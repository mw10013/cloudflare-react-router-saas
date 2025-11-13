"use client";

import { ToggleButton } from "@/components/ui/oui-toggle-button";
import { Moon, Sun } from "lucide-react";
import { Theme, useTheme } from "remix-themes";

export function ReactRouterThemeToggleButton() {
  const [theme, setTheme, metadata] = useTheme();

  const smartToggle = () => {
    // https://github.com/cosscom/coss/blob/14591a5215ddbba462b5173dcea81977a9dc608f/apps/origin/components/theme-toggle.tsx
    /* The smart toggle by @nrjdalal */
    const prefersDarkScheme = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    if (metadata.definedBy === "SYSTEM") {
      setTheme(prefersDarkScheme ? Theme.LIGHT : Theme.DARK);
    } else if (
      (theme === Theme.LIGHT && !prefersDarkScheme) ||
      (theme === Theme.DARK && prefersDarkScheme)
    ) {
      setTheme(theme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT);
    } else {
      setTheme(null);
    }
  };

  return (
    <ToggleButton
      isSelected={metadata.definedBy === "SYSTEM"}
      onChange={smartToggle}
      aria-label="Toggle dark mode"
      variant="ghost"
    >
      <Sun className="dark:hidden" />
      <Moon className="hidden dark:block" />
    </ToggleButton>
  );
}

export default ReactRouterThemeToggleButton;
