"use client";

import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import * as Rac from "react-aria-components";
import { twMerge } from "tailwind-merge";

/**
 * Derived from shadcn DialogTitle, AlertDialogTitle, PopoverDemo, AccordionHeader
 */
export const headingVariants = cva(undefined, {
  variants: {
    variant: {
      default: "text-lg leading-none font-semibold",
      alert: "text-lg font-semibold",
      popover: "text-base leading-none font-medium",
      disclosure: "flex",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface HeadingProps
  extends Rac.HeadingProps,
    VariantProps<typeof headingVariants> {}

export function Heading({ className, variant, ...props }: HeadingProps) {
  return (
    <Rac.Heading
      className={twMerge(headingVariants({ className, variant }))}
      {...props}
    />
  );
}
