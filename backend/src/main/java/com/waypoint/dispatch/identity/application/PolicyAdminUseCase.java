package com.waypoint.dispatch.identity.application;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.waypoint.dispatch.identity.domain.policy.AccessRequest;
import com.waypoint.dispatch.identity.domain.policy.Pattern;
import com.waypoint.dispatch.identity.domain.policy.PolicyEvaluator;
import com.waypoint.dispatch.identity.domain.policy.PolicyDocument;
import com.waypoint.dispatch.identity.domain.policy.Statement;
import com.waypoint.dispatch.identity.infrastructure.JdbcPolicyRepository;
import com.waypoint.dispatch.identity.infrastructure.PolicyDocumentParser;
import com.waypoint.dispatch.platform.audit.AuditEntry;
import com.waypoint.dispatch.platform.audit.AuditLog;
import com.waypoint.dispatch.platform.observability.Metrics;
import com.waypoint.dispatch.platform.db.Database;
import com.waypoint.dispatch.platform.db.ModuleRole;
import com.waypoint.dispatch.shared.domain.Actor;
import com.waypoint.dispatch.shared.domain.Cursor;
import com.waypoint.dispatch.shared.domain.Page;
import com.waypoint.dispatch.shared.error.DomainException;
import com.waypoint.dispatch.shared.error.ErrorCode;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Component;

/**
 * Authoring and attaching policy at runtime.
 *
 * <p>This is what makes authorization data rather than code: an administrator
 * changes what a role may do and the next command sees it, with no deployment.
 *
 * <p>Every change is the body of a command. The {@code apply*} methods assume the
 * command bus has opened the transaction, so the change commits with its receipt
 * and its audit row, and a retry of the same command changes nothing twice. There
 * is no other way in: policy is the last thing that should have a write path the
 * bus does not see.
 *
 * <p>Three invariants run through every method here. A version is never edited,
 * only superseded, so a decision taken under an older policy stays explainable.
 * A change to an existing policy quotes the policy's version, so two
 * administrators cannot both move the default from the same starting point. And
 * any change moves the policy generation, which clears every replica's cache,
 * because a cache that is clever about which actors were affected is a cache
 * that eventually serves a revoked permission.
 */
@Component
public class PolicyAdminUseCase {
  private final Database database;
  private final JdbcPolicyRepository policies;
  private final PolicyDocumentParser parser;
  private final PolicyGeneration generation;
  private final AuditLog audit;
  private final Metrics metrics;
  private final ObjectMapper mapper;

  public PolicyAdminUseCase(
      Database database,
      JdbcPolicyRepository policies,
      PolicyDocumentParser parser,
      PolicyGeneration generation,
      AuditLog audit,
      Metrics metrics,
      ObjectMapper mapper) {
    this.database = database;
    this.policies = policies;
    this.parser = parser;
    this.generation = generation;
    this.audit = audit;
    this.metrics = metrics;
    this.mapper = mapper;
  }

  /**
   * @param rowVersion what a caller sends back as {@code expectedVersion} to change this policy
   */
  public record PolicySummary(UUID policyId, String name, int defaultVersion, long rowVersion) {}

  /** @param inForce whether this is the default version, the one decisions read */
  public record VersionView(
      int versionNumber, boolean inForce, Instant createdAt, String createdBy, JsonNode document) {}

  /** @param label the role's description or the person's name, for a reader, never for matching */
  public record AttachmentView(
      String principalType, String principalId, String label, Instant attachedAt) {}

  /** @param rowVersion what a caller sends back as {@code expectedVersion} to change this policy */
  public record PolicyDetail(
      UUID policyId,
      String name,
      String description,
      long rowVersion,
      int defaultVersion,
      List<VersionView> versions,
      List<AttachmentView> attachments) {}

