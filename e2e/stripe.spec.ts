import type { APIRequestContext, Page } from "@playwright/test";
import { planData } from "@/lib/domain";
import { invariant } from "@epic-web/invariant";
import { expect, test } from "@playwright/test";

const emailPrefix = "stripe-";

test.describe("subscribe", () => {
  planData
    .flatMap((plan) => [
      {
        email: `${emailPrefix}${plan.monthlyPriceLookupKey.toLowerCase()}@e2e.com`,
        intent: plan.monthlyPriceLookupKey,
        planName: plan.name,
      },
      {
        email: `${emailPrefix}${plan.annualPriceLookupKey.toLowerCase()}@e2e.com`,
        intent: plan.annualPriceLookupKey,
        planName: plan.name,
      },
    ])
    .forEach(({ email, intent, planName }) => {
      test(`${intent} for ${email}`, async ({ page, request, baseURL }) => {
        invariant(baseURL, "Missing baseURL");
        const pom = new StripePom({ page, baseURL });

        await pom.deleteUser({ request, email });
        await pom.login({ email });
        await pom.subscribe({ email, intent });
        await pom.verifySubscription({ planName, status: "trialing" });
      });
    });
});

test.describe("subscribe/cancel", () => {
  test.describe.configure({ mode: "parallel", timeout: 120_000 });
  planData
    .flatMap((plan) => [
      {
        email: `${emailPrefix}${plan.monthlyPriceLookupKey.toLowerCase()}-cancel@e2e.com`,
        intent: plan.monthlyPriceLookupKey,
        planName: plan.name,
      },
      {
        email: `${emailPrefix}${plan.annualPriceLookupKey.toLowerCase()}-cancel@e2e.com`,
        intent: plan.annualPriceLookupKey,
        planName: plan.name,
      },
    ])
    .forEach(({ email, intent, planName }) => {
      test(`${intent} for ${email}`, async ({ page, request, baseURL }) => {
        invariant(baseURL, "Missing baseURL");
        const pom = new StripePom({ page, baseURL });

        await pom.deleteUser({ request, email });
        await pom.login({ email });
        await pom.subscribe({ email, intent });
        await pom.verifySubscription({ planName, status: "trialing" });
        await pom.cancelSubscription();
        await pom.verifyNoSubscription();
      });
    });
});

test.describe("subscribe/upgrade", () => {
  test.describe.configure({ mode: "parallel", timeout: 120_000 });
  [planData, planData.toReversed()]
    .flatMap(([plan, plan1]) => [
      {
        email: `${emailPrefix}${plan.monthlyPriceLookupKey.toLowerCase()}-${plan.monthlyPriceLookupKey.toLowerCase()}-upgrade@e2e.com`,
        intent: plan.monthlyPriceLookupKey,
        planName: plan.name,
        intent1: plan.annualPriceLookupKey,
        planName1: plan.name,
      },
      {
        email: `${emailPrefix}${plan.monthlyPriceLookupKey.toLowerCase()}-${plan1.monthlyPriceLookupKey.toLowerCase()}-upgrade@e2e.com`,
        intent: plan.monthlyPriceLookupKey,
        planName: plan.name,
        intent1: plan1.monthlyPriceLookupKey,
        planName1: plan1.name,
      },
      {
        email: `${emailPrefix}${plan.monthlyPriceLookupKey.toLowerCase()}-${plan1.annualPriceLookupKey.toLowerCase()}-upgrade@e2e.com`,
        intent: plan.monthlyPriceLookupKey,
        planName: plan.name,
        intent1: plan1.annualPriceLookupKey,
        planName1: plan1.name,
      },
    ])
    .forEach(({ email, intent, planName, intent1, planName1 }) => {
      test(`${intent} to ${intent1} for ${email}`, async ({
        page,
        request,
        baseURL,
      }) => {
        invariant(baseURL, "Missing baseURL");
        const pom = new StripePom({ page, baseURL });

        await pom.deleteUser({ request, email });
        await pom.login({ email });
        await pom.subscribe({ email, intent });
        await pom.verifySubscription({ planName, status: "trialing" });

        await pom.upgrade({ intent: intent1 });
        await pom.verifySubscription({ planName: planName1, status: "active" });
      });
    });
});

// https://playwright.dev/docs/pom

class StripePom {
  readonly page: Page;
  readonly baseURL: string;

  constructor({ page, baseURL }: { page: Page; baseURL: string }) {
    invariant(baseURL.endsWith("/"), "baseURL must have a trailing slash");
    this.page = page;
    this.baseURL = baseURL;
  }

  async deleteUser({
    request,
    email,
  }: {
    request: APIRequestContext;
    email: string;
  }) {
    const response = await request.post(`/api/e2e/delete/user/${email}`);
    expect(response.ok()).toBe(true);
  }

