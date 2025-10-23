"use client";

import { composeTailwindRenderProps } from "@/components/ui/oui-base";
import * as Rac from "react-aria-components";

export function ComboBox<T extends object>({
  className,
  ...props
}: Rac.ComboBoxProps<T>) {
  return (
    <Rac.ComboBox
      className={composeTailwindRenderProps(
        className,
        "group flex flex-col gap-2",
      )}
      {...props}
    />
  );
}
