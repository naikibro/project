import { expect, test } from "@playwright/test";
import { init } from "./setup/test.helpers";

test("should navigate to the default pages", async ({ page }) => {
  await init(page);

  // Verify header elements by aria-label
  await expect(page.getByLabel("header").first()).toBeVisible();
  await expect(
    page.locator('[aria-label="header-logo"]').first()
  ).toBeVisible();
  await expect(page.getByLabel("hero-section")).toBeVisible();
  await expect(page.getByLabel("header-auth-box").nth(1)).toBeVisible();

  await expect(page.getByLabel("footer-links")).toBeVisible();

  // Verify Contact page
  await page.getByRole("link", { name: "Contact" }).click();
  await expect(page.getByRole("heading", { name: "Contact Us" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Send Message" })
  ).toBeVisible();

  // Verify Terms and conditions page
  await page.getByRole("link", { name: "Terms and conditions" }).click();
  await expect(page.getByText("By using")).toBeVisible();

  // Verify Privacy policy page
  await page.getByRole("link", { name: "Privacy policy" }).click();
  await expect(page.getByText("By using")).toBeVisible();

  // Verify Organization page

  await page.getByRole("link", { name: "GitHub" }).click();
  await expect(
    page.getByRole("heading", { name: "Hi there, I'm NaikiBro! 👋" })
  ).toBeVisible();
});
