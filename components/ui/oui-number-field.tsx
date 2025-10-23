"use client";

import { composeTailwindRenderProps } from "@/components/ui/oui-base";
import * as Rac from "react-aria-components";

export function NumberField({ className, ...props }: Rac.NumberFieldProps) {
  return (
    <Rac.NumberField
      className={composeTailwindRenderProps(className, "group grid gap-2")}
      {...props}
    />
  );
}
