"use client";

import { useState } from "react";
import { ApiError, friendlyError } from "@shared/api/problem";
import type { PolicyDetailView, PolicyDocument } from "@shared/domain/identity";
import { createPolicy, createVersion, fetchPolicy, putVersionInForce } from "../data/policies";
import { Modal, field, primary, secondary } from "./components";

const STARTER: PolicyDocument = {
  Version: "2026-10-06",
  Statement: [{ Sid: "Describe", Effect: "Allow", Action: ["order:Read"], Resource: ["*"] }],
};

/** Parsed document, or the reason it cannot be one. The server validates it again. */
function parse(text: string): PolicyDocument | string {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    return "This is not valid JSON.";
  }
  if (!value || typeof value !== "object" || !Array.isArray((value as PolicyDocument).Statement) || !(value as PolicyDocument).Statement.length) {
    return "A policy needs a Statement list with at least one statement.";
  }
  return value as PolicyDocument;
}

/** What the server refused, with any action names it did not recognise. */
function problemText(failure: unknown): string {
  const base = friendlyError(failure);
  if (failure instanceof ApiError && failure.problem.violations.length) {
    return `${base}: ${failure.problem.violations.map((v) => v.rule).join(", ")}`;
  }
  return base;
}

/**
 * A new version of an existing policy. Saving adds a version and leaves the one in
 * force alone, unless the administrator also chooses to put it in force: two
 * versioned commands, each refused if someone else changed the policy first.
 */
export function VersionEditor({ policy, from, onClose, onSaved }: {
  policy: PolicyDetailView;
  from: PolicyDocument;
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const [text, setText] = useState(JSON.stringify(from, null, 2));
  const [inForce, setInForce] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    const document = parse(text);
    if (typeof document === "string") return setError(document);
    setBusy(true);
    setError(null);
    try {
      const ack = await createVersion(policy, document);
      const created = ack.result.versionNumber;
      if (inForce) {
        // The create moved the policy's version; read it again before the second command.
        await putVersionInForce(await fetchPolicy(policy.name), created);
        onSaved(`Version ${created} of ${policy.name} is saved and now in force.`);
      } else {
        onSaved(`Version ${created} of ${policy.name} is saved. The version in force is unchanged.`);
      }
    } catch (failure) {
      setError(problemText(failure));
      setBusy(false);
    }
  }

  return <Modal title={`New version of ${policy.name}`} onClose={onClose} wide>
    <div className="space-y-3">
      <p className="text-sm text-go-secondary">Versions are never edited. This saves version {Math.max(...policy.versions.map((v) => v.versionNumber)) + 1}; earlier versions stay as they were, so past decisions remain explainable.</p>
      <label className="block text-sm font-medium">Policy document<textarea className={`${field} mt-1 h-80 font-mono text-xs`} value={text} onChange={(event) => setText(event.target.value)} spellCheck={false} /></label>
      <label className="flex items-start gap-2 text-sm"><input className="mt-1" type="checkbox" checked={inForce} onChange={(event) => setInForce(event.target.checked)} /><span>Put it in force now. Everyone it is attached to gets these permissions on their next action.</span></label>
      {error && <p className="text-sm text-go-danger-strong" role="alert">{error}</p>}
      <div className="flex justify-end gap-2"><button className={secondary} onClick={onClose} disabled={busy}>Cancel</button><button className={primary} onClick={save} disabled={busy}>{busy ? "Saving..." : "Save version"}</button></div>
    </div>
  </Modal>;
}

/** A new policy, attached to nobody until the administrator attaches it. */
export function NewPolicy({ onClose, onSaved }: { onClose: () => void; onSaved: (name: string) => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [text, setText] = useState(JSON.stringify(STARTER, null, 2));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    if (!/^[A-Za-z][A-Za-z0-9_-]*$/.test(name)) return setError("A name starts with a letter and uses letters, digits, hyphens or underscores.");
    const document = parse(text);
    if (typeof document === "string") return setError(document);
    setBusy(true);
    setError(null);
    try {
      await createPolicy(name, description, document);
      onSaved(name);
    } catch (failure) {
      setError(problemText(failure));
      setBusy(false);
    }
  }

  return <Modal title="New policy" onClose={onClose} wide>
    <div className="space-y-3">
      <label className="block text-sm font-medium">Name<input className={`${field} mt-1`} value={name} onChange={(event) => setName(event.target.value)} placeholder="KandyDispatchers" /></label>
      <label className="block text-sm font-medium">What it is for<input className={`${field} mt-1`} value={description} onChange={(event) => setDescription(event.target.value)} /></label>
      <label className="block text-sm font-medium">Policy document<textarea className={`${field} mt-1 h-64 font-mono text-xs`} value={text} onChange={(event) => setText(event.target.value)} spellCheck={false} /></label>
      <p className="text-xs text-go-secondary">It changes nobody&apos;s access until you attach it to a role or a person.</p>
      {error && <p className="text-sm text-go-danger-strong" role="alert">{error}</p>}
      <div className="flex justify-end gap-2"><button className={secondary} onClick={onClose} disabled={busy}>Cancel</button><button className={primary} onClick={save} disabled={busy}>{busy ? "Saving..." : "Create policy"}</button></div>
    </div>
  </Modal>;
}
