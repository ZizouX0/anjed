import { test, expect } from "@playwright/test";

// ── Home ─────────────────────────────────────────────────────────────────────

test("home shows Anjed's Closet", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toContainText("Anjed’s Closet");
});

// ── Bottom-nav navigation ─────────────────────────────────────────────────────

test("bottom nav goes to Dressing and shows Mon dressing", async ({ page }) => {
  await page.goto("/");
  await page.locator("nav[aria-label='Navigation principale'] a[href='/dressing']").click();
  await expect(page).toHaveURL(/\/dressing/);
  await expect(page.locator("h1")).toContainText("Mon dressing");
});

test("bottom nav goes to Mood and mood cards are visible", async ({ page }) => {
  await page.goto("/");
  await page.locator("nav[aria-label='Navigation principale'] a[href='/mood']").click();
  await expect(page).toHaveURL(/\/mood/);
  // At least one mood card should be visible
  const cards = page.locator(".mood-card");
  await expect(cards.first()).toBeVisible();
  const count = await cards.count();
  expect(count).toBeGreaterThan(0);
});

test("bottom nav goes to Looks", async ({ page }) => {
  await page.goto("/");
  await page.locator("nav[aria-label='Navigation principale'] a[href='/looks']").click();
  await expect(page).toHaveURL(/\/looks/);
  await expect(page.locator("h1")).toContainText("Mes looks");
});

// ── Mood card changes data-mood on <html> ─────────────────────────────────────

test("clicking Confiance mood card sets data-mood=boss on <html>", async ({ page }) => {
  await page.goto("/mood");

  // The default mood is "romantic" — verify that before clicking
  const html = page.locator("html");
  await expect(html).toHaveAttribute("data-mood", "romantic");

  // Find and click the mood card whose label is "Confiance"
  // The card structure: <button class="mood-card"><span class="mood-card__name">Confiance</span>
  await page
    .locator(".mood-card", { has: page.locator(".mood-card__name", { hasText: "Confiance" }) })
    .click();

  // After clicking, the provider calls document.documentElement.dataset.mood = "boss"
  await expect(html).toHaveAttribute("data-mood", "boss");
});

// ── Looks tabs ────────────────────────────────────────────────────────────────

test("Looks tabs navigate to Lookbooks", async ({ page }) => {
  await page.goto("/looks");
  await page.locator(".tabs a[href='/lookbooks']").click();
  await expect(page).toHaveURL(/\/lookbooks/);
  await expect(page.locator("h1")).toContainText("Lookbooks");
});

test("Looks tabs navigate to Comparer", async ({ page }) => {
  await page.goto("/looks");
  await page.locator(".tabs a[href='/comparer']").click();
  await expect(page).toHaveURL(/\/comparer/);
  await expect(page.locator("h1")).toContainText("Comparer");
});

// ── Styliste page ──────────────────────────────────────────────────────────────

test("/styliste shows greeting bubble and text input", async ({ page }) => {
  await page.goto("/styliste");
  // Greeting bubble (first AI message)
  await expect(page.locator(".bubble--ai").first()).toBeVisible();
  await expect(page.locator(".bubble--ai").first()).toContainText("Coucou Anjed");
  // The composer text input
  await expect(page.locator(".chat__composer input.input")).toBeVisible();
});
