"use client";

import { CheckboxGroup } from "@/components/ui/oui-checkbox-group";
import { FieldError } from "@/components/ui/oui-field-error";
import { Label } from "@/components/ui/oui-label";
import { Text } from "@/components/ui/oui-text";
import * as Rac from "react-aria-components";

export interface CheckboxGroupExProps extends Rac.CheckboxGroupProps {
  labelClassName?: string;
  label?: React.ReactNode;
  descriptionClassName?: string;
  description?: React.ReactNode;
  errorMessage?: string | ((validation: Rac.ValidationResult) => string);
}

/**
 * Derived from shadcn FormDemo FormItem and div
 */
export function CheckboxGroupEx({
  labelClassName,
  label,
  descriptionClassName,
  description,
  errorMessage,
  className,
  children,
  ...props
}: CheckboxGroupExProps) {
  return (
    <CheckboxGroup {...props} className={className}>
      {(renderProps) => (
        <>
          <div>
            <Label className={labelClassName}>{label}</Label>
            {description && (
              <Text className={descriptionClassName} slot="description">
                {description}
              </Text>
            )}
          </div>
          <div className="flex flex-col gap-2">
            {typeof children === "function" ? children(renderProps) : children}
          </div>
          <FieldError>{errorMessage}</FieldError>
        </>
      )}
    </CheckboxGroup>
  );
}
