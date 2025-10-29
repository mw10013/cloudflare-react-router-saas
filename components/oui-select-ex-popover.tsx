"use client";

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

export interface SelectExPopoverProps<T extends object>
  extends Omit<Rac.SelectProps<T>, "children"> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  errorMessage?: string | ((validation: Rac.ValidationResult) => string);
  children: React.ReactNode;
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
 * A select component that renders children in a popover for complex dropdown content like autocomplete.
 * Children are rendered as the contents of Popover and not in a ListBox.
 * Useful for Autocomplete.
 *
 * @example
 *
 * ```tsx
 * <SelectExPopover label="Users" defaultSelectedKey={users[0].id}>
 *   <AutocompleteEx
 *     placeholder="Select user..."
 *     searchFieldProps={{ "aria-label": "User", autoFocus: true }}
 *   >
 *     <Rac.ListBox items={users}>
 *       {(item) => (
 *         <ListBoxItem id={item.userId}>
 *           {item.username}
 *         </ListBoxItem>
 *       )}
 *     </Rac.ListBox>
 *   </AutocompleteEx>
 * </SelectExPopover>
 * ```
 */
export function SelectExPopover<T extends object>({
  label,
  description,
  errorMessage,
  children,
  buttonClassName,
  renderSelectValue,
  ...props
}: SelectExPopoverProps<T>) {
  return (
    <Select {...props}>
      {label && typeof label === "string" ? <Label>{label}</Label> : label}
      <SelectButton className={buttonClassName}>
        <SelectValue>{renderSelectValue}</SelectValue>
      </SelectButton>
      {description && <Text slot="description">{description}</Text>}
      <FieldError>{errorMessage}</FieldError>
      <Popover>{children}</Popover>
    </Select>
  );
}
