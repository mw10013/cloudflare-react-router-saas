"use client";

import { Button } from "@/components/ui/oui-button";
import { Dialog } from "@/components/ui/oui-dialog";
import { Popover } from "@/components/ui/oui-popover";
import * as Rac from "react-aria-components";

export interface PopoverExProps extends Omit<Rac.PopoverProps, "children"> {
  triggerElement: string | React.ReactElement;
  dialogClassName?: string;
  children?: Rac.DialogProps["children"];
}

/**
 * Reusable wrapper for Popover that displays a popover dialog.
 * If `triggerElement` is a string, it's rendered as a ghost `Button`.
 * The dialog is dismissable via an outside press if `role` is not "alertdialog".
 */
export function PopoverEx({
  triggerElement,
  dialogClassName,
  children,
  ...props
}: PopoverExProps) {
  return (
    <Rac.DialogTrigger>
      {typeof triggerElement === "string" ? (
        <Button variant="ghost">{triggerElement}</Button>
      ) : (
        triggerElement
      )}
      <Popover {...props}>
        <Dialog className={dialogClassName} hideCloseButtonForNonAlert>
          {children}
        </Dialog>
      </Popover>
    </Rac.DialogTrigger>
  );
}
