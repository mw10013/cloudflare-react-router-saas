"use client";

import { Button } from "@/components/ui/oui-button";
import { Label } from "@/components/ui/oui-label";
import { Link } from "@/components/ui/oui-link";
import { Menu } from "@/components/ui/oui-menu";
import { Popover } from "@/components/ui/oui-popover";
import { Text } from "@/components/ui/oui-text";
import * as Rac from "react-aria-components";

export interface MenuExProps<T> extends Rac.MenuProps<T> {
  triggerElement: string | React.ReactElement;
}

/**
 * If `triggerElement` is a string, it's rendered as a ghost `Button`.
 */
export function MenuEx<T extends object>({
  triggerElement,
  children,
  ...rest
}: MenuExProps<T>) {
  return (
    <Rac.MenuTrigger>
      {typeof triggerElement === "string" ? (
        <Button variant="ghost">{triggerElement}</Button>
      ) : (
        triggerElement
      )}
      <Popover>
        <Menu {...rest}>{children}</Menu>
      </Popover>
    </Rac.MenuTrigger>
  );
}

export default function Component() {
  return (
    <div className="grid gap-2">
      <Label>MenuEx</Label>
      <Text slot="description">
        A reusable wrapper for{" "}
        <Link
          href="https://react-spectrum.adobe.com/react-aria/Menu.html"
          underline="always"
        >
          Menu
        </Link>{" "}
        — see{" "}
        <Link
          href="https://oui.mw10013.workers.dev/filter?tags=menu-ex"
          underline="always"
        >
          Uses
        </Link>
        .
      </Text>
    </div>
  );
}
