"use client";

import type { ComponentProps } from "react";
import * as Rac from "react-aria-components";
import { twMerge } from "tailwind-merge";

/**
 * A styled form component based on shadcn.
 * If you don't want default styles, use Rac.Form directly.
 */
export function Form({ className, ...props }: ComponentProps<typeof Rac.Form>) {
  // "grid" vs "flex flex-col"
  return (
    <Rac.Form
      className={twMerge("flex flex-col gap-6", className)}
      {...props}
    />
  );
}
