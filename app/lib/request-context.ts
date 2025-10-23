import type { Auth } from "~/lib/auth";
import type { Repository } from "~/lib/repository";
import type { StripeService } from "~/lib/stripe-service";
import { createContext } from "react-router";

export interface RequestContext {
  env: Env;
  auth: Auth;
  repository: Repository;
  stripeService: StripeService;
  session?: Auth["$Infer"]["Session"];
  organization?: Auth["$Infer"]["Organization"];
  organizations?: Auth["$Infer"]["Organization"][];
}

// RequestContext serves as both the context key (runtime) and type (TypeScript)
export const RequestContext = createContext<RequestContext | undefined>(
  undefined,
);