  UUID applyCreate(Actor actor, String name, String description, String documentJson) {
    validate(documentJson);
    if (database.queryOne("SELECT policy_id FROM iam.policies WHERE name = ?", name) != null) {
      throw new DomainException(ErrorCode.CONFLICT, "Policy " + name + " already exists");
    }
    UUID policyId = UUID.randomUUID();
    database.update(
        "INSERT INTO iam.policies (policy_id, name, description, created_by) VALUES (?, ?, ?, ?)",
        policyId,
        name,
        description == null ? "" : description,
        actor.userId());
    database.update(
        "INSERT INTO iam.policy_versions"
            + " (policy_id, version_number, document, is_default, created_by)"
            + " VALUES (?, 1, ?::jsonb, true, ?)",
        policyId,
        documentJson,
        actor.userId());
    record(actor, "iam:CreatePolicy", name, "version 1 created and made default");
    generation.advance();
    return policyId;
  }

  /** Adds a version without changing which one is in force. */
  int applyCreateVersion(Actor actor, String name, String documentJson, Long expectedVersion) {
    validate(documentJson);
    UUID policyId = touchPolicy(name, expectedVersion);
    Map<String, Object> latest =
        database.queryOne(
            "SELECT max(version_number) AS latest FROM iam.policy_versions WHERE policy_id = ?",
            policyId);
    int next = ((Number) latest.get("latest")).intValue() + 1;
    database.update(
        "INSERT INTO iam.policy_versions"
            + " (policy_id, version_number, document, is_default, created_by)"
            + " VALUES (?, ?, ?::jsonb, false, ?)",
        policyId,
        next,
        documentJson,
        actor.userId());
    record(actor, "iam:CreatePolicy", name, "version " + next + " created, not yet default");
    return next;
  }

  /** Moves which version is in force. This is the moment permissions actually change. */
  void applySetDefaultVersion(Actor actor, String name, int versionNumber, Long expectedVersion) {
    UUID policyId = touchPolicy(name, expectedVersion);
    if (database.queryOne(
            "SELECT policy_version_id FROM iam.policy_versions"
                + " WHERE policy_id = ? AND version_number = ?",
            policyId,
            versionNumber)
        == null) {
      throw new DomainException(
          ErrorCode.NOT_FOUND, "Policy " + name + " has no version " + versionNumber);
    }
    // Clear first: the partial unique index allows only one default.
    database.update(
        "UPDATE iam.policy_versions SET is_default = false WHERE policy_id = ? AND is_default",
        policyId);
    database.update(
        "UPDATE iam.policy_versions SET is_default = true"
            + " WHERE policy_id = ? AND version_number = ?",
        policyId,
        versionNumber);
    requireSomeoneCanStillChange(name);
    record(actor, "iam:CreatePolicy", name, "version " + versionNumber + " is now in force");
    generation.advance();
  }

  void applyAttach(
      Actor actor, String name, String principalType, String principalId, Long expectedVersion) {
    requirePrincipalType(principalType);
    UUID policyId = touchPolicy(name, expectedVersion);
    assertPrincipalExists(principalType, principalId);
    database.update(
        "INSERT INTO iam.policy_attachments"
            + " (policy_id, principal_type, principal_id, attached_by)"
            + " VALUES (?, ?, ?, ?) ON CONFLICT DO NOTHING",
        policyId,
        principalType,
        principalId,
        actor.userId());
    // Attaching can take access away too: a policy of Denies fences every Allow.
    requireSomeoneCanStillChange(name);
    record(actor, "iam:AttachPolicy", name, "attached to " + principalType + " " + principalId);
    generation.advance();
  }

  /** Not an error when nothing was attached: the intended state is what it leaves. */
  void applyDetach(
      Actor actor, String name, String principalType, String principalId, Long expectedVersion) {
    requirePrincipalType(principalType);
    UUID policyId = touchPolicy(name, expectedVersion);
    int removed =
        database.update(
            "DELETE FROM iam.policy_attachments"
                + " WHERE policy_id = ? AND principal_type = ? AND principal_id = ?",
            policyId,
            principalType,
            principalId);
    requireSomeoneCanStillChange(name);
    record(
        actor,
        "iam:DetachPolicy",
        name,
        (removed == 0 ? "was not attached to " : "detached from ")
            + principalType
            + " "
            + principalId);
    generation.advance();
  }

