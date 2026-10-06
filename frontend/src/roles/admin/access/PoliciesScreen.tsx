"use client";

import { useCallback, useEffect, useState } from "react";
import { friendlyError } from "@shared/api/problem";
import type { AccountView, PolicyDetailView, PolicyDocument, PolicySummaryView, RoleView } from "@shared/domain/identity";
import { fetchAccounts } from "../data/accounts";
import { fetchRoles } from "../data/access";
import { fetchPolicies, fetchPolicy, putVersionInForce, setAttached } from "../data/policies";
import { Badge, Empty, Modal, card, field, primary, secondary } from "./components";
import { NewPolicy, VersionEditor } from "./PolicyEditor";
import { when } from "./policyText";

type Confirm =
  | { kind: "in-force"; versionNumber: number }
  | { kind: "detach"; principalType: "user" | "role"; principalId: string; label: string };

/**
 * Permission editing (R-IAM-39). Every change is one of the existing versioned
 * policy commands; the server re-reads, re-validates and refuses a change that
 * would leave nobody able to change the policy again.
 */
export function PoliciesScreen() {
  const [policies, setPolicies] = useState<PolicySummaryView[] | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback((signal?: AbortSignal) => {
    fetchPolicies(signal).then(setPolicies).catch((failure) => { if (!signal?.aborted) setError(friendlyError(failure)); });
  }, []);
  useEffect(() => { const controller = new AbortController(); load(controller.signal); return () => controller.abort(); }, [load]);

  if (selected) return <PolicyDetail name={selected} onBack={() => { setSelected(null); load(); }} />;

  return <div className="space-y-5">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div><h2 className="text-2xl font-semibold">Policies</h2><p className="text-sm text-go-secondary">What each role or person may do. A policy changes access only where it is attached, through the version in force.</p></div>
      <button className={primary} onClick={() => setCreating(true)}>+ New policy</button>
    </div>
    {notice && <p className="rounded-go-card-s bg-go-subtle p-3 text-sm" role="status">{notice}</p>}
    {error ? <Empty>{error}</Empty> : !policies ? <Empty>Reading policies...</Empty> : <div className={card}>
      {policies.map((policy) => <button key={policy.policyId} className="flex min-h-14 w-full items-center justify-between border-b border-go-rule px-5 py-3 text-left last:border-0 hover:bg-go-subtle" onClick={() => setSelected(policy.name)}>
        <span className="font-medium">{policy.name}</span>
        <span className="text-sm text-go-secondary">Version {policy.defaultVersion} in force</span>
      </button>)}
    </div>}
    {creating && <NewPolicy onClose={() => setCreating(false)} onSaved={(name) => { setCreating(false); setNotice(`${name} created. Attach it to change anyone's access.`); setSelected(name); }} />}
  </div>;
}

