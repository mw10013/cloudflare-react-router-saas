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
 * Derived from shadcn Button.
 * Rac.Button does not support aria-invalid or have data-invalid. We keep the aria-invalid styles for now.
 */
export const buttonVariants = cva(
  [
    focusVisibleStyles,
    disabledStyles,
    "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
    "inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ],
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground data-hovered:bg-primary/90",
        destructive:
          "bg-destructive text-white data-focus-visible:ring-destructive/20 data-hovered:bg-destructive/90 dark:bg-destructive/60 dark:data-focus-visible:ring-destructive/40",
        outline:
          "border bg-background shadow-xs data-hovered:bg-accent data-hovered:text-accent-foreground dark:border-input dark:bg-input/30 dark:data-hovered:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground data-hovered:bg-secondary/80",
        ghost:
          "data-hovered:bg-accent data-hovered:text-accent-foreground dark:data-hovered:bg-accent/50",
        link: "text-primary underline-offset-4 data-hovered:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

/**
 * Returns a className function to style a react aria component as a button.
 *
 * @example
 * <Rac.Link
 *   href="#"
 *   className={buttonClassName({ variant: "outline" })}
 * >
 *   Button Link
 * </Rac.Link>
 */
export function buttonClassName<T>(
  props?: VariantProps<typeof buttonVariants>,
  className?: string | ((renderProps: T) => string),
) {
  return Rac.composeRenderProps(className, (className) =>
    twMerge(buttonVariants(props), className),
  );
}

export function Button({
  variant,
  size,
  className,
  ...props
}: React.ComponentProps<typeof Rac.Button> &
  VariantProps<typeof buttonVariants>) {
  return (
    <Rac.Button
      data-slot="button"
      className={buttonClassName({ variant, size }, className)}
      {...props}
    />
  );
}
