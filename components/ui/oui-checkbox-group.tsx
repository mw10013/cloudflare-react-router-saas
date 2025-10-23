"use client";

import { composeTailwindRenderProps } from "@/components/ui/oui-base";
import * as Rac from "react-aria-components";

export function CheckboxGroup({
  className,
  children,
  ...props
}: Rac.CheckboxGroupProps) {
  return (
    <Rac.CheckboxGroup
      {...props}
      className={composeTailwindRenderProps(className, "flex flex-col gap-4")}
    >
      {(renderProps) =>
        typeof children === "function" ? children(renderProps) : children
      }
    </Rac.CheckboxGroup>
  );
}
