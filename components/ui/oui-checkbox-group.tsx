"use client";

import type { FieldStylesProps } from "@/components/ui/oui-field";
import { composeTailwindRenderProps } from "@/components/ui/oui-base";
import { fieldStyles } from "@/components/ui/oui-field";
import * as Rac from "react-aria-components";

export type CheckboxGroupProps = Rac.CheckboxGroupProps & FieldStylesProps;

export function CheckboxGroup({
  orientation = "vertical",
  className,
  children,
  ...props
}: CheckboxGroupProps) {
  return (
    <Rac.CheckboxGroup
      data-slot="checkbox-group"
      data-slot-type="field"
      data-orientation={orientation}
      className={composeTailwindRenderProps(
        className,
        fieldStyles({
          orientation,
          className:
            "*:data-[slot=checkbox]:font-normal *:data-[slot=field-description]:mb-2",
        }),
      )}
      {...props}
    >
      {(renderProps) =>
        typeof children === "function" ? children(renderProps) : children
      }
    </Rac.CheckboxGroup>
  );
}
