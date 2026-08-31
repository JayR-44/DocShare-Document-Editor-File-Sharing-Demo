# Architecture

## Overview

DocShare is a single Next.js application with a React client, Next.js Route Handlers for backend behavior, and Supabase Postgres for persistence. Keeping the frontend and backend in one deployable application reduces setup overhead while preserving a clear server-side boundary for document access.

```text
Browser
  -> Next.js page and TipTap editor
  -> Next.js Route Handlers (/api/*)
  -> Supabase JavaScript client (server-only secret key)
  -> Supabase Postgres
```

The browser never receives Supabase credentials. It calls only the application API.

## Components

| Layer | Responsibility |
| --- | --- |
| `src/app/page.tsx` | Workspace UI, active-user switcher, document list, import, sharing, and deletion interactions. |
| `src/components/rich-text-editor.tsx` | TipTap editor and requested formatting controls. |
| `src/app/api/*` | Validation, document CRUD, imports, sharing, and permission enforcement. |
| `src/lib/supabase.ts` | Creates the server-side Supabase client from `SUPABASE_URL` and `SUPABASE_SECRET_KEY`. |
| `src/lib/documents.ts` | Maps database records to API responses and resolves a user's document permission. |
| `src/lib/validation.ts` | Shared request validation rules. |
| `supabase/schema.sql` | Database schema, indexes, update trigger, and seeded demo users. |

## Data Model

### `profiles`

Represents seeded demonstration users. Each profile has an ID, name, and email.

### `documents`

Stores a title, owner, timestamps, and the TipTap JSON document structure. JSON preserves rich-text semantics when a document is saved and reopened.

### `document_shares`

Represents document access granted to a profile. The composite primary key on `(document_id, user_id)` prevents duplicate shares. Permission is either `viewer` or `editor`.

Deleting a document cascades to its `document_shares` records through the foreign-key relationship.

## Request Flow

1. The active-user selector provides one seeded user ID for the assessment demo.
2. The browser calls the appropriate `/api` Route Handler with that user ID.
3. The handler validates the request and loads document ownership or a matching share record.
4. The handler permits or rejects the action before querying or mutating Supabase.
5. The handler returns a normalized document response for the client to render.

## Access Rules

| Capability | Owner | Editor | Viewer |
| --- | --- | --- | --- |
| Read document | Yes | Yes | Yes |
| Edit title/content | Yes | Yes | No |
| Share document | Yes | No | No |
| Delete document | Yes | No | No |

The active-user selector is a deliberate mock-authentication boundary for the assessment. In production, replace it with Supabase Auth, derive the user ID from a verified server session, and retain the same server-side authorization checks.

## File Import

The application accepts `.txt` and `.md` files up to 200 KB. The browser reads the file content, then the import route converts simple Markdown headings and lists to TipTap JSON before saving a new document. Imported source files are not retained in storage, which keeps the workflow focused on document creation rather than file hosting.

## Security

`SUPABASE_SECRET_KEY` is available only to Next.js Route Handlers and is excluded from Git. It bypasses Supabase Row Level Security, so application-level access checks are mandatory and are performed before every document read, edit, share, or delete action.

## Tradeoffs

- No real-time cursors, conflict resolution, comments, revisions, or presence indicators.
- No Supabase Auth in the assessment version; seeded users make sharing behavior easy to demonstrate.
- No DOCX parsing or persistent attachments; import is intentionally limited to `.txt` and `.md`.
- The product favors a reliable persisted document lifecycle and server-enforced sharing over broader Google Docs parity.
