import type { Route } from "./+types/signin";
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
import { redirect, useSubmit } from "react-router";
import * as z from "zod";
import { RequestContext } from "~/lib/request-context";
import * as TechnicalDomain from "~/lib/technical-domain";

export async function action({
  request,
  context,
}: Route.ActionArgs): Promise<TechnicalDomain.FormActionResult> {
  const schema = z.object({
    email: z.email(),
    password: z.string().min(6),
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
  const response = await auth.api.signInEmail({
    body: {
      email: parseResult.data.email,
      password: parseResult.data.password,
      callbackURL: "/email-verification", // http://localhost:3000/api/auth/verify-email?token=ey&callbackURL=/email-verification
    },
    asResponse: true,
  });
  // TODO: signin: handle 401: UNAUTHORIZED
  if (!response.ok) {
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    if (response.status === 403) throw redirect("/email-verification");
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw response;
  }
  // eslint-disable-next-line @typescript-eslint/only-throw-error
  throw redirect("/", { headers: response.headers });
}

export default function RouteComponent({ actionData }: Route.ComponentProps) {
  const submit = useSubmit();
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sign in to your account</CardTitle>
          <CardDescription>
            Enter your email and password to sign in
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
            <Oui.TextFieldEx
              name="password"
              type="password"
              isRequired
              label={
                <div className="flex items-center">
                  <Oui.Label>Password</Oui.Label>
                  <Oui.Link
                    href="/forgot-password"
                    className="ml-auto inline-block text-sm"
                    underline="hover"
                  >
                    Forgot your password?
                  </Oui.Link>
                </div>
              }
            />
            <Oui.Button type="submit" className="w-full">
              Sign in
            </Oui.Button>
          </Oui.Form>
        </CardContent>
      </Card>
    </div>
  );
}
