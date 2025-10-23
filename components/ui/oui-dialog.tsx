"use client";

import { XIcon } from "lucide-react";
import * as Rac from "react-aria-components";
import { twJoin, twMerge } from "tailwind-merge";

export interface DialogProps extends Rac.DialogProps {
  /**
   * If `true`, hides the close button for non-'alertdialog' role.
   * 'alertdialog' role never shows a close button.
   * @default false
   */
  hideCloseButtonForNonAlert?: boolean;
}

/**
 * Derived from shadcn DialogContent.
 */
export function Dialog({
  hideCloseButtonForNonAlert = false,
  className,
  children,
  ...props
}: DialogProps) {
  return (
    <Rac.Dialog
      className={twMerge("grid gap-4 outline-none", className)}
      {...props}
    >
      {(renderProps) => (
        <>
          {typeof children === "function" ? children(renderProps) : children}
          {!hideCloseButtonForNonAlert && props.role !== "alertdialog" && (
            <Rac.Button
              slot="close"
              className={twJoin(
                "absolute top-4 right-4 rounded-sm p-1 opacity-70 transition-opacity",
                "data-hovered:bg-accent data-hovered:text-muted-foreground data-hovered:opacity-100",
                "data-focus-visible:ring-2 data-focus-visible:ring-ring data-focus-visible:ring-offset-2 data-focus-visible:ring-offset-background data-focus-visible:outline-none",
                "data-disabled:pointer-events-none",
              )}
            >
              <XIcon className="size-4" />
              <span className="sr-only">Close</span>
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
      {...props}
      className={twMerge(
        "flex flex-col gap-2 text-center sm:text-left",
        className,
      )}
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
      {...props}
      className={twMerge(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
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
      {...props}
      className={twMerge("text-sm text-muted-foreground", className)}
    />
  );
}
