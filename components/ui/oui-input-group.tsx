"use client";

import type { VariantProps } from "class-variance-authority";
import {
  InputGroupAddon,
  InputGroupText,
} from "@/components/ui/input-group";
import { Button } from "@/components/ui/oui-button";
import { Input } from "@/components/ui/oui-input";
import { TextArea } from "@/components/ui/oui-text-area";
import { cva } from "class-variance-authority";
import * as Rac from "react-aria-components";
import { twMerge } from "tailwind-merge";
import { composeTailwindRenderProps } from "./oui-base";

export { InputGroupAddon, InputGroupText };

export function InputGroup({ className, ...props }: Rac.GroupProps) {
  return (
    <Rac.Group
      data-slot="input-group"
      className={composeTailwindRenderProps(className, [
        "group/input-group relative flex w-full items-center rounded-md border border-input shadow-xs transition-[color,box-shadow] outline-none dark:bg-input/30",
        "h-9 min-w-0 has-[>textarea]:h-auto",

        "has-[>[data-align=inline-start]]:[&>input]:pl-2",
        "has-[>[data-align=inline-end]]:[&>input]:pr-2",
        "has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>[data-align=block-start]]:[&>input]:pb-3",
        "has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-end]]:[&>input]:pt-3",

        "has-[[data-slot=input-group-control][data-focus-visible]]:border-ring has-[[data-slot=input-group-control][data-focus-visible]]:ring-[3px] has-[[data-slot=input-group-control][data-focus-visible]]:ring-ring/50",

        "data-invalid:border-destructive data-invalid:ring-destructive/20 dark:data-invalid:ring-destructive/40",
      ])}
      {...props}
    />
  );
}

const inputGroupButtonVariants = cva(
  "flex items-center gap-2 text-sm shadow-none",
  {
    variants: {
      size: {
        xs: "h-6 gap-1 rounded-[calc(var(--radius)-5px)] px-2 has-[>svg]:px-2 [&>svg:not([class*='size-'])]:size-3.5",
        sm: "h-8 gap-1.5 rounded-md px-2.5 has-[>svg]:px-2.5",
        "icon-xs":
          "size-6 rounded-[calc(var(--radius)-5px)] p-0 has-[>svg]:p-0",
        "icon-sm": "size-8 p-0 has-[>svg]:p-0",
      },
    },
    defaultVariants: {
      size: "xs",
    },
  },
);

export function InputGroupButton({
  type = "button",
  variant = "ghost",
  size = "xs",
  className,
  ...props
}: Omit<React.ComponentProps<typeof Button>, "size"> &
  VariantProps<typeof inputGroupButtonVariants>) {
  return (
    <Button
      type={type}
      data-size={size}
      variant={variant}
      className={Rac.composeRenderProps(className, (className) =>
        twMerge(inputGroupButtonVariants({ size }), className),
      )}
      {...props}
    />
  );
}

export function InputGroupInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  return (
    <Input
      data-slot="input-group-control"
      className={composeTailwindRenderProps(
        className,
        "flex-1 rounded-none border-0 bg-transparent shadow-none data-focus-visible:ring-0 dark:bg-transparent",
      )}
      {...props}
    />
  );
}

export function InputGroupTextArea({
  className,
  ...props
}: React.ComponentProps<typeof Rac.TextArea>) {
  return (
    <TextArea
      data-slot="input-group-control"
      className={composeTailwindRenderProps(
        className,
        "flex-1 resize-none rounded-none border-0 bg-transparent py-3 shadow-none data-focus-visible:ring-0 dark:bg-transparent",
      )}
      {...props}
    />
  );
}
