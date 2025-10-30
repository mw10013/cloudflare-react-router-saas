import type { Route } from "./+types/signup";
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
import { redirect, useSubmit } from "react-router";
import * as z from "zod";

export async function action({
  request,
  context,
}: Route.ActionArgs): Promise<Oui.FormActionResult> {
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
  const { authService: auth } = requestContext;
  const response = await auth.api.signUpEmail({
    body: {
      email: parseResult.data.email,
      password: parseResult.data.password,
      name: "",
      callbackURL: "/email-verification", // http://localhost:3000/api/auth/verify-email?token=ey&callbackURL=/email-verification
    },
    asResponse: true,
  });

  if (!response.ok) {
    // better-auth returns 422 UNPROCESSABLE_ENTITY with { code: 'USER_ALREADY_EXISTS', ... } when an existing user tries to sign up again
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    if (response.status === 422) throw redirect("/signin");
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw response;
  }
  // With email verification enabled, there is no session cookie set on sign up so no need to pass headers here.
  // eslint-disable-next-line @typescript-eslint/only-throw-error
  throw redirect("/");
}

export default function RouteComponent({ actionData }: Route.ComponentProps) {
  const submit = useSubmit();
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sign up for an account</CardTitle>
          <CardDescription>
            Enter your email and password to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Oui.Form
            method="post"
            validationBehavior="aria"
            validationErrors={actionData?.validationErrors}
            onSubmit={onSubmitReactRouter(submit)}
          >
            <Oui.FormAlert
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
              label="Password"
              isRequired
            />
            <Oui.Button type="submit" className="w-full">
              Sign up
            </Oui.Button>
          </Oui.Form>
        </CardContent>
      </Card>
    </div>
  );
}
