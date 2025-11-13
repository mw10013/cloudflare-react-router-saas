"use client";

import type { VariantProps } from "class-variance-authority";
import {
  disabledStyles,
  focusVisibleStyles,
} from "@/components/ui/oui-base";
import { cva } from "class-variance-authority";
import * as Rac from "react-aria-components";
import { twMerge } from "tailwind-merge";

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

export interface ToggleButtonProps
  extends Rac.ToggleButtonProps,
    VariantProps<typeof toggleButtonVariants> {}

export function ToggleButton({
  className,
  variant,
  size,
  ...props
}: ToggleButtonProps) {
  return (
    <Rac.ToggleButton
      data-slot="toggle-button"
      className={Rac.composeRenderProps(className, (className, renderProps) =>
        twMerge(
          toggleButtonVariants({
            ...renderProps,
            variant,
            size,
            className,
          }),
        ),
      )}
      {...props}
    />
  );
}
