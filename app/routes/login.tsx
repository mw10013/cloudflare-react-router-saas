import type { Route } from "./+types/login";
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
import { useSubmit } from "react-router";
import * as z from "zod";
import { RequestContext } from "~/lib/request-context";
import * as TechnicalDomain from "~/lib/technical-domain";

export async function action({
  request,
  context,
}: Route.ActionArgs): Promise<
  TechnicalDomain.FormActionResult & { magicLink?: string }
> {
  const schema = z.object({
    email: z.email(),
  });
  const parseResult = schema.safeParse(
    Object.fromEntries(await request.formData()),
  );
  if (!parseResult.success) {
    const { formErrors: details, fieldErrors: validationErrors } =
      z.flattenError(parseResult.error);
    return {
      success: false,
      details,
      validationErrors,
    } satisfies TechnicalDomain.FormActionResult;
  }
  const requestContext = context.get(RequestContext);
  invariant(requestContext, "Missing request context.");
  const { auth, env } = requestContext;
  const result = await auth.api.signInMagicLink({
    headers: request.headers,
    body: { email: parseResult.data.email, callbackURL: "/magic-link" },
  });
  invariant(
    result.status,
    "Expected signInMagicLink to throw error on failure",
  );
  const magicLink =
    env.ENVIRONMENT === "local"
      ? ((await env.KV.get(`local:magicLink`)) ?? undefined)
      : undefined;
  console.log("magicLink", magicLink);
  return { success: true, magicLink };
}

export default function RouteComponent({ actionData }: Route.ComponentProps) {
  const submit = useSubmit();
  if (actionData?.success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Check your email</CardTitle>
            <CardDescription>
              If an account exists for that email, a magic sign-in link has been
              sent.
            </CardDescription>
          </CardHeader>
        </Card>
        {actionData.magicLink && (
          <div className="mt-4">
            {/* <a> used to bypass react router routing and hit the api endpoint directly */}
            <a href={actionData.magicLink} className="block">
              {actionData.magicLink}
            </a>
          </div>
        )}
      </div>
    );
  }
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sign in / Sign up</CardTitle>
          <CardDescription>
            Enter your email to receive a magic sign-in link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Oui.Form
            method="post"
            validationBehavior="aria"
            validationErrors={actionData?.validationErrors}
            onSubmit={TechnicalDomain.onSubmit(submit)}
          >
            <FormAlert
              success={actionData?.success}
              message={actionData?.message}
              details={actionData?.details}
            />
            <Oui.TextFieldEx
              name="email"
              type="email"
              label="Email"
              placeholder="m@example.com"
              isRequired
            />
            <Oui.Button type="submit" className="w-full">
              Send magic link
            </Oui.Button>
          </Oui.Form>
        </CardContent>
      </Card>
    </div>
  );
}
