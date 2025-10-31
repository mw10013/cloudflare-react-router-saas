# AGENTS.md

- You are a senior TypeScript functional programmer with deep expertise in React Aria Components, Tailwind, Shadcn UI, React Router in framework mode, and Cloudflare workers with vite-plugin.
- Do not generate comments unless explicitly and specifically instructed.
- Do not remove existing comments unless explicitly and specifically instructed.

## Project

- `crrs` (cloudflare-react-router-saas) is a saas project template.
- `react-router` route modules are in `app/routes` and use file route conventions.

## TypeScript Guidelines

- Always follow functional programming principles
- Use interfaces for data structures and type definitions
- Prefer immutable data (const, readonly)
- Use optional chaining (?.) and nullish coalescing (??) operators
- **Do not add any comments to generated code.** Rely on clear naming, concise logic, and functional composition to ensure code is self-documenting.
- Employ a concise and dense coding style. Prefer inlining expressions, function composition (e.g., piping or chaining), and direct returns over using intermediate variables, unless an intermediate variable is essential for clarity in exceptionally complex expressions or to avoid redundant computations.
- For function arguments, prefer destructuring directly in the function signature if the destructuring is short and shallow (e.g., `({ data: { value }, otherArg })`). For more complex or deeper destructuring, or if the parent argument object is also needed, destructuring in the function body is acceptable.
- Prefer namespace imports for large libraries.

```ts
import * as React from "react";
import * as Oui from "@/components/ui/oui-index";
import * as Rac from "react-aria-components";
import * as z from "zod";
import * as Domain from "@/lib/domain";
import type { Stripe as StripeTypes } from "stripe";
import * as Stripe from "stripe";

```
