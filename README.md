# Eki Suggest / EkiSignal

Mobile-first civic reporting platform for Ekiti State, Nigeria.

## Portfolio summary

Eki Suggest, built as EkiSignal, is a production-style civic technology app that helps residents report public issues, track their submissions, and route cases to the right government desk. It combines a citizen PWA, public tracking, admin moderation, handler queues, and a Supabase-ready backend model.

The project demonstrates modern full-stack product work: Next.js App Router, TypeScript, PWA behavior, structured reporting workflows, role-based dashboards, map-first UI, offline-friendly submissions, and database design for civic operations.

## Product scope

- Citizen-facing mobile PWA with map-first navigation
- Multi-step report submission with categories, location context, media-aware drafts, and tracking numbers
- Public tracking page with transparent status timeline
- Admin dashboard for moderation, routing, assignment, analytics, exports, and workbench review
- Handler dashboard for assigned government desks
- Alerts, rewards, transparency, help, account, and report history pages
- Supabase schema and seed data for offices, wards, routing rules, assignments, notifications, audit logs, and public tracking
- Legacy static prototype preserved for project-history context

## Engineering highlights

- Next.js App Router with TypeScript-first components
- PWA manifest, install surfaces, service worker, offline fallback, and weak-network recovery
- Supabase client/server helpers with typed database models
- Report workflow service for tracking numbers, routing, assignment, status updates, notifications, and audit events
- Reusable UI system with shadcn-style components and Tailwind CSS
- CI-ready type checking and linting

## Technology

| Area | Stack |
| --- | --- |
| App framework | Next.js, React, TypeScript |
| UI | Tailwind CSS, shadcn-style components, Framer Motion, Lucide |
| Maps | Leaflet, React Leaflet |
| Backend model | Supabase SQL, typed service helpers |
| PWA | Manifest, service worker, offline shell |

## Local setup

1. Install Node.js 20 or newer.
2. Copy `.env.example` to `.env.local`.
3. Add your Supabase values:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   SUPABASE_REPORT_MEDIA_BUCKET=report-media
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. Install dependencies:

   ```bash
   npm install
   ```

5. Run the app:

   ```bash
   npm run dev
   ```

6. Open `http://localhost:3000`.

## Database setup

Use a fresh Supabase development project:

1. Run `supabase/schema.sql`.
2. Run `supabase/seed.sql`.
3. Configure the private `report-media` storage bucket.

Do not apply the resettable schema directly to a live production database without converting it into migrations.

## Security note

The public repo includes `.env.example` only. Real Supabase keys, service role keys, and deployment secrets must stay in `.env.local` or the hosting provider’s secret manager.

## Career relevance

This project shows my ability to design and build a civic-tech product with real-world workflows: citizen intake, government routing, transparency, offline resilience, admin review, handler queues, and database-backed operations.
