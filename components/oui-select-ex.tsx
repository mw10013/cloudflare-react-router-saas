"use client";

import type { SelectionMode } from "@/components/ui/oui-select";
import { FieldError } from "@/components/ui/oui-field-error";
import { Label } from "@/components/ui/oui-label";
import { Popover } from "@/components/ui/oui-popover";
import {
  Select,
  SelectButton,
  SelectValue,
} from "@/components/ui/oui-select";
import { Text } from "@/components/ui/oui-text";
import * as Rac from "react-aria-components";

export interface SelectExProps<T extends object, M extends SelectionMode>
  extends Omit<Rac.SelectProps<T, M>, "children"> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  errorMessage?: string | ((validation: Rac.ValidationResult) => string);
  items?: Iterable<T>;
  children: React.ReactNode | ((item: T) => React.ReactNode);
  buttonClassName?: string;
  /**
   * A render function to customize the display of the selected value or placeholder.
   * Receives `isPlaceholder` and `defaultChildren` (the placeholder string or default rendered item).
   */
  renderSelectValue?: (
    props: Rac.SelectValueRenderProps<T> & {
      defaultChildren: React.ReactNode | undefined;
    },
  ) => React.ReactNode;
}

/**
 * @example
 *
 * ```tsx
 * <SelectEx
 *   name="role"
 *   label="Role"
 *   defaultSelectedKey={"member"}
 *   items={[
 *     { id: "member", name: "Member" },
 *     { id: "admin", name: "Admin" },
 *   ]}
 * >
 *   {(item) => <ListBoxItem>{item.name}</ListBoxItem>}
 * </SelectEx>
 * ```
 */
export function SelectEx<T extends object, M extends SelectionMode = "single">({
  label,
  description,
  errorMessage,
  children,
  items,
  buttonClassName,
  renderSelectValue,
  ...props
}: SelectExProps<T, M>) {
  return (
    <Select {...props}>
      {label && typeof label === "string" ? <Label>{label}</Label> : label}
      <SelectButton className={buttonClassName}>
        <SelectValue>{renderSelectValue}</SelectValue>
      </SelectButton>
      {description && <Text slot="description">{description}</Text>}
      <FieldError>{errorMessage}</FieldError>
      <Popover>
        <Rac.ListBox items={items}>{children}</Rac.ListBox>
      </Popover>
    </Select>
  );
}
