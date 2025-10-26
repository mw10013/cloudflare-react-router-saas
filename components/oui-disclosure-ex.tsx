"use client";

import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@/components/ui/oui-disclosure";
import { Heading } from "@/components/ui/oui-heading";
import * as Rac from "react-aria-components";

export interface DisclosureExProps
  extends Omit<Rac.DisclosureProps, "children"> {
  title?: string;
  children?: Rac.DisclosurePanelProps["children"];
}

export function DisclosureEx({ title, children, ...props }: DisclosureExProps) {
  return (
    <Disclosure {...props}>
      <Heading variant="disclosure">
        <DisclosureButton>{title}</DisclosureButton>
      </Heading>
      <DisclosurePanel>{children}</DisclosurePanel>
    </Disclosure>
  );
}
