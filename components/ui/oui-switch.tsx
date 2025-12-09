"use client";

import {
  composeTailwindRenderProps,
  groupFocusVisibleStyles,
} from "@/components/ui/oui-base";
import { labelComponentStyles } from "@/components/ui/oui-label";
import * as Rac from "react-aria-components";
import { twJoin } from "tailwind-merge";

/**
 * Derived from shadcn Label, Field (gap-3 but not items-start), FieldLabel (leading-snug overriding Label leading-none).
 * indicator and thumb dervived from shadcn Switch (SwitchPrimitive.Root and SwitchPrimitive.Thumb)
 */
export function Switch({ className, ...props }: Rac.SwitchProps) {
  return (
    <Rac.Switch
      data-slot="switch"
      className={composeTailwindRenderProps(className, [
        labelComponentStyles,
        "group gap-3 leading-snug",
        // Card styling when FieldDescription is nested inside Checkbox
        "has-data-[slot=field-description]:items-start has-data-[slot=field-description]:rounded-md has-data-[slot=field-description]:border has-data-[slot=field-description]:p-4",
        "has-data-[slot=field-description]:data-hovered:bg-accent/50 has-data-[slot=field-description]:data-selected:border-primary has-data-[slot=field-description]:data-selected:bg-primary/5 dark:has-data-[slot=field-description]:data-selected:bg-primary/10",
      ])}
      {...props}
    >
      {(renderProps) => (
        <>
          <span
            data-slot="switch-indicator"
            className={twJoin(
              groupFocusVisibleStyles,
              "inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent bg-input shadow-xs transition-all group-data-selected:bg-primary dark:bg-input/80 dark:group-data-selected:bg-primary",
            )}
          >
            <span
              data-slot="switch-thumb"
              className="pointer-events-none block size-4 translate-x-0 rounded-full bg-background ring-0 transition-transform group-data-selected:translate-x-[calc(100%-2px)] dark:bg-foreground dark:group-data-selected:bg-primary-foreground"
            />
          </span>
          {typeof props.children === "function"
            ? props.children(renderProps)
            : props.children}
        </>
      )}
    </Rac.Switch>
  );
}