  async login({ email }: { email: string }) {
    await this.page.goto("/login");
    await this.page.getByRole("textbox", { name: "Email" }).click();
    await this.page.getByRole("textbox", { name: "Email" }).fill(email);
    await this.page.getByRole("button", { name: "Send magic link" }).click();
    await this.page.getByRole("link", { name: /magic-link/ }).click();
    await this.page.waitForURL(/\/app\//);
  }

  async navigateToPricing() {
    await this.page.getByRole("link", { name: "Home" }).click();
    await this.page.getByRole("link", { name: "Pricing" }).click();
  }

  async selectPlan({ intent }: { intent: string }) {
    // Find the plan that matches the intent (lookup key).
    const plan = planData.find(
      (p) =>
        p.monthlyPriceLookupKey === intent || p.annualPriceLookupKey === intent,
    );
    if (!plan) throw new Error(`Plan not found for intent ${intent}`);
    // Determine if the intent is for annual pricing.
    const isAnnual = intent === plan.annualPriceLookupKey;
    // Get the switch element and check its current state.
    const switchElement = this.page.getByLabel("Annual pricing");
    const isCurrentlyAnnual =
      (await switchElement.getAttribute("aria-checked")) === "true";
    // Toggle the switch only if it's not already in the desired state.
    if (isAnnual !== isCurrentlyAnnual) {
      await switchElement.dispatchEvent("click");
    }
    // Click the "Purchase" button for the plan.
    await this.page.getByTestId(plan.name).click();
  }

  async fillPaymentForm({ email }: { email: string }) {
    // Use dispatchEvent instead of click because the button has 0x0 dimensions and is not considered visible by Playwright
    await this.page
      .getByTestId("card-accordion-item-button")
      .dispatchEvent("click");

    await this.page.getByRole("textbox", { name: "Card number" }).click();
    await this.page
      .getByRole("textbox", { name: "Card number" })
      .fill("4242 4242 4242 4242");
    await this.page.getByRole("textbox", { name: "Expiration" }).click();
    await this.page
      .getByRole("textbox", { name: "Expiration" })
      .fill("12 / 34");
    await this.page.getByRole("textbox", { name: "CVC" }).click();
    await this.page.getByRole("textbox", { name: "CVC" }).fill("123");
    await this.page.getByRole("textbox", { name: "Cardholder name" }).click();
    await this.page
      .getByRole("textbox", { name: "Cardholder name" })
      .fill(email);
    await this.page.getByRole("textbox", { name: "ZIP" }).click();
    await this.page.getByRole("textbox", { name: "ZIP" }).fill("12345");
    await this.page
      .getByRole("checkbox", { name: "Save my information for" })
      .uncheck();
  }

  async submitPayment() {
    await this.page.getByTestId("hosted-payment-submit-button").click();
    await this.page.waitForURL(`${this.baseURL}**`);
  }

  async navigateToBilling() {
    await this.page.getByTestId("sidebar-billing").click();
    await this.page.waitForURL(/billing/);
  }

  async verifySubscription({
    planName,
    status,
  }: {
    planName: string;
    status: string;
  }) {
    await this.navigateToBilling();
    await expect(async () => {
      await this.page.reload();
      await expect(this.page.getByTestId("active-plan")).toContainText(
        planName,
        { ignoreCase: true, timeout: 100 }, // Timeout short since data is static.
      );
      await expect(this.page.getByTestId("active-status")).toContainText(
        status,
        { ignoreCase: true, timeout: 100 },
      );
    }).toPass({ timeout: 60_000 });
  }

  async cancelSubscription() {
    await this.page
      .getByRole("button", { name: "Cancel Subscription" })
      .click();
    await this.page.getByTestId("confirm").click();
    await expect(this.page.getByTestId("page-container-main")).toContainText(
      "Subscription canceled",
    );
    await this.page.getByTestId("return-to-business-link").click();
    await this.page.waitForURL(`${this.baseURL}**`);
  }

  async verifyNoSubscription() {
    await expect(async () => {
      await this.page.reload();
      await expect(
        this.page.getByText("No active subscription for"),
      ).toBeVisible({
        timeout: 100,
      });
    }).toPass({ timeout: 60_000 });
  }

  async subscribe({ email, intent }: { email: string; intent: string }) {
    await this.navigateToPricing();
    await this.selectPlan({ intent });
    await this.fillPaymentForm({ email });
    await this.submitPayment();
  }

  async upgrade({ intent }: { intent: string }) {
    await this.navigateToPricing();
    await this.selectPlan({ intent });
    await this.page.getByTestId("confirm").click();
    await this.page.waitForURL(`${this.baseURL}**`);
  }
}
