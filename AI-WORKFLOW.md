# AI Workflow

## AI Tool Used

I used Codex as an AI-assisted development partner throughout the assessment. Codex helped inspect the workspace, generate and refine implementation code, identify errors from build and runtime output, and draft project documentation.

## Where AI Saved Time

- Scaffolding the Next.js application and organizing the frontend, API, database, test, and documentation files.
- Translating the product requirements into a focused data model for profiles, documents, and document shares.
- Implementing repetitive but important backend work such as request validation, normalized API responses, and permission checks.
- Accelerating UI implementation for the TipTap editor, import flow, sharing controls, delete confirmation, and responsive styling.
- Diagnosing integration issues, including the seeded UUID validation mismatch and duplicate TipTap Underline registration.

## Generated Output I Modified or Rejected

- I chose a seeded-user switcher over a partially implemented authentication flow. The assessment needs demonstrable sharing behavior, and this kept the scope focused while preserving server-side authorization checks.
- I rejected real-time collaboration, comments, version history, DOCX parsing, and persistent attachments. Those features would dilute the timebox without strengthening the core document lifecycle.
- I limited imports to `.txt` and `.md`, with a 200 KB size limit, instead of accepting arbitrary files.
- I removed a duplicate Underline extension after TipTap reported that StarterKit already supplied it.
- I kept Supabase access server-only through Next.js Route Handlers rather than exposing direct database access to the browser.

## Verification

- Ran `pnpm lint` to catch React, TypeScript, and code-quality issues.
- Ran `pnpm test` to verify owner/editor/viewer permission behavior.
- Ran `pnpm build` to verify the production application and all API routes compile successfully.
- Connected the application to Supabase and verified the seeded users through the live `/api/users` endpoint.
- Manually exercised document creation, rich-text saving, sharing, and permission-aware document listing in the local application.
- Reviewed runtime output and resolved surfaced warnings and validation failures before continuing.

AI accelerated implementation, but I retained responsibility for choosing scope, reviewing generated output, handling credentials safely, and verifying the final behavior.
