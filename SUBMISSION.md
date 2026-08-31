# Submission Contents

DocShare is submitted as a focused full-stack demonstration project. It emphasizes a reliable document lifecycle, server-enforced access control, and clear engineering tradeoffs over broad but incomplete collaboration features.

## Application

- Next.js App Router application at the repository root.
- Collaborative document workspace with owned and shared document sections.
- Seeded-user switcher for Alex Morgan and Sam Lee.
- TipTap rich-text editing with bold, italic, underline, H1, H2, bulleted lists, and numbered lists.
- Document creation, rename, save/reopen persistence, and owner-only deletion with confirmation.
- `.txt` and `.md` import, limited to 200 KB, with basic Markdown heading and list conversion.
- Owner-controlled sharing with Editor and Viewer permissions.
- Responsive interface with visible saving, read-only, error, and empty states.

## Backend and Database

- Next.js Route Handlers for users, documents, importing, sharing, and deletion.
- Server-side validation and owner/editor/viewer authorization checks.
- Supabase JavaScript client configured with server-only `SUPABASE_URL` and `SUPABASE_SECRET_KEY` environment variables.
- `supabase/schema.sql` defining `profiles`, `documents`, and `document_shares`, indexes, timestamp trigger, cascade behavior, and seeded users.

## Quality and Documentation

- `tests/permissions.test.ts` automated permission test.
- `README.md` setup, local run, demo, deployment, and project overview.
- `ARCHITECTURE.md` component boundaries, request flow, data model, access rules, security, and tradeoffs.
- `AI-WORKFLOW.md` AI tools used, acceleration areas, reviewed/rejected output, and verification process.
- `package.json`, `pnpm-lock.yaml`, TypeScript, ESLint, Tailwind, and Next.js configuration.

## Not Included

- `.env` and any Supabase credentials.
- `node_modules`, `.next`, pnpm cache/store files, or other generated runtime artifacts.
- Real authentication, real-time collaboration, comments, revision history, DOCX parsing, or persistent file attachments. These are documented scope decisions rather than incomplete setup.
