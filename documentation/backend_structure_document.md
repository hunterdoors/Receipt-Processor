# Backend Structure Document

## 1. Backend Architecture

Our backend follows an event-driven, serverless design built primarily on Supabase. We’ve broken down each piece of logic into small, focused functions so it’s easy to understand, maintain, and scale. Here’s the high-level view:

• Serverless Functions (Supabase Functions)
  – Receive incoming SMS (Twilio) and Email (SendGrid) webhooks.  
  – Handle PDF-to-image conversion with pdf-lib.  
  – Call OpenAI Vision API for data extraction.  
  – Post approved expenses to QuickBooks Online API.  
  – Perform daily project list sync via Microsoft Graph API.  

• Managed Database (Supabase Postgres)
  – Stores users, receipts, extracted data, projects, audit logs, and expense entries.  
  – Row-Level Security (RLS) ensures only the right roles see or modify data.  

• Storage (Supabase Storage)
  – Houses original receipt files (JPEG, PNG, PDF) and processed images.  

• Admin Dashboard (Next.js 14 on Vercel)
  – Communicates with Supabase Functions and the database via RESTful APIs.  
  – Provides a smooth UI for admins to search, filter, edit, and approve receipts.  

Why this architecture works:

• Scalability: Supabase Functions auto-scale based on traffic. The managed Postgres database grows as needed.  
• Maintainability: Each function has one responsibility—easy to test, debug, and update.  
• Performance: Offloading heavy tasks (PDF conversion, AI calls) to background functions keeps the user experience snappy.

---

## 2. Database Management

We use Supabase’s managed PostgreSQL for all structured data and Supabase Storage for files. Data flow and best practices:

• SQL Database (PostgreSQL)
  – Well-defined tables for users, receipts, projects, extracted data, logs, and expenses.  
  – JSONB columns for flexible fields (e.g., raw AI results).  
  – Row-Level Security to enforce access rules by role.  

• Storage
  – Receipt files stored in buckets per user or per project.  
  – Public or signed URLs served via Supabase’s built-in CDN.  

• Data Access Patterns
  – Functions and the Admin Dashboard query the database via JWT-authenticated REST endpoints.  
  – Daily project sync writes directly into the projects table.  
  – Archiving policies mark old receipts and move associated files to “cold” storage or flag them for deletion.

---

## 3. Database Schema

Below is an overview of the key tables in plain English, followed by PostgreSQL create-table statements.

### Tables in Plain English

• users: Every person (employee or admin) who interacts with the system.  
• projects: Projects imported daily from Excel 365, with names, nicknames, and tax codes.  
• receipts: Each receipt submission record, linked to a user and storing metadata.  
• extracted_data: Fields pulled from the receipt (vendor, PO, amount, etc.) plus raw AI response.  
• audit_logs: Immutable history of actions (uploads, edits, approvals).  
• expense_entries: Records of expenses sent to QuickBooks, with status and error info if any.  
• oauth_tokens: Stores OAuth tokens for third-party APIs (Microsoft Graph, QuickBooks).  

### PostgreSQL Schema

