"use client";

import type { VariantProps } from "class-variance-authority";
import * as React from "react";
import {
  composeTailwindRenderProps,
  disabledStyles,
  focusVisibleStyles,
} from "@/components/ui/oui-base";
import { cva } from "class-variance-authority";
import * as Rac from "react-aria-components";

/**
 * Derived from shadcn Toggle.
 * Rac.ToggleButton does not support aria-invalid or have data-invalid.
 */
export const toggleButtonVariants = cva(
  [
    focusVisibleStyles,
    disabledStyles,
    "group inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-[color,box-shadow] data-hovered:bg-muted data-hovered:text-muted-foreground data-selected:bg-accent data-selected:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ],
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline:
          "border border-input bg-transparent shadow-xs data-hovered:bg-accent data-hovered:text-accent-foreground",
        ghost:
          "data-hovered:bg-accent data-hovered:text-accent-foreground data-selected:bg-transparent data-selected:text-inherit dark:data-hovered:bg-accent/50",
      },
      size: {
        default: "h-9 min-w-9 px-2",
        sm: "h-8 min-w-8 px-1.5",
        lg: "h-10 min-w-10 px-2.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

/**
 * Derived from shadcn Toggle.
 *
 * Unlike standard RAC ToggleButton, this component supports string className overrides (not merge) via 
 * ToggleButtonContext, allowing ToggleButtonGroup to control styles of child buttons.
 */
export function ToggleButton({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof Rac.ToggleButton> &
  VariantProps<typeof toggleButtonVariants>) {
  const context = React.useContext(Rac.ToggleButtonContext);
  const contextClassName =
    context && "className" in context && typeof context.className === "string"
      ? context.className
      : undefined;
  return (
    <Rac.ToggleButton
      data-slot="toggle-button"
      className={composeTailwindRenderProps(
        className,
        // Override with context className string if provided (from ToggleButtonGroup)
        contextClassName ??
          toggleButtonVariants({
            variant,
            size,
          }),
      )}
      {...props}
    />
  );
}
