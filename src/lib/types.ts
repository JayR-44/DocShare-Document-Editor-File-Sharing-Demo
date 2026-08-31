export type DocumentPermission = "owner" | "editor" | "viewer";
export type RichTextContent = Record<string, unknown>;
export type User = { id: string; name: string; email: string };
export type DocumentItem = { id: string; title: string; content: RichTextContent; ownerId: string; ownerName: string; permission: DocumentPermission; createdAt: string; updatedAt: string };
