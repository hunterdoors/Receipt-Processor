# Implementation Plan for Knightway Mobile Haulers Receipt Processing App

This plan outlines a step-by-step approach—aligned with security best practices—to build, secure, and deploy the receipt processing application.

## 1. Project Initialization & Infrastructure Setup

### 1.1. Repository & CI/CD
- Initialize a monorepo (e.g., using pnpm/workspaces) in GitHub.
- Add GitHub Actions for:
  - Linting (ESLint, Prettier).
  - TypeScript type checks.
  - Tailwind CSS build.
  - Automated tests (unit/integration).
  - Secrets scanning (e.g., GitHub Secret Scanning).
- Enforce branch protection and require PR reviews.

### 1.2. Environment & Secrets Management
- Define environments: `development`, `staging`, `production`.
- Store third-party keys (OpenAI, Twilio, SendGrid, QuickBooks, Microsoft Graph, Supabase) in a dedicated secrets store (e.g., GitHub Environments, Supabase Secrets).
- Use least-privilege credentials for each environment.

### 1.3. Domain & TLS
- Configure custom domain (e.g., `app.knightway.com`) on Vercel or similar.
- Enforce HTTPS (TLS 1.2+).
- Add HSTS header.

## 2. Backend: Supabase Setup

### 2.1. Authentication & RBAC
- Enable Supabase Auth with email/password for Administrators.
- Configure a separate service user (no UI login) for backend jobs.
- Define roles: `admin` and `service` (for ingestion and batch jobs).
- Enforce Row Level Security (RLS) policies:
  - Admins can CRUD receipts, projects, and audit logs.
  - Service role can insert/update ingestion tables but cannot read sensitive PII.

### 2.2. Database Schema
- Tables:
  - `receipts` (id, user_id, status, extracted_data JSONB, created_at, updated_at).
  - `projects` (project_id, name, nickname, tax_code, last_synced_at).
  - `file_storage` (receipt_id FK, bucket_path, mimetype, metadata).
  - `audit_logs` (id, user_id, action, table_name, record_id, diff JSONB, timestamp).
  - `qbo_exports` (receipt_id FK, qbo_entry_id, status, error_message).
- Define indexes on `status`, `created_at`, and any foreign keys.

### 2.3. Storage & Archiving
- Create a private Supabase Storage bucket for original receipts.
- Policies:
  - Service role: read/write to bucket.
  - Admin role: read.
- Configure automatic retention lifecycle (e.g., move to cold storage after 90 days).

## 3. Frontend: Next.js 14 + Tailwind + shadcn/ui

### 3.1. Project Scaffold
- `npx create-next-app@latest --typescript --app-dir`.
- Install and configure Tailwind CSS and shadcn/ui components.
- Configure ESLint, Prettier, and Husky pre-commit hooks.

### 3.2. Layout & Theming
- Define global theme (black, gray, dark yellow).
- Implement secure headers via `next.config.js`:
  - Content-Security-Policy.
  - X-Frame-Options.
  - X-Content-Type-Options.
  - Referrer-Policy.

### 3.3. Authentication Flow
- Use Supabase Client in React Server Components.
- Protect admin routes via server-side auth check.
- Secure cookies: `HttpOnly`, `Secure`, `SameSite=Strict`.

## 4. File Ingestion & Validation Service

### 4.1. Inbound Webhooks / API Routes
- **Email**: Configure SendGrid inbound parse webhook to a Next.js API route.
- **SMS**: Configure Twilio webhook for MMS to a Next.js API route.
- Validate and sanitize all incoming fields.
- Rate limit via API Route middleware (e.g., 10/min per user).

### 4.2. File Handling & Conversion
- Validate content-type and file extension (JPEG, PNG, PDF).
- Scan for malware (e.g., ClamAV in a serverless function).
- For PDF:
  - Use `pdf-lib` to split into pages, convert each page to an image (PNG).
- Store images in Supabase Storage with unique, unguessable paths.

### 4.3. Error Handling & Retries
- On transient errors (API timeouts, conversion failures), implement exponential backoff and retry (max 3 attempts).
- Log failures to `audit_logs` and alert via email to admins if repeated.

