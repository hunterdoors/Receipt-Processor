# Implementation plan

## Phase 1: Environment Setup

1.  **Prevalidation:** In the project root, check for `package.json` or `.git/` directory; if present, skip project initialization. (Project Overview)
2.  **Install Node.js:** If Node.js isn’t installed or isn’t v20.2.1, install Node.js v20.2.1. (Tech Stack)
3.  **Validation:** Run `node -v` and confirm output is `v20.2.1`. (Tech Stack)
4.  **Initialize Git:** If `.git/` is missing, run `git init` in project root. (Tech Stack)
5.  **Create Next.js App:** Run `npx create-next-app@14 receipt-processor --typescript` to scaffold a Next.js 14 project. (Tech Stack)
6.  **Change Directory:** `cd receipt-processor`. (Tech Stack)
7.  **Install Dependencies:** Run:

`npm install tailwindcss@latest postcss@latest autoprefixer@latest @shadcn/ui pdf-lib `(Tech Stack)

1.  **Initialize Tailwind CSS:** Run `npx tailwindcss init -p` to create `tailwind.config.js` and `postcss.config.js`. (Tech Stack)
2.  **Set Up shadcn/ui:** Run `npx shadcn-ui@latest init` and follow prompts to generate base components. (Tech Stack)
3.  **Create Supabase Project:** In the Supabase dashboard, create a new project and copy the **Postgres connection string**. (Tech Stack)
4.  **Configure Environment Variables:** In project root, create `.env` with:

`SUPABASE_URL=<your-supabase-url> SUPABASE_ANON_KEY=<anon-key> SUPABASE_SERVICE_ROLE_KEY=<service-role-key> `(Tech Stack)

1.  **Configure Windsurf MCP:**

    1.  Open the Cascade assistant in Windsurf and tap the hammer icon.
    2.  Add the following to the configuration file:

2.  `{ "mcpServers": { "supabase": { "command": "npx", "args": ["-y", "@modelcontextprotocol/server-postgres", "<connection-string>"] } } }`

    1.  Add the connection-string guide link: <https://supabase.com/docs/guides/getting-started/mcp#connect-to-supabase-using-mcp>
    2.  Save and tap **Refresh** until status is active. (Tech Stack)

## Phase 2: Frontend Development

1.  **Layout & Providers:** Create `app/layout.tsx` with:

    *   Tailwind global CSS import (`styles/globals.css`)
    *   Supabase AuthProvider wrapper
    *   shadcn/ui `<Theme>` component (Tech Stack)

2.  **Global CSS:** In `styles/globals.css`, add Tailwind directives:

`@tailwind base; @tailwind components; @tailwind utilities; `(Tech Stack)

1.  **Admin Dashboard Page:** Create `app/admin/dashboard/page.tsx` with shadcn/ui `<Card>` showing summary stats. (App Flow Summary)
2.  **Receipts List Page:** Create `app/admin/receipts/page.tsx` rendering a table with columns: Date, Employee, Project, Status. (App Flow Summary)
3.  **Receipt Detail Page:** Create `app/admin/receipts/[id]/page.tsx` with a form to edit extracted data and approve or flag for review. (App Flow Summary)
4.  **API Client:** In `lib/api.ts`, initialize Supabase client:

`import { createClient } from '@supabase/supabase-js'; export const supabase = createClient( process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY! ); `(Tech Stack)

1.  **Fetch Projects:** In `app/admin/receipts/page.tsx`, use React’s `useEffect` to call `/api/projects` (Next.js route) and populate a `projects` dropdown. (App Flow Summary)
2.  **Navigation Layout:** Create `app/admin/layout.tsx` with a sidebar linking to Dashboard, Receipts, Settings; style using Tailwind/shadcn/ui. (App Flow Summary)

## Phase 3: Backend Development

1.  **Define Database Schema:** In Supabase SQL editor, run:

`create table projects ( id uuid primary key default gen_random_uuid(), name text, code text unique, updated_at timestamptz default now() ); create table receipts ( id uuid primary key default gen_random_uuid(), employee_contact text, file_path text, extracted_data jsonb, status text default 'pending', created_at timestamptz default now() ); create table expense_entries ( id uuid primary key default gen_random_uuid(), receipt_id uuid references receipts(id), qbo_id text, posted_at timestamptz ); create table audit_logs ( id uuid primary key default gen_random_uuid(), user text, action text, reference_id uuid, timestamp timestamptz default now() ); `(Tech Stack)

1.  **Validation:** Confirm tables `projects`, `receipts`, `expense_entries`, `audit_logs` exist in the Supabase dashboard. (Tech Stack)

2.  **Twilio Webhook Function:** Create `/supabase/functions/twilio-webhook/index.ts` to:

    *   Parse incoming SMS webhook
    *   Download media URL
    *   Validate MIME (JPEG, PNG, PDF)
    *   Upload to Supabase Storage bucket `receipts`
    *   Insert record in `receipts` table (App Flow Summary)

3.  **SendGrid Webhook Function:** Create `/supabase/functions/sendgrid-webhook/index.ts` to:

    *   Parse SendGrid Inbound Parse JSON
    *   Extract attachments
    *   If PDF, use `pdf-lib` to split pages into images
    *   Upload all images to Supabase Storage
    *   Insert record in `receipts` table (Project Overview)

