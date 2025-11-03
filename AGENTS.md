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
import type { Stripe as StripeTypes } from "stripe";
import * as React from "react";
import * as Oui from "@/components/ui/oui-index";
import * as Domain from "@/lib/domain";
import * as Hono from "hono";
import * as Rac from "react-aria-components";
import * as ReactRouter from "react-router";
import * as Stripe from "stripe";
import * as z from "zod";
```

## UI Guidelines

- **Preference order for UI components:**
  1. Oui UI components (oui-\* prefixed files in `@/components` and `@/components/ui`) - these are ui components and react-aria-components reusable wrappers with shadcn styling
  2. Shadcn UI components from `@/components/ui` - use for gaps in oui coverage
  3. React Aria Components (`Rac.*`) directly - when no styling is needed
- Custom or app-specific components generally live in `@/components` or route modules
- Leverage the design token system: CSS variables defined in `app/app.css` are mapped to Tailwind utilities via `@theme inline` (use semantic color classes like `bg-background`, `text-foreground`, `border-border` instead of hardcoded colors)
- Follow the shadcn color convention: each color has a base and `-foreground` variant (e.g., `bg-primary text-primary-foreground`)
