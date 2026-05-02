import { expect, test } from "@playwright/test";

test("renders the Zipline public domain homepage", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: /A clean public front door for your Zipline host/i }),
  ).toBeVisible();
  await expect(page.getByText(/Public domain ready/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /Review launch plan/i })).toBeVisible();
  await expect(
    page.getByText(/Set ZIPLINE_API_URL and ZIPLINE_TOKEN on the server to enable live uploads/i),
  ).toBeVisible();
});
