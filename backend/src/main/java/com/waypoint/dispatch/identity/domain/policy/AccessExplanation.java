package com.waypoint.dispatch.identity.domain.policy;

import java.util.List;
import java.util.Map;

/**
 * Why an actor may or may not do something, in the terms an administrator can act on.
 *
 * <p>The decision itself always comes from {@link PolicyEvaluator}: this class only
 * adds where each statement came from, so the explanation and the enforcement can
 * never disagree. A second evaluator, here or in a screen, would eventually explain
 * a decision the system did not take.
 *
 * <p>Pure and framework-free, like the evaluator it wraps.
 */
public final class AccessExplanation {

  private AccessExplanation() {}

  /**
   * Where a statement came from.
   *
   * @param attachedTo {@code "user"} for a policy attached to the person, otherwise the
   *     role code it reaches them through
   */
  public record Source(String policy, int version, String attachedTo) {}

  public record SourcedStatement(Statement statement, Source source) {}

  /** The answer to one action before any resource is named. */
  public enum Outcome {
    ALLOWED,
    /** An explicit Deny matched, which beats every Allow. */
    BLOCKED,
    /** Nothing matched, so the default Deny holds. */
    NOT_GRANTED
  }

  /**
   * @param deciding the statements that produced the outcome: the matching Denies when
   *     blocked, the matching Allows when allowed, nothing when not granted
   * @param limited statements that name the action but hold only for some resources or
   *     under conditions, so the answer for a particular depot, outlet or vehicle may
   *     differ from the outcome
   */
  public record ActionAccess(
      String action, Outcome outcome, List<SourcedStatement> deciding, List<SourcedStatement> limited) {}

  /** @param matching every statement that matched the request, Allow and Deny alike */
  public record Check(Decision decision, List<SourcedStatement> matching) {}

  /** One request answered exactly as the decision point answers it, with every statement that matched. */
  public static Check check(List<SourcedStatement> statements, AccessRequest request) {
    Decision decision =
        PolicyEvaluator.evaluate(
            statements.stream().map(SourcedStatement::statement).toList(), request);
    List<SourcedStatement> matching =
        statements.stream()
            .filter(s -> s.statement().matches(request.action(), request.resource(), request.context()))
            .toList();
    return new Check(decision, matching);
  }

  /**
   * One action asked with no particular resource, which is how an unscoped grant is
   * recognised (see {@link AccessRequest}), plus every narrower statement naming it.
   */
  public static ActionAccess forAction(
      List<SourcedStatement> statements, String action, Map<String, String> context) {
    Check unscoped = check(statements, new AccessRequest(action, null, context));
    Effect wanted = unscoped.decision().allowed() ? Effect.ALLOW : Effect.DENY;
    List<SourcedStatement> deciding =
        unscoped.matching().stream().filter(s -> s.statement().effect() == wanted).toList();
    Outcome outcome =
        unscoped.decision().allowed()
            ? Outcome.ALLOWED
            : deciding.isEmpty() ? Outcome.NOT_GRANTED : Outcome.BLOCKED;
    List<SourcedStatement> limited =
        statements.stream()
            .filter(s -> s.statement().namesAction(action))
            .filter(s -> !unscoped.matching().contains(s))
            .toList();
    return new ActionAccess(action, outcome, deciding, limited);
  }
}
