"use client";

import { SearchFieldEx } from "@/components/oui-search-field-ex";
import { Label } from "@/components/ui/oui-label";
import { Link } from "@/components/ui/oui-link";
import { Text } from "@/components/ui/oui-text";
import * as Rac from "react-aria-components";

export interface AutocompleteExProps
  extends Omit<Rac.AutocompleteProps, "children"> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  errorMessage?: string | ((validation: Rac.ValidationResult) => string);
  placeholder?: string;
  searchFieldProps?: Rac.SearchFieldProps;
  children: React.ReactNode;
}

export function AutocompleteEx({
  label,
  description,
  errorMessage,
  placeholder,
  searchFieldProps,
  children,
  filter,
  ...rest
}: AutocompleteExProps) {
  /* eslint-disable-next-line @typescript-eslint/unbound-method --
   * React Aria uses functional patterns, so destructured functions don't use 'this'
   */
  const { contains: defaultFilter } = Rac.useFilter({ sensitivity: "base" });

  return (
    <Rac.Autocomplete {...rest} filter={filter ?? defaultFilter}>
      <SearchFieldEx
        {...searchFieldProps}
        label={label}
        description={description}
        errorMessage={errorMessage}
        placeholder={placeholder}
      />
      {children}
    </Rac.Autocomplete>
  );
}

export default function Component() {
  return (
    <div className="grid gap-2">
      <Label>AutocompleteEx</Label>
      <Text slot="description">
        A reusable wrapper for{" "}
        <Link
          href="https://react-spectrum.adobe.com/react-aria/Autocomplete.html"
          underline="always"
        >
          Autocomplete
        </Link>{" "}
        — see{" "}
        <Link
          href="https://oui.mw10013.workers.dev/filter?tags=autocomplete-ex"
          underline="always"
        >
          Uses
        </Link>
        .
      </Text>
    </div>
  );
}
