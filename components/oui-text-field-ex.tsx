"use client";

import { FieldError } from "@/components/ui/oui-field-error";
import { Input } from "@/components/ui/oui-input";
import { Label } from "@/components/ui/oui-label";
import { Link } from "@/components/ui/oui-link";
import { Text } from "@/components/ui/oui-text";
import { TextField } from "@/components/ui/oui-text-field";
import * as Rac from "react-aria-components";

export interface TextFieldExProps extends Rac.TextFieldProps {
  label?: React.ReactNode;
  description?: React.ReactNode;
  errorMessage?: string | ((validation: Rac.ValidationResult) => string);
  placeholder?: string;
}

export function TextFieldEx({
  label,
  description,
  errorMessage,
  placeholder,
  children,
  ...props
}: TextFieldExProps) {
  return (
    <TextField {...props}>
      {(renderProps) => (
        <>
          {label && typeof label === "string" ? <Label>{label}</Label> : label}
          {children ? (
            typeof children === "function" ? (
              children(renderProps)
            ) : (
              children
            )
          ) : (
            <Input placeholder={placeholder} />
          )}
          {description && <Text slot="description">{description}</Text>}
          <FieldError>{errorMessage}</FieldError>
        </>
      )}
    </TextField>
  );
}

export default function Component() {
  return (
    <div className="grid gap-2">
      <Label>TextFieldEx</Label>
      <Text slot="description">
        A reusable wrapper for{" "}
        <Link
          href="https://react-spectrum.adobe.com/react-aria/TextField.html"
          underline="always"
        >
          TextField
        </Link>{" "}
        — see{" "}
        <Link
          href="https://oui.mw10013.workers.dev/filter?tags=text-field-ex"
          underline="always"
        >
          Uses
        </Link>
        .
      </Text>
    </div>
  );
}
