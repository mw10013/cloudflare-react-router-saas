"use client";

import type { VariantProps } from "class-variance-authority";
import { focusVisibleStyles } from "@/components/ui/oui-base";
import { cva } from "class-variance-authority";
import * as Rac from "react-aria-components";
import { twMerge } from "tailwind-merge";

/** Derived from shadcn Input. */
export const inputVariants = cva(
  [
    "flex h-9 w-full min-w-0 bg-transparent px-3 py-1 text-base transition-[color,box-shadow] outline-none placeholder:text-muted-foreground md:text-sm dark:bg-input/30",
    "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
    "selection:bg-primary selection:text-primary-foreground",
    "data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:opacity-50",
  ],
  {
    variants: {
      variant: {
        default: [
          focusVisibleStyles,
          "rounded-md border border-input shadow-xs",
          "data-invalid:border-destructive data-invalid:ring-destructive/20 dark:data-invalid:ring-destructive/40",
        ],
        ghost: "flex-1",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface InputProps
  extends Rac.InputProps,
    VariantProps<typeof inputVariants> {}

export function Input({ variant, className, ...props }: InputProps) {
  return (
    <Rac.Input
      data-slot="input"
      className={Rac.composeRenderProps(className, (className, renderProps) =>
        twMerge(
          inputVariants({
            variant,
            ...renderProps,
            className,
          }),
        ),
      )}
      {...props}
    />
  );
}
