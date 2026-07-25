"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useThemeStore, type Theme } from "@/store/theme-store";

const THEME_OPTIONS: Array<{ value: Theme; icon: typeof Sun }> = [
  { value: "dark", icon: Moon },
  { value: "light", icon: Sun },
  { value: "system", icon: Monitor },
];

export function ThemeToggle() {
  const t = useTranslations("theme");
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);
  const hydrate = useThemeStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const ActiveIcon =
    THEME_OPTIONS.find((option) => option.value === theme)?.icon ?? Moon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" aria-label={t("toggle")}>
            <ActiveIcon />
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        {THEME_OPTIONS.map(({ value, icon: Icon }) => (
          <DropdownMenuItem key={value} onClick={() => setTheme(value)}>
            <Icon />
            {t(value)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
