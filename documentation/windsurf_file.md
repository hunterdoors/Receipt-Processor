# .windsurfrules

## Project Overview

*   **Type:** Receipt Processing Web Application
*   **Description:** A system for Knightway Mobile Haulers that accepts receipts via SMS (Twilio) or Email (SendGrid), converts PDFs to images, extracts data with OpenAI Vision, matches or prompts for project codes, and pushes expense entries (including original receipt files) into QuickBooks Online.
*   **Primary Goal:** Automate receipt ingestion, data extraction, project matching, and expense creation in QuickBooks Online with full auditability.

## Project Structure

### Framework-Specific Routing

*   **Directory Rules:**

    *   Next.js 14 (App Router): Use the `app/` directory with nested folder routes. Each page is defined at `app/[route]/page.tsx` and route handlers at `app/[route]/route.ts`.
    *   Example: `app/receipts/submit/page.tsx` → receipt submission UI

### Core Directories

*   **Versioned Structure:**

    *   `app/api` : Next.js 14 Route Handlers for webhooks and scheduled jobs
    *   `app/dashboard` : Admin UI routes and nested layouts (review, edit, approve)
    *   `app/auth` : Supabase Auth pages (`login`, `register`)
    *   `app/components` : Shared shadcn/ui components and primitives
    *   `app/lib` : Clients and utilities (Supabase, OpenAI, QBO, Twilio, SendGrid)
    *   `app/styles` : Tailwind CSS globals and theming (black, gray, dark yellow)

### Key Files

*   **Stack-Versioned Patterns:**

    *   `app/layout.tsx` : Next.js 14 root layout with global providers and branding
    *   `app/dashboard/layout.tsx` : Nested layout for admin dashboard pages
    *   `app/api/receipts/route.ts` : Twilio/SendGrid webhook handlers, `pdf-lib` conversion, OpenAI Vision extraction
    *   `app/api/projects/route.ts` : Microsoft Graph Excel import and Supabase upsert
    *   `app/api/expenses/route.ts` : QuickBooks Online expense creation with receipt attachment
    *   `app/auth/login/page.tsx` : Supabase Auth login page (server component)
    *   `app/auth/register/page.tsx` : Supabase Auth registration page

## Tech Stack Rules

*   **Version Enforcement:**

    *   next@14 : App Router required, disallow `pages/` directory and `getInitialProps`
    *   typescript@5 : Enable `strict` mode, forbid implicit `any`
    *   tailwindcss@3 : JIT mode, configure in `app/styles/globals.css`
    *   shadcn/ui@latest : Use only provided primitives; no external CSS modules
    *   supabase-js@2 : Modular imports; use Edge Functions for webhook routes
    *   openai@3 : Vision API calls in server actions only
    *   pdf-lib@1 : Convert each PDF page to an image before extraction
    *   twilio@4 : Webhook route integration for SMS receipt submission
    *   @sendgrid/mail@7 : Secure email webhook handlers

## PRD Compliance

*   **Non-Negotiable:**

    *   "Pushing expense entries WITH the original receipt file into QuickBooks Online is a MUST.": All expense API calls must include the original receipt as an attachment.
    *   "When a project can't be matched, employees will confirm/correct it by replying to a text/email.": Implement two-way SMS/email reply handling in `app/api/receipts/route.ts`.

## App Flow Integration

*   **Stack-Aligned Flow:**

    *   Receipt Submission Flow → `app/api/receipts/route.ts` uses Edge Function server actions to handle Twilio/SendGrid webhooks, `pdf-lib` conversion, and OpenAI Vision extraction.
    *   Project Sync Flow → Scheduled job at `app/api/projects/route.ts` fetching Excel via Microsoft Graph and upserting into Supabase.
    *   Admin Dashboard → UI under `app/dashboard/` with `layout.tsx`, using shadcn/ui for review, edit, and approval.
    *   Auth Flow → `app/auth/login/page.tsx` & `app/auth/register/page.tsx` using Supabase Auth in Next.js 14 server components.
    *   Expense Push Flow → `app/api/expenses/route.ts` triggered post-approval to push entries to QBO with file attachments.
