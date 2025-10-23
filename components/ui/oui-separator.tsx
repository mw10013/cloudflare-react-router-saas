"use client";

import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import * as Rac from "react-aria-components";
import { twMerge } from "tailwind-merge";

export const separatorVariants = cva("shrink-0 bg-border", {
  variants: {
    variant: {
      default: "w-full",
      // For the 'menu' variant, 'w-full' is omitted. This results in an implicit
      // 'width: auto', allowing negative horizontal margins (-mx-1) to expand the
      // separator's actual content-box width to fill the parent's padding area.
      // An explicit width (like 'w-full') would fix the content-box size first,
      // and negative margins would only shift this fixed-size box.
      menu: "-mx-1 my-1",
    },
    orientation: {
      horizontal: "h-px",
      vertical: "h-full w-px",
    },
  },
  defaultVariants: {
    orientation: "horizontal",
    variant: "default",
  },
});

/**
 * Props for the Separator component.
 *
 * The Omit removes 'orientation' from the variant props to avoid a type conflict,
 * since 'orientation' is already defined in the react-aria Separator props.
 */
export interface SeparatorProps
  extends React.ComponentProps<typeof Rac.Separator>,
    Omit<VariantProps<typeof separatorVariants>, "orientation"> {}

/**
 * Derived from shadcn Separator and DropdownMenuSeparator
 */
export function Separator({
  className,
  variant,
  orientation,
  ...rest
}: SeparatorProps) {
  return (
    <Rac.Separator
      orientation={orientation}
      className={twMerge(
        separatorVariants({
          orientation,
          variant,
          className,
        }),
      )}
      {...rest}
    />
  );
}
