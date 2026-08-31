import { getSupabaseAdmin } from "./supabase";
import type { DocumentItem, DocumentPermission, RichTextContent } from "./types";

type DatabaseDocument = { id: string; title: string; content: RichTextContent; owner_id: string; created_at: string; updated_at: string; profiles?: { name: string } | { name: string }[] | null };

export function toDocumentItem(document: DatabaseDocument, permission: DocumentPermission): DocumentItem {
  const profile = Array.isArray(document.profiles) ? document.profiles[0] : document.profiles;
  return { id: document.id, title: document.title, content: document.content, ownerId: document.owner_id, ownerName: profile?.name ?? "Unknown owner", permission, createdAt: document.created_at, updatedAt: document.updated_at };
}

export async function getDocumentAccess(documentId: string, userId: string) {
  const supabase = getSupabaseAdmin();
  const { data: document, error } = await supabase.from("documents").select("id,title,content,owner_id,created_at,updated_at,profiles!documents_owner_id_fkey(name)").eq("id", documentId).maybeSingle();
  if (error) throw error;
  if (!document) return null;
  if (document.owner_id === userId) return { document: document as DatabaseDocument, permission: "owner" as const };
  const { data: share, error: shareError } = await supabase.from("document_shares").select("permission").eq("document_id", documentId).eq("user_id", userId).maybeSingle();
  if (shareError) throw shareError;
  if (!share) return null;
  return { document: document as DatabaseDocument, permission: share.permission as "viewer" | "editor" };
}

export function asApiError(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}
