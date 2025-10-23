"use client";

import {
  composeTailwindRenderProps,
  focusVisibleStyles,
} from "@/components/ui/oui-base";
import * as Rac from "react-aria-components";

/**
 * Derived from shadcn Input
 */
export function Group({ className, ...props }: Rac.GroupProps) {
  return (
    <Rac.Group
      className={composeTailwindRenderProps(className, [
        focusVisibleStyles,
        "inline-flex h-9 w-full items-center overflow-hidden rounded-md border border-input whitespace-nowrap",
        "data-invalid:border-destructive data-invalid:ring-destructive/20 dark:data-invalid:ring-destructive/40",
      ])}
      {...props}
    />
  );
}
