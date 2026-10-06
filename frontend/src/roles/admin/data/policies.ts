import { request, requestAll } from "@shared/api/client";
import { newCommand, send } from "@shared/api/commands";
import {
  PolicyCommandKind,
  type AccessCheckView,
  type AccountAccessView,
  type PolicyDetailView,
  type PolicyDocument,
  type PolicySummaryView,
} from "@shared/domain/identity";

// Reads and writes for permission editing (R-IAM-39, R-IAM-40). Every write is a
// versioned command; the decision and its explanation always come from the server.

export function fetchPolicies(signal?: AbortSignal): Promise<PolicySummaryView[]> {
  return requestAll<PolicySummaryView>("/api/policies", { signal });
}

export function fetchPolicy(name: string, signal?: AbortSignal): Promise<PolicyDetailView> {
  return request<PolicyDetailView>(`/api/policies/${encodeURIComponent(name)}`, { signal });
}

export function fetchAccess(userId: string, signal?: AbortSignal): Promise<AccountAccessView> {
  return request<AccountAccessView>(`/api/accounts/${encodeURIComponent(userId)}/access`, { signal });
}

export function checkAccess(userId: string, action: string, resource: string, signal?: AbortSignal): Promise<AccessCheckView> {
  const params = new URLSearchParams({ action });
  if (resource.trim()) params.set("resource", resource.trim());
  return request<AccessCheckView>(`/api/accounts/${encodeURIComponent(userId)}/access/check?${params}`, { signal });
}

/** Adds a version; it is not in force until {@link putVersionInForce}. */
export function createVersion(policy: PolicyDetailView, document: PolicyDocument) {
  return send<{ name: string; versionNumber: number }>(
    newCommand(PolicyCommandKind.CreateVersion, { name: policy.name, document }, policy.rowVersion),
  );
}

export function putVersionInForce(policy: PolicyDetailView, versionNumber: number) {
  return send(newCommand(PolicyCommandKind.SetDefaultVersion, { name: policy.name, versionNumber }, policy.rowVersion));
}

export function setAttached(policy: PolicyDetailView, principalType: "user" | "role", principalId: string, attached: boolean) {
  return send(
    newCommand(
      attached ? PolicyCommandKind.Attach : PolicyCommandKind.Detach,
      { name: policy.name, principalType, principalId },
      policy.rowVersion,
    ),
  );
}

export function createPolicy(name: string, description: string, document: PolicyDocument) {
  return send<{ name: string }>(newCommand(PolicyCommandKind.Create, { name, description, document }));
}
