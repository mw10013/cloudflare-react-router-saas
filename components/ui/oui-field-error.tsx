"use client";

import { composeTailwindRenderProps } from "@/components/ui/oui-base";
import * as Rac from "react-aria-components";

/**
 * Derived from shadcn FormMessage
 * https://github.com/adobe/react-spectrum/issues/7525
 */
export function FieldError({ className, ...props }: Rac.FieldErrorProps) {
  // https://github.com/adobe/react-spectrum/issues/7525
  return (
    <Rac.TextContext.Provider value={{ elementType: "p" }}>
      <Rac.FieldError
        data-slot="form-message"
        className={composeTailwindRenderProps(
          className,
          "text-sm text-destructive",
        )}
        {...props}
      />
    </Rac.TextContext.Provider>
  );
}
