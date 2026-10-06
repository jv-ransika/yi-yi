"use client";

import { useEffect, useMemo, useState } from "react";
import { friendlyError } from "@shared/api/problem";
import type { AccessCheckView, AccountAccessView, AccessOutcome } from "@shared/domain/identity";
import { checkAccess, fetchAccess } from "../data/policies";
import { Badge, Empty, card, field, primary, secondary } from "./components";
import { OUTCOME_LABEL, OUTCOME_TONE, moduleLabel, sourceText } from "./policyText";

type Filter = "all" | AccessOutcome | "limited";
type Row = AccountAccessView["actions"][number];

/**
 * R-IAM-40: what this person may do and why, as the server decides it. Nothing is
 * evaluated here; a second evaluator in the browser would one day explain a
 * decision the system did not take.
 */
export function MemberAccessPanel({ userId, onOpenPolicies }: { userId: string; onOpenPolicies: () => void }) {
  const [access, setAccess] = useState<AccountAccessView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setAccess(null);
    setError(null);
    fetchAccess(userId, controller.signal)
      .then(setAccess)
      .catch((failure) => { if (!controller.signal.aborted) setError(friendlyError(failure)); });
    return () => controller.abort();
  }, [userId]);

  const groups = useMemo(() => {
    if (!access) return [];
    const wanted = query.trim().toLowerCase();
    const rows = access.actions.filter((row) => {
      if (filter === "limited" ? row.limited.length === 0 : filter !== "all" && row.outcome !== filter) return false;
      return !wanted || `${row.description} ${row.action}`.toLowerCase().includes(wanted);
    });
    const byModule = new Map<string, Row[]>();
    for (const row of rows) byModule.set(row.module, [...(byModule.get(row.module) ?? []), row]);
    return [...byModule.entries()];
  }, [access, query, filter]);

  if (error) return <section className={`${card} p-6`}><h3 className="text-lg font-semibold">Access could not be read</h3><p className="mt-2 text-sm text-go-secondary">{error}</p></section>;
  if (!access) return <section className={`${card} p-6 text-sm text-go-secondary`}>Reading this person&apos;s access...</section>;

  const count = (outcome: AccessOutcome) => access.actions.filter((row) => row.outcome === outcome).length;
  const places = [...access.depots, ...access.outlets];

  return <div className="space-y-4">
    <section className={`${card} space-y-3 p-6`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">What this person may do</h3>
          <p className="mt-1 text-sm text-go-secondary">Decided by the server from the policies attached to this person and to their roles. Policies decide what; assigned places decide where.</p>
        </div>
        <button className={secondary} onClick={onOpenPolicies}>Change access in Policies</button>
      </div>
      {!access.active && <p className="rounded-go-card-s bg-go-subtle p-3 text-sm">This account is inactive, so it cannot sign in, whatever its policies allow.</p>}
      <div className="flex flex-wrap gap-2">
        <Badge tone="green">{count("allowed")} allowed</Badge>
        <Badge tone="red">{count("blocked")} blocked</Badge>
        <Badge>{count("not_granted")} not granted</Badge>
        <Badge tone="amber">{access.actions.filter((row) => row.limited.length).length} only for some places</Badge>
      </div>
      <p className="text-sm text-go-secondary">Roles: {access.roles.length ? access.roles.map((role) => role.replaceAll("_", " ")).join(", ") : "none"} · Places: {places.length ? places.join(", ") : "none assigned"}</p>
    </section>

    <CheckForm userId={userId} actions={access.actions} />

    <div className={`${card} grid gap-3 p-4 md:grid-cols-[1fr_14rem]`}>
      <label className="text-sm font-medium">Search<input className={`${field} mt-1`} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Capability or action" /></label>
      <label className="text-sm font-medium">Show<select className={`${field} mt-1`} value={filter} onChange={(event) => setFilter(event.target.value as Filter)}>
        <option value="all">Everything</option>
        <option value="allowed">Allowed</option>
        <option value="blocked">Blocked</option>
        <option value="not_granted">Not granted</option>
        <option value="limited">Only for some places</option>
      </select></label>
    </div>

    {groups.length === 0 ? <Empty>Nothing matches these filters.</Empty> : groups.map(([module, rows]) => <section key={module} className={card}>
      <h4 className="border-b border-go-rule px-5 py-3 text-sm font-semibold">{moduleLabel(module)}</h4>
      <ul>{rows.map((row) => <li key={row.action} className="border-b border-go-rule px-5 py-3 last:border-0">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div><p className="text-sm font-medium">{row.description}</p><p className="font-mono text-xs text-go-secondary">{row.action}</p></div>
          <div className="flex items-center gap-2">
            {row.limited.length > 0 && <Badge tone="amber">Some places</Badge>}
            <Badge tone={OUTCOME_TONE[row.outcome]}>{OUTCOME_LABEL[row.outcome]}</Badge>
            <button className="min-h-11 px-2 text-sm font-semibold text-go-teal" aria-expanded={open === row.action} onClick={() => setOpen(open === row.action ? null : row.action)}>Why?</button>
          </div>
        </div>
        {open === row.action && <Why row={row} />}
      </li>)}</ul>
    </section>)}
  </div>;
}

