package com.waypoint.dispatch.identity.application;

import com.waypoint.dispatch.identity.domain.policy.AccessExplanation;
import com.waypoint.dispatch.identity.domain.policy.AccessRequest;
import com.waypoint.dispatch.identity.domain.policy.Pattern;
import com.waypoint.dispatch.identity.domain.policy.Statement;
import com.waypoint.dispatch.identity.infrastructure.JdbcPolicyRepository;
import com.waypoint.dispatch.platform.db.Database;
import com.waypoint.dispatch.platform.db.ModuleRole;
import com.waypoint.dispatch.shared.error.DomainException;
import com.waypoint.dispatch.shared.error.ErrorCode;
import com.waypoint.dispatch.shared.util.Clock;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Component;

/**
 * R-IAM-40: why a person may or may not do something.
 *
 * <p>The answer is the decision point's own answer: statements come from the same
 * attachments and default versions, and the decision from the same evaluator. What
 * this adds is provenance, the policy, its version and the role or direct
 * attachment each statement arrived through, so an administrator can see which
 * change would alter the result.
 *
 * <p>Policy decides actions; the depot and outlet scope decides rows (effective
 * access is policy AND scope). The scope is returned beside the actions so a reader
 * is never told "allowed" without being shown where.
 */
@Component
public class AccessExplanationQuery {
  private final Database database;
  private final JdbcPolicyRepository policies;
  private final AccountQuery accounts;
  private final Clock clock;

  public AccessExplanationQuery(
      Database database, JdbcPolicyRepository policies, AccountQuery accounts, Clock clock) {
    this.database = database;
    this.policies = policies;
    this.accounts = accounts;
    this.clock = clock.realTime();
  }

  /**
   * @param attachedTo {@code "user"} when attached to the person, otherwise the role code
   * @param effect {@code Allow} or {@code Deny}, as authored
   * @param resources what the statement is limited to; {@code *} for everything
   * @param conditions the condition clauses, as {@code Operator(key)}
   */
  public record SourceView(
      String policy,
      int version,
      String attachedTo,
      String statement,
      String effect,
      List<String> resources,
      List<String> conditions) {}

  /**
   * @param outcome {@code allowed}, {@code blocked} by an explicit Deny, or {@code not_granted}
   * @param sources the statements that produced the outcome
   * @param limited statements that hold only for some resources or under conditions
   */
  public record ActionAccessView(
      String action,
      String module,
      String description,
      String outcome,
      List<SourceView> sources,
      List<SourceView> limited) {}

  public record AccessView(
      UUID userId,
      boolean active,
      List<String> roles,
      List<String> depots,
      List<String> outlets,
      List<ActionAccessView> actions) {}

  public record CheckView(
      String action, String resource, boolean allowed, String reason, List<SourceView> matching) {}

  /** Every action the system enforces, answered for this person with no resource named. */
  public AccessView forUser(UUID userId) {
    AccountQuery.AccountView account = accounts.byId(userId);
    return database.asModule(
        ModuleRole.IAM,
        null,
        () -> {
          List<AccessExplanation.SourcedStatement> statements = policies.sourcedStatementsFor(userId);
          Map<String, String> context = context(userId);
          List<ActionAccessView> actions =
              database
                  .query(
                      "SELECT action, module, description FROM iam.action_catalogue"
                          + " WHERE implemented ORDER BY module, action")
                  .stream()
                  .map(
                      row -> {
                        String action = (String) row.get("action");
                        AccessExplanation.ActionAccess access =
                            AccessExplanation.forAction(statements, action, context);
                        return new ActionAccessView(
                            action,
                            (String) row.get("module"),
                            (String) row.get("description"),
                            access.outcome().name().toLowerCase(java.util.Locale.ROOT),
                            views(access.deciding()),
                            views(access.limited()));
                      })
                  .toList();
          return new AccessView(
              userId,
              account.active(),
              account.roles(),
              account.depots(),
              account.outlets(),
              actions);
        });
  }

  /** One action on one resource, answered exactly as a command would be. */
  public CheckView check(UUID userId, String action, String resource) {
    accounts.byId(userId);
    return database.asModule(
        ModuleRole.IAM,
        null,
        () -> {
          if (action == null || !policies.actionExists(action)) {
            throw new DomainException(
                ErrorCode.VALIDATION_FAILED, "Choose an action from the catalogue");
          }
          AccessRequest request = new AccessRequest(action, resource, context(userId));
          AccessExplanation.Check check =
              AccessExplanation.check(policies.sourcedStatementsFor(userId), request);
          return new CheckView(
              action,
              request.resource(),
              check.decision().allowed(),
              check.decision().reason(),
              views(check.matching()));
        });
  }

  /** The same context the decision point supplies to every command. */
  private Map<String, String> context(UUID userId) {
    return Map.of("wpt:now", clock.now().toString(), "wpt:actorId", userId.toString());
  }

  private static List<SourceView> views(List<AccessExplanation.SourcedStatement> statements) {
    return statements.stream().map(AccessExplanationQuery::view).toList();
  }

  private static SourceView view(AccessExplanation.SourcedStatement sourced) {
    Statement statement = sourced.statement();
    List<String> resources =
        statement.resources().isEmpty()
            ? List.of("*")
            : statement.resources().stream().map(Pattern::raw).toList();
    return new SourceView(
        sourced.source().policy(),
        sourced.source().version(),
        sourced.source().attachedTo(),
        statement.sid(),
        statement.effect().name().equals("DENY") ? "Deny" : "Allow",
        resources,
        statement.conditions().stream().map(Object::toString).toList());
  }
}
