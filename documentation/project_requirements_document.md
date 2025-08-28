# Project Requirements Document (PRD)

## 1. Project Overview

Knightway Mobile Haulers needs a streamlined way for employees to submit expense receipts without logging into a separate app. This web-based solution lets staff send photos or PDFs of receipts via SMS or email. PDFs are auto-split into individual pages, then every receipt image is fed into OpenAI’s Vision API to pull out vendor name, purchase order, totals, dates, tax details, project codes, and any other configurable fields.

On the back end, we keep an up-to-date project roster by pulling an Excel 365 workbook (exported daily from QuickBooks Online) through Microsoft Graph into Supabase. Extracted project IDs get matched to that list; unmatched receipts trigger an SMS or email back to the employee to pick the correct project. Administrators use a Next.js dashboard (branded in black, gray, and industrial yellow) to review, correct, approve, and finally push expense entries—with original receipts attached—into QuickBooks Online. Audit logs and automated archiving ensure compliance and traceability.

**Key Objectives / Success Criteria**

*   ≥ 90% of receipts auto-matched to the correct project without human intervention
*   Average end-to-end processing time (submission → approval) under 5 minutes
*   Full audit trail exportable to CSV/Excel, retention indefinitely
*   Secure handling and storage of sensitive financial documents

## 2. In-Scope vs. Out-of-Scope

**In-Scope (v1.0)**

*   Receipt ingestion via SMS (Twilio) and email (SendGrid)
*   File validation (JPEG, PNG, PDF only)
*   PDF-to-image conversion and page splitting (pdf-lib)
*   Automated data extraction with OpenAI Vision API (vendor, PO, project, amounts, taxes, date, currency, etc.)
*   Daily project list import from Excel 365 via Microsoft Graph into Supabase
*   Automated project matching; SMS/email prompts for unmatched receipts
*   Administrator dashboard (Next.js, TypeScript, Tailwind CSS, shadcn/ui) for review, editing, approval
*   Expense entry creation in QuickBooks Online API with receipt attachment
*   Immutable audit logging of all events; exportable logs
*   Automated archiving of processed receipts and metadata

**Out-of-Scope (Planned Later)**

*   Native mobile app for iOS/Android
*   Direct two-way sync of projects via QuickBooks Online API (beyond Excel import)
*   User-managed accounts for employees (they only use SMS/email)
*   Multi-language support
*   Custom branding beyond Knightway’s color palette

## 3. User Flow

**Employee Submission Journey**

1.  The employee snaps or forwards a receipt image/PDF to our designated SMS number (Twilio) or email alias (SendGrid).
2.  Our ingestion service validates the file type, stores it in Supabase Storage, and (for PDFs) converts and splits it into separate images. Each image becomes an individual “receipt record” in the database.
3.  OpenAI Vision API analyzes each image, extracting vendor name, purchase order, date, amounts, tax details, currency, and any free-form fields. The system then attempts to match the extracted project ID against the daily-synced Excel 365 project list in Supabase.

**Unmatched-Project Notification & Admin Review**\
4. If the project ID doesn’t match, the system sends an SMS or email back to the employee listing valid project nicknames. The employee replies with the correct code, and we update the record.\
5. Administrators log into the Next.js dashboard (styled in Knightway’s black, gray, and dark yellow). They filter and search receipts, view the original image side-by-side with extracted data, make corrections if needed, and approve each receipt.\
6. Upon approval, the app pushes an expense entry—complete with vendor, amounts, project code, tax details, date, and a link to the stored receipt—into QuickBooks Online via its API. All actions are recorded in an exportable audit log, and receipts enter an automated archiving workflow.

## 4. Core Features

*   **Receipt Submission (SMS & Email)**\
    • Twilio-powered SMS ingestion\
    • SendGrid-powered email ingestion\
    • Automatic file-type and format validation
*   **PDF Splitting & Image Conversion**\
    • Use `pdf-lib` to convert each PDF page into a high-res JPEG/PNG\
    • Treat each page as a separate receipt record
