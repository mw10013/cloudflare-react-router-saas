"use client";

import { XIcon } from "lucide-react";
import * as Rac from "react-aria-components";
import { twJoin, twMerge } from "tailwind-merge";

/**
 * Supports both regular dialogs and alert dialogs.
 * For regular dialogs, omit the role prop. For alert dialogs, set role="alertdialog".
 * Alert dialogs are for important prompts requiring user action and do not show
 * a close button to prevent dismissal without interaction, per accessibility guidelines.
 *
 * @param role - The ARIA role for the dialog.
 * @default undefined
 * @param showCloseButton - Show the close button. Overridden to false for role="alertdialog".
 * @default true
 *
 * Derived from shadcn DialogContent.
 */
export function Dialog({
  showCloseButton = true,
  className,
  children,
  ...props
}: React.ComponentProps<typeof Rac.Dialog> & {
  showCloseButton?: boolean;
}) {
  return (
    <Rac.Dialog
      data-slot={props.role === "alertdialog" ? "alert-dialog" : "dialog"}
      className={twMerge("group grid gap-4 outline-none", className)}
      {...props}
    >
      {(renderProps) => (
        <>
          {typeof children === "function" ? children(renderProps) : children}
          {showCloseButton && props.role !== "alertdialog" && (
            <Rac.Button
              data-slot="dialog-close-button"
              slot="close"
              aria-label="Close"
              className={twJoin(
                "absolute top-4 right-4 rounded-sm p-1 opacity-70 transition-opacity",
                "data-hovered:bg-accent data-hovered:text-muted-foreground data-hovered:opacity-100",
                "data-focus-visible:ring-2 data-focus-visible:ring-ring data-focus-visible:ring-offset-2 data-focus-visible:ring-offset-background data-focus-visible:outline-none",
                "data-disabled:pointer-events-none",
              )}
            >
              <XIcon className="size-4" />
            </Rac.Button>
          )}
        </>
      )}
    </Rac.Dialog>
  );
}

/**
 * Derived from shadcn DialogHeader
 */
export function DialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="dialog-header"
      className={twMerge(
        "flex flex-col gap-2 text-center sm:text-left",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Derived from shadcn DialogFooter
 */
export function DialogFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="dialog-footer"
      className={twMerge(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Wraps Rac.Heading with slot="title".
 *
 * Derived from shadcn DialogTitle and AlertDialogTitle
 *
 */
export function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof Rac.Heading>) {
  return (
    <Rac.Heading
      data-slot="dialog-title"
      slot="title"
      className={twMerge(
        "text-lg font-semibold group-data-[slot=dialog]:leading-none",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Derived from shadcn DialogDescription
 */
export function DialogDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      data-slot="dialog-description"
      className={twMerge("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}
