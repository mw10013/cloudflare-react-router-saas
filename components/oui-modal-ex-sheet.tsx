"use client";

import type { VariantProps } from "class-variance-authority";
import { Modal, ModalOverlay } from "@/components/ui/oui-modal";
import { cva } from "class-variance-authority";
import * as Rac from "react-aria-components";
import { twMerge } from "tailwind-merge";

/**
 * Derived from shadcn SheetContent.
 * Merges with modalStyles so resets zoom and positioning.
 */
export const modalExSheetVariants = cva(
  [
    "fixed top-auto left-auto z-50 flex max-w-none translate-x-0 translate-y-0 flex-col gap-4 rounded-none bg-background shadow-lg transition ease-in-out sm:max-w-none",
    "data-entering:animate-in data-entering:duration-500 data-entering:zoom-in-100",
    "data-exiting:animate-outata-[exiting]:duration-300 data-exiting:fill-mode-forwards data-exiting:zoom-out-100",
  ],
  {
    variants: {
      side: {
        right:
          "inset-y-0 right-0 h-full w-3/4 border-l data-entering:slide-in-from-right data-exiting:slide-out-to-right sm:max-w-sm",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-entering:slide-in-from-left data-exiting:slide-out-to-left sm:max-w-sm",
        top: "inset-x-0 top-0 h-auto border-b data-entering:slide-in-from-top data-exiting:slide-out-to-top",
        bottom:
          "inset-x-0 bottom-0 h-auto border-t data-entering:slide-in-from-bottom data-exiting:slide-out-to-bottom",
      },
    },
    defaultVariants: {
      side: "right",
    },
  },
);

export interface ModalExSheetProps
  extends Rac.ModalOverlayProps,
    Pick<VariantProps<typeof modalExSheetVariants>, "side"> {
  overlayClassName?: Rac.ModalOverlayProps["className"];
}

/**
 * A modal that slides in from an edge of the screen, suitable for a "Sheet" component.
 * Derived from shadcn SheetContent.
 * @param side - The side of the screen from which the modal will enter.
 */
export function ModalExSheet({
  className,
  overlayClassName,
  children,
  side,
  ...props
}: ModalExSheetProps) {
  return (
    <ModalOverlay className={overlayClassName} {...props}>
      <Modal
        className={Rac.composeRenderProps(className, (className, renderProps) =>
          twMerge(modalExSheetVariants({ ...renderProps, side, className })),
        )}
      >
        {children}
      </Modal>
    </ModalOverlay>
  );
}
