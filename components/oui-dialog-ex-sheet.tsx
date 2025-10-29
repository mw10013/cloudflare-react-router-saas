"use client";

import type { DialogProps } from "@/components/ui/oui-dialog";
import type { VariantProps } from "class-variance-authority";
import type { ReactElement } from "react";
import {
  ModalExSheet,
  modalExSheetVariants,
} from "@/components/oui-modal-ex-sheet";
import { Button } from "@/components/ui/oui-button";
import { Dialog } from "@/components/ui/oui-dialog";
import * as Rac from "react-aria-components";

export interface DialogExSheetProps
  extends Omit<DialogProps, "role">, // Prevent 'alertdialog' role
    Pick<VariantProps<typeof modalExSheetVariants>, "side"> {
  triggerElement: string | ReactElement;
  modalClassName?: string;
  overlayClassName?: string;
}

/**
 * A sheet modal that slides in from a side of the screen.
 * The modal is always dismissable via an outside press.
 */
export function DialogExSheet({
  triggerElement,
  modalClassName,
  overlayClassName,
  side,
  ...props
}: DialogExSheetProps) {
  return (
    <Rac.DialogTrigger>
      {typeof triggerElement === "string" ? (
        <Button variant="ghost">{triggerElement}</Button>
      ) : (
        triggerElement
      )}
      <ModalExSheet
        className={modalClassName}
        overlayClassName={overlayClassName}
        side={side}
        isDismissable
      >
        <Dialog {...props} />
      </ModalExSheet>
    </Rac.DialogTrigger>
  );
}
