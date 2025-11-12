"use client";

import { Button } from "@/components/ui/oui-button";
import { Menu } from "@/components/ui/oui-menu";
import { Popover } from "@/components/ui/oui-popover";
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
  ...props
}: MenuExProps<T>) {
  return (
    <Rac.MenuTrigger>
      {typeof triggerElement === "string" ? (
        <Button variant="ghost">{triggerElement}</Button>
      ) : (
        triggerElement
      )}
      <Popover>
        <Menu {...props}>{children}</Menu>
      </Popover>
    </Rac.MenuTrigger>
  );
}