```sql
-- USERS
eCREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('employee','admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- PROJECTS
eCREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  nickname TEXT,
  tax_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RECEIPTS
eCREATE TABLE receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  file_url TEXT NOT NULL,
  original_file_name TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending','matched','approved','archived','error')),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- EXTRACTED DATA
eCREATE TABLE extracted_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id UUID REFERENCES receipts(id),
  vendor TEXT,
  po_number TEXT,
  project_id UUID REFERENCES projects(id),
  total_amount NUMERIC(12,2),
  tax_amount NUMERIC(12,2),
  currency TEXT,
  other_fields JSONB,
  raw_response JSONB,
  extracted_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- AUDIT LOGS
eCREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  receipt_id UUID REFERENCES receipts(id),
  details JSONB,
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- EXPENSE ENTRIES
eCREATE TABLE expense_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id UUID REFERENCES receipts(id),
  quickbooks_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending','success','failed')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- OAUTH TOKENS
eCREATE TABLE oauth_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

---

## 4. API Design and Endpoints

We follow a RESTful approach. All endpoints use JWT authentication provided by Supabase Auth.

### Inbound Webhooks

• POST /api/webhooks/sms  
  – Receives SMS attachments from Twilio, kicks off a function to store and process the receipt.  

• POST /api/webhooks/email  
  – Receives email attachments from SendGrid, converts PDF pages, and queues them for extraction.  

### Receipt Management

• GET /api/receipts  
  – Lists receipts (filter by status, date, user).  

• GET /api/receipts/{receiptId}  
  – Retrieves a single receipt with extracted data and audit history.  

• PATCH /api/receipts/{receiptId}  
  – Admin edits extracted fields or project match.  

• POST /api/receipts/{receiptId}/approve  
  – Marks receipt as approved and triggers QuickBooks submission.  

### Project Sync

• POST /api/sync/projects  
  – (Scheduled) Imports the project list from Excel 365 via Microsoft Graph API.  

### Expenses & QuickBooks

• GET /api/expense-entries  
  – View all expense entries sent to QuickBooks.  

• POST /api/expense-entries/{entryId}/retry  
  – Retry a failed QuickBooks submission.  

### Audit Logs

• GET /api/audit-logs  
  – Exportable CSV/Excel of all logged actions. Supports filtering.

---

## 5. Hosting Solutions

• Supabase (PostgreSQL, Auth, Storage, Functions)
  – Fully managed, high availability, automatic horizontal scaling.  
  – Pay-as-you-go pricing that aligns with usage.  

• Vercel (Next.js Admin Dashboard)
  – Global CDN, edge caching, automatic deploys from Git.  
  – Low-latency frontend experience for worldwide teams.

Benefits:

• Reliability: 99.99% SLAs and automatic failover.  
• Cost-Effectiveness: No up-front servers, only pay for what you use.  
• Simplicity: Managed services reduce operational overhead.

---

## 6. Infrastructure Components

• Load Balancers & Edge Network  
  – Handled by Supabase and Vercel to distribute traffic globally.  

• Caching  
  – Supabase edge caching for frequent read queries.  
  – Vercel’s CDN for static assets (JS, CSS).  

• Background Workers  
  – Supabase Functions running asynchronously for data extraction, PDF conversion, and project sync.  

• CDN  
  – Supabase Storage uses a built-in CDN for serving receipt files securely.  

• Scheduled Jobs  
  – Daily cron job in Supabase Functions to sync projects and apply archiving policies.

---

## 7. Security Measures

• Authentication & Authorization  
  – Supabase Auth issues JWTs.  
  – Role-based access (employee vs. admin).  
  – Row-Level Security in Postgres ensures users only see their own data.  

• Data Encryption  
  – TLS everywhere (inbound webhooks, API calls, DB connections).  
  – At-rest encryption for Postgres and Storage.  

• Webhook Validation  
  – Twilio signature check on SMS webhooks.  
  – SendGrid event/webhook signing validation.  

• Secure Token Storage  
  – OAuth tokens for Microsoft Graph and QuickBooks stored encrypted in Postgres.  
  – Regular token refresh and rotation.  

• Audit Logging  
  – Immutable logs for every action, exportable for compliance.  

• Compliance  
  – Data retention and archiving policies configurable to meet regional regulations.  

---

## 8. Monitoring and Maintenance

• Logging & Error Tracking  
  – Supabase Function logs visible in dashboard.  
  – Recommend integrating Sentry or Logflare for real-time error alerts.  

• Performance Monitoring  
  – Supabase metrics for query times, function invocation rates.  
  – Vercel analytics for frontend load times.  

• Backups & Recovery  
  – Automated nightly snapshots of PostgreSQL.  
  – Storage versioning for critical buckets.  

• Maintenance Strategy  
  – CI/CD pipeline with automated tests on Git commits.  
  – Scheduled dependency updates.  
  – Quarterly security reviews and penetration tests.

---

## 9. Conclusion and Overall Backend Summary

We’ve built a lean, serverless backend that ties together receipt submissions, AI-powered data extraction, and QuickBooks integration—all on a managed stack (Supabase + Vercel). Key wins:

• Scalability: Serverless functions and managed Postgres grow with demand.  
• Reliability: SLA-backed services, real-time monitoring, and automated backups.  
• Maintainability: Clear separation of concerns, small functions, and robust schema.  
• Security & Compliance: Role checks, RLS, encryption, audit trails, and archiving.  

This setup ensures Knightway Mobile Haulers can handle up to 1,000 daily submissions with confidence, maintain a full audit history, and seamlessly push expenses into QuickBooks Online—all without the team worrying about infrastructure overhead.
