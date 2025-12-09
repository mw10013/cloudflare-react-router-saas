"use client";

import type { FieldStylesProps } from "@/components/ui/oui-field";
import {
  composeTailwindRenderProps,
  groupFocusVisibleStyles,
} from "@/components/ui/oui-base";
import { fieldStyles } from "@/components/ui/oui-field";
import { labelComponentStyles } from "@/components/ui/oui-label";
import { CircleIcon } from "lucide-react";
import * as Rac from "react-aria-components";
import { twJoin } from "tailwind-merge";

/**
 * Derived from shadcn RadioGroup and Field
 */
export type RadioGroupProps = Rac.RadioGroupProps & FieldStylesProps;

export function RadioGroup({
  orientation = "vertical",
  className,
  children,

  ...props
}: RadioGroupProps) {
  return (
    <Rac.RadioGroup
      data-slot="radio-group"
      data-orientation={orientation}
      className={composeTailwindRenderProps(
        className,
        fieldStyles({
          orientation,
          className:
            "*:data-[slot=field-description]:mb-2 **:data-[slot=radio]:font-normal",
        }),
      )}
      {...props}
    >
      {(renderProps) =>
        typeof children === "function" ? children(renderProps) : children
      }
    </Rac.RadioGroup>
  );
}

/**
 * Derived from shadcn Label, Field (gap-3 but not items-start), FieldLabel (leading-snug overriding Label leading-none), RadioGroupItem
 * Radix has RadioGroupPrimitive.Item which is separate from label while RAC structures with a label.
 *
 * @example
 * ```tsx
 * import * as Oui from "@/components/ui/oui-index";
 *
 * <Oui.RadioGroup defaultValue="monthly">
 *   <Oui.Radio value="monthly">Monthly ($9.99/month)</Oui.Radio>
 *   <Oui.Radio value="yearly">Yearly ($99.99/year)</Oui.Radio>
 * </Oui.RadioGroup>
 * ```
 *
 * Choice card: When a `FieldDescription` is nested inside `Radio`, it styles as a selectable card with border, padding, and hover/selected background colors.
 *
 * @example
 * ```tsx
 * import * as Oui from "@/registry/default/ui/oui-index";
 *
 * <Oui.RadioGroup defaultValue="starter" aria-label="Plans" className="max-w-sm">
 *   <Oui.Radio value="starter">
 *     <Oui.FieldContent>
 *       { // Use FieldTitle instead of FieldLabel since Radio structures with a label }
 *       <Oui.FieldTitle>Starter Plan</Oui.FieldTitle>
 *       <Oui.FieldDescription>Perfect for small businesses</Oui.FieldDescription>
 *     </Oui.FieldContent>
 *   </Oui.Radio>
 *   <Oui.Radio value="pro">
 *     <Oui.FieldContent>
 *       <Oui.FieldTitle>Pro Plan</Oui.FieldTitle>
 *       <Oui.FieldDescription>Advanced features</Oui.FieldDescription>
 *     </Oui.FieldContent>
 *   </Oui.Radio>
 * </Oui.RadioGroup>
 * ```
 */
export function Radio({ className, children, ...props }: Rac.RadioProps) {
  return (
    <Rac.Radio
      data-slot="radio"
      className={composeTailwindRenderProps(className, [
        labelComponentStyles,
        "group gap-3 leading-snug",
        // Card styling when FieldDescription is nested inside Radio
        "has-data-[slot=field-description]:items-start has-data-[slot=field-description]:rounded-md has-data-[slot=field-description]:border has-data-[slot=field-description]:p-4",
        "has-data-[slot=field-description]:data-hovered:bg-accent/50 has-data-[slot=field-description]:data-selected:border-primary has-data-[slot=field-description]:data-selected:bg-primary/5 dark:has-data-[slot=field-description]:data-selected:bg-primary/10",
      ])}
      {...props}
    >
      {(renderProps) => (
        <>
          <div
            data-slot="radio-group-item"
            className={twJoin(
              groupFocusVisibleStyles,
              "relative aspect-square size-4 shrink-0 rounded-full border border-input text-primary shadow-xs transition-[color,box-shadow] dark:bg-input/30",
              "group-data-invalid:border-destructive group-data-invalid:ring-destructive/20 group-data-invalid:dark:ring-destructive/40",
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
