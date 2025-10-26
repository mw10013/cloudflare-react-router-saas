"use client";

import type { ReactNode } from "react";
import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { ModalEx } from "@/components/oui-modal-ex";
import { Button } from "@/components/ui/oui-button";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/oui-dialog";
import { Heading } from "@/components/ui/oui-heading";
import * as Rac from "react-aria-components";

export interface DialogExAlertProps
  extends Rac.DialogProps,
    Pick<Rac.ModalOverlayProps, "isOpen" | "onOpenChange" | "defaultOpen"> {
  type?: "confirm" | "acknowledge";
  title: React.ReactNode;
  children: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  modalClassName?: string;
}

/**
 * A modal confirmation or acknowledgement dialog with a title, message, and
 * customizable action buttons. It is not dismissable by an outside press.
 *
 * - `type="confirm"` (default): Renders "Confirm" and "Cancel" buttons.
 * - `type="acknowledge"`: Renders a single "Acknowledge" button.
 */
export function DialogExAlert({
  type = "confirm",
  title,
  children,
  confirmLabel = type === "confirm" ? "Continue" : "OK",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  modalClassName,
  isOpen,
  onOpenChange,
  defaultOpen,
  ...props
}: DialogExAlertProps) {
  return (
    <ModalEx
      className={modalClassName}
      isDismissable={false}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      defaultOpen={defaultOpen}
    >
      <Dialog role="alertdialog" {...props}>
        <DialogHeader>
          <Heading variant="alert" slot="title">
            {title}
          </Heading>
          <DialogDescription>{children}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          {type === "confirm" && (
            <Button variant="outline" slot="close" autoFocus onPress={onCancel}>
              {cancelLabel}
            </Button>
          )}
          <Button
            slot="close"
            onPress={onConfirm}
            autoFocus={type === "acknowledge"}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </Dialog>
    </ModalEx>
  );
}

type DialogExAlertOptions = Omit<
  DialogExAlertProps,
  "isOpen" | "onOpenChange" | "defaultOpen" | "onConfirm" | "onCancel"
>;

interface DialogExAlertContextType {
  show: (options: DialogExAlertOptions) => Promise<boolean>;
}

const DialogExAlertContext = createContext<
  DialogExAlertContextType | undefined
>(undefined);

export function useDialogExAlert() {
  const context = useContext(DialogExAlertContext);
  if (!context) {
    throw new Error(
      "useDialogExAlert must be used within a DialogExAlertProvider",
    );
  }
  return context;
}

/**
 * This provider manages a global alert dialog.
 */
export function DialogExAlertProvider({ children }: { children: ReactNode }) {
  /* We use a promise-based approach to allow for async/await usage.
   * `useRef` stores the promise's `resolve` function across renders without
   * causing re-renders. When the user confirms or cancels, this `resolve`
   * function is called to fulfill the promise.
   *
   * `useCallback` memoizes the `show` function to prevent consumers of the
   * context from re-rendering unnecessarily, which is a performance
   * optimization.
   */
  const [options, setOptions] = useState<DialogExAlertOptions | null>(null);
  const promiseRef = useRef<{ resolve: (value: boolean) => void } | null>(null);

  const show = useCallback((newOptions: DialogExAlertOptions) => {
    setOptions(newOptions);
    return new Promise<boolean>((resolve) => {
      promiseRef.current = { resolve };
    });
  }, []);

  const handleClose = (confirmed: boolean) => {
    if (promiseRef.current) {
      promiseRef.current.resolve(confirmed);
    }
    setOptions(null);
    promiseRef.current = null;
  };

  return (
    <DialogExAlertContext.Provider value={{ show }}>
      {children}
      {options && (
        <DialogExAlert
          {...options}
          isOpen
          onConfirm={() => {
            handleClose(true);
          }}
          onCancel={() => {
            handleClose(false);
          }}
        />
      )}
    </DialogExAlertContext.Provider>
  );
}
