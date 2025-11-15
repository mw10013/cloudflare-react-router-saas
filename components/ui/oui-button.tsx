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
 * Rac.Button does not support aria-invalid or have data-invalid.
 */
export const buttonVariants = cva(
  [
    focusVisibleStyles,
    disabledStyles,
    "inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ],
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs data-hovered:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs data-focus-visible:ring-destructive/20 data-hovered:bg-destructive/90 dark:bg-destructive/60 dark:data-focus-visible:ring-destructive/40",
        outline:
          "border bg-background shadow-xs data-hovered:bg-accent data-hovered:text-accent-foreground dark:border-input dark:bg-input/30 dark:data-hovered:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs data-hovered:bg-secondary/80",
        ghost:
          "data-hovered:bg-accent data-hovered:text-accent-foreground dark:data-hovered:bg-accent/50",
        link: "text-primary underline-offset-4 data-hovered:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
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
export const buttonClassName =
  ({
    className,
    ...props
  }: VariantProps<typeof buttonVariants> & { className?: string }) =>
  // The renderProps type omits variant props (variant, size) from the buttonVariants parameters,
  // resulting in the RAC render props (isHovered, isPressed, etc.) for compatibility across components.
  (
    renderProps: Omit<
      Parameters<typeof buttonVariants>[0],
      keyof VariantProps<typeof buttonVariants>
    >,
  ) =>
    twMerge(buttonVariants({ ...renderProps, ...props, className }));

export interface ButtonProps
  extends Rac.ButtonProps,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <Rac.Button
      data-slot="button"
      className={Rac.composeRenderProps(className, (className, renderProps) =>
        twMerge(
          buttonVariants({
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
