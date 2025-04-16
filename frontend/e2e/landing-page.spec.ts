import { expect, test } from "@playwright/test";
import { init } from "./setup/test.helpers";

test("should navigate to the landing page", async ({ page }) => {
  await init(page);

  // Verify header elements by aria-label
  await expect(page.getByLabel("header").first()).toBeVisible();
  await expect(
    page.locator('[aria-label="header-logo"]').first()
  ).toBeVisible();

  // Verify hero section elements by aria-label
  await expect(page.locator('[aria-label="hero-section"]')).toBeVisible();

  // Verify footer elements by aria-label
  await expect(page.locator('[aria-label="footer-links"]')).toBeVisible();
  await expect(
    page.locator('[aria-label="footer-social-links"]')
  ).toBeVisible();
  await expect(page.locator('[aria-label="LinkedIn"]')).toBeVisible();
  await expect(page.locator('[aria-label="GitHub"]')).toBeVisible();
});
