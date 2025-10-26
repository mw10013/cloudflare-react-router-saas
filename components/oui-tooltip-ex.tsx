"use client";

import type { ReactElement } from "react";
import { Button } from "@/components/ui/oui-button";
import { OverlayArrow, Tooltip } from "@/components/ui/oui-tooltip";
import * as Rac from "react-aria-components";

export interface TooltipExProps
  extends React.ComponentProps<typeof Rac.Tooltip>,
    Partial<
      Pick<
        React.ComponentProps<typeof Rac.TooltipTrigger>,
        "isOpen" | "defaultOpen" | "onOpenChange" | "delay"
      >
    > {
  triggerElement?: string | ReactElement;
}

/**
 * A tooltip that can be opened via a trigger element or programmatically.
 *
 * `triggerElement` is required for the tooltip to be positioned and displayed.
 * The open state can be uncontrolled (using `defaultOpen`) or controlled
 * (using `isOpen` and `onOpenChange`).
 */
export function TooltipEx({
  triggerElement,
  isOpen,
  defaultOpen,
  onOpenChange,
  delay,
  children,
  ...props
}: TooltipExProps) {
  if (!triggerElement) {
    return null;
  }
  return (
    <Rac.TooltipTrigger
      isOpen={isOpen}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      delay={delay}
    >
      {typeof triggerElement === "string" ? (
        <Button variant="ghost">{triggerElement}</Button>
      ) : (
        triggerElement
      )}
      <Tooltip {...props}>
        {(renderProps) => (
          <>
            <OverlayArrow />
            {typeof children === "function" ? children(renderProps) : children}
          </>
        )}
      </Tooltip>
    </Rac.TooltipTrigger>
  );
}
