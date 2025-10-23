"use client";

import React from "react";
import { FieldError } from "@/components/ui/oui-field-error";
import { Label } from "@/components/ui/oui-label";
import { Link } from "@/components/ui/oui-link";
import { RadioGroup } from "@/components/ui/oui-radio-group";
import { Text } from "@/components/ui/oui-text";
import * as Rac from "react-aria-components";

export interface RadioGroupExProps extends Rac.RadioGroupProps {
  label?: React.ReactNode;
  description?: React.ReactNode;
  errorMessage?: string | ((validation: Rac.ValidationResult) => string);
}

export function RadioGroupEx({
  label,
  description,
  errorMessage,
  children,
  ...props
}: RadioGroupExProps) {
  return (
    <RadioGroup {...props}>
      {(renderProps) => (
        <>
          {label && <Label className="">{label}</Label>}
          {description && <Text slot="description">{description}</Text>}
          {typeof children === "function" ? children(renderProps) : children}
          <FieldError>{errorMessage}</FieldError>
        </>
      )}
    </RadioGroup>
  );
}

export default function Component() {
  return (
    <div className="grid gap-2">
      <Label>RadioGroupEx</Label>
      <Text slot="description">
        A reusable wrapper for{" "}
        <Link
          href="https://react-spectrum.adobe.com/react-aria/RadioGroup.html"
          underline="always"
        >
          RadioGroup
        </Link>{" "}
        — see{" "}
        <Link
          href="https://oui.mw10013.workers.dev/filter?tags=radio-group-ex"
          underline="always"
        >
          Uses
        </Link>
        .
      </Text>
    </div>
  );
}
