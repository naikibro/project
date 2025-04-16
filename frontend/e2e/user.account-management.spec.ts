import { expect, test } from "@playwright/test";
import { init } from "./setup/test.helpers";
import { idOf } from "src/utils/utils";

test("User should be able to create an account, login, update his name, delete his account", async ({
  page,
}) => {
  await init(page);

  const randomNumber = idOf(Date.now().toString());
  const password = process.env.TEST_ADMIN_PASSWORD;

  await page.getByRole("button", { name: "Sign up" }).click();
  await page.getByRole("textbox", { name: "Username" }).click();
  await page.getByRole("textbox", { name: "Username" }).fill("user");
  await page.getByRole("textbox", { name: "Email" }).click();
  await page
    .getByRole("textbox", { name: "Email" })
    .fill(`user+${randomNumber}@example.com`);
  await page.getByRole("textbox", { name: "Password" }).click();
  await page.getByRole("textbox", { name: "Password" }).fill(password);
  await page.getByRole("checkbox", { name: "I accept the Terms and" }).check();
  await page
    .getByRole("checkbox", { name: "I accept the Privacy Policy" })
    .check();
  await page.getByRole("button", { name: "Sign Up" }).click();
  await expect(page.getByLabel("dashboard", { exact: true })).toBeVisible();
  await expect(page.getByRole("tab", { name: "My Profile" })).toBeVisible();
  await page.getByRole("tab", { name: "My Profile" }).click();
  await expect(page.getByLabel("user-informations").first()).toBeVisible();
  await expect(
    page.getByRole("button", { name: "✎ Edit Profile" })
  ).toBeVisible();
  await page.getByRole("button", { name: "✎ Edit Profile" }).click();
  await page.getByRole("textbox", { name: "Username" }).click();
  await page.getByRole("textbox", { name: "Username" }).fill("usernewname");
  await page.getByRole("button", { name: "Save" }).click();

  await page.getByRole("button", { name: "delete-account-button" }).click();
  await page.getByRole("button", { name: "Delete" }).click();
  await page.getByRole("button", { name: "Delete" }).click();

  await expect(page.getByLabel("hero-section")).toBeVisible();
});
