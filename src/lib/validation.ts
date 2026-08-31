import { z } from "zod";

// Postgres accepts any 128-bit UUID representation, including deterministic demo IDs.
export const userIdSchema = z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, "A valid user is required.");
export const titleSchema = z.string().trim().min(1, "A document title is required.").max(120, "Titles must be 120 characters or less.");
export const contentSchema = z.object({ type: z.literal("doc"), content: z.array(z.unknown()).optional() }).passthrough();
export const permissionSchema = z.enum(["viewer", "editor"]);
