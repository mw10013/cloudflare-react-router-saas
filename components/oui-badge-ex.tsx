import type { VariantProps } from "class-variance-authority";
import {
  disabledStyles,
  focusVisibleStyles,
} from "@/components/ui/oui-base";
import { cva } from "class-variance-authority";
import * as Rac from "react-aria-components";
import { twMerge } from "tailwind-merge";

/**
 * Derived from shadcn Badge.
 */
const badgeExVariants = cva(
  [
    "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-[color,box-shadow] aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3",
    focusVisibleStyles,
    disabledStyles,
  ],
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground data-hovered:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground data-hovered:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white focus-visible:ring-destructive/20 data-hovered:bg-destructive/90 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40",
        outline:
          "text-foreground data-hovered:bg-accent data-hovered:text-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

/**
 * Returns a className function to style a react aria component as a badge.
 *
 * @example
 * <Rac.Link
 *   href="#"
 *   className={badgeExClassName({ variant: "secondary" })}
 * >
 *   Badge Link
 * </Rac.Link>
 */
export function badgeExClassName<T>(
  props?: VariantProps<typeof badgeExVariants>,
  className?: string | ((renderProps: T) => string),
) {
  return Rac.composeRenderProps(className, (className) =>
    twMerge(badgeExVariants(props), className),
  );
}
