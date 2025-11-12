"use client";

import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import * as Rac from "react-aria-components";
import { twMerge } from "tailwind-merge";

export const headerVariants = cva("px-2 py-1.5", {
  variants: {
    variant: {
      menu: "text-sm font-medium", // Derived from shadcn DropdownMenuLabel
      select: "text-muted-foreground text-xs", // Derived from shadcn SelectLabel
    },
    inset: {
      true: "pl-8",
    },
  },
  defaultVariants: {
    variant: "menu",
    inset: false,
  },
});

export interface HeaderProps
  extends React.ComponentProps<typeof Rac.Header>,
    VariantProps<typeof headerVariants> {}

export function Header({ variant, inset, className, ...props }: HeaderProps) {
  return (
    <Rac.Header
      className={twMerge(headerVariants({ variant, inset, className }))}
      {...props}
    />
  );
}