## 5. Data Extraction with OpenAI Vision

### 5.1. API Integration
- Call OpenAI Vision with signed, pre-authenticated URLs.
- Define a modular extraction schema for future modifications.
- Validate the response schema (vendor, PO, project ID, total, tax, currency).

### 5.2. Secure Processing
- Never expose raw images or PII in logs.
- Enforce response timeouts (e.g., 10s) and fail securely.
- If extraction confidence is low or required fields missing, set status=`pending_manual_review`.

## 6. Project List Sync (Daily Job)

### 6.1. Supabase Edge Function / CRON
- Schedule a Supabase Edge Function (cron) at off-peak hours.
- Authenticate to Microsoft Graph via OAuth 2.0 (client credentials, secret in vault).
- Fetch Excel file and parse (e.g., `exceljs`).
- Upsert into `projects` table.
- Record `last_synced_at` and log success/failure in `audit_logs`.

### 6.2. Security
- Scope Graph token to only the specific file/read scope.
- Validate file structure (columns match expected template).

## 7. Project Matching & Employee Notification

### 7.1. Automated Matching
- Join `receipts.extracted_data.project_id` with `projects.project_id`.
- If match found → update status=`matched`.
- Else → status=`awaiting_user_confirmation`.

### 7.2. Notification Workflow
- For `awaiting_user_confirmation`, send templated SMS (Twilio) or Email (SendGrid) with:
  - Receipt thumbnail + extracted data.
  - Reply instructions (e.g., reply with correct project ID).
- Inbound replies handled by the same API route:
  - Validate sender matches original user.
  - Update `extracted_data.project_id` and status to `matched`.

## 8. Admin Dashboard & Approval Flow

### 8.1. Dashboard Pages
- **Receipts List**: filters (status, date, project).
- **Receipt Detail**: view image, extracted data, editing form.
- **Project Management**: view/edit imported projects.
- **Audit Logs**: exportable CSV/Excel.

### 8.2. Approval Action
- On approve:
  - Trigger QBO integration (see next).
  - Update `receipts.status` → `approved`.
  - Log in `audit_logs`.

### 8.3. Security
- Server-side permission checks on every API route.
- CSRF protection for state-changing requests.

## 9. QuickBooks Online Integration

### 9.1. OAuth & Token Management
- Implement QBO OAuth 2.0 with stored refresh tokens in vault.
- Refresh tokens automatically before expiry.

### 9.2. Expense Entry Posting
- On approval, format expense payload per QBO API specs.
- Attach original receipt from Supabase Storage.
- Handle idempotency: store QBO entry ID in `qbo_exports`.
- On error, retry with backoff; if fatal, alert admin.

### 9.3. Auditing & Reconciliation
- Record API responses in `qbo_exports` and `audit_logs`.
- Provide dashboard view for QBO status.

## 10. Audit Logging & Compliance

- Centralize all actions (ingestion, edits, approvals, syncs, exports) in `audit_logs`.
- Make logs queryable via Supabase (RLS restricted to admins).
- Add an export endpoint (CSV/Excel) protected by auth.

## 11. Monitoring, Alerts & Observability

- Integrate Sentry or Logflare for exceptions and performance.
- Define alerts for:
  - Repeated ingestion failures.
  - QBO API failures.
  - Extraction timeouts.
- Configure uptime checks and error-rate alerts.

## 12. Testing & QA

- Unit tests for all data-processing modules.
- Integration tests for API routes (mock third-party APIs).
- End-to-end tests (e.g., Playwright) for admin flows.
- Security tests:
  - SAST (e.g., CodeQL).
  - Dependency vulnerability scans (e.g., Dependabot).

## 13. Deployment & Maintenance

- Staged rollout: `development` → `staging` → `production`.
- Feature flags for major workflows.
- Regular dependency updates & vulnerability monitoring.
- Quarterly security reviews & pen tests.

---

By following this structured plan—incorporating secure defaults, least-privilege, defense in depth, and robust error handling—you will build a scalable, maintainable, and secure receipt processing system for Knightway Mobile Haulers.