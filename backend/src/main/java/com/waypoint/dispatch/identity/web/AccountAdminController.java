package com.waypoint.dispatch.identity.web;

import com.waypoint.dispatch.identity.application.AccessExplanationQuery;
import com.waypoint.dispatch.identity.application.AccountQuery;
import com.waypoint.dispatch.platform.web.RequestAuthorizer;
import com.waypoint.dispatch.platform.web.RequestValues;
import com.waypoint.dispatch.shared.domain.Page;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Reading accounts, scopes and driver assignments.
 *
 * <p>Reads only, and deliberately. Every change to an account is a command
 * through {@code POST /api/commands}, so it gets an idempotency receipt, a version
 * guard and an audit row that commit with it. A second write path here would have
 * none of those, and would be the one a client reached for.
 *
 * <p>Each response carries {@code rowVersion}, which is what the caller sends back
 * as {@code expectedVersion}. A read surface that hides the version makes the
 * version guard unusable.
 */
@RestController
@RequestMapping("/api/accounts")
public class AccountAdminController {
  private final AccountQuery accounts;
  private final AccessExplanationQuery access;
  private final RequestAuthorizer authorizer;

  public AccountAdminController(
      AccountQuery accounts, AccessExplanationQuery access, RequestAuthorizer authorizer) {
    this.accounts = accounts;
    this.access = access;
    this.authorizer = authorizer;
  }

  /**
   * Listing accounts is reading the shape of the organisation, so it needs the
   * same permission as changing one. There is no read-only account browser.
   */
  @GetMapping
  public Page<AccountQuery.AccountView> list(
      @RequestParam(required = false) String after,
      @RequestParam(required = false) Integer limit,
      HttpServletRequest request) {
    authorizer.require(request, "iam:UpdateUser", "wpt:iam:user:*");
    // Keyset paginated on the user id, so a new account appearing mid-scan cannot
    // shift a page, and the cursor carries no email into an access log.
    return accounts.page(after, limit);
  }

  @GetMapping("/{userId}")
  public AccountQuery.AccountView one(@PathVariable String userId, HttpServletRequest request) {
    UUID id = RequestValues.uuid("userId", userId);
    authorizer.require(request, "iam:UpdateUser", "wpt:iam:user:" + id);
    return accounts.byId(id);
  }

  /**
   * R-IAM-40. What this person may do and why. It reveals which policies reach
   * them, so it needs the permission to read policy, on this person.
   */
  @GetMapping("/{userId}/access")
  public AccessExplanationQuery.AccessView access(
      @PathVariable String userId, HttpServletRequest request) {
    UUID id = RequestValues.uuid("userId", userId);
    authorizer.require(request, "iam:ReadPolicy", "wpt:iam:user:" + id);
    return access.forUser(id);
  }

  /** One action on one resource, answered as a command from this person would be. */
  @GetMapping("/{userId}/access/check")
  public AccessExplanationQuery.CheckView check(
      @PathVariable String userId,
      @RequestParam String action,
      @RequestParam(required = false) String resource,
      HttpServletRequest request) {
    UUID id = RequestValues.uuid("userId", userId);
    authorizer.require(request, "iam:ReadPolicy", "wpt:iam:user:" + id);
    return access.check(id, action, resource);
  }

  @GetMapping("/driver-assignments")
  public Page<AccountQuery.AssignmentView> assignments(
      @RequestParam(required = false) String on,
      @RequestParam(required = false) String after,
      @RequestParam(required = false) Integer limit,
      HttpServletRequest request) {
    authorizer.require(request, "iam:AssignDriver", "wpt:iam:assignment:*");
    return accounts.assignments(RequestValues.optionalDate("on", on), after, limit);
  }


}
