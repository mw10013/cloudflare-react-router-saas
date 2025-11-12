"use client";

import { SearchFieldEx } from "@/components/oui-search-field-ex";
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
  ...props
}: AutocompleteExProps) {
  /* eslint-disable-next-line @typescript-eslint/unbound-method --
   * React Aria uses functional patterns, so destructured functions don't use 'this'
   */
  const { contains: defaultFilter } = Rac.useFilter({ sensitivity: "base" });

  return (
    <Rac.Autocomplete {...props} filter={filter ?? defaultFilter}>
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
