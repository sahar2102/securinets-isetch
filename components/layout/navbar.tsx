"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { nav } from "@/data/site";
import { useI18n, localeLabels, locales, type Locale } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { useAppStore } from "@/lib/client-store";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/icons";
import { LogoMark, Wordmark } from "@/components/ui/brand";

export function Navbar() {
  const { t, locale, setLocale } = useI18n();
  const { theme, toggle } = useTheme();
  const { user, progress, loading } = useAppStore();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setLangOpen(false);
    setUserOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) setLangOpen(false);
      if (userRef.current && !userRef.current.contains(event.target as Node)) setUserOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const links = nav.filter((item) => item.key !== "home");
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ember focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>

      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          scrolled
            ? "border-b border-line/10 bg-canvas/80 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <div className="container-x flex h-[68px] items-center justify-between gap-4">
          <Link href="/" className="group flex shrink-0 items-center gap-3" aria-label="Securinets ISET Charguia — home">
            <LogoMark size={38} priority />
            <Wordmark />
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-0.5 lg:flex">
            {links.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  "relative whitespace-nowrap rounded-full px-2.5 py-2 text-[13px] font-medium tracking-tight transition-colors xl:px-3 xl:text-[13.5px]",
                  item.key === "team" || item.key === "contact" ? "hidden xl:block" : "",
                  isActive(item.href) ? "text-ink" : "text-muted hover:text-ink",
                )}
              >
                {isActive(item.href) ? (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full border border-line/10 bg-line/[0.05]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                ) : null}
                <span className="relative">{t.nav[item.key as keyof typeof t.nav]}</span>
              </Link>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-1.5">
            <div ref={langRef} className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setLangOpen((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={langOpen}
                aria-label="Change language"
                className="flex items-center gap-1 rounded-full border border-line/10 px-2.5 py-1.5 font-mono text-[11px] tracking-wider text-muted transition-colors hover:border-line/25 hover:text-ink"
              >
                {localeLabels[locale].short}
                <Icon name="chevronDown" size={12} />
              </button>
              <AnimatePresence>
                {langOpen ? (
                  <motion.ul
                    role="listbox"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.16 }}
                    className="absolute end-0 top-full z-50 mt-2 w-40 overflow-hidden rounded-xl border border-line/12 bg-elev/95 p-1 shadow-2xl backdrop-blur-xl"
                  >
                    {locales.map((code) => (
                      <li key={code}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={locale === code}
                          onClick={() => {
                            setLocale(code as Locale);
                            setLangOpen(false);
                          }}
                          className={cn(
                            "flex w-full items-center justify-between rounded-lg px-3 py-2 text-start text-sm transition-colors",
                            locale === code ? "bg-ember/10 text-ink" : "text-muted hover:bg-line/5 hover:text-ink",
                          )}
                        >
                          {localeLabels[code].long}
                          {locale === code ? <Icon name="check" size={14} className="text-ember" /> : null}
                        </button>
                      </li>
                    ))}
                  </motion.ul>
                ) : null}
              </AnimatePresence>
            </div>

            <button
              type="button"
              onClick={toggle}
              aria-label={theme === "dark" ? t.common.lightMode : t.common.darkMode}
              className="rounded-full border border-line/10 p-2 text-muted transition-colors hover:border-line/25 hover:text-ink"
            >
              <Icon name={theme === "dark" ? "sun" : "moon"} size={16} />
            </button>

            {!loading && user ? (
              <div ref={userRef} className="relative hidden md:block">
                <button
                  type="button"
                  onClick={() => setUserOpen((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={userOpen}
                  className="flex items-center gap-2 whitespace-nowrap rounded-full border border-line/10 py-1.5 pe-3 ps-1.5 text-[12px] text-muted transition-colors hover:border-line/25 hover:text-ink"
                >
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-ember/15 font-mono text-[10px] font-bold text-ember">
                    {user.name.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="max-w-[80px] truncate">{user.name.split(" ")[0]}</span>
                  <span className="font-mono text-[10px] text-ember">{progress.score}</span>
                  <Icon name="chevronDown" size={12} />
                </button>

                <AnimatePresence>
                  {userOpen ? (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.16 }}
                      role="menu"
                      className="absolute end-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-line/12 bg-elev/95 p-1 shadow-2xl backdrop-blur-xl"
                    >
                      <div className="border-b border-line/8 px-3 py-2">
                        <p className="truncate text-[12px] text-ink">{user.name}</p>
                        <p className="truncate font-mono text-[9.5px] text-muted">{user.email}</p>
                      </div>
                      <Link
                        href="/challenges"
                        role="menuitem"
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-[12.5px] text-muted hover:bg-line/5 hover:text-ink"
                      >
                        <Icon name="flag" size={14} />
                        {t.challenges.progressTitle}
                        <span className="ms-auto font-mono text-[10px] text-ember">{progress.score}</span>
                      </Link>
                      {user.role === "admin" ? (
                        <Link
                          href="/admin"
                          role="menuitem"
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-[12.5px] text-muted hover:bg-line/5 hover:text-ink"
                        >
                          <Icon name="shield" size={14} />
                          {t.nav.admin}
                        </Link>
                      ) : null}
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => void signOut({ callbackUrl: "/" })}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-start text-[12.5px] text-muted hover:bg-line/5 hover:text-ink"
                      >
                        <Icon name="arrowUpRight" size={14} />
                        {t.nav.logout}
                      </button>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden whitespace-nowrap rounded-full px-3 py-2 text-[13px] font-medium text-muted transition-colors hover:text-ink md:block"
              >
                {t.nav.login}
              </Link>
            )}

            {!user ? (
              <Link href="/join" className="btn-primary hidden whitespace-nowrap !px-4 !py-2 text-[13px] sm:inline-flex">
                {t.nav.join}
                <Icon name="arrowRight" size={15} />
              </Link>
            ) : null}

            <button
              type="button"
              onClick={() => setOpen(true)}
              className="rounded-full border border-line/10 p-2 text-ink lg:hidden"
              aria-label={t.common.openMenu}
              aria-expanded={open}
            >
              <Icon name="menu" size={18} />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] lg:hidden"
          >
            <div className="absolute inset-0 bg-canvas/95 backdrop-blur-xl" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex h-full flex-col"
            >
              <div className="container-x flex h-[68px] items-center justify-between">
                <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
                  <LogoMark size={38} />
                  <Wordmark />
                </Link>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full border border-line/10 p-2 text-ink"
                  aria-label={t.common.closeMenu}
                >
                  <Icon name="close" size={18} />
                </button>
              </div>

              <nav className="container-x flex flex-1 flex-col justify-center gap-1" aria-label="Mobile">
                {nav.map((item, i) => (
                  <motion.div
                    key={item.key}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 * i }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-baseline justify-between border-b border-line/8 py-4 font-display text-2xl font-medium tracking-tight",
                        isActive(item.href) ? "text-ember" : "text-ink",
                      )}
                    >
                      {t.nav[item.key as keyof typeof t.nav]}
                      <span className="font-mono text-[10px] text-muted">0{i + 1}</span>
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <div className="container-x pb-8">
                <div className="mb-5 flex items-center gap-2">
                  {locales.map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setLocale(code as Locale)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 font-mono text-[11px] tracking-wider",
                        locale === code
                          ? "border-ember/40 bg-ember/10 text-ember"
                          : "border-line/12 text-muted",
                      )}
                    >
                      {localeLabels[code].short}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={toggle}
                    className="ms-auto rounded-full border border-line/12 p-2 text-muted"
                    aria-label={theme === "dark" ? t.common.lightMode : t.common.darkMode}
                  >
                    <Icon name={theme === "dark" ? "sun" : "moon"} size={16} />
                  </button>
                </div>
                {user ? (
                  <div className="flex items-center gap-3">
                    <Link href="/challenges" onClick={() => setOpen(false)} className="btn-primary flex-1">
                      {t.nav.account}
                    </Link>
                    <button
                      type="button"
                      onClick={() => void signOut({ callbackUrl: "/" })}
                      className="btn-ghost"
                    >
                      {t.nav.logout}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Link href="/join" onClick={() => setOpen(false)} className="btn-primary flex-1">
                      {t.nav.join}
                      <Icon name="arrowRight" size={16} />
                    </Link>
                    <Link href="/login" onClick={() => setOpen(false)} className="btn-ghost">
                      {t.nav.login}
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
