"use client";

import {
  composeTailwindRenderProps,
  disabledStyles,
  focusVisibleStyles,
} from "@/components/ui/oui-base";
import { ChevronDown } from "lucide-react";
import * as Rac from "react-aria-components";
import { twMerge } from "tailwind-merge";

export type SelectionMode = NonNullable<
  React.ComponentProps<typeof Rac.Select>["selectionMode"]
>;

export function Select<T extends object, M extends SelectionMode = "single">({
  className,
  ...props
}: Rac.SelectProps<T, M>) {
  return (
    <Rac.Select
      data-slot="select"
      className={composeTailwindRenderProps(className, "grid gap-2")}
      {...props}
    />
  );
}

export function SelectButton({
  className,
  size = "default",
  children,
  ...props
}: Rac.ButtonProps & {
  size?: "sm" | "default";
}) {
  return (
    <Rac.Button
      data-slot="select-trigger"
      data-size={size}
      className={composeTailwindRenderProps(className, [
        focusVisibleStyles,
        disabledStyles,
        "flex w-fit items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none data-disabled:cursor-not-allowed data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 dark:bg-input/30 dark:data-hovered:bg-input/50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground",
      ])}
      {...props}
    >
      {Rac.composeRenderProps(children, (children) => (
        <>
          {children}
          <ChevronDown className="size-4 opacity-50" aria-hidden="true" />
        </>
      ))}
    </Rac.Button>
  );
}

export function SelectValue<T extends object>({
  className,
  ...props
}: Rac.SelectValueProps<T>) {
  return (
    <Rac.SelectValue
      data-slot="select-value"
      className={Rac.composeRenderProps(
        className,
        (className, { isPlaceholder }) =>
          twMerge(isPlaceholder ? "text-muted-foreground" : "", className),
      )}
      {...props}
    />
  );
}
