# EkiSignal — map-first pilot safety and release gates

Status: **design / development only; not deployed.** Canonical source: `oprahayo/eki-suggest` (Next.js), draft PR #1.

## Citizen experience

1. **Home**: simple text-only conversation with shortcuts to report an issue, track a reference, and read notices. No microphone, recording, audio synthesis or claim of unrestricted AI assistance. The chat routes to supported workflows; it does not submit report narratives or create backend records.
2. **Reports**: Leaflet map with marker/list synchronization, Ekiti outline/bounds, LGA/category/status filters and mobile filter drawer. The seven example cases are **fictional demonstrations**, not data from government. Unlocated example pins are **approximate area estimates**, not exact properties.
3. **Reporting**: browser-local draft / preview; anonymous mode may omit contact name and phone. Browser-generated references must not be mistaken for cross-device database IDs.
4. **Tracking**: shows demonstration examples or device-local information. A device-local case does not prove a government office has received or viewed anything.

## Privacy boundary in this branch

- Local submissions have `isPublic=false`. The public map deliberately includes **only** `source="demo"` records until a separate approved server feed is implemented. Even older persisted local reports with `isPublic=true` are not displayed. Map model projection strips contact details and internal notes.
- The reference `supabase/schema.sql` uses `public_tracking_enabled=false` and `moderation_flag='review'` by default. Public tracking requires an explicitly approved public title, summary, coarse location label, moderator identity and approval timestamp.
- The proposed public tracking RPC returns **no original image/video**, storage bucket/path, exact latitude/longitude, street address, home landmark, contact details or raw description. Reviewers must produce safe public derivatives before any cross-device map feed is enabled.
- The existing backend API routes return **503** unless `EKISIGNAL_REAL_INTAKE_ENABLED=true`. Even when a service is enabled after future review, automated routing is a **suggested desk** and not evidence of an acknowledged official assignment.

**Warning:** `supabase/schema.sql` resets tables and is only for a disposable, new development database. Do not run it in live Supabase or promote these changes to production. An approved additive migration, security-definer review, access policy, retention/delete jobs, operator identity and emergency disclaimer are prerequisites.

## What remains before handling actual citizens' reports

1. Publish a legal/privacy notice with the independent project operator, purpose, lawful basis, retention window, withdrawal/deletion process, and handling rules for sensitive allegations.
2. Implement verified invite-only moderator/staff accounts and identity, separate from anonymous public search. Enforce limited LGA/role permissions and audit every read and write.
3. Build authenticated, rate-limited, abuse-resistant cross-device intake. Generate durable server references only after transactional persistence.
4. Add explicit report moderation and duplication/sensitivity review before public title, summary, location approximation, timeline update or media derivative is released. Security, corruption and address-specific complaints require elevated review.
5. Implement verified government office directory, evidence-backed dispatch events and authenticated handler acknowledgements. Keep *suggested routing*, *dispatched*, *received*, *viewed* and *official response* distinct.
6. Implement reviewed public map projection and pagination, so server responses contain only approved public fields. Keep unreviewed photos and GPS in restricted storage.
7. Test on two different devices: file case on A, moderate/acknowledge from authorized account B, read the published update on public device C, and verify withdrawal and deletion remove it from every feed and cache.
8. Pilot in one LGA with roads, drainage, water and sanitation before expanding. Track time to assignment, time to first **verified** official response, overdue cases and independently substantiated resolution.

## Developer checks

- `npm run typecheck`
- `npm run lint`
- `node --test tests/privacy-map.test.mjs`
- `npm run build`
- GitHub Actions also performs real Chromium reviews at 280, 390 and 1280 pixel widths, capturing Home chat, the public map and mobile filter drawer.