function PolicyDetail({ name, onBack }: { name: string; onBack: () => void }) {
  const [policy, setPolicy] = useState<PolicyDetailView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [shown, setShown] = useState<number | null>(null);
  const [editFrom, setEditFrom] = useState<PolicyDocument | null>(null);
  const [confirm, setConfirm] = useState<Confirm | null>(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setPolicy(await fetchPolicy(name));
      setError(null);
    } catch (failure) {
      setError(friendlyError(failure));
    }
  }, [name]);
  useEffect(() => { void reload(); }, [reload]);

  async function run(work: (fresh: PolicyDetailView) => Promise<unknown>, message: string) {
    setBusy(true);
    setActionError(null);
    try {
      // Always from a fresh read, so the command names the version the server holds now.
      await work(await fetchPolicy(name));
      setNotice(message);
      setConfirm(null);
      await reload();
    } catch (failure) {
      setActionError(friendlyError(failure));
    } finally {
      setBusy(false);
    }
  }

  if (error) return <div className="space-y-4"><button className="min-h-11 text-sm font-semibold text-go-teal" onClick={onBack}>← Back to policies</button><Empty>{error}</Empty></div>;
  if (!policy) return <Empty>Reading {name}...</Empty>;

  const current = policy.versions.find((version) => version.inForce);

  return <div className="space-y-5">
    <button className="min-h-11 text-sm font-semibold text-go-teal" onClick={onBack}>← Back to policies</button>
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div><h2 className="text-3xl font-semibold">{policy.name}</h2><p className="text-go-secondary">{policy.description || "No description"}</p></div>
      <Badge tone="green">Version {policy.defaultVersion} in force</Badge>
    </div>
    {notice && <p className="rounded-go-card-s bg-go-subtle p-3 text-sm" role="status">{notice}</p>}

    <section className={`${card} space-y-3 p-5`}>
      <h3 className="font-semibold">Attached to</h3>
      {policy.attachments.length === 0 ? <p className="text-sm text-go-secondary">Nobody. This policy changes no one&apos;s access until it is attached.</p> : <ul>{policy.attachments.map((attachment) => <li key={`${attachment.principalType}:${attachment.principalId}`} className="flex flex-wrap items-center justify-between gap-2 border-b border-go-rule py-2 last:border-0">
        <span className="text-sm"><Badge tone="blue">{attachment.principalType === "role" ? "Role" : "Person"}</Badge> <span className="ml-2 font-medium">{attachment.principalType === "role" ? attachment.principalId.replaceAll("_", " ") : attachment.label ?? attachment.principalId}</span>{attachment.principalType === "role" && attachment.label && <span className="ml-2 text-go-secondary">{attachment.label}</span>}</span>
        <button className={secondary} onClick={() => setConfirm({ kind: "detach", principalType: attachment.principalType, principalId: attachment.principalId, label: attachment.label ?? attachment.principalId })}>Detach</button>
      </li>)}</ul>}
      <AttachForm busy={busy} onAttach={(type, id, label) => run((fresh) => setAttached(fresh, type, id, true), `${policy.name} is now attached to ${label}.`)} />
    </section>

    <section className={`${card} space-y-3 p-5`}>
      <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-semibold">Versions</h3>{current && <button className={primary} onClick={() => setEditFrom(current.document)}>New version from the one in force</button>}</div>
      <ul>{policy.versions.map((version) => <li key={version.versionNumber} className="border-b border-go-rule py-3 last:border-0">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm"><span className="font-medium">Version {version.versionNumber}</span>{version.inForce && <span className="ml-2"><Badge tone="green">In force</Badge></span>}<span className="ml-2 text-go-secondary">{when(version.createdAt)}{version.createdBy ? ` · ${version.createdBy}` : ""}</span></span>
          <span className="flex gap-2">
            <button className={secondary} onClick={() => setShown(shown === version.versionNumber ? null : version.versionNumber)}>{shown === version.versionNumber ? "Hide" : "View"}</button>
            <button className={secondary} onClick={() => setEditFrom(version.document)}>Copy to new version</button>
            {!version.inForce && <button className={primary} onClick={() => setConfirm({ kind: "in-force", versionNumber: version.versionNumber })}>Put in force</button>}
          </span>
        </div>
        {shown === version.versionNumber && <pre className="mt-2 max-h-96 overflow-auto rounded-go-card-s bg-go-subtle p-3 text-xs">{JSON.stringify(version.document, null, 2)}</pre>}
      </li>)}</ul>
    </section>

    {editFrom && <VersionEditor policy={policy} from={editFrom} onClose={() => setEditFrom(null)} onSaved={async (message) => { setEditFrom(null); setNotice(message); await reload(); }} />}
    {confirm && <Modal title={confirm.kind === "in-force" ? `Put version ${confirm.versionNumber} in force?` : `Detach from ${confirm.label}?`} onClose={() => { setConfirm(null); setActionError(null); }}>
      <div className="space-y-3 text-sm">
        <p>{confirm.kind === "in-force"
          ? `Everyone ${policy.name} is attached to gets the permissions of version ${confirm.versionNumber} on their next action. Version ${policy.defaultVersion} stays available to put back.`
          : `${confirm.label} loses whatever ${policy.name} grants, and is freed from whatever it blocks, on their next action.`}</p>
        <p className="text-go-secondary">The server refuses a change that would leave nobody able to change this policy again.</p>
        {actionError && <p className="text-go-danger-strong" role="alert">{actionError}</p>}
        <div className="flex justify-end gap-2">
          <button className={secondary} disabled={busy} onClick={() => { setConfirm(null); setActionError(null); }}>Cancel</button>
          <button className={primary} disabled={busy} onClick={() => confirm.kind === "in-force"
            ? run((fresh) => putVersionInForce(fresh, confirm.versionNumber), `Version ${confirm.versionNumber} of ${policy.name} is now in force.`)
            : run((fresh) => setAttached(fresh, confirm.principalType, confirm.principalId, false), `${policy.name} is detached from ${confirm.label}.`)}>
            {busy ? "Saving..." : confirm.kind === "in-force" ? "Put in force" : "Detach"}
          </button>
        </div>
      </div>
    </Modal>}
    {!confirm && actionError && <p className="text-sm text-go-danger-strong" role="alert">{actionError}</p>}
  </div>;
}

function AttachForm({ busy, onAttach }: { busy: boolean; onAttach: (type: "user" | "role", id: string, label: string) => void }) {
  const [type, setType] = useState<"role" | "user">("role");
  const [roles, setRoles] = useState<RoleView[]>([]);
  const [people, setPeople] = useState<AccountView[]>([]);
  const [target, setTarget] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetchRoles({ signal: controller.signal }).then((page) => setRoles(page.items)).catch(() => undefined);
    fetchAccounts({ signal: controller.signal }).then((page) => setPeople(page.items)).catch(() => undefined);
    return () => controller.abort();
  }, []);

  const options = type === "role"
    ? roles.map((role) => ({ id: role.roleCode, label: `${role.roleCode.replaceAll("_", " ")} role` }))
    : people.map((person) => ({ id: person.userId, label: `${person.displayName} (${person.email})` }));
  const chosen = options.find((option) => option.id === target);

  return <div className="grid gap-3 border-t border-go-rule pt-3 md:grid-cols-[10rem_1fr_auto] md:items-end">
    <label className="text-sm font-medium">Attach to<select className={`${field} mt-1`} value={type} onChange={(event) => { setType(event.target.value as "role" | "user"); setTarget(""); }}><option value="role">A role</option><option value="user">A person</option></select></label>
    <label className="text-sm font-medium">{type === "role" ? "Role" : "Person"}<select className={`${field} mt-1`} value={target} onChange={(event) => setTarget(event.target.value)}><option value="">Choose...</option>{options.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select></label>
    <button className={primary} disabled={busy || !chosen} onClick={() => chosen && onAttach(type, chosen.id, chosen.label)}>Attach</button>
  </div>;
}
