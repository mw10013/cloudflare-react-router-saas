"use client";

import { Button } from "@/components/ui/oui-button";
import { ComboBox } from "@/components/ui/oui-combo-box";
import { FieldError } from "@/components/ui/oui-field-error";
import { Group } from "@/components/ui/oui-group";
import { Input } from "@/components/ui/oui-input";
import { Label } from "@/components/ui/oui-label";
import { Popover } from "@/components/ui/oui-popover";
import { Text } from "@/components/ui/oui-text";
import { ChevronsUpDown } from "lucide-react";
import * as Rac from "react-aria-components";

export interface ComboBoxExProps<T extends object>
  extends Omit<Rac.ComboBoxProps<T>, "children"> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  errorMessage?: string | ((validation: Rac.ValidationResult) => string);
  placeholder?: string;
  items?: Iterable<T>;
  children: React.ReactNode | ((item: T) => React.ReactNode);
}

export function ComboBoxEx<T extends object>({
  label,
  description,
  errorMessage,
  placeholder,
  items,
  children,
  ...props
}: ComboBoxExProps<T>) {
  return (
    <ComboBox {...props}>
      {label && typeof label === "string" ? <Label>{label}</Label> : label}
      <Group>
        <Input variant="ghost" placeholder={placeholder} />
        <Button variant="ghost" size="icon">
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </Group>
      {description && <Text slot="description">{description}</Text>}
      <FieldError>{errorMessage}</FieldError>
      <Popover>
        <Rac.ListBox items={items}>{children}</Rac.ListBox>
      </Popover>
    </ComboBox>
  );
}
