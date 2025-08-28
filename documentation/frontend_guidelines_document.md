# Frontend Guideline Document

This document outlines the frontend architecture, design principles, styling, component structure, state management, routing, performance optimizations, and testing strategies for the Knightway Mobile Haulers receipt processing application. It’s written in everyday language so anyone on the team can understand how the frontend is set up and maintained.

## 1. Frontend Architecture

### 1.1 Frameworks and Libraries
- **Next.js 14 (App Router)**: Provides server-side rendering, file-based routing, and API routes out of the box.
- **TypeScript**: Adds type safety and self-documenting code.
- **Tailwind CSS**: Utility-first styling framework for rapid UI development.
- **shadcn/ui**: A collection of accessible, customizable React components built on top of Tailwind CSS.
- **Supabase JS**: Client SDK to interact with Supabase (Auth, Database, Storage).

### 1.2 Folder Structure
```
app/                 # Next.js App Router directory
  layout.tsx         # Global layout (header, sidebar, footer)
  page.tsx           # Dashboard homepage
  receipts/          # Receipt review pages (list, detail, edit)
components/          # Shared UI components (atoms, molecules, organisms)
hooks/               # Custom React hooks (useAuth, useFetchProjects, etc.)
lib/                 # Utilities and API wrappers (supabaseClient, api.ts)
styles/              # Global styles and Tailwind config
  tailwind.config.js
  globals.css
tests/               # Unit, integration, and E2E tests

```

### 1.3 Scalability, Maintainability, Performance
- **Scalability**: Next.js handles dynamic routes and SSR/ISR to serve growing data sets, while Supabase scales with PostgreSQL.
- **Maintainability**: Component-based architecture defines small, reusable pieces. TypeScript catches errors early.
- **Performance**: Code splitting, lazy loading of pages/components, optimized image handling, and Tailwind’s purge feature keep bundle sizes small.

## 2. Design Principles

### 2.1 Usability
- Forms provide real-time validation and clear error messages.
- Loading and success states use spinners and toasts to keep users informed.

### 2.2 Accessibility
- All interactive elements have `aria` attributes and focus states.
- Color contrast meets WCAG AA standards.
- Keyboard-first navigation support throughout the dashboard.

### 2.3 Responsiveness
- Mobile-first design with Tailwind’s responsive classes.
- Layouts collapse gracefully on smaller screens (hamburger menu for sidebar, stacked cards instead of tables).

### 2.4 Consistency
- Reusable UI components (buttons, inputs, modals) ensure the same behavior and appearance everywhere.

## 3. Styling and Theming

### 3.1 Styling Approach
- **Tailwind CSS** as the core styling tool (utility-first).
- **shadcn/ui** for prebuilt component scaffolding—styled via Tailwind.
- No separate CSS files beyond global resets and Tailwind config.

### 3.2 Theming
- Custom theme defined in `tailwind.config.js`:
  - Primary colors reflect Knightway’s industrial palette.
  - Dark mode toggled via CSS class.

### 3.3 Visual Style
- **Overall Style**: Industrial/Commercial — clean lines, minimal distraction.
- **Glassmorphism**: Subtle translucent panels for modals and cards to give depth without clutter.

### 3.4 Color Palette
- **Black**: #000000 (text, primary backgrounds)
- **Dark Gray**: #1F1F1F (secondary backgrounds, navigation)
- **Medium Gray**: #4A4A4A (borders, dividers)
- **Industrial Yellow**: #FFC107 (primary accent, call-to-action buttons)
- **Light Gray**: #F5F5F5 (forms, surface backgrounds)

### 3.5 Typography
- **Font Family**: “Inter”, sans-serif — modern, legible, web-safe.
- **Headings**: Bold weights for clear hierarchy.
- **Body Text**: Regular weight at 16px base for readability.

## 4. Component Structure

### 4.1 Organization
- **Atoms**: Smallest building blocks (Button, Input, Checkbox).
- **Molecules**: Groups of atoms that form a unit (SearchBar, ReceiptCard).
- **Organisms**: Larger sections composed of molecules (ReceiptList, Header, Sidebar).
- **Pages**: High-level layouts under `app/` using organisms.

### 4.2 Reusability and Maintenance
- Each component lives in its own folder with:
  - `Component.tsx`  (logic and markup)
  - `Component.test.tsx` (unit tests)
  - `styles.ts` or embedded Tailwind classes
- Props are strongly typed so consumers know exactly what to pass.
- Stories (optional) in Storybook for visual testing and documentation.

## 5. State Management

### 5.1 Authentication State
- **Supabase Auth** context (`useAuth`) holds user session and provides login/logout functions.

### 5.2 Data Fetching and Caching
- **SWR** or **React Query** for fetching projects, receipts, and other resources from backend APIs.
- Automatic caching, refetching, and stale-while-revalidate give a snappy UI.

### 5.3 Global UI State
- **React Context + `useReducer`** for theme toggle (light/dark), sidebar open/close, notifications.

## 6. Routing and Navigation

### 6.1 Next.js App Router
- File-based routing under `app/`:
  - `app/page.tsx` → Dashboard home
  - `app/receipts/page.tsx` → Receipt list
  - `app/receipts/[id]/page.tsx` → Receipt detail/edit
- Layouts and templates share headers, sidebars, and footers via `layout.tsx`.

### 6.2 Protected Routes
- Middleware checks Supabase session cookie; redirects to login if unauthenticated.

### 6.3 Navigation Components
- **Sidebar** for main sections: Dashboard, Receipts, Projects, Settings, Audit Logs.
- **Topbar** with user menu, notifications, and theme switch.

## 7. Performance Optimization

- **Lazy Loading**: `next/dynamic` for heavy or rarely used components (charts, file viewers).
- **Code Splitting**: Next.js splits code per page automatically; further split large components.
- **Image Optimization**: Use `next/image` for external receipt thumbnails.
- **Asset Compression**: Gzip/Brotli via Next.js built-in.
- **Tailwind Purge**: Remove unused CSS classes in production.
- **Caching**: SWR/React Query caching plus HTTP caching headers on API routes.

## 8. Testing and Quality Assurance

### 8.1 Linting and Formatting
- **ESLint** with TypeScript plugin and Tailwind plugin to catch invalid classes.
- **Prettier** for consistent code style.

### 8.2 Unit Testing
- **Jest** + **React Testing Library** for component and hook tests.
- Aim for ≥80% coverage on critical UI logic (forms, data fetching, state changes).

### 8.3 Integration and E2E Testing
- **Cypress** for end-to-end tests covering:
  - User login flow.
  - Receipt list search/filter.
  - Receipt detail edit/approve.
  - Theme toggle and responsive layouts.

### 8.4 CI/CD
- **GitHub Actions**: Run lint, tests, and type checks on every PR.
- Deploy to Vercel with preview URLs for QA.

## 9. Conclusion and Overall Frontend Summary

This guideline covers the core of our frontend setup:
- **Next.js App Router** and **TypeScript** for a robust, scalable codebase.
- **Tailwind CSS** and **shadcn/ui** for consistent, accessible styling.
- **Component-based architecture** organized into atoms, molecules, and organisms.
- **SWR/React Query** and **Context** for smooth data flows and global state.
- **Next.js routing** with protected pages and dynamic routes.
- **Performance strategies** like lazy loading and code splitting.
- **Comprehensive testing** with Jest, React Testing Library, and Cypress.

By following these guidelines, anyone on the team can add features, fix bugs, and maintain the frontend with confidence. The result is a user-friendly, high-performance admin dashboard that aligns perfectly with Knightway Mobile Haulers’ needs and branding.