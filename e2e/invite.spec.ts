import type { APIRequestContext, Page } from "@playwright/test";
import { invariant } from "@epic-web/invariant";
import { expect, test } from "@playwright/test";

test.describe("invite", () => {
  test.describe.configure({ mode: "serial" });
  Array.from({ length: 10 }, (_, n) => n).forEach((n) => {
    const email = `invite-${String(n)}@e2e.com`;
    const otherEmails = Array.from({ length: 10 }, (_, j) => j)
      .filter((j) => j !== n)
      .map((j) => `invite-${String(j)}@e2e.com`);

    test(`invite from ${email}`, async ({ page, request, baseURL }) => {
      invariant(baseURL, "Missing baseURL");
      const pom = new InvitePom({ page, baseURL });

      await pom.deleteUser({ request, email });
      await pom.login({ email });
      await pom.inviteUsers({ emails: otherEmails });
      await pom.verifyInvitations({ expectedEmails: otherEmails });
    });
  });
});

class InvitePom {
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
    await this.page.waitForURL(/app/);
  }

  async inviteUsers({ emails }: { emails: string[] }) {
    await this.page.getByTestId("sidebar-invitations").click();
    await this.page.waitForURL(/invitations/);

    await this.page
      .getByRole("textbox", { name: "Email Addresses" })
      .fill(emails.join(", "));
    await this.page.getByRole("button", { name: "Invite" }).click();
    await expect(
      this.page.getByRole("textbox", { name: "Email Addresses" }),
    ).toHaveValue("");
  }

  async verifyInvitations({ expectedEmails }: { expectedEmails: string[] }) {
    await expect(this.page.getByTestId("invitations-list")).toBeVisible();
    for (const email of expectedEmails) {
      await expect(
        this.page.getByTestId("invitations-list").getByText(email),
      ).toBeVisible();
    }
    await expect(
      this.page.getByTestId("invitations-list").locator("li"),
    ).toHaveCount(expectedEmails.length);
  }
}
