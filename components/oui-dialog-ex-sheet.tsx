"use client";

import type { DialogProps } from "@/components/ui/oui-dialog";
import type { VariantProps } from "class-variance-authority";
import type { ReactElement } from "react";
import {
  ModalExSheet,
  sheetModalVariants,
} from "@/components/oui-modal-ex-sheet";
import { Button } from "@/components/ui/oui-button";
import { Dialog } from "@/components/ui/oui-dialog";
import { Label } from "@/components/ui/oui-label";
import { Link } from "@/components/ui/oui-link";
import { Text } from "@/components/ui/oui-text";
import * as Rac from "react-aria-components";

export interface DialogExSheetProps
  extends Omit<DialogProps, "role">, // Prevent 'alertdialog' role
    Pick<VariantProps<typeof sheetModalVariants>, "side"> {
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

export default function Component() {
  return (
    <div className="grid gap-2">
      <Label>DialogExSheet</Label>
      <Text slot="description">
        A reusable wrapper that extends{" "}
        <Link
          href="https://react-spectrum.adobe.com/react-aria/Dialog.html"
          underline="always"
        >
          Dialog
        </Link>{" "}
        to display content that complements the main content of the screen — see{" "}
        <Link
          href="https://oui.mw10013.workers.dev/filter?tags=dialog-ex-sheet"
          underline="always"
        >
          Uses
        </Link>
        .
      </Text>
    </div>
  );
}
