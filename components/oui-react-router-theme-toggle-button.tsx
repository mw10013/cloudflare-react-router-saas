import { ToggleButton } from "@/components/ui/oui-toggle-button";
import { Moon, Sun } from "lucide-react";
import { Theme, useTheme } from "remix-themes";

export default function ReactRouterThemeToggleButton() {
  const [theme, setTheme, metadata] = useTheme();

  const smartToggle = () => {
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
      onChange={() => {
        smartToggle();
      }}
      aria-label="Toggle dark mode"
      variant="ghost"
    >
      <Sun className="dark:hidden" size={20} aria-hidden="true" />
      <Moon className="hidden dark:block" size={20} aria-hidden="true" />
      <span className="sr-only">Switch to system/light/dark version</span>
    </ToggleButton>
  );
}
