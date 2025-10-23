"use client";

import {
  composeTailwindRenderProps,
  groupFocusVisibleStyles,
} from "@/components/ui/oui-base";
import { labelComponentStyles } from "@/components/ui/oui-label";
import { CircleIcon } from "lucide-react";
import * as Rac from "react-aria-components";
import { twMerge } from "tailwind-merge";

/**
 * Derived from shadcn RadioGroup
 */
export function RadioGroup({ className, ...props }: Rac.RadioGroupProps) {
  return (
    <Rac.RadioGroup
      data-slot="radio-group"
      className={composeTailwindRenderProps(className, "grid gap-3")}
      {...props}
    />
  );
}

export interface RadioProps extends Rac.RadioProps {
  radioGroupItemClassName?: string;
}

/**
 * Derived from shadcn FormDemo FormItem and RadioGroupItem
 * Radix has RadioGroupPrimitive.Item which is separate from label while RAC structures with a label.
 */
export function Radio({
  className,
  children,
  radioGroupItemClassName,
  ...props
}: RadioProps) {
  return (
    <Rac.Radio
      className={composeTailwindRenderProps(className, [
        labelComponentStyles,
        "group items-start gap-3",
      ])}
      {...props}
    >
      {(renderProps) => (
        <>
          <div
            data-slot="radio-group-item"
            className={twMerge(
              [
                groupFocusVisibleStyles,
                "relative aspect-square size-4 shrink-0 rounded-full border border-input text-primary shadow-xs transition-[color,box-shadow] dark:bg-input/30",
                "group-data-invalid:border-destructive group-data-invalid:ring-destructive/20 group-data-invalid:dark:ring-destructive/40",
              ],
              radioGroupItemClassName,
            )}
          >
            {renderProps.isSelected && (
              <CircleIcon
                data-slot="radio-group-indicator"
                className="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 fill-primary"
              />
            )}
          </div>
          {typeof children === "function" ? children(renderProps) : children}
        </>
      )}
    </Rac.Radio>
  );
}