function Why({ row }: { row: Row }) {
  return <div className="mt-3 space-y-2 rounded-go-card-s bg-go-subtle p-3 text-sm">
    {row.outcome === "not_granted" && <p>No policy reaching this person grants it, so it is refused by default.</p>}
    {row.outcome === "blocked" && <p>A block beats every grant, wherever it comes from.</p>}
    {row.sources.map((source, index) => <p key={`s${index}`}>{sourceText(source)}</p>)}
    {row.limited.length > 0 && <>
      <p className="font-medium">Also, for particular places or conditions only:</p>
      {row.limited.map((source, index) => <p key={`l${index}`}>{sourceText(source)}</p>)}
    </>}
  </div>;
}

function CheckForm({ userId, actions }: { userId: string; actions: Row[] }) {
  const [action, setAction] = useState(actions[0]?.action ?? "");
  const [resource, setResource] = useState("");
  const [result, setResult] = useState<AccessCheckView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function run() {
    setBusy(true);
    setError(null);
    try {
      setResult(await checkAccess(userId, action, resource));
    } catch (failure) {
      setResult(null);
      setError(friendlyError(failure));
    } finally {
      setBusy(false);
    }
  }

  return <section className={`${card} space-y-3 p-5`}>
    <h4 className="font-semibold">Check one action on one place</h4>
    <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
      <label className="text-sm font-medium">Action<select className={`${field} mt-1`} value={action} onChange={(event) => setAction(event.target.value)}>
        {actions.map((row) => <option key={row.action} value={row.action}>{row.description}</option>)}
      </select></label>
      <label className="text-sm font-medium">Place or record (optional)<input className={`${field} mt-1 font-mono`} value={resource} onChange={(event) => setResource(event.target.value)} placeholder="wpt:ref:depot:Peliyagoda" /></label>
      <button className={primary} disabled={busy || !action} onClick={run}>{busy ? "Checking..." : "Check"}</button>
    </div>
    {error && <p className="text-sm text-go-danger-strong">{error}</p>}
    {result && <div className="space-y-1 text-sm">
      <p><Badge tone={result.allowed ? "green" : "red"}>{result.allowed ? "Allowed" : "Not allowed"}</Badge> <span className="ml-2 text-go-secondary">{result.reason}</span></p>
      {result.matching.length === 0 ? <p className="text-go-secondary">No statement speaks to this.</p> : result.matching.map((source, index) => <p key={index}>{sourceText(source)}</p>)}
      <p className="text-xs text-go-secondary">A command also needs the record to be within this person&apos;s assigned places.</p>
    </div>}
  </section>;
}