*   **Automated Data Extraction**\
    • OpenAI Vision API integration\
    • Configurable fields: vendor, PO, date, totals, taxes, currency, project ID, plus any future fields
*   **Project List Sync**\
    • Microsoft Graph API to pull Excel 365 workbook daily\
    • Upsert project name, nickname/description, tax code into Supabase table
*   **Project Matching & Employee Confirmation**\
    • Automated lookup in Supabase\
    • SMS/email prompts for unmatched project IDs\
    • Parse employee replies to complete matching
*   **Administrator Dashboard**\
    • Next.js 14 (app router) + TypeScript + Tailwind CSS + shadcn/ui\
    • Filter, search, side-by-side image and data display\
    • Edit, re-trigger extraction, override matches, approve receipts
*   **Expense Posting to QuickBooks**\
    • QuickBooks Online API integration\
    • Attach receipt image to expense entry
*   **Audit Logging & Export**\
    • Immutable event logs for uploads, edits, approvals, imports\
    • CSV/Excel export capability
*   **Automated Archiving & Retention**\
    • Configurable retention policies for receipts and metadata\
    • Archived data remains queryable and downloadable

## 5. Tech Stack & Tools

*   **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
*   **Backend & Storage**: Supabase (PostgreSQL, Auth, Storage, Functions)
*   **Image/PDF Processing**: pdf-lib
*   **AI/ML**: OpenAI Vision API for OCR and data extraction
*   **Project Sync**: Microsoft Graph API pulling Excel 365
*   **Communication**: Twilio (SMS), SendGrid (Email)
*   **Accounting Integration**: QuickBooks Online API
*   **IDE & AI Coding**: Windsurf

## 6. Non-Functional Requirements

*   **Performance**:\
    • Single receipt extraction under 5 seconds (excluding network latency)\
    • Daily project sync completes within 5 minutes
*   **Scalability**:\
    • Handle up to 1,000 submissions per day without performance degradation
*   **Security & Compliance**:\
    • TLS encryption in transit; AES-256 at rest in Supabase Storage\
    • Role-based access control (employees via SMS/email only; admins via dashboard)\
    • Retain audit logs indefinitely; exportable to CSV/Excel
*   **Usability**:\
    • Zero-friction submission for employees (no login required)\
    • Responsive, accessible admin UI
*   **Availability**:\
    • 99.9% uptime SLA for ingestion and dashboard

## 7. Constraints & Assumptions

*   **Dependencies**:\
    • OpenAI Vision API availability and rate limits\
    • Twilio and SendGrid delivery reliability\
    • Microsoft Graph connectivity to a well-formed Excel 365 workbook\
    • QuickBooks Online API credentials for expense posting
*   **Environment**:\
    • All services run in a modern cloud environment (e.g., Vercel + Supabase hosting)\
    • Employees have basic SMS or email capability—no web login needed
*   **Assumptions**:\
    • Excel template structure for projects remains consistent\
    • No file-size limits, but clients will send reasonable image/PDF sizes\
    • Future field extraction requirements can be added via configuration

## 8. Known Issues & Potential Pitfalls

*   **API Rate Limits**:\
    • OpenAI Vision and Twilio have quotas—implement retry/backoff logic and request batching for project sync.
*   **PDF Conversion Edge Cases**:\
    • Complex PDFs (scanned with poor contrast) may yield low-quality images—add a manual review flag.
*   **OCR Accuracy**:\
    • Misreads of vendor or PO numbers—allow admins to re-trigger extraction or correct fields.
*   **Excel Format Changes**:\
    • If the Excel 365 template changes columns, project sync will break—validate header names on import and alert admins.
*   **Data Privacy**:\
    • Receipts often contain sensitive PII—ensure strict IAM rules in Supabase and consider field-level encryption if required.

By following this PRD, the AI model (and any future technical documents) will have a clear, unambiguous blueprint to build, test, and deploy the Knightway Mobile Haulers receipt processing application.
