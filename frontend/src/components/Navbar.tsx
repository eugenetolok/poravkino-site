import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Navbar as HeroNavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
} from "@heroui/navbar";

import { ThemeSwitch } from "@/components/theme-switch";
import { apiClient, getImageUrl } from "@/utils/apiClient";

interface CinemaInfo {
  logo?: string;
}

const MAIN_NAV = [
  { name: "Афиша", path: "/" },
  { name: "Скоро в кино", path: "/soon" },
  { name: "Вопросы и ответы", path: "/faq" },
  { name: "Мои билеты", path: "/my-tickets" },
  { name: "Контакты", path: "/contacts" },
];

export const Navbar = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cinemaLogo, setCinemaLogo] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    apiClient
      .get<CinemaInfo>("/api/cinema")
      .then((data) => {
        if (!isMounted) return;
        setCinemaLogo(data.logo || null);
      })
      .catch(() => {
        setCinemaLogo(null);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const currentSection = useMemo(() => {
    if (location.pathname.startsWith("/performance/")) return "Выбор мест";
    if (location.pathname.startsWith("/movie/")) return "Фильм";

    const matchedNavItem = MAIN_NAV.find((item) =>
      item.path === "/"
        ? location.pathname === "/"
        : location.pathname.startsWith(item.path),
    );

    return matchedNavItem?.name || "Афиша";
  }, [location.pathname]);

  return (
    <div className="relative z-50 mx-auto w-full max-w-[1600px] px-4 pt-4 md:px-6">
      <HeroNavbar
        className="glass-panel h-16 rounded-2xl"
        classNames={{
          wrapper: "px-3 md:px-4",
        }}
        isBlurred={false}
        isMenuOpen={isMenuOpen}
        maxWidth="full"
        onMenuOpenChange={setIsMenuOpen}
      >
        <NavbarContent>
          <NavbarBrand>
            <Link className="group flex items-center gap-2" to="/">
              {cinemaLogo ? (
                <img
                  alt="Логотип кинотеатра"
                  className="h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                  src={getImageUrl(cinemaLogo)}
                />
              ) : (
                <div className="flex items-end gap-2">
                  <span className="type-title text-lg uppercase text-[var(--text-primary)]">
                    Поравкино
                  </span>
                  <span className="type-meta mb-0.5 rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[10px] tracking-[0.14em] text-[var(--accent-strong)]">
                    online
                  </span>
                </div>
              )}
            </Link>
          </NavbarBrand>
        </NavbarContent>

        <NavbarContent className="hidden xl:flex" justify="center">
          {MAIN_NAV.map((item) => {
            const isActive =
              item.path === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.path);

            return (
              <NavbarItem key={item.path} isActive={isActive}>
                <Link
                  className={`type-label rounded-full px-3 py-2 transition-colors xl:px-4 ${
                    isActive
                      ? "bg-[var(--accent)] text-white"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  }`}
                  to={item.path}
                >
                  {item.name}
                </Link>
              </NavbarItem>
            );
          })}
        </NavbarContent>

        <NavbarContent className="gap-3" justify="end">
          <NavbarItem className="hidden xl:flex">
            <span className="type-meta rounded-full border border-black/10 bg-white/50 px-3 py-1 text-[10px] tracking-[0.11em] text-[var(--text-muted)] dark:border-white/15 dark:bg-white/5">
              {currentSection}
            </span>
          </NavbarItem>
          <NavbarItem className="hidden xl:flex">
            <ThemeSwitch />
          </NavbarItem>
          <NavbarItem className="xl:hidden">
            <NavbarMenuToggle
              aria-label={isMenuOpen ? "Закрыть меню" : "Открыть меню"}
            />
          </NavbarItem>
        </NavbarContent>

        <NavbarMenu className="bg-[var(--surface-0)]/95 px-2 pt-20 backdrop-blur-xl dark:bg-[var(--surface-0)]/95">
          {MAIN_NAV.map((item) => (
            <NavbarMenuItem key={item.path}>
              <Link
                className="type-display text-2xl text-[var(--text-primary)] md:text-3xl"
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            </NavbarMenuItem>
          ))}
          <NavbarMenuItem>
            <div className="mt-3 flex items-center justify-between rounded-2xl border border-black/10 bg-white/60 px-3 py-2 dark:border-white/10 dark:bg-white/5">
              <span className="type-label uppercase tracking-[0.08em] text-[var(--text-muted)]">
                Тема
              </span>
              <ThemeSwitch />
            </div>
          </NavbarMenuItem>
        </NavbarMenu>
      </HeroNavbar>
    </div>
  );
};
