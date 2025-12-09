"use client";

import * as React from "react";
import {
  composeTailwindRenderProps,
  disabledStyles,
  focusVisibleStyles,
} from "@/components/ui/oui-base";
import { ChevronDown } from "lucide-react";
import * as Rac from "react-aria-components";
import { twMerge } from "tailwind-merge";

/**
 * Derived from shadcn AccordionItem
 */
export function Disclosure({ className, ...props }: Rac.DisclosureProps) {
  return (
    <Rac.Disclosure
      className={composeTailwindRenderProps(
        className,
        "group border-b last:border-b-0",
      )}
      {...props}
    />
  );
}

/**
 * Derived from shadcn AccordionTrigger
 */
export function DisclosureHeading({
  className,
  ...props
}: React.ComponentProps<typeof Rac.Heading>) {
  return <Rac.Heading className={twMerge("flex", className)} {...props} />;
}

/**
 * Derived from shadcn AccordionTrigger
 */
export function DisclosureButton({
  className,
  children,
  ...props
}: Rac.ButtonProps) {
  return (
    <Rac.Button
      slot="trigger"
      className={composeTailwindRenderProps(className, [
        focusVisibleStyles,
        disabledStyles,
        "flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all data-hovered:underline",
      ])}
      {...props}
    >
      {(renderProps) => (
        <>
          {typeof children === "function" ? children(renderProps) : children}
          <ChevronDown className="pointer-events-none size-4 shrink-0 translate-y-0.5 text-muted-foreground transition-transform duration-200 group-data-expanded:rotate-180" />
        </>
      )}
    </Rac.Button>
  );
}

/**
 * Derived from shadcn AccordionContent.
 *
 * `Rac.DisclosurePanel` adds a `hidden` attribute when collapsed, preventing
 * exit animations.
 */
export function DisclosurePanel({
  className,
  children,
  ...props
}: Rac.DisclosurePanelProps) {
  return (
    <Rac.DisclosurePanel
      className={composeTailwindRenderProps(
        className,
        "grid grid-rows-[0fr] text-sm transition-[grid-template-rows] duration-200 ease-out group-data-expanded:grid-rows-[1fr]",
      )}
      {...props}
    >
      <div className="overflow-hidden">
        <div className="pt-0 pb-4">{children}</div>
      </div>
    </Rac.DisclosurePanel>
  );
}
