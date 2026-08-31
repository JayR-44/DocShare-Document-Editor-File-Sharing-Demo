import type { DocumentPermission } from "./types";

export function canEditDocument(ownerId: string, currentUserId: string, permission?: DocumentPermission | null) {
  return ownerId === currentUserId || permission === "editor";
}

export function canManageSharing(ownerId: string, currentUserId: string) { return ownerId === currentUserId; }
