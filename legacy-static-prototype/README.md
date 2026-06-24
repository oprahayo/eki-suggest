# EkiBridge Prototype

A mobile-first Ekiti citizen-to-government reporting prototype with anonymous submission, optional account access, structured LGA and ward selection, a live map, file attachments, and phone-friendly video capture.

## What This Prototype Includes

- Anonymous-first report form with optional identified mode
- Login and create-account entry options in the reporting flow
- Ekiti State data for all 16 LGAs, plus town or community and ward selectors
- Interactive Leaflet map for dropping a pin inside Ekiti
- Live location request using the browser geolocation API
- Privacy toggle to reduce exact GPS to approximate coordinates
- Live video capture using `getUserMedia()` and `MediaRecorder` when supported
- Native phone camera fallback using the HTML `capture` attribute when live recording is unavailable
- Local tracking IDs and a browser-stored activity ledger
- PWA basics: manifest, service worker, and install prompt support

## Run It Locally

The browser needs a secure context for location and camera access. `localhost` works.

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173` in a browser.

## How Live Video Works

1. The user taps `Record video`.
2. If the browser supports secure-context media capture, the app requests camera and microphone permission.
3. If permission is granted, the app starts a live preview and records in-browser.
4. If the browser does not support live recording in the current context, the app opens the phone's native video capture flow instead.
5. The user can preview, clear, and include the captured video in the report package.

## How Anonymous Reporting Should Work In Production

This prototype demonstrates the experience only. For a real whistleblowing-grade system, the backend should:

- avoid collecting names, email, or phone in anonymous mode
- disable or discard IP logging for anonymous endpoints where legally feasible
- strip EXIF and other metadata from uploaded media before storage or routing
- encrypt files at rest and in transit
- separate case content from any optional contact details
- restrict staff access with roles and full audit logs
- generate tracking IDs that do not reveal reporter identity

## How To Ensure Transparency

Transparency is not only about public posting. It is about traceability.

A production system should create:

- a report record with timestamp, category, location, and tracking ID
- an assignment log showing which desk received it
- a status history such as `Received`, `Assigned`, `In Review`, `Resolved`, `Closed`
- SLA timers and escalations when desks do not respond
- a redacted public view for non-sensitive service issues
- a private handling flow for sensitive whistleblowing reports

## How Reports Reach Government

Do not use email as the main system of record.

Recommended flow:

1. Citizen submits report through the web app.
2. Backend stores the report in a database and object storage.
3. Routing rules decide the correct desk based on issue type and location.
4. The desk gets a dashboard alert and optional email notification.
5. Supervisors see unresolved reports and escalation queues.
6. Citizens track progress using the tracking ID.

## Good First Backend Stack

For a fast MVP, a practical stack could be:

- frontend PWA: static HTML/CSS/JS or later React/Next.js
- database: PostgreSQL
- file storage: S3-compatible storage or Supabase Storage
- API: serverless functions or a small Node service
- dashboard: secure internal web dashboard for approved officials
- notifications: email first, then WhatsApp or SMS

## Data Notes

The Ekiti location data in this prototype is seeded from:

- Ekiti State Government facts and reference pages for LGA context
- Ekiti State Government towns and villages listing
- ward listings from the Integrity election-results reference pages for Ekiti

The ward coverage is complete for all 16 LGAs. The town or community options are a practical seed list for the MVP and can be expanded further.

## Backend Dashboard Notes

When the backend and internal government dashboard are built, the reporting layer should support:

- issue heatmaps by LGA, ward, and exact map pin clusters
- loudest complaint points and repeat-incident locations
- top complaint categories by day, week, and month
- response time, backlog, and unresolved case volume by desk
- media-rich case views with photos, audio, and video evidence
- whistleblowing queues separated from normal public-service complaints
- trend lines for rising issues such as roads, water, power, and safety

## Important Limits

- No browser app can guarantee perfect anonymity by itself.
- In-browser camera and live GPS require a secure context such as `https://` or `localhost`.
- The native phone-camera fallback is more reliable than in-browser recording on some mobile browsers.
- This prototype stores reports in local browser storage only, not on a real server.