  /** Keyset paginated on the policy name, which is unique and not personal data. */
  public Page<PolicySummary> list(String after, Integer limit) {
    int size = Page.limit(limit);
    List<String> key = Cursor.decode(after, 1);
    String afterName = key.isEmpty() ? null : key.get(0);
    List<PolicySummary> rows =
        database
            .asModule(
                ModuleRole.IAM,
                null,
                () ->
                    database.query(
                        """
                        SELECT p.policy_id, p.name, v.version_number, p.row_version
                        FROM iam.policies p
                        JOIN iam.policy_versions v ON v.policy_id = p.policy_id AND v.is_default
                        WHERE (?::text IS NULL OR p.name > ?::text)
                        ORDER BY p.name
                        LIMIT ?
                        """,
                        afterName,
                        afterName,
                        size + 1))
            .stream()
            .map(
                r ->
                    new PolicySummary(
                        (UUID) r.get("policy_id"),
                        (String) r.get("name"),
                        ((Number) r.get("version_number")).intValue(),
                        ((Number) r.get("row_version")).longValue()))
            .toList();
    return Page.fromOverfetch(rows, size, policy -> Cursor.encode(policy.name()));
  }

  /** One policy with every version it has had and everything it is attached to. */
  public PolicyDetail detail(String name) {
    return database.asModule(
        ModuleRole.IAM,
        null,
        () -> {
          Map<String, Object> policy =
              database.queryOne(
                  "SELECT policy_id, name, description, row_version FROM iam.policies WHERE name = ?",
                  name);
          if (policy == null) {
            throw new DomainException(ErrorCode.NOT_FOUND, "No policy named " + name);
          }
          UUID policyId = (UUID) policy.get("policy_id");
          List<VersionView> versions =
              database
                  .query(
                      """
                      SELECT v.version_number, v.is_default, v.created_at, u.display_name,
                             v.document::text AS document
                      FROM iam.policy_versions v
                      LEFT JOIN iam.users u ON u.user_id = v.created_by
                      WHERE v.policy_id = ?
                      ORDER BY v.version_number DESC
                      """,
                      policyId)
                  .stream()
                  .map(
                      r ->
                          new VersionView(
                              ((Number) r.get("version_number")).intValue(),
                              Boolean.TRUE.equals(r.get("is_default")),
                              instant(r.get("created_at")),
                              (String) r.get("display_name"),
                              json((String) r.get("document"))))
                  .toList();
          List<AttachmentView> attachments =
              database
                  .query(
                      """
                      SELECT a.principal_type, a.principal_id, a.attached_at,
                             coalesce(ro.description, u.display_name) AS label
                      FROM iam.policy_attachments a
                      LEFT JOIN iam.roles ro
                        ON a.principal_type = 'role' AND ro.role_code = a.principal_id
                      LEFT JOIN iam.users u
                        ON a.principal_type = 'user' AND u.user_id::text = a.principal_id
                      WHERE a.policy_id = ?
                      ORDER BY a.principal_type, a.principal_id
                      """,
                      policyId)
                  .stream()
                  .map(
                      r ->
                          new AttachmentView(
                              (String) r.get("principal_type"),
                              (String) r.get("principal_id"),
                              (String) r.get("label"),
                              instant(r.get("attached_at"))))
                  .toList();
          int inForce =
              versions.stream()
                  .filter(VersionView::inForce)
                  .findFirst()
                  .map(VersionView::versionNumber)
                  .orElse(0);
          return new PolicyDetail(
              policyId,
              (String) policy.get("name"),
              (String) policy.get("description"),
              ((Number) policy.get("row_version")).longValue(),
              inForce,
              versions,
              attachments);
        });
  }

