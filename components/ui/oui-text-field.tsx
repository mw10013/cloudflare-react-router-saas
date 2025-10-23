"use client";

import { composeTailwindRenderProps } from "@/components/ui/oui-base";
import * as Rac from "react-aria-components";

/**
 * Derived styles from shadcn FormItem
 */
export function TextField({ className, ...props }: Rac.TextFieldProps) {
  return (
    <Rac.TextField
      className={composeTailwindRenderProps(
        className,
        "group flex flex-col gap-2",
      )}
      {...props}
    />
  );
}
