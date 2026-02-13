import type { NavigateOptions } from "react-router-dom";

import React, { useEffect } from "react";
import { HeroUIProvider } from "@heroui/system";
import { useHref, useNavigate } from "react-router-dom";
import { useTheme } from "@heroui/use-theme";

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NavigateOptions;
  }
}

const ThemeSetter = () => {
  const { setTheme } = useTheme();

  useEffect(() => {
    // Check if a theme is already set in localStorage to avoid overriding user's choice
    const storedTheme = localStorage.getItem("heroui-theme");

    if (!storedTheme) {
      setTheme("dark");
    }
  }, [setTheme]); // useEffect runs only once after the component mounts

  return null; // This component renders nothing.
};

export function Provider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  return (
    <HeroUIProvider navigate={navigate} useHref={useHref}>
      <ThemeSetter />
      {children}
    </HeroUIProvider>
  );
}
