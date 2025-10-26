"use client";

import React from "react";
import { composeTailwindRenderProps } from "@/components/ui/oui-base";
import { Switch, SwitchIndicator } from "@/components/ui/oui-switch";
import { Text } from "@/components/ui/oui-text";
import * as Rac from "react-aria-components";
import { twMerge } from "tailwind-merge";

export interface SwitchExProps extends Rac.SwitchProps {
  indicatorPosition?: "start" | "end";
  indicatorClassName?: string;
  descriptionClassName?: string;
  description?: React.ReactNode;
  containerClassName?: string;
}

export function SwitchEx({
  indicatorPosition = "start",
  className,
  indicatorClassName,
  descriptionClassName,
  description,
  children,
  containerClassName,
  ...props
}: SwitchExProps) {
  const _descriptionId = React.useId();
  const descriptionId = description ? _descriptionId : undefined;
  return (
    // Derived fromshadcn FormDemo div
    <div className={twMerge("flex flex-col gap-0.5", containerClassName)}>
      <Switch
        {...props}
        className={composeTailwindRenderProps(className, [
          "peer",
          indicatorPosition === "end" && "justify-between",
        ])}
        aria-describedby={descriptionId}
      >
        {(renderProps) => (
          <>
            {indicatorPosition === "start" && (
              <SwitchIndicator className={indicatorClassName} />
            )}
            {typeof children === "function" ? children(renderProps) : children}
            {indicatorPosition === "end" && (
              <SwitchIndicator className={indicatorClassName} />
            )}
          </>
        )}
      </Switch>
      {description && (
        <Text
          id={descriptionId}
          slot="description"
          className={twMerge(
            "peer-data-disabled:opacity-60",
            descriptionClassName,
          )}
        >
          {description}
        </Text>
      )}
    </div>
  );
}
