import { Link } from "react-router-dom";

import { siteConfig } from "../config/site";

/**
 * Footer with email pill, nav links, social buttons, and legal links.
 */
export function Footer() {
  return (
    <footer className="flex w-full justify-center bg-hero px-4 tb:px-[30px] dk:px-0">
      <div className="flex w-full max-w-[750px] flex-col gap-[30px] tb:gap-[50px] dk:max-w-[1200px]">
        {/* Email pill between two rules */}
        <div className="flex items-center gap-[30px]">
          <span aria-hidden="true" className="h-px flex-1 bg-line" />
          <a
            href={`mailto:${siteConfig.contact.email}`}
            className="flex shrink-0 items-center gap-1 rounded-pill bg-surface-100 px-4 py-3 transition-colors duration-200 hover:bg-surface-300"
          >
            <img src="/icons/mail.svg" alt="" width={24} height={24} aria-hidden="true" />
            <span className="t-body text-ink-700">{siteConfig.contact.email}</span>
          </a>
          <span aria-hidden="true" className="h-px flex-1 bg-line" />
        </div>

        <div className="flex flex-col items-center gap-[30px] tb:gap-[40px]">
          {/* Logo */}
          <a href="/#hero" aria-label={`${siteConfig.name} home`}>
            <img
              src={siteConfig.logo}
              alt={siteConfig.name}
              className="h-10 w-auto"
              style={{ width: "auto", height: "40px" }}
            />
          </a>

          {/* Section links */}
          <nav aria-label="Footer">
            <ul className="flex flex-wrap items-center justify-center gap-[10px] tb:gap-[18px]">
              {siteConfig.footerNav.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="group block overflow-hidden rounded-pill bg-surface-100 px-5 py-[14px] transition-colors duration-200 hover:bg-surface-300"
                  >
                    <span className="relative block h-6 overflow-hidden dk:h-[27px]">
                      <span className="t-body block text-ink-600 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-full">
                        {link.label}
                      </span>
                      <span
                        aria-hidden="true"
                        className="t-body absolute left-0 top-full block text-ink-600 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-full"
                      >
                        {link.label}
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Bottom bar */}
          <div className="flex flex-col items-center gap-6 p-[30px] tb:flex-row tb:justify-between tb:gap-0 w-full">
            <span className="t-body text-ink-400">
              {siteConfig.credit.label}
            </span>

            <ul className="flex items-center gap-[10px]">
              {siteConfig.social.map((social) => (
                <li key={social.href}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="flex h-11 w-11 items-center justify-center rounded-pill bg-ink-700 transition-colors duration-200 hover:bg-brand"
                  >
                    <img src={social.icon} alt="" width={24} height={24} aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-4">
              <Link
                to={siteConfig.legal.privacyPolicy.href}
                className="t-body text-ink-700 transition-colors duration-200 hover:text-brand"
              >
                {siteConfig.legal.privacyPolicy.label}
              </Link>
              <span className="text-ink-300">•</span>
              <Link
                to={siteConfig.legal.termsOfService.href}
                className="t-body text-ink-700 transition-colors duration-200 hover:text-brand"
              >
                {siteConfig.legal.termsOfService.label}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
