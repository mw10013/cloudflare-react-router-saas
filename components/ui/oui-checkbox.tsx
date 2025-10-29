"use client";

import {
  composeTailwindRenderProps,
  groupFocusVisibleStyles,
} from "@/components/ui/oui-base";
import { labelComponentStyles } from "@/components/ui/oui-label";
import { CheckIcon, MinusIcon } from "lucide-react";
import * as Rac from "react-aria-components";
import { twMerge } from "tailwind-merge";

export interface CheckboxProps extends Rac.CheckboxProps {
  indicatorClassName?: string;
}

/**
 * Derived from shadcn FormDemo FormItem and CheckboxPrimitive.Root
 * Radix has CheckboxPrimitive.Root which is separate from label while RAC structures with a label.
 */
export function Checkbox({
  indicatorClassName,
  className,
  children,
  ...props
}: CheckboxProps) {
  return (
    <Rac.Checkbox
      {...props}
      className={composeTailwindRenderProps(className, [
        labelComponentStyles,
        "group items-start gap-3",
      ])}
    >
      {(renderProps) => (
        <>
          <span
            data-slot="checkbox-indicator"
            className={twMerge(
              [
                groupFocusVisibleStyles,
                "size-4 shrink-0 rounded-lg border border-input shadow-xs transition-shadow dark:bg-input/30",
                "group-data-selected:border-primary group-data-selected:bg-primary group-data-selected:text-primary-foreground dark:group-data-selected:bg-primary",
                "group-data-interminate:border-primary group-data-interminate:bg-primary group-data-interminate:text-primary-foreground dark:group-data-interminate:bg-primary",
                "group-data-invalid:border-destructive group-data-invalid:ring-destructive/20 group-data-invalid:dark:ring-destructive/40",
              ],
              indicatorClassName,
            )}
          >
            {renderProps.isIndeterminate ? (
              <MinusIcon aria-hidden className="size-3.5" />
            ) : renderProps.isSelected ? (
              <CheckIcon aria-hidden className="size-3.5" />
            ) : null}
          </span>
          {typeof children === "function" ? children(renderProps) : children}
        </>
      )}
    </Rac.Checkbox>
  );
}
