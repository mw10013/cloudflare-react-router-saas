"use client";

import type { FieldStylesProps } from "@/components/ui/oui-field";
import { composeTailwindRenderProps } from "@/components/ui/oui-base";
import { fieldStyles } from "@/components/ui/oui-field";
import * as Rac from "react-aria-components";

export type NumberFieldProps = Rac.NumberFieldProps & FieldStylesProps;

/**
 * Derived from shadcn Field
 */
export function NumberField({
  className,
  orientation = "vertical",
  ...props
}: NumberFieldProps) {
  return (
    <Rac.NumberField
      data-slot="number-field"
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
