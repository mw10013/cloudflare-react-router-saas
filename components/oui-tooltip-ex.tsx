"use client";

import type { ReactElement } from "react";
import { Button } from "@/components/ui/oui-button";
import { Label } from "@/components/ui/oui-label";
import { Link } from "@/components/ui/oui-link";
import { Text } from "@/components/ui/oui-text";
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

export default function Component() {
  return (
    <div className="grid gap-2">
      <Label>TooltipEx</Label>
      <Text slot="description">
        A reusable wrapper for{" "}
        <Link
          href="https://react-spectrum.adobe.com/react-aria/Tooltip.html"
          underline="always"
        >
          Tooltip
        </Link>{" "}
        — see{" "}
        <Link
          href="https://oui.mw10013.workers.dev/filter?tags=tooltip-ex"
          underline="always"
        >
          Uses
        </Link>
        .
      </Text>
    </div>
  );
}
