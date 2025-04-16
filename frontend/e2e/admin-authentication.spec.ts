import { expect, test } from "@playwright/test";
import { init } from "./setup/test.helpers";
import { assert } from "console";

test("Admin User should signin to a dashboard page", async ({ page }) => {
  await init(page);

  const adminEmail = process.env.TEST_ADMIN_EMAIL;
  const adminPassword = process.env.TEST_ADMIN_PASSWORD;

  assert(adminEmail, "TEST_ADMIN_EMAIL is not set");
  assert(adminPassword, "TEST_ADMIN_PASSWORD is not set");

  // Signin using admin credentials
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.getByRole("textbox", { name: "Email" }).click();
  await page.getByRole("textbox", { name: "Email" }).fill(adminEmail);
  await page.getByRole("textbox", { name: "Email" }).press("Tab");
  await page.getByRole("textbox", { name: "Password" }).fill(adminPassword);
  await page.getByRole("textbox", { name: "Password" }).press("Enter");

  // Verify dashboard page

  await expect(page.getByLabel("admin-header-title")).toBeVisible();
  await expect(page.getByLabel("admin-dashboard")).toBeVisible();
  await expect(page.getByLabel("dashboard-welcome-box")).toBeVisible();

  // Sign out
  await page.getByRole("button", { name: "signout-button" }).click();
  await expect(page.getByLabel("hero-section")).toBeVisible();
});
