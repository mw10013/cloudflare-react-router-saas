import type { Page } from "@playwright/test";
import { invariant } from "@epic-web/invariant";
import { expect, test } from "@playwright/test";

const users: {
  email: string;
  invitees: { email: string; action?: "accept" | "reject" }[];
}[] = [
  {
    email: "invite@e2e.com",
    invitees: [
      { email: "invite1@e2e.com", action: "accept" },
      { email: "invite2@e2e.com", action: "accept" },
      { email: "invite3@e2e.com", action: "accept" },
    ],
  },
  {
    email: "invite1@e2e.com",
    invitees: [
      { email: "invite@e2e.com" },
      { email: "invite2@e2e.com" },
      { email: "invite3@e2e.com" },
    ],
  },
  {
    email: "invite2@e2e.com",
    invitees: [
      { email: "invite@e2e.com", action: "reject" },
      { email: "invite1@e2e.com", action: "reject" },
      { email: "invite3@e2e.com", action: "reject" },
    ],
  },
  {
    email: "invite3@e2e.com",
    invitees: [
      { email: "invite@e2e.com", action: "accept" },
      { email: "invite1@e2e.com", action: "reject" },
      { email: "invite2@e2e.com" },
    ],
  },
];

test.describe("invite", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(async ({ request }) => {
    for (const email of users.map((user) => user.email)) {
      await request.post(`/api/e2e/delete/user/${email}`);
    }
  });

  users.forEach((user) => {
    test(`invite from ${user.email}`, async ({ page, baseURL }) => {
      invariant(baseURL, "Missing baseURL");
      const pom = new InvitePom({ page, baseURL });

      await pom.login({ email: user.email });
      await pom.inviteUsers({ emails: user.invitees.map((i) => i.email) });
      await pom.verifyInvitations({
        expectedEmails: user.invitees.map((i) => i.email),
      });
    });
  });

  users.forEach((user) => {
    const inviters = users.filter((u) =>
      u.invitees.some((i) => i.email === user.email),
    );
    const toAccept = inviters.filter(
      (u) =>
        u.invitees.find((i) => i.email === user.email)?.action === "accept",
    );
    const toReject = inviters.filter(
      (u) =>
        u.invitees.find((i) => i.email === user.email)?.action === "reject",
    );
    test(`handle invites for ${user.email}`, async ({ page, baseURL }) => {
      invariant(baseURL, "Missing baseURL");
      const pom = new InvitePom({ page, baseURL });

      await pom.login({ email: user.email });
      if (toAccept.length > 0) {
        await pom.acceptInvitations({
          expectedEmails: toAccept.map((u) => u.email),
        });
      }
      if (toReject.length > 0) {
        await pom.rejectInvitations({
          expectedEmails: toReject.map((u) => u.email),
        });
      }
    });
  });

  users.forEach((user) => {
    const acceptedCount = user.invitees.filter(
      (i) => i.action === "accept",
    ).length;
    const expectedCount = 1 + acceptedCount;
    test(`verify member count for ${user.email}`, async ({ page, baseURL }) => {
      invariant(baseURL, "Missing baseURL");
      const pom = new InvitePom({ page, baseURL });

      await pom.login({ email: user.email });
      await expect(page.getByTestId("member-count")).toHaveText(
        String(expectedCount),
      );
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

  async login({ email }: { email: string }) {
    await this.page.goto("/login");
    await this.page.getByRole("textbox", { name: "Email" }).click();
    await this.page.getByRole("textbox", { name: "Email" }).fill(email);
    await this.page.getByRole("button", { name: "Send magic link" }).click();
    await this.page.getByRole("link", { name: /magic-link/ }).click();
    await this.page.waitForURL(/\/app\//);
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
        .getByRole("button", { name: new RegExp(`accept.*${email}`, "i") })
        .click();
    }
    for (const email of expectedEmails) {
      await expect(this.page.getByText(`Inviter: ${email}`)).not.toBeVisible();
    }
  }

  async rejectInvitations({ expectedEmails }: { expectedEmails: string[] }) {
    for (const email of expectedEmails) {
      await this.page
        .getByRole("button", { name: new RegExp(`reject.*${email}`, "i") })
        .click();
    }
    for (const email of expectedEmails) {
      await expect(this.page.getByText(`Inviter: ${email}`)).not.toBeVisible();
    }
  }
}
