package com.waypoint.dispatch.identity.domain.policy;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.waypoint.dispatch.identity.domain.policy.AccessExplanation.Outcome;
import com.waypoint.dispatch.identity.domain.policy.AccessExplanation.Source;
import com.waypoint.dispatch.identity.domain.policy.AccessExplanation.SourcedStatement;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

/**
 * The explanation an administrator reads must never disagree with the decision the
 * system takes, so every case here checks both.
 */
class AccessExplanationTest {
  private static final Source ROLE = new Source("WaypointDispatcher", 3, "dispatcher");
  private static final Source DIRECT = new Source("PersonalFence", 1, "user");

  @Test
  void anAllowThroughARoleNamesThePolicyVersionAndRole() {
    var access =
        AccessExplanation.forAction(
            List.of(sourced(allow("Publish", "plan:Publish", "*"), ROLE)), "plan:Publish", Map.of());

    assertEquals(Outcome.ALLOWED, access.outcome());
    assertEquals(1, access.deciding().size());
    assertEquals(ROLE, access.deciding().get(0).source());
    assertTrue(access.limited().isEmpty());
  }

  @Test
  void aDenyAttachedToThePersonBlocksAndIsTheReasonGiven() {
    var access =
        AccessExplanation.forAction(
            List.of(
                sourced(allow("Broad", "plan:*", "*"), ROLE),
                sourced(deny("Fence", "plan:Publish", "*"), DIRECT)),
            "plan:Publish",
            Map.of());

    assertEquals(Outcome.BLOCKED, access.outcome());
    assertEquals(List.of(DIRECT), access.deciding().stream().map(SourcedStatement::source).toList());
  }

  @Test
  void nothingNamingTheActionIsNotGrantedWithNoSources() {
    var access =
        AccessExplanation.forAction(
            List.of(sourced(allow("Read", "order:Read", "*"), ROLE)), "plan:Publish", Map.of());

    assertEquals(Outcome.NOT_GRANTED, access.outcome());
    assertTrue(access.deciding().isEmpty());
    assertTrue(access.limited().isEmpty());
  }

  @Test
  void aGrantForOneDepotIsShownAsLimitedNotAsAllowed() {
    // AccessRequest: an unscoped question matches only an unscoped grant, so a
    // depot grant must never read as access everywhere.
    var access =
        AccessExplanation.forAction(
            List.of(sourced(allow("OneDepot", "plan:Publish", "wpt:ref:depot:KANDY"), ROLE)),
            "plan:Publish",
            Map.of());

    assertEquals(Outcome.NOT_GRANTED, access.outcome());
    assertEquals(1, access.limited().size());
  }

  @Test
  void aConditionalGrantIsLimited() {
    Statement conditional =
        new Statement(
            "OnlyKandy",
            Effect.ALLOW,
            List.of(new Pattern("plan:Publish")),
            List.of(Pattern.ANY),
            List.of(new Condition(ConditionOperator.STRING_EQUALS, "wpt:depot", List.of("KANDY"))));

    var access =
        AccessExplanation.forAction(List.of(sourced(conditional, ROLE)), "plan:Publish", Map.of());

    assertEquals(Outcome.NOT_GRANTED, access.outcome());
    assertEquals(1, access.limited().size());
  }

  @Test
  void aCheckAgreesWithTheEvaluatorAndListsEveryMatch() {
    List<SourcedStatement> statements =
        List.of(
            sourced(allow("Broad", "order:*", "*"), ROLE),
            sourced(deny("Fence", "order:Cancel", "wpt:ref:outlet:OUT001"), DIRECT));
    AccessRequest request = AccessRequest.of("order:Cancel", "wpt:ref:outlet:OUT001");

    var check = AccessExplanation.check(statements, request);

    assertEquals(
        PolicyEvaluator.evaluate(statements.stream().map(SourcedStatement::statement).toList(), request),
        check.decision());
    assertFalse(check.decision().allowed());
    assertEquals(2, check.matching().size());
  }

  @Test
  void theSamePolicyReachingThroughTwoRolesIsListedForEach() {
    Statement publish = allow("Publish", "plan:Publish", "*");
    var access =
        AccessExplanation.forAction(
            List.of(
                sourced(publish, new Source("Shared", 1, "dispatcher")),
                sourced(publish, new Source("Shared", 1, "admin"))),
            "plan:Publish",
            Map.of());

    assertEquals(Outcome.ALLOWED, access.outcome());
    assertEquals(2, access.deciding().size());
  }

  private static SourcedStatement sourced(Statement statement, Source source) {
    return new SourcedStatement(statement, source);
  }

  private static Statement allow(String sid, String action, String resource) {
    return new Statement(
        sid, Effect.ALLOW, List.of(new Pattern(action)), List.of(new Pattern(resource)), List.of());
  }

  private static Statement deny(String sid, String action, String resource) {
    return new Statement(
        sid, Effect.DENY, List.of(new Pattern(action)), List.of(new Pattern(resource)), List.of());
  }
}
