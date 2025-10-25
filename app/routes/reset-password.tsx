import type { Route } from "./+types/reset-password";
import { FormAlert } from "@/components/form-alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import * as Oui from "@/components/ui/oui-index";
import { invariant } from "@epic-web/invariant";
import * as z from "zod";
import { RequestContext } from "~/lib/request-context";
import * as TechnicalDomain from "~/lib/technical-domain";

export function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  invariant(token, "Missing token");
  return { token };
}

export async function action({
  request,
  context,
}: Route.ActionArgs): Promise<TechnicalDomain.FormActionResult> {
  const schema = z.object({
    password: z.string().min(8),
    token: z.string().min(1),
  });
  const parseResult = schema.safeParse(
    Object.fromEntries(await request.formData()),
  );
  if (!parseResult.success) {
    const { formErrors: details, fieldErrors: validationErrors } =
      z.flattenError(parseResult.error);
    return { success: false, details, validationErrors };
  }
  const requestContext = context.get(RequestContext);
  invariant(requestContext, "Missing request context.");
  const { auth } = requestContext;
  const result = await auth.api.resetPassword({
    body: {
      token: parseResult.data.token,
      newPassword: parseResult.data.password,
    },
  });
  invariant(result.status, "Expected resetPassword to throw error on failure");
  return { success: result.status };
}

export default function RouteComponent({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  if (actionData?.success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Password reset successful</CardTitle>
            <CardDescription>
              Your password has been reset. You can now sign in with your new
              password.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Reset your password</CardTitle>
          <CardDescription>Enter your new password below.</CardDescription>
        </CardHeader>
        <CardContent>
          <Oui.Form
            method="post"
            validationBehavior="aria"
            validationErrors={actionData?.validationErrors}
          >
            <FormAlert
              success={actionData?.success}
              message={actionData?.message}
              details={actionData?.details}
            />
            <input type="hidden" name="token" value={loaderData.token} />
            <Oui.TextFieldEx
              name="password"
              type="password"
              label="New password"
              placeholder="••••••••"
              isRequired
            />
            <Oui.Button type="submit" className="w-full">
              Reset password
            </Oui.Button>
          </Oui.Form>
        </CardContent>
      </Card>
    </div>
  );
}
