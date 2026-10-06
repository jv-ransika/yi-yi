import type { AccessOutcome, AccessSourceView } from "@shared/domain/identity";
import { clock, dayLabel, depotToday } from "@shared/wording";

// How permission explanations read. The decision is the server's; these only word it.

const MODULE_LABEL: Record<string, string> = {
  referencedata: "Reference data",
  identity: "People and access",
  ordering: "Orders",
  planning: "Planning",
  loading: "Loading",
  execution: "Delivery",
  receipt: "Receipt",
  issues: "Issues",
  warehouse: "Warehouse",
  sync: "Offline sync",
  notification: "Notifications",
  intelligence: "Forecasts and models",
  messaging: "Messages",
  demo: "Demo",
  platform: "Platform",
  audit: "Audit",
  mcp: "AI assistants",
};

export function moduleLabel(module: string): string {
  return MODULE_LABEL[module] ?? module.charAt(0).toUpperCase() + module.slice(1);
}

export const OUTCOME_LABEL: Record<AccessOutcome, string> = {
  allowed: "Allowed",
  blocked: "Blocked",
  not_granted: "Not granted",
};

export const OUTCOME_TONE: Record<AccessOutcome, "green" | "red" | "neutral"> = {
  allowed: "green",
  blocked: "red",
  not_granted: "neutral",
};

/** "through the dispatcher role" or "attached to this person". */
export function attachedText(attachedTo: string): string {
  return attachedTo === "user" ? "attached to this person" : `through the ${attachedTo.replaceAll("_", " ")} role`;
}

/** One line per statement: which policy, which version, how it reaches the person, and its limits. */
export function sourceText(source: AccessSourceView): string {
  const verb = source.effect === "Deny" ? "Blocked by" : "Allowed by";
  const limits = source.resources.length && !(source.resources.length === 1 && source.resources[0] === "*")
    ? ` · only for ${source.resources.join(", ")}`
    : "";
  const conditions = source.conditions.length ? ` · when ${source.conditions.join(" and ")}` : "";
  const statement = source.statement ? ` (statement ${source.statement})` : "";
  return `${verb} ${source.policy} version ${source.version}, ${attachedText(source.attachedTo)}${statement}${limits}${conditions}`;
}

/** A recorded moment in depot time, such as "Tue 6 Oct · 14:05". */
export function when(value: string | null): string {
  if (!value) return "Unknown time";
  return `${dayLabel(depotToday(new Date(value)))} · ${clock(value)}`;
}
