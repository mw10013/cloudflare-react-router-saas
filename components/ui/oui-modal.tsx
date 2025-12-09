"use client";

import { composeTailwindRenderProps } from "@/components/ui/oui-base";
import * as Rac from "react-aria-components";

/**
 * Derived from shadcn DialogOverlay.
 * Includes `fill-mode-forwards` in `data-exiting` to prevent animation snapback.
 */
export function ModalOverlay({ className, ...props }: Rac.ModalOverlayProps) {
  return (
    <Rac.ModalOverlay
      data-slot="modal-overlay"
      className={composeTailwindRenderProps(className, [
        "fixed inset-0 z-50 bg-black/50",
        "data-entering:animate-in data-entering:fade-in-0",
        "data-exiting:animate-out data-exiting:fade-out-0 data-exiting:fill-mode-forwards",
      ])}
      {...props}
    />
  );
}

/**
 * Derived from shadcn DialogContent.
 */
export function Modal({ className, ...props }: Rac.ModalOverlayProps) {
  return (
    <Rac.Modal
      data-slot="modal"
      className={composeTailwindRenderProps(className, [
        "fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border bg-background p-6 shadow-lg duration-200 sm:max-w-lg",
        "data-entering:animate-in data-entering:fade-in-0 data-entering:zoom-in-95",
        "data-exiting:animate-out data-exiting:fade-out-0 data-exiting:fill-mode-forwards data-exiting:zoom-out-95", // fill-mode-forwards prevents animation snapback
      ])}
      {...props}
    />
  );
}
