"use client";

import { Modal, ModalOverlay } from "@/components/ui/oui-modal";
import * as Rac from "react-aria-components";

export interface ModalExProps extends Rac.ModalOverlayProps {
  overlayClassName?: Rac.ModalOverlayProps["className"];
}

/**
 * Reusable wrapper that composes ModalOverlay and Modal with children.
 * `className` is applied to Modal. `overlayClassName` and other props are applied to ModalOverlay.
 * `children` are nested within Modal.
 * 
 * @example
 * ```tsx
 * #import * as Oui from "@/components/ui/oui-index";
 * #import * as Rac from "react-aria-components";
 * 
 * <Rac.DialogTrigger>
 *   <Oui.Button>Open Modal</Oui.Button>
 *   <Oui.ModalEx>
 *     <Oui.Dialog>Hello, ModalEx</Oui.Dialog>
 *   </Oui.ModalEx>
 * </Rac.DialogTrigger>
 * ```
 */
export function ModalEx({
  className,
  overlayClassName,
  children,
  ...props
}: ModalExProps) {
  return (
    <ModalOverlay className={overlayClassName} {...props}>
      <Modal className={className}>{children}</Modal>
    </ModalOverlay>
  );
}