4.  **OCR Processor:** Create `/supabase/functions/process-ocr/index.ts` triggered by Storage event:

    *   Download uploaded image
    *   Call OpenAI Vision API to extract fields (date, amount, project ID, vendor)
    *   Update corresponding `receipts.extracted_data`
    *   If `project ID` not in `projects` table, set `status = 'unmatched'` (Project Overview)

5.  **Project Sync Function:** Create `/supabase/functions/sync-projects/index.ts` with daily Cron trigger:

    *   Authenticate with Microsoft Graph API
    *   Fetch Excel file from OneDrive/SharePoint
    *   Parse rows and upsert into `projects` table (App Flow Summary)

6.  **Unmatched Notification Function:** Create `/supabase/functions/notify-employee/index.ts` to:

    *   Query `receipts` where `status = 'unmatched'`
    *   Send SMS via Twilio or email via SendGrid asking for project ID confirmation
    *   Log notification in `audit_logs` (Project Overview)

7.  **Admin Approval Function:** Create `/supabase/functions/admin-approve/index.ts` to:

    *   Receive receipt ID and confirmed project code
    *   Call QuickBooks Online API to create an expense with attached receipt
    *   Insert record in `expense_entries` and update `receipts.status = 'approved'`
    *   Log action in `audit_logs` (Core Features)

8.  **QBO OAuth2 Client:** In `/utils/qboClient.ts`, implement OAuth2 flow using QBO client ID/secret from env variables. (Integrations)

9.  **Validation:** Write a unit test in `/tests/process-ocr.test.ts` that invokes `process-ocr` with a sample image and asserts presence of `amount`, `date`, `projectId` keys. (Quality)

## Phase 4: Integration

1.  **API Routes:** In `pages/api/` create Next.js API routes that proxy to Supabase Edge Function URLs: `twilio-webhook`, `sendgrid-webhook`, `admin-approve`. (Integration)

2.  **Frontend ↔ Backend Calls:** Update `lib/api.ts` with functions:

    *   `submitReceipt()` calls Next.js route for ingestion
    *   `approveReceipt(id, projectCode)` calls `admin-approve` route (Integration)

3.  **CORS Configuration:** In each Edge Function, set CORS headers to allow requests from your Vercel domain and `localhost:3000`. (Security)

4.  **End-to-End Test:** Add Cypress test in `cypress/integration/receipt-flow.spec.js` to:

    *   Simulate SendGrid webhook POST with sample PDF
    *   Wait for OCR to complete
    *   Validate `status` transitions from `pending` → `unmatched` → `approved` (Quality)

## Phase 5: Deployment

1.  **Deploy Supabase Functions:** Run:

`supabase functions deploy \ twilio-webhook sendgrid-webhook process-ocr \ sync-projects notify-employee admin-approve \ --project-ref <your-project-ref> `(Deployment)

1.  **Schedule Cron Job:** In the Supabase Dashboard, under **Functions → Triggers**, enable daily schedule for `sync-projects`. (App Flow Summary)

2.  **Configure Webhooks:**

    *   In Twilio console, set SMS webhook URL to Supabase function endpoint.
    *   In SendGrid dashboard, configure Inbound Parse webhook to Vercel API route `/api/sendgrid-webhook`. (Integrations)

3.  **Deploy Next.js to Vercel:**

    1.  Create a new Vercel project linked to your repo.
    2.  Set environment variables (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `TWILIO_*`, `SENDGRID_*`, `QBO_*`).
    3.  Deploy from `main` branch. (Deployment)

4.  **CI/CD Pipeline:** Create `.github/workflows/ci.yml` to:

    *   Run `npm ci && npm run lint && npm run type-check && npm test`
    *   On success, trigger Vercel and Supabase deploys. (Deployment)

5.  **Backup & Retention:** In Supabase Dashboard, configure daily database backups and set retention policy (e.g., 30 days). (Security)

6.  **Documentation:** Update `README.md` with setup steps, environment variables, deployment instructions, and architecture diagram. (Project Overview)

7.  **Final Validation:** Perform full integration test: send sample receipt via SMS and email, confirm unmatched flow, approve via UI, verify expense in QuickBooks. (Project Overview)

8.  **Monitoring:** Enable Vercel Analytics and Supabase Logging, create alerts for function errors and high latency. (Maintenance)

9.  **Audit Export:** In the admin dashboard implement an “Export Logs” button that queries `audit_logs` and streams a CSV using `papaparse`. (Q&A: Audit Logging)

10. **Archival Cron:** Create `/supabase/functions/archive-receipts/index.ts` scheduled monthly to:

    *   Move receipts older than 1 year to a separate storage bucket `archive`.
    *   Log archival actions in `audit_logs`. (Data Retention)

11. **Archival Deployment:** Deploy `archive-receipts` with a monthly schedule via Supabase Triggers. (Data Retention)

12. **Retry Logic:** In `process-ocr` and `admin-approve`, implement 3 retry attempts with 2s backoff on external API failures. (Error Handling)

13. **404 Page:** Create `app/not-found.tsx` with “Return Home” button styled in Knightway branding colors. (App Flow Summary)

14. **Security Review:** Perform dependency audit (`npm audit`) and rotate any exposed service-role keys. (Security)

15. **Project Handoff:** Deliver credentials, architecture doc, Postman collection for APIs, and walkthrough to the Knightway team. (Project Overview)
