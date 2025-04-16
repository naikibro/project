import { expect, test } from "@playwright/test";
import { init } from "./setup/test.helpers";
import { assert } from "console";

test("Default User should signin to a dashboard page", async ({ page }) => {
  await init(page);

  const userEmail = process.env.TEST_USER_EMAIL;
  const userPassword = process.env.TEST_USER_PASSWORD;

  assert(userEmail, "TEST_USER_EMAIL is not set");
  assert(userPassword, "TEST_USER_PASSWORD is not set");

  // Signin using admin credentials
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.getByRole("textbox", { name: "Email" }).click();
  await page.getByRole("textbox", { name: "Email" }).fill(userEmail);
  await page.getByRole("textbox", { name: "Email" }).press("Tab");
  await page.getByRole("textbox", { name: "Password" }).fill(userPassword);
  await page.getByRole("textbox", { name: "Password" }).press("Enter");

  await page.waitForTimeout(500);
  // Verify dashboard page
  await expect(page.getByLabel("user-dashboard").first()).toBeVisible();
  await expect(page.getByLabel("dashboard").first()).toBeVisible();
  await expect(page.getByLabel("header-title")).toBeVisible();

  // Sign out
  await page.getByRole("button", { name: "signout-button" }).click();
  await expect(page.getByLabel("hero-section")).toBeVisible();
});
