"use client";

import { cva } from "class-variance-authority";
import * as Rac from "react-aria-components";
import { twMerge } from "tailwind-merge";

/**
 * Derived from shadcn DropdownMenuItem label and FormDescription.
 */
const slot = {
  label: "text-sm",
  title: "text-sm",
  description: "text-muted-foreground text-sm",
} as const;

export const textVariants = cva(undefined, {
  variants: { slot },
});

function isTextVariantsSlotKey(value: unknown): value is keyof typeof slot {
  return typeof value === "string" && Object.keys(slot).includes(value);
}

export function Text({
  elementType: elementTypeProp,
  slot,
  className,
  ...props
}: Rac.TextProps) {
  const elementType =
    !elementTypeProp && slot === "description" ? "p" : elementTypeProp;
  return (
    <Rac.Text
      data-slot={slot === "description" ? "form-description" : undefined}
      elementType={elementType}
      slot={slot}
      className={twMerge(
        textVariants({
          slot: isTextVariantsSlotKey(slot) ? slot : undefined,
          className,
        }),
      )}
      {...props}
    />
  );
}
