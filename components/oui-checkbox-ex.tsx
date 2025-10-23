"use client";

import React from "react";
import { Checkbox } from "@/components/ui/oui-checkbox";
import { Label } from "@/components/ui/oui-label";
import { Link } from "@/components/ui/oui-link";
import { Text } from "@/components/ui/oui-text";
import * as Rac from "react-aria-components";
import { twMerge } from "tailwind-merge";

export interface CheckboxExProps extends Omit<Rac.CheckboxProps, "children"> {
  children?: React.ReactNode;
  descriptionClassName?: string;
  description: React.ReactNode;
  containerClassName?: string;
  indicatorClassName?: string;
}

export function CheckboxEx({
  children,
  descriptionClassName,
  description,
  containerClassName,
  indicatorClassName,
  ...props
}: CheckboxExProps) {
  const descriptionId = React.useId();
  return (
    <div className={twMerge("flex flex-col gap-1", containerClassName)}>
      <Checkbox
        {...props}
        aria-describedby={descriptionId}
        indicatorClassName={indicatorClassName}
      >
        {children}
      </Checkbox>
      <div className="items-top flex gap-3">
        <span className="size-4 shrink-0" />
        <Text
          id={descriptionId}
          slot="description"
          className={descriptionClassName}
        >
          {description}
        </Text>
      </div>
    </div>
  );
}

export default function Component() {
  return (
    <div className="grid gap-2">
      <Label>CheckboxEx</Label>
      <Text slot="description">
        A reusable wrapper for{" "}
        <Link
          href="https://react-spectrum.adobe.com/react-aria/Checkbox.html"
          underline="always"
        >
          Checkbox
        </Link>{" "}
        — see{" "}
        <Link
          href="https://oui.mw10013.workers.dev/filter?tags=checkbox-ex"
          underline="always"
        >
          Uses
        </Link>
        .
      </Text>
    </div>
  );
}
