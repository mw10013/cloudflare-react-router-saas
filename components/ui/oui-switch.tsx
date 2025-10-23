"use client";

import React from "react";
import {
  composeTailwindRenderProps,
  groupFocusVisibleStyles,
} from "@/components/ui/oui-base";
import { labelComponentStyles } from "@/components/ui/oui-label";
import * as Rac from "react-aria-components";
import { twMerge } from "tailwind-merge";

export function Switch({ className, ...props }: Rac.SwitchProps) {
  return (
    <Rac.Switch
      {...props}
      className={composeTailwindRenderProps(className, [
        labelComponentStyles,
        "group",
      ])}
    />
  );
}

/**
 * Derived from shadcn SwitchPrimitive.Root and SwitchPrimitive.Thumb
 */
export function SwitchIndicator({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={twMerge(
        groupFocusVisibleStyles,
        "inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent bg-input shadow-xs transition-all group-data-selected:bg-primary dark:bg-input/80 dark:group-data-selected:bg-primary",
        className,
      )}
      {...props}
    >
      <span className="pointer-events-none block size-4 translate-x-0 rounded-full bg-background ring-0 transition-transform group-data-selected:translate-x-[calc(100%-2px)] dark:bg-foreground dark:group-data-selected:bg-primary-foreground" />
    </div>
  );
}
