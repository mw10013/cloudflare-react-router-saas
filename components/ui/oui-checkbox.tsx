"use client";

import {
  composeTailwindRenderProps,
  groupFocusVisibleStyles,
} from "@/components/ui/oui-base";
import { labelComponentStyles } from "@/components/ui/oui-label";
import { CheckIcon, MinusIcon } from "lucide-react";
import * as Rac from "react-aria-components";
import { twMerge } from "tailwind-merge";

/**
 * Derived from shadcn Label, Field (gap-3 but not items-start), FieldLabel (leading-snug overriding Label leading-none) and Checkbox
 * Radix has CheckboxPrimitive.Root which is separate from label while RAC structures with a label.
 *
 * @example
 * ```tsx
 * import * as Oui from "@/components/ui/oui-index";
 *
 * <CheckboxGroup defaultValue={["hard-disks"]}>
 *   <Checkbox value="hard-disks">Hard disks</Checkbox>
 *   <Checkbox value="external-disks">External disks</Checkbox>
 * </CheckboxGroup>
 * ```
 *
 * Card: When a `FieldDescription` is nested inside `Checkbox`, it styles as a selectable card with border, padding, and hover/selected background colors.
 *
 * @example
 * ```tsx
 * import * as Oui from "@/components/ui/oui-index";
 *
 * <Checkbox defaultSelected>
 *   <FieldContent>
 *     { // Use FieldTitle instead of FieldLabel since Checkbox structures with a label }
 *     <FieldTitle>Enable notifications</FieldTitle>
 *     <FieldDescription>You can do this anytime.</FieldDescription>
 *  </FieldContent>
 * </Checkbox>
 * ```
 */
export function Checkbox({ className, children, ...props }: Rac.CheckboxProps) {
  return (
    <Rac.Checkbox
      data-slot="checkbox"
      className={composeTailwindRenderProps(className, [
        labelComponentStyles,
        "group gap-3 leading-snug",
        // Card styling when FieldDescription is nested inside Checkbox
        "has-data-[slot=field-description]:items-start has-data-[slot=field-description]:rounded-md has-data-[slot=field-description]:border has-data-[slot=field-description]:p-4",
        "has-data-[slot=field-description]:data-hovered:bg-accent/50 has-data-[slot=field-description]:data-selected:border-primary has-data-[slot=field-description]:data-selected:bg-primary/5 dark:has-data-[slot=field-description]:data-selected:bg-primary/10",
      ])}
      {...props}
    >
      {(renderProps) => (
        <>
          <span
            data-slot="checkbox-indicator"
            className={twMerge([
              groupFocusVisibleStyles,
              "size-4 shrink-0 rounded border border-input shadow-xs transition-shadow dark:bg-input/30",
              "group-data-selected:border-primary group-data-selected:bg-primary group-data-selected:text-primary-foreground dark:group-data-selected:bg-primary",
              "group-data-interminate:border-primary group-data-interminate:bg-primary group-data-interminate:text-primary-foreground dark:group-data-interminate:bg-primary",
              "group-data-invalid:border-destructive group-data-invalid:ring-destructive/20 group-data-invalid:dark:ring-destructive/40",
            ])}
          >
            <MinusIcon
              className="hidden size-3.5 group-data-indeterminate:block"
              aria-hidden
            />
            <CheckIcon
              className="hidden size-3.5 group-data-selected:block"
              aria-hidden
            />
          </span>
          {typeof children === "function" ? children(renderProps) : children}
        </>
      )}
    </Rac.Checkbox>
  );
}
