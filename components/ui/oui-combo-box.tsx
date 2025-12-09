"use client";

import type { FieldStylesProps } from "@/components/ui/oui-field";
import { composeTailwindRenderProps } from "@/components/ui/oui-base";
import { fieldStyles } from "@/components/ui/oui-field";
import * as Rac from "react-aria-components";

export function ComboBox<T extends object>({
  className,
  orientation,
  ...props
}: Rac.ComboBoxProps<T> & FieldStylesProps) {
  return (
    <Rac.ComboBox
      data-slot="combo-box"
      data-slot-type="field"
      className={composeTailwindRenderProps(
        className,
        fieldStyles({ orientation }),
      )}
      {...props}
    />
  );
}
