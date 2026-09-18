import { AnimatePresence, motion } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { siteConfig } from "../config/site";

/**
 * Fixed navigation bar with desktop links + mobile dropdown.
 * Includes "Sign In" link preserved from the original landing page.
 */
export function Header() {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onPointer = (e: PointerEvent) => {
      const target = e.target as Node;
      if (panelRef.current?.contains(target) || buttonRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <nav
        aria-label="Main"
        className="flex w-full items-center justify-center px-4 pt-[30px] tb:px-[30px] dk:px-0"
      >
        <div className="flex w-full max-w-[800px] items-center justify-between rounded-pill border border-line bg-white py-[14px] pl-5 pr-[14px] dk:max-w-[1000px]">
          <a href="/#hero" aria-label={`${siteConfig.name} home`} className="shrink-0">
            <img
              src={siteConfig.logo}
              alt={siteConfig.name}
              className="h-11 w-auto"
              style={{ width: "auto", height: "44px" }}
            />
          </a>

          {/* Desktop + tablet links */}
          <div className="hidden items-center tb:flex">
            {siteConfig.nav.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="t-nav rounded-pill bg-surface-100/0 px-5 py-4 text-ink-600 transition-colors duration-200 hover:bg-surface-100"
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="hidden items-center gap-2 tb:flex">
            <Link
              to="/login"
              className="t-nav rounded-pill px-4 py-4 text-ink-600 transition-colors duration-200 hover:bg-surface-100"
            >
              Sign In
            </Link>
            <a
              href={siteConfig.cta.nav.href}
              className="t-nav rounded-pill bg-brand px-5 py-4 text-white transition-opacity duration-200 hover:opacity-90"
            >
              {siteConfig.cta.nav.label}
            </a>
          </div>

          {/* Phone menu button */}
          <button
            ref={buttonRef}
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls={menuId}
            aria-label={open ? "Close menu" : "Open menu"}
            className="flex h-[53px] w-16 items-center justify-center rounded-pill bg-brand transition-opacity duration-200 hover:opacity-90 tb:hidden"
          >
            <img src="/icons/menu.svg" alt="" width={24} height={25} aria-hidden="true" />
          </button>
        </div>
      </nav>

      {/* Phone dropdown panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            id={menuId}
            initial={{ opacity: 0, scale: 0.94, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: -8 }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.35 }}
            style={{ transformOrigin: "top right", boxShadow: "var(--shadow-menu)" }}
            className="absolute right-4 top-[127px] w-[200px] origin-top-right rounded-panel bg-surface-50 p-5 tb:hidden"
          >
            <ul className="flex flex-col items-start gap-4">
              {siteConfig.mobileNav.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="t-nav text-ink-700 transition-colors duration-200 hover:text-brand"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="t-nav text-ink-700 transition-colors duration-200 hover:text-brand"
                >
                  Sign In
                </Link>
              </li>
            </ul>
            <a
              href={siteConfig.cta.nav.href}
              onClick={() => setOpen(false)}
              className="t-nav mt-4 flex w-40 items-center justify-center rounded-pill bg-brand px-5 py-4 text-white transition-opacity duration-200 hover:opacity-90"
            >
              {siteConfig.cta.nav.label}
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
