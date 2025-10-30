import type { AuthService } from "@/lib/auth-service";
import type { Repository } from "@/lib/repository";
import type { StripeService } from "@/lib/stripe-service";
import { createContext } from "react-router";

export interface RequestContext {
  env: Env;
  authService: AuthService;
  repository: Repository;
  stripeService: StripeService;
  session?: AuthService["$Infer"]["Session"];
  organization?: AuthService["$Infer"]["Organization"];
  organizations?: AuthService["$Infer"]["Organization"][];
}

// RequestContext serves as both the context key (runtime) and type (TypeScript)
export const RequestContext = createContext<RequestContext | undefined>(
  undefined,
);
