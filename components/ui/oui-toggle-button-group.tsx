"use client";

import type { VariantProps } from "class-variance-authority";
import * as React from "react";
import { toggleButtonVariants } from "@/components/ui/oui-toggle-button";
import * as Rac from "react-aria-components";
import { twJoin } from "tailwind-merge";
import { composeTailwindRenderProps } from "./oui-base";

/**
 * Derived from shadcn ToggleGroup.
 */
export function ToggleButtonGroup({
  variant,
  size,
  spacing = 0,
  children,
  className,
  ...props
}: React.ComponentProps<typeof Rac.ToggleButtonGroup> &
  VariantProps<typeof toggleButtonVariants> & {
    spacing?: number;
  }) {
  console.log(
    `ToggleButtonGroup: variant=${String(variant)}, size=${String(size)}, spacing=${String(spacing)} className=${toggleButtonVariants({ variant, size })}`,
  );
  return (
    <Rac.ToggleButtonGroup
      data-slot="toggle-button-group"
      data-variant={variant}
      data-size={size}
      data-spacing={spacing}
      style={{ "--gap": spacing } as React.CSSProperties}
      className={composeTailwindRenderProps(
        className,
        "group/toggle-group flex w-fit items-center gap-[--spacing(var(--gap))] rounded-md data-[spacing=0]:data-[variant=outline]:shadow-xs",
      )}
      {...props}
    >
      {(renderProps) => (
        <Rac.ToggleButtonContext.Provider
          value={{
            className: twJoin(
              toggleButtonVariants({ variant, size }),
              "w-auto min-w-0 shrink-0 px-3 data-focus-visible:z-10 data-focused:z-10",
              "group-data-[spacing=0]/toggle-group:rounded-none group-data-[spacing=0]/toggle-group:shadow-none group-data-[spacing=0]/toggle-group:group-data-[variant=outline]/toggle-group:border-l-0 group-data-[spacing=0]/toggle-group:first:rounded-l-md group-data-[spacing=0]/toggle-group:group-data-[variant=outline]/toggle-group:first:border-l group-data-[spacing=0]/toggle-group:last:rounded-r-md",
            ),
          }}
        >
          {typeof children === "function" ? children(renderProps) : children}
        </Rac.ToggleButtonContext.Provider>
      )}
    </Rac.ToggleButtonGroup>
  );
}
