# Ajaia Docs

A lightweight collaborative document workspace built for the Ajaia full-stack assessment.

## What it does

- Create, rename, edit, save, and reopen rich-text documents.
- Format text with bold, italic, underline, H1/H2 headings, bulleted lists, and numbered lists.
- Import `.txt` and `.md` files up to 200 KB as editable documents. Markdown headings and lists are preserved during import.
- Share an owned document with a seeded teammate as an Editor or Viewer.
- Keep owned and shared documents visibly separate in the workspace.
- Persist document content as TipTap JSON in Supabase Postgres.

## Setup

1. Create a Supabase project.
2. In the Supabase SQL Editor, run [`supabase/schema.sql`](./supabase/schema.sql). It creates the tables and the two demo users, Alex Morgan and Sam Lee.
3. Copy `.env.example` to `.env.local` and set the values from Supabase project settings:

   ```bash
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SECRET_KEY=your-secret-key
   ```

   The secret key is used only by Next.js Route Handlers and must never be prefixed with `NEXT_PUBLIC_` or exposed to the browser. A legacy `SUPABASE_SERVICE_ROLE_KEY` also works if your project has not yet created new keys.
4. Install dependencies and start the application:

   ```bash
   corepack pnpm install
   corepack pnpm dev
   ```

5. Open `http://localhost:3000`.

## Demo flow

1. Select Alex Morgan from the user switcher and create a document.
2. Add a heading, bold text, and a list. Refresh the page to show persistence.
3. Share the document with Sam Lee as Editor or Viewer.
4. Switch to Sam Lee. The document appears under **Shared with me** and respects the selected permission.
5. Import a `.txt` or `.md` file to create another document.

## Quality checks

```bash
corepack pnpm test
corepack pnpm lint
corepack pnpm build
```

The test covers the critical authorization distinction: owners and editors can edit, while viewers cannot; only owners can manage sharing.

## Architecture and tradeoffs

This is a single Next.js App Router application. The React client owns the editing experience, and Next.js Route Handlers are the backend boundary for document CRUD, importing, and sharing. Those routes use a server-only Supabase secret key and enforce access before reading or mutating a document.

Supabase Postgres stores `profiles`, `documents`, and `document_shares`. Formatted editor content is stored as JSON rather than HTML so its structure is preserved and it can safely be restored into TipTap. The relationship table makes sharing explicit and supports an Editor/Viewer permission model.

The active-user picker represents two seeded accounts rather than implementing authentication. This was a deliberate timebox choice: it makes owner and shared-document behavior directly demonstrable without obscuring the assessment in session management. In production, replace it with Supabase Auth and derive the active user from the verified session. The server-side access checks should remain.

I intentionally did not implement real-time presence, conflict resolution, comments, version history, file storage, or DOCX parsing. The priority was a reliable persisted document lifecycle and server-enforced sharing model. Imported source files are parsed into document content rather than retained as attachments.

## AI-native workflow note

Codex was used to accelerate project scaffolding, API/component implementation, SQL design, test creation, and documentation drafting. I reviewed and adapted the generated work: I selected the mock-user scope instead of building a partial authentication system, kept imports limited to `.txt` and `.md`, and rejected a broader file-storage workflow as unnecessary for the timebox.

Correctness is verified through the permissions test, TypeScript/lint/build checks, and the end-to-end manual demo flow above. I also review the UI at desktop and mobile widths, verify document persistence with a refresh, and switch between both seeded users to confirm the share permissions are enforced by the API.

## Deployment

Deploy the repository to Vercel and add `SUPABASE_URL` and `SUPABASE_SECRET_KEY` in the Vercel project environment variables. Use the same Supabase project created during setup. The deployed Vercel URL is the reviewer link.
