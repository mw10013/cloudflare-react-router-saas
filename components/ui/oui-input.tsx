"use client";

import * as React from "react";
import {
  composeTailwindRenderProps,
  focusVisibleStyles,
} from "@/components/ui/oui-base";
import * as Rac from "react-aria-components";
import { twJoin } from "tailwind-merge";

export const inputStyles = twJoin(
  focusVisibleStyles,
  "h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground md:text-sm dark:bg-input/30",
  "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
  "selection:bg-primary selection:text-primary-foreground",
  "data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:opacity-50",
  "data-invalid:border-destructive data-invalid:ring-destructive/20 dark:data-invalid:ring-destructive/40",
  "[&::-webkit-search-cancel-button]:hidden",
);

/**
 * Derived from shadcn Input.
 */
export function Input({
  className,
  ...props
}: React.ComponentProps<typeof Rac.Input>) {
  return (
    <Rac.Input
      data-slot="input"
      className={composeTailwindRenderProps(className, inputStyles)}
      {...props}
    />
  );
}
