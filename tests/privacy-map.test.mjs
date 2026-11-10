import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import ts from "typescript"

const project = (path) => readFileSync(
  fileURLToPath(new URL("../" + path, import.meta.url)), "utf8"
)

// Execute the actual TS projection with a fixed fake Ekiti centroid.
// No database, browser, user file or external network is touched.
function projector() {
  const compiled = ts.transpileModule(project("src/lib/public-signals.ts"), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  }).outputText
  const loaded = { exports: {} }
  const requireSafe = (specifier) => {
    if (specifier === "@/lib/ekiti") {
      return { ekitiCenter: { lat: 7.6, lng: 5.2 } }
    }
    throw new Error("Unexpected import: " + specifier)
  }
  const evaluate = new Function("require", "module", "exports", compiled)
  evaluate(requireSafe, loaded, loaded.exports)
  return loaded.exports.materializePublicSignalReports
}

const base = {
  id: "demo-1", trackingNumber: "DEMO-EKI-1", isPublic: true, source: "demo",
  title: "Fictional broken bridge", category: "Road", status: "Under Review",
  severity: "urgent",
  location: {
    state: "Ekiti", lga: "Ikere", ward: "Demo Ward",
    community: "Demo Community", area: "Demo road", landmark: "Fictional junction",
    coordinates: { lat: 7.49, lng: 5.23 },
  },
  contact: { name: "Do not reveal name", phone: "+234123456789", email: "private@example.test" },
  updates: [
    { id: "pub", visibility: "public", note: "Fictional map status" },
    { id: "private", visibility: "internal", note: "Sensitive internal investigation" },
  ],
  media: [],
}

test("public map refuses all device-created cases, including old isPublic=true drafts", () => {
  const projectSignals = projector()
  const privateReport = {
    ...base, id: "device-2", trackingNumber: "EKI-DEVICE-2",
    source: "submitted", isPublic: true, title: "Sensitive family complaint",
  }
  const privateDraft = { ...privateReport, id: "device-3", isPublic: false }
  const published = projectSignals([privateReport, privateDraft, base])
  assert.equal(published.length, 1)
  assert.equal(published[0].trackingNumber, base.trackingNumber)
  assert.equal(JSON.stringify(published).includes("Sensitive family complaint"), false)
})

test("public map strips all reporter contacts and internal notes", () => {
  const published = projector()([base])
  assert.deepEqual(published[0].contact, { name: "", phone: "", email: "" })
  assert.deepEqual(published[0].updates.map((item) => item.id), ["pub"])
  assert.equal(JSON.stringify(published).includes("Do not reveal name"), false)
  assert.equal(JSON.stringify(published).includes("Sensitive internal investigation"), false)
})

test("locations without supplied GPS are explicitly labelled approximate", () => {
  const estimated = {
    ...base, id: "demo-approx", trackingNumber: "DEMO-EKI-2",
    location: { ...base.location, coordinates: undefined },
  }
  const published = projector()([base, estimated])
  assert.equal(published[0].mapPositionKind, "provided")
  assert.equal(published[1].mapPositionKind, "approximate")
  assert.equal(typeof published[1].location.coordinates.lat, "number")
  assert.equal(typeof published[1].location.coordinates.lng, "number")
  // Second projection must preserve the approximate marker label.
  assert.equal(projector()(published)[1].mapPositionKind, "approximate")
})

test("new real reports are private in device state and server intake", () => {
  const client = project("src/components/providers/report-center-provider.tsx")
  const service = project("src/lib/supabase/report-service.ts")
  const endpoint = project("src/app/api/reports/route.ts")
  assert.match(client, /isPublic: false,\s*source: "submitted"/)
  assert.match(service, /public_tracking_enabled: false/)
  assert.match(service, /moderation_flag: "review"/)
  assert.match(service, /assignment: null/)
  assert.match(service, /visibility: "internal"/)
  assert.match(endpoint, /EKISIGNAL_REAL_INTAKE_ENABLED/)
  assert.match(endpoint, /deliveryConfirmed: false/)
})

test("public tracking is approval-gated and never reveals raw GPS or evidence paths", () => {
  const schema = project("supabase/schema.sql")
  assert.match(schema, /public_tracking_enabled boolean not null default false/)
  assert.match(schema, /reports_publication_requires_review/)
  assert.match(schema, /public_approved_at is not null/)
  assert.match(schema, /public_approved_by is not null/)
  const start = schema.indexOf("create or replace function public.get_public_report_tracking(")
  const end = schema.indexOf("insert into storage.buckets", start)
  assert.ok(start >= 0 && end > start)
  const publicFunction = schema.slice(start, end)
  assert.doesNotMatch(publicFunction, /'storagePath'|'bucket', m.bucket_name/)
  assert.doesNotMatch(publicFunction, /'latitude', loc.latitude|'longitude', loc.longitude/)
  assert.doesNotMatch(publicFunction, /'description', r.description/)
  assert.match(publicFunction, /'description', r.public_description/)
  assert.match(publicFunction, /'media', '\[\]'::jsonb/)
})

test("home is text-only with exactly three primary shortcuts", () => {
  const home = project("src/components/citizen/home-screen.tsx")
  assert.match(home, /Type a message…/)
  assert.match(home, /Send message/)
  for (const label of ["Report an issue", "Track a number", "Community notices"]) {
    assert.match(home, new RegExp(label))
  }
  assert.doesNotMatch(home, /speechRecognition|SpeechRecognition|microphone|<Mic/)
})
