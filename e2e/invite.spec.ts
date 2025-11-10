import type { Page } from "@playwright/test";
import { invariant } from "@epic-web/invariant";
import { expect, test } from "@playwright/test";

test.describe("invite", () => {
  test.describe.configure({ mode: "serial" });
  const emails = Array.from(
    { length: 4 },
    (_, n) => `invite-${String(n)}@e2e.com`,
  );

  test.beforeAll(async ({ request }) => {
    for (const email of emails) {
      await request.post(`/api/e2e/delete/user/${email}`);
    }
  });

  emails.forEach((email) => {
    const emailsToInvite = emails.filter((e) => e !== email);
    test(`invite from ${email}`, async ({ page, baseURL }) => {
      invariant(baseURL, "Missing baseURL");
      const pom = new InvitePom({ page, baseURL });

      await pom.login({ email });
      await pom.inviteUsers({ emails: emailsToInvite });
      await pom.verifyInvitations({ expectedEmails: emailsToInvite });
    });
  });

  emails.forEach((email) => {
    const expectedInviters = emails.filter((e) => e !== email);
    test(`accept invites for ${email}`, async ({ page, baseURL }) => {
      invariant(baseURL, "Missing baseURL");
      const pom = new InvitePom({ page, baseURL });

      await pom.login({ email });
      await pom.acceptInvitations({ expectedEmails: expectedInviters });
    });
  });

  test("verify member count", async ({ page, baseURL }) => {
    invariant(baseURL, "Missing baseURL");
    const pom = new InvitePom({ page, baseURL });

    await pom.login({ email: emails[0] });
    await expect(page.getByTestId("member-count")).toHaveText(
      String(emails.length),
    );
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
    await this.page
      .locator("main")
      .getByRole("button", { name: "Invite" })
      .click();
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
  }

  async acceptInvitations({ expectedEmails }: { expectedEmails: string[] }) {
    // Invitations are accepted on the main app page, not the invitations page
    // After login, we're already on /app/ which shows pending invitations
    for (const email of expectedEmails) {
      await this.page
        .getByRole("button", { name: `Accept invitation from ${email}` })
        .click();
    }
    for (const email of expectedEmails) {
      await expect(this.page.getByText(`Inviter: ${email}`)).not.toBeVisible();
    }
  }
}
