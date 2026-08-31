"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { RichTextEditor } from "@/components/rich-text-editor";
import type { DocumentItem, DocumentPermission, User } from "@/lib/types";

const EMPTY_DOCUMENT = { type: "doc", content: [{ type: "paragraph" }] };

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(value));
}

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [activeUserId, setActiveUserId] = useState("");
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [shareTargetId, setShareTargetId] = useState("");
  const [sharePermission, setSharePermission] = useState<DocumentPermission>("editor");
  const activeDocument = useMemo(() => documents.find((document) => document.id === activeDocumentId) ?? null, [activeDocumentId, documents]);
  const activeUser = users.find((user) => user.id === activeUserId) ?? null;

  async function loadDocuments(userId: string) {
    setLoading(true); setError("");
    try {
      const response = await fetch(`/api/documents?userId=${encodeURIComponent(userId)}`);
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Unable to load documents.");
      setDocuments(payload.documents);
      setActiveDocumentId((current) => current ?? payload.documents[0]?.id ?? null);
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Unable to load documents."); }
    finally { setLoading(false); }
  }

  useEffect(() => { void (async () => {
    try {
      const response = await fetch("/api/users"); const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Unable to load users.");
      setUsers(payload.users);
      const initialUserId = payload.users[0]?.id;
      if (!initialUserId) { setLoading(false); return; }
      setActiveUserId(initialUserId);
      const documentsResponse = await fetch(`/api/documents?userId=${encodeURIComponent(initialUserId)}`);
      const documentsPayload = await documentsResponse.json();
      if (!documentsResponse.ok) throw new Error(documentsPayload.error ?? "Unable to load documents.");
      setDocuments(documentsPayload.documents);
      setActiveDocumentId(documentsPayload.documents[0]?.id ?? null);
      setLoading(false);
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Unable to initialize workspace."); setLoading(false); }
  })(); }, []);

  async function createDocument() {
    if (!activeUserId) return; setSaving(true);
    try {
      const response = await fetch("/api/documents", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: activeUserId, title: "Untitled document", content: EMPTY_DOCUMENT }) });
      const payload = await response.json(); if (!response.ok) throw new Error(payload.error ?? "Unable to create document.");
      setDocuments((current) => [payload.document, ...current]); setActiveDocumentId(payload.document.id);
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Unable to create document."); }
    finally { setSaving(false); }
  }

  async function updateDocument(changes: Record<string, unknown>) {
    if (!activeDocument || !activeUserId || activeDocument.permission === "viewer") return; setSaving(true);
    try {
      const response = await fetch(`/api/documents/${activeDocument.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: activeUserId, ...changes }) });
      const payload = await response.json(); if (!response.ok) throw new Error(payload.error ?? "Unable to save document.");
      setDocuments((current) => current.map((document) => document.id === payload.document.id ? payload.document : document));
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Unable to save document."); }
    finally { setSaving(false); }
  }

  async function shareDocument() {
    if (!activeDocument || !activeUserId || !shareTargetId) return;
    try {
      const response = await fetch(`/api/documents/${activeDocument.id}/shares`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: activeUserId, targetUserId: shareTargetId, permission: sharePermission }) });
      const payload = await response.json(); if (!response.ok) throw new Error(payload.error ?? "Unable to share document.");
      setShareTargetId(""); setError("");
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Unable to share document."); }
  }

  async function deleteDocument() {
    if (!activeDocument || !activeUserId) return;
    if (!window.confirm(`Delete "${activeDocument.title || "Untitled document"}"? This cannot be undone.`)) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/documents/${activeDocument.id}`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: activeUserId }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Unable to delete document.");
      setDocuments((current) => {
        const remaining = current.filter((document) => document.id !== payload.deletedId);
        setActiveDocumentId(remaining[0]?.id ?? null);
        return remaining;
      });
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Unable to delete document."); }
    finally { setSaving(false); }
  }

  async function importFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; event.target.value = ""; if (!file || !activeUserId) return;
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (extension !== "txt" && extension !== "md") { setError("Only .txt and .md files can be imported."); return; }
    if (file.size > 200_000) { setError("Files must be smaller than 200 KB."); return; }
    setSaving(true);
    try {
      const rawText = await file.text();
      const response = await fetch("/api/import", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: activeUserId, fileName: file.name, rawText }) });
      const payload = await response.json(); if (!response.ok) throw new Error(payload.error ?? "Unable to import file.");
      setDocuments((current) => [payload.document, ...current]); setActiveDocumentId(payload.document.id);
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Unable to import file."); }
    finally { setSaving(false); }
  }

  const ownedDocuments = documents.filter((document) => document.ownerId === activeUserId);
  const sharedDocuments = documents.filter((document) => document.ownerId !== activeUserId);
  return <main className="workspace-shell">
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark">D</span><span>DocShare</span></div>
      <button className="primary-button" type="button" onClick={() => void createDocument()} disabled={saving}>New document</button>
      <label className="import-button">Import .txt or .md<input type="file" accept=".txt,.md,text/plain,text/markdown" onChange={importFile} /></label>
      <div className="document-nav"><p className="section-label">My documents</p>{ownedDocuments.map((document) => <DocumentLink key={document.id} document={document} active={document.id === activeDocumentId} onClick={() => setActiveDocumentId(document.id)} />)}<p className="section-label section-label-spaced">Shared with me</p>{sharedDocuments.map((document) => <DocumentLink key={document.id} document={document} active={document.id === activeDocumentId} onClick={() => setActiveDocumentId(document.id)} />)}{!loading && documents.length === 0 && <p className="empty-list">No documents yet.</p>}</div>
      <label className="user-switcher">Viewing as<select value={activeUserId} onChange={(event) => { const nextUserId = event.target.value; setActiveDocumentId(null); setActiveUserId(nextUserId); if (nextUserId) void loadDocuments(nextUserId); }}><option value="">Select user</option>{users.map((user) => <option value={user.id} key={user.id}>{user.name}</option>)}</select></label>
    </aside>
    <section className="document-area">
      <header className="topbar"><div>{activeDocument && <span className="status-text">{saving ? "Saving" : "Saved"}</span>}</div><div className="topbar-actions">{activeDocument?.ownerId === activeUserId && <><details className="share-menu"><summary>Share</summary><div className="share-panel"><p>Give a teammate access</p><select value={shareTargetId} onChange={(event) => setShareTargetId(event.target.value)}><option value="">Select teammate</option>{users.filter((user) => user.id !== activeUserId).map((user) => <option value={user.id} key={user.id}>{user.name}</option>)}</select><select value={sharePermission} onChange={(event) => setSharePermission(event.target.value as DocumentPermission)}><option value="editor">Can edit</option><option value="viewer">Can view</option></select><button type="button" onClick={() => void shareDocument()} disabled={!shareTargetId}>Invite</button></div></details><button className="delete-button" type="button" onClick={() => void deleteDocument()} disabled={saving}>Delete</button></>}<span className="avatar" title={activeUser?.name}>{activeUser?.name?.slice(0, 1) ?? "?"}</span></div></header>
      {error && <div className="error-banner" role="alert">{error}</div>}
      {loading ? <div className="loading-state">Loading workspace...</div> : activeDocument ? <article className="document-canvas"><div className="document-meta"><span>{activeDocument.ownerId === activeUserId ? "Owned by you" : `Shared by ${activeDocument.ownerName}`}</span>{activeDocument.permission === "viewer" && <span className="readonly-badge">View only</span>}</div><input className="document-title" value={activeDocument.title} onChange={(event) => setDocuments((current) => current.map((document) => document.id === activeDocument.id ? { ...document, title: event.target.value } : document))} onBlur={(event) => void updateDocument({ title: event.target.value })} disabled={activeDocument.permission === "viewer"} aria-label="Document title" /><RichTextEditor key={activeDocument.id} content={activeDocument.content} editable={activeDocument.permission !== "viewer"} onChange={(content) => void updateDocument({ content })} /><p className="updated-at">Last updated {formatDate(activeDocument.updatedAt)}</p></article> : <div className="loading-state">Create a document or import a text file to begin.</div>}
    </section>
  </main>;
}

function DocumentLink({ document, active, onClick }: { document: DocumentItem; active: boolean; onClick: () => void }) {
  return <button type="button" className={`document-link ${active ? "document-link-active" : ""}`} onClick={onClick}><span>{document.title || "Untitled document"}</span><small>{formatDate(document.updatedAt)}</small></button>;
}
