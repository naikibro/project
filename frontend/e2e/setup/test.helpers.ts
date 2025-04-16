import { expect } from "@playwright/test";

export async function init(page) {
  await page.goto("http://localhost:3000/");
  await expect(page).toHaveURL("http://localhost:3000/");
}