  /**
   * R-IAM-39. A policy change that would leave no active account able to change this
   * policy back is refused, because nobody could undo it short of editing the
   * database. Asked of the state the change leaves behind, on the command's own
   * connection, so it sees the change before it commits; the throw rolls it back.
   */
  private void requireSomeoneCanStillChange(String name) {
    String resource = "wpt:iam:policy:" + name;
    AccessRequest author = AccessRequest.of("iam:CreatePolicy", resource);
    AccessRequest attach = AccessRequest.of("iam:AttachPolicy", resource);
    boolean someone =
        policies.statementsByActiveUser().values().stream()
            .anyMatch(
                statements ->
                    PolicyEvaluator.evaluate(statements, author).allowed()
                        && PolicyEvaluator.evaluate(statements, attach).allowed());
    if (!someone) {
      metrics.increment("waypoint.policy.lockout_refused");
      throw new DomainException(
          ErrorCode.CONFLICT,
          "This change would leave nobody able to change policy " + name + " again");
    }
  }

  private JsonNode json(String document) {
    try {
      return mapper.readTree(document);
    } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
      throw new IllegalStateException("Stored policy document is not JSON", e);
    }
  }

  private static Instant instant(Object value) {
    return value == null ? null : ((Timestamp) value).toInstant();
  }

  /**
   * R-IAM-03. Every action a document names must exist in the catalogue.
   *
   * <p>Without this a typo denies silently forever and looks exactly like a
   * permissions bug nobody can find. Wildcards are checked by prefix, so
   * {@code order:*} is accepted when the catalogue has any order action.
   */
  private void validate(String documentJson) {
    try {
      validateDocument(documentJson);
    } catch (DomainException e) {
      // SEC-09: a rejected document is someone trying, and failing, to change access.
      metrics.increment("waypoint.policy.rejected");
      throw e;
    }
  }

  private void validateDocument(String documentJson) {
    PolicyDocument document = parser.parse(documentJson);
    List<String> catalogue = policies.catalogueActions();
    List<String> unknown = new ArrayList<>();

    for (Statement statement : document.statements()) {
      for (Pattern action : statement.actions()) {
        boolean known = catalogue.stream().anyMatch(action::matches);
        if (!known) {
          unknown.add(action.raw());
        }
      }
    }
    if (!unknown.isEmpty()) {
      throw new DomainException(
          ErrorCode.VALIDATION_FAILED,
          "Policy names " + unknown.size() + " action(s) that do not exist",
          unknown);
    }
  }

  /**
   * Guards a change to a policy with its version and moves it. The update is the
   * guard: zero rows means another administrator changed the policy first.
   */
  private UUID touchPolicy(String name, Long expectedVersion) {
    Map<String, Object> row =
        database.queryOne("SELECT policy_id, row_version FROM iam.policies WHERE name = ?", name);
    if (row == null) {
      throw new DomainException(ErrorCode.NOT_FOUND, "No policy named " + name);
    }
    if (expectedVersion == null) {
      throw new DomainException(
          ErrorCode.VALIDATION_FAILED, "expectedVersion is required to change policy " + name);
    }
    long actual = ((Number) row.get("row_version")).longValue();
    if (actual != expectedVersion) {
      throw new DomainException(
          ErrorCode.VERSION_CONFLICT,
          "Policy " + name + " is at version " + actual + ", not " + expectedVersion);
    }
    database.updateExpectingOneRow(
        "UPDATE iam.policies SET row_version = row_version + 1"
            + " WHERE policy_id = ? AND row_version = ?",
        row.get("policy_id"),
        actual);
    return (UUID) row.get("policy_id");
  }

  private static void requirePrincipalType(String principalType) {
    if (!List.of("user", "role").contains(principalType)) {
      throw new DomainException(
          ErrorCode.VALIDATION_FAILED, "A principal is a user or a role, not " + principalType);
    }
  }

  private void record(Actor actor, String action, String name, String reason) {
    audit.record(
        AuditEntry.allowed(
            actor.userId(), actor.deviceId(), action, "wpt:iam:policy:" + name, reason));
  }

  private void assertPrincipalExists(String principalType, String principalId) {
    boolean exists =
        "role".equals(principalType)
            ? database.queryOne("SELECT role_code FROM iam.roles WHERE role_code = ?", principalId)
                != null
            : database.queryOne(
                    "SELECT user_id FROM iam.users WHERE user_id = ?::uuid", principalId)
                != null;
    if (!exists) {
      throw new DomainException(
          ErrorCode.NOT_FOUND, "No " + principalType + " called " + principalId);
    }
  }
}
