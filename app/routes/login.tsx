import type { Route } from "./+types/login";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import * as Oui from "@/components/ui/oui-index";
import { onSubmitReactRouter } from "@/lib/oui-on-submit-react-router";
import { RequestContext } from "@/lib/request-context";
import { invariant } from "@epic-web/invariant";
import * as Rac from "react-aria-components";
import { useSubmit } from "react-router";
import * as z from "zod";

export function loader({ context }: Route.LoaderArgs) {
  const requestContext = context.get(RequestContext);
  invariant(requestContext, "Missing request context.");
  const { env } = requestContext;
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  return { isDemoMode: env.DEMO_MODE === "true" };
}

export async function action({
  request,
  context,
}: Route.ActionArgs): Promise<
  Oui.AlertFormActionResult & { magicLink?: string }
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
    } satisfies Oui.AlertFormActionResult;
  }
  const requestContext = context.get(RequestContext);
  invariant(requestContext, "Missing request context.");
  const { authService: auth, env } = requestContext;
  const result = await auth.api.signInMagicLink({
    headers: request.headers,
    body: { email: parseResult.data.email, callbackURL: "/magic-link" },
  });
  invariant(
    result.status,
    "Expected signInMagicLink to throw error on failure",
  );
  const magicLink =
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    env.DEMO_MODE === "true"
      ? ((await env.KV.get(`demo:magicLink`)) ?? undefined)
      : undefined;
  console.log("magicLink", magicLink);
  return { success: true, magicLink };
}

export default function RouteComponent({
  loaderData: { isDemoMode },
  actionData,
}: Route.ComponentProps) {
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
            {isDemoMode
              ? "DEMO MODE: no transactional emails. Use fake email or a@a.com for admin."
              : "Enter your email to receive a magic sign-in link"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Rac.Form
            method="post"
            validationBehavior="aria"
            validationErrors={actionData?.validationErrors}
            onSubmit={onSubmitReactRouter(submit)}
          >
            <Oui.FieldGroup>
              <Oui.AlertForm
                success={actionData?.success}
                message={actionData?.message}
                details={actionData?.details}
              />
              <Oui.TextField name="email" type="email" isRequired>
                <Oui.FieldLabel>Email</Oui.FieldLabel>
                <Oui.Input placeholder="m@example.com" />
              </Oui.TextField>
              <Oui.Button type="submit" className="w-full">
                Send magic link
              </Oui.Button>
            </Oui.FieldGroup>
          </Rac.Form>
        </CardContent>
      </Card>
    </div>
  );
}
