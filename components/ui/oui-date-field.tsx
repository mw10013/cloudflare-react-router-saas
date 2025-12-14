"use client";

import type { FieldStylesProps } from "@/components/ui/oui-field";
import * as React from "react";
import { composeTailwindRenderProps } from "@/components/ui/oui-base";
import { fieldStyles } from "@/components/ui/oui-field";
import { inputStyles } from "@/components/ui/oui-input";
import * as Rac from "react-aria-components";

/**
 * Derived from shadcn Field
 */
export function DateField({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof Rac.DateField> & FieldStylesProps) {
  return (
    <Rac.DateField
      data-slot="date-field"
      data-slot-type="field"
      data-orientation={orientation}
      className={composeTailwindRenderProps(
        className,
        fieldStyles({ orientation }),
      )}
      {...props}
    />
  );
}

export function DateFieldInput({
  className,
  ...props
}: React.ComponentProps<typeof Rac.DateInput>) {
  return (
    <Rac.DateInput
      data-slot="date-field-input"
      className={composeTailwindRenderProps(className, [
        inputStyles,
        "flex items-center data-focus-within:border-ring data-focus-within:ring-[3px] data-focus-within:ring-ring/50",
      ])}
      {...props}
    />
  );
}

export function DateFieldSegment({
  className,
  ...props
}: React.ComponentProps<typeof Rac.DateSegment>) {
  return (
    <Rac.DateSegment
      data-slot="date-field-segment"
      className={composeTailwindRenderProps(className, [
        "inline rounded-xs p-0.5 text-foreground caret-transparent forced-color-adjust-none outline-none data-type-literal:px-0",
        "data-placeholder:text-muted-foreground",
        "data-focused:bg-primary data-focused:text-primary-foreground",
      ])}
      {...props}
    />
  );
}
