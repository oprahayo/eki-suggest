import assert from "node:assert/strict"
import { mkdir } from "node:fs/promises"
import { chromium } from "playwright"

const origin = "http://127.0.0.1:4174"
const folder = "artifacts/ekisignal-review"
await mkdir(folder, { recursive: true })
const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] })

async function record(width, height) {
  const page = await browser.newPage({
    viewport: { width, height },
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
  })
  const errors = []
  page.on("pageerror", (error) => errors.push(error.message))
  await page.goto(origin + "/", { waitUntil: "domcontentloaded", timeout: 45000 })
  await page.getByRole("heading", { name: "EkiSignal" }).waitFor({ timeout: 15000 })
  assert.equal(await page.locator("#ekisignal-chat-message").count(), 1)
  assert.equal(await page.locator("button[aria-label='Send message']").count(), 1)
  assert.equal(await page.getByRole("link", { name: "Report an issue" }).count(), 1)
  assert.equal(await page.getByRole("link", { name: "Track a number" }).count(), 1)
  assert.equal(await page.getByRole("link", { name: "Community notices" }).count(), 1)
  assert.equal(await page.locator("button[aria-label*='microphone' i]").count(), 0)
  const fit = await page.evaluate(() => ({
    viewport: innerWidth,
    document: document.documentElement.scrollWidth,
  }))
  assert.ok(fit.document <= fit.viewport, "Home overflow at " + width + "px: " + JSON.stringify(fit))
  await page.screenshot({ path: folder + "/home-" + width + ".png", fullPage: true })

  await page.locator("#ekisignal-chat-message").fill("Show the public reports map")
  await page.getByRole("button", { name: "Send message" }).click()
  await page.getByRole("link", { name: "Open public map" }).waitFor({ timeout: 10000 })
  await page.screenshot({ path: folder + "/chat-" + width + ".png", fullPage: true })

  await page.goto(origin + "/reports", { waitUntil: "domcontentloaded", timeout: 45000 })
  await page.getByRole("heading", { name: "Reports across Ekiti State" }).waitFor({ timeout: 15000 })
  await page.getByText("Demo map · No verified live government reports").waitFor({ timeout: 10000 })
  await page.waitForTimeout(2500)
  const map = await page.evaluate(() => {
    const frame = document.querySelector(".leaflet-container")?.getBoundingClientRect()
    const visibleHeight = frame
      ? Math.max(0, Math.min(frame.bottom, innerHeight - 112) - Math.max(0, frame.top))
      : 0
    return {
      viewport: innerWidth,
      document: document.documentElement.scrollWidth,
      markers: document.querySelectorAll(".ekisignal-report-marker-shell").length,
      mapTop: frame?.top ?? null,
      mapHeight: frame?.height ?? 0,
      visibleHeight,
    }
  })
  assert.ok(map.document <= map.viewport, "Map overflow at " + width + "px: " + JSON.stringify(map))
  assert.ok(map.markers >= 1, "Public example markers absent at " + width + "px")
  assert.ok(map.visibleHeight >= (width <= 300 ? 175 : 240),
    "Public map must remain prominently visible at " + width + "px: " + JSON.stringify(map))
  await page.screenshot({ path: folder + "/public-map-" + width + ".png", fullPage: true })
  if (width <= 390) {
    await page.getByRole("button", { name: "Filters" }).click()
    await page.getByRole("heading", { name: "Public signals" }).waitFor({ timeout: 10000 })
    await page.screenshot({ path: folder + "/filters-" + width + ".png", fullPage: true })
  }
  console.log(JSON.stringify({ width, home: fit, map, pageErrors: errors.slice(0, 5) }))
  assert.equal(errors.length, 0, "Browser runtime errors at width " + width)
  await page.close()
}

try {
  await record(390, 844)
  await record(280, 720)
  await record(1280, 820)
} finally {
  await browser.close()
}
