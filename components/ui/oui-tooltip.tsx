"use client";

import * as React from "react";
import * as Rac from "react-aria-components";
import { composeTailwindRenderProps } from "./oui-base";

export function Tooltip({
  offset = 7,
  className,
  children,
  ...props
}: React.ComponentProps<typeof Rac.Tooltip>) {
  return (
    <Rac.Tooltip
      data-slot="tooltip"
      offset={offset}
      className={composeTailwindRenderProps(className, [
        "z-50 w-fit rounded-md bg-foreground px-3 py-1.5 text-xs text-balance text-background",
        "data-entering:animate-in data-entering:fade-in-0 data-entering:zoom-in-95",
        "data-exiting:animate-out data-exiting:fade-out-0 data-exiting:zoom-out-95",
        "data-[placement=bottom]:slide-in-from-top-2",
        "data-[placement=left]:slide-in-from-right-2",
        "data-[placement=right]:slide-in-from-left-2",
        "data-[placement=top]:slide-in-from-bottom-2",
        "transform-origin-[var(--trigger-anchor-point)]",
      ])}
      {...props}
    >
      {(renderProps) => (
        <>
          <OverlayArrow />
          {typeof children === "function" ? children(renderProps) : children}
        </>
      )}
    </Rac.Tooltip>
  );
}

export function OverlayArrow(
  props: React.ComponentProps<typeof Rac.OverlayArrow>,
) {
  return (
    <Rac.OverlayArrow
      data-slot="overlay-arrow"
      className={composeTailwindRenderProps(
        props.className,
        "fill-foreground stroke-foreground",
      )}
      {...props}
    >
      <svg width={8} height={8} viewBox="0 0 8 8" className="size-2">
        <path d="m0 0 4 4 4-4" />
      </svg>
    </Rac.OverlayArrow>
  );
}
