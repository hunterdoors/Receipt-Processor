# Tech Stack Document for Receipt Processing Application

This document explains the technology choices for your receipt processing app in everyday language. Each section shows what tools we’ve chosen, why we picked them, and how they work together to make your project reliable, scalable, and user-friendly.

## 1. Frontend Technologies
These technologies power the web-based admin dashboard where managers review and manage receipts.

- **Next.js 14 (App Router)**
  • A React framework that simplifies building high-performance web apps.
  • Offers server-side rendering and edge functions for faster page loads and smoother navigation.
  • The App Router makes organizing pages and data fetching straightforward, so developers can focus on features, not boilerplate.

- **TypeScript**
  • Adds type checking on top of JavaScript to catch mistakes early and improve code readability.
  • Helps the team maintain a consistent codebase as the project grows.

- **Tailwind CSS**
  • A utility-first styling framework that speeds up design by providing pre-made CSS classes.
  • Ensures a consistent look (spacing, typography, colors) without writing custom CSS from scratch.

- **shadcn/ui**
  • A library of pre-built, accessible React components that match Tailwind’s design system.
  • Saves time by using battle-tested UI elements (buttons, modals, lists) that adhere to best practices.

How these choices enhance UX:
- Fast initial loads and smooth page transitions keep admins productive.
- Consistent styling and pre-built components deliver a polished, professional interface quickly.
- Type safety reduces bugs, leading to fewer user-facing errors.

## 2. Backend Technologies
This layer handles receipt storage, data extraction, business logic, and database operations.

- **Supabase (PostgreSQL)**
  • A hosted Postgres database with a built-in API for storing receipts, extracted data, project lists, and audit logs.
  • Row-level security lets us define who can read or write each record, enhancing data protection.

- **Supabase Auth**
  • Manages administrator login and session handling with secure password storage and optional multi-factor authentication.

- **Supabase Storage**
  • Hosts uploaded receipt images and converted PDF pages.
  • Provides signed URLs so only authorized users or services can access files.

- **Supabase Edge Functions / Serverless Functions**
  • Run custom code (PDF conversion, Excel parsing, QuickBooks syncing) close to the database for low-latency operations.
  • Automatically scale with load, so we don’t worry about servers.

- **pdf-lib**
  • A JavaScript library used in our serverless functions to convert PDF pages into individual high-resolution images for analysis.

How these pieces work together:
1. When a receipt arrives, Supabase Storage saves the file.  
2. An Edge Function checks the file type, splits PDFs via pdf-lib, and uploads each page back to storage.  
3. Another function triggers the OpenAI Vision API to extract text and metadata.  
4. Extracted data and references to stored images are saved in the Postgres database.  
5. Scheduled functions use Microsoft Graph to pull the Excel 365 project list and upsert it into Postgres.  
6. After admin approval, a function pushes expense entries (with receipt links) to QuickBooks Online.

## 3. Infrastructure and Deployment
These choices make deploying, updating, and scaling the app easy.

- **Version Control: GitHub**
  • All code lives in GitHub repositories for collaboration, code review, and history tracking.

- **CI/CD: GitHub Actions**
  • Automates testing and deployment on every pull request or merge to the main branch.
  • Runs unit tests (frontend and backend) and linting to catch issues before they hit production.

- **Hosting Platform: Vercel**
  • Automatically deploys the Next.js frontend and Supabase Edge Functions.
  • Provides a global CDN and edge network for low-latency page loads.

- **Supabase Managed Services**
  • Database, auth, storage, and functions all run on Supabase’s managed infrastructure, handling backups, updates, and scaling.

How this contributes to reliability and scalability:
- Automated pipelines catch errors early and keep production stable.
- Edge networks and serverless functions scale on demand, ensuring smooth performance even with high daily usage.

## 4. Third-Party Integrations
These services extend functionality without reinventing the wheel.

- **OpenAI Vision API**
  • Analyzes images to extract vendor names, purchase order numbers, project codes, totals, dates, tax breakdowns, currencies, and any other fields you configure.
  • Reduces manual data entry, speeding up processing and minimizing errors.

- **QuickBooks Online API**
  • Used to push approved expense entries (with attachments) back into QuickBooks Online for streamlined accounting.

- **Microsoft Graph API**
  • Retrieves the daily-updated Excel 365 workbook containing your project list (name, nickname, tax code).
  • Allows real-time syncing without granting direct QuickBooks API access.

- **Twilio**
  • Ingests incoming SMS messages with attachments (images/PDFs).
  • Sends automated SMS prompts when project matching fails.

- **SendGrid**
  • Handles inbound and outbound email processing for receipt submission and employee notifications.

Benefits of these integrations:
- Automates critical workflows (data extraction, project syncing, expense posting).
- Leverages best-in-class services for OCR, messaging, and accounting tasks.
- Reduces development time and ongoing maintenance.

## 5. Security and Performance Considerations
We’ve built in safeguards to protect your data and keep the app snappy.

Security Measures:
- **Authentication & Authorization**  
  • Supabase Auth secures administrator login.  
  • Row-level security rules in Postgres ensure only authorized functions or users can access each record.
- **Data Encryption**  
  • All data in transit uses HTTPS/TLS.  
  • Supabase encrypts data at rest for both storage files and database entries.
- **Audit Logging**  
  • Every action (uploads, edits, approvals, notifications, API calls) is logged with timestamps and user identifiers.  
  • Exportable logs support compliance and reporting needs.
- **Automated Archiving**  
  • Receipts and metadata follow configurable retention policies, moving stale records to an archive tier while keeping them accessible for audits.

Performance Optimizations:
- **Edge Rendering & Caching**  
  • Next.js edge functions and Vercel’s CDN deliver dashboard pages from servers closest to users.  
  • Static assets (CSS, JS) are cached globally.
- **Serverless Scaling**  
  • Supabase Edge Functions spin up only when needed, avoiding cold starts for most tasks.  
  • Background jobs (PDF conversion, Excel parsing) run asynchronously so users aren’t blocked.
- **Batch Processing**  
  • Daily project sync and bulk PDF splits run in scheduled batches to spread load evenly.

## 6. Conclusion and Overall Tech Stack Summary
In building this receipt processing application, we’ve selected tools that:

- Automate and streamline your core workflows (receipt ingestion, data extraction, project matching, expense posting).
- Provide a fast, responsive admin dashboard with Next.js, TypeScript, Tailwind CSS, and shadcn/ui.
- Rely on managed services (Supabase, Vercel) to minimize operational overhead while ensuring scalability and reliability.
- Integrate industry-leading APIs (OpenAI Vision, QuickBooks, Microsoft Graph, Twilio, SendGrid) to handle specialized tasks efficiently.
- Enforce security and compliance through encrypted data storage, row-level access rules, audit logs, and retention policies.

This combination of technologies aligns with your goals: it’s easy for employees to submit receipts, gives administrators a powerful review interface, and connects seamlessly with your existing QuickBooks workflows—all while staying secure and scalable.
