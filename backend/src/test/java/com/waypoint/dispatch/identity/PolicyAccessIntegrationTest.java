package com.waypoint.dispatch.identity;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.waypoint.dispatch.identity.application.AccountAdminUseCase;
import com.waypoint.dispatch.identity.application.LoginHandler;
import com.waypoint.dispatch.identity.web.AuthController;
import com.waypoint.dispatch.platform.db.Migrator;
import com.waypoint.dispatch.support.TestDatabase;
import jakarta.servlet.http.Cookie;
import java.util.UUID;
import java.util.stream.StreamSupport;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

/**
 * Permission editing and the access explanation over HTTP (R-IAM-39, R-IAM-40).
 *
 * <p>Each test makes its own accounts and policies under a fresh suffix, so it holds
 * whatever other classes have left in a shared database.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ExtendWith(TestDatabase.class)
class PolicyAccessIntegrationTest {
  private static final String PASSWORD = "PolicyAccess2026!";

  @Autowired MockMvc http;
  @Autowired ObjectMapper mapper;
  @Autowired Migrator migrator;
  @Autowired AccountAdminUseCase accounts;
  @Autowired LoginHandler login;

  @DynamicPropertySource
  static void databaseUrl(DynamicPropertyRegistry registry) {
    registry.add("app.database-url", TestDatabase::url);
  }

  private String suffix;
  private String admin;
  private String driver;
  private UUID driverId;

  @BeforeEach
  void accounts() {
    migrator.migrate();
    suffix = UUID.randomUUID().toString().substring(0, 8);
    admin = "pa-admin-" + suffix + "@waypoint.test";
    driver = "pa-driver-" + suffix + "@waypoint.test";
    accounts.createAccount(admin, "Policy Admin", PASSWORD, "admin");
    driverId = accounts.createAccount(driver, "Policy Driver " + suffix, PASSWORD, "driver");
  }

  @Test
  void theExplanationNamesTheRolePolicyAndAPersonalDenyBlocksIt() throws Exception {
    JsonNode before = read(admin, "/api/accounts/" + driverId + "/access", 200);
    JsonNode granted =
        StreamSupport.stream(before.get("actions").spliterator(), false)
            .filter(a -> "allowed".equals(a.get("outcome").asText()))
            .findFirst()
            .orElseThrow(() -> new AssertionError("a driver is allowed something: " + before));
    String action = granted.get("action").asText();
    JsonNode source = granted.get("sources").get(0);
    assertEquals("driver", source.get("attachedTo").asText(), granted.toString());
    assertTrue(source.get("policy").asText().startsWith("Waypoint"), granted.toString());
    assertEquals(
        "not_granted",
        outcome(before, "iam:CreatePolicy"),
        "a driver may not author policy, and nothing blocks it either");

    String fence = "ItFence" + suffix;
    command(
        admin,
        "iam:CreatePolicy",
        null,
        """
        {"name":"%s","description":"Integration fence","document":
          {"Version":"test","Statement":[
            {"Sid":"Fence","Effect":"Deny","Action":["%s"],"Resource":["*"]}]}}
        """
            .formatted(fence, action),
        200);
    command(
        admin,
        "iam:AttachPolicy",
        rowVersion(fence),
        """
        {"name":"%s","principalType":"user","principalId":"%s"}
        """
            .formatted(fence, driverId),
        200);

    JsonNode after = read(admin, "/api/accounts/" + driverId + "/access", 200);
    JsonNode blocked = actionNamed(after, action);
    assertEquals("blocked", blocked.get("outcome").asText(), blocked.toString());
    assertEquals(fence, blocked.get("sources").get(0).get("policy").asText());
    assertEquals("user", blocked.get("sources").get(0).get("attachedTo").asText());

    JsonNode check =
        read(admin, "/api/accounts/" + driverId + "/access/check?action=" + action, 200);
    assertFalse(check.get("allowed").asBoolean(), check.toString());
    var effects =
        StreamSupport.stream(check.get("matching").spliterator(), false)
            .map(m -> m.get("effect").asText())
            .toList();
    assertTrue(
        effects.contains("Allow") && effects.contains("Deny"),
        "both the role's Allow and the personal Deny matched, and the reader is shown both: "
            + check);
  }

  @Test
  void aPolicyDetailListsEveryVersionWhichIsInForceAndItsAttachments() throws Exception {
    String name = "ItVersions" + suffix;
    command(
        admin,
        "iam:CreatePolicy",
        null,
        """
        {"name":"%s","description":"Versioned in a test","document":
          {"Version":"test","Statement":[
            {"Sid":"ReadOrders","Effect":"Allow","Action":["order:Read"],"Resource":["*"]}]}}
        """
            .formatted(name),
        200);
    command(
        admin,
        "iam:CreatePolicyVersion",
        rowVersion(name),
        """
        {"name":"%s","document":{"Version":"test","Statement":[
          {"Sid":"ReadPlans","Effect":"Allow","Action":["plan:Read"],"Resource":["*"]}]}}
        """
            .formatted(name),
        200);

    JsonNode detail = read(admin, "/api/policies/" + name, 200);
    assertEquals(1, detail.get("defaultVersion").asInt(), "a new version is not in force until chosen");
    assertEquals(2, detail.get("versions").size());
    assertEquals(2, detail.get("versions").get(0).get("versionNumber").asInt(), "newest first");
    assertEquals(
        "ReadPlans",
        detail.get("versions").get(0).get("document").get("Statement").get(0).get("Sid").asText());

    command(
        admin,
        "iam:SetDefaultPolicyVersion",
        rowVersion(name),
        """
        {"name":"%s","versionNumber":2}
        """
            .formatted(name),
        200);
    command(
        admin,
        "iam:AttachPolicy",
        rowVersion(name),
        """
        {"name":"%s","principalType":"user","principalId":"%s"}
        """
            .formatted(name, driverId),
        200);

    JsonNode after = read(admin, "/api/policies/" + name, 200);
    assertEquals(2, after.get("defaultVersion").asInt());
    assertEquals(1, after.get("attachments").size());
    assertEquals("Policy Driver " + suffix, after.get("attachments").get(0).get("label").asText());
    assertEquals(
        "allowed",
        outcome(read(admin, "/api/accounts/" + driverId + "/access", 200), "plan:Read"),
        "the version in force is the one the explanation reads");
  }

  @Test
  void aChangeThatWouldLeaveNobodyAbleToUndoItIsRefused() throws Exception {
    String name = "ItLockout" + suffix;
    // Blocks every account holding the admin role from changing this one policy.
    command(
        admin,
        "iam:CreatePolicy",
        null,
        """
        {"name":"%s","description":"Would lock itself","document":
          {"Version":"test","Statement":[
            {"Sid":"NoChanges","Effect":"Deny","Action":["iam:CreatePolicy","iam:AttachPolicy"],
             "Resource":["wpt:iam:policy:%s"]}]}}
        """
            .formatted(name, name),
        200);

    JsonNode refused =
        mapper.readTree(
            command(
                admin,
                "iam:AttachPolicy",
                rowVersion(name),
                """
                {"name":"%s","principalType":"role","principalId":"admin"}
                """
                    .formatted(name),
                409));
    assertTrue(refused.get("detail").asText().contains("nobody able"), refused.toString());
    assertEquals(
        0,
        read(admin, "/api/policies/" + name, 200).get("attachments").size(),
        "the refused attachment left nothing behind");
  }

  @Test
  void aDriverMayNotReadPolicyOrAnotherPersonsAccess() throws Exception {
    read(driver, "/api/accounts/" + driverId + "/access", 403);
    read(driver, "/api/policies/WaypointDriver", 403);
  }

  // ---- helpers ----

  private static String outcome(JsonNode access, String action) {
    return actionNamed(access, action).get("outcome").asText();
  }

  private static JsonNode actionNamed(JsonNode access, String action) {
    return StreamSupport.stream(access.get("actions").spliterator(), false)
        .filter(a -> action.equals(a.get("action").asText()))
        .findFirst()
        .orElseThrow(() -> new AssertionError("no action " + action));
  }

  private long rowVersion(String policy) throws Exception {
    return read(admin, "/api/policies/" + policy, 200).get("rowVersion").asLong();
  }

  private String command(
      String email, String kind, Long expectedVersion, String payload, int expectedStatus)
      throws Exception {
    String body =
        """
        {"commandId":"%s","kind":"%s","expectedVersion":%s,"payload":%s,
         "clientRecordedAt":"2026-10-06T08:00:00Z"}
        """
            .formatted(
                UUID.randomUUID(),
                kind,
                expectedVersion == null ? "null" : expectedVersion.toString(),
                payload);
    return perform(post("/api/commands").content(body), email, expectedStatus);
  }

  private JsonNode read(String email, String path, int expectedStatus) throws Exception {
    String body = perform(get(path), email, expectedStatus);
    return body.isEmpty() ? mapper.nullNode() : mapper.readTree(body);
  }

  private String perform(MockHttpServletRequestBuilder builder, String email, int expectedStatus)
      throws Exception {
    String token = login.login(email, PASSWORD, null, "127.0.0.1");
    MvcResult result =
        http.perform(
                builder
                    .cookie(new Cookie(AuthController.COOKIE, token))
                    .contentType(MediaType.APPLICATION_JSON))
            .andReturn();
    String response = result.getResponse().getContentAsString();
    assertEquals(expectedStatus, result.getResponse().getStatus(), response);
    return response;
  }
}
