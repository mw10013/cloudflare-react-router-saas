"use client";

import { Label } from "@/components/ui/oui-label";
import { Link } from "@/components/ui/oui-link";
import { Modal, ModalOverlay } from "@/components/ui/oui-modal";
import { Text } from "@/components/ui/oui-text";
import * as Rac from "react-aria-components";

export interface ModalExProps extends Rac.ModalOverlayProps {
  overlayClassName?: Rac.ModalOverlayProps["className"];
}

/**
 * Composes ModalOverlay and Modal.
 * `className` is applied to Modal, `overlayClassName` and other props are applied to ModalOverlay.
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

export default function Component() {
  return (
    <div className="grid gap-2">
      <Label>ModalEx</Label>
      <Text slot="description">
        A reusable wrapper for{" "}
        <Link
          href="https://react-spectrum.adobe.com/react-aria/Modal.html"
          underline="always"
        >
          Modal
        </Link>{" "}
        — see{" "}
        <Link
          href="https://oui.mw10013.workers.dev/filter?tags=modal-ex"
          underline="always"
        >
          Uses
        </Link>
        .
      </Text>
    </div>
  );
}
