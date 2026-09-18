/**
 * Central Ordio site configuration for the landing page.
 */

export interface NavLink {
  label: string;
  href: string;
}

export interface SocialLink {
  label: string;
  href: string;
  icon: string;
}

export const siteConfig = {
  name: "Ordio",
  tagline: "Everything your restaurant needs. All in one place.",
  eyebrow: "RESTAURANT OPERATIONS, SIMPLIFIED",
  description:
    "Ordio brings ordering, kitchen operations, tables, inventory, CRM and analytics together in one powerful restaurant platform.",
  url: "https://ordio.in",
  logo: "/logos/ordio-logo.png",
  logoMark: "/favicon.png",
  ogImage: "/images/app-hero-center.png",
  twitterHandle: "@ordio_app",

  contact: {
    email: "hello@ordio.in",
  },

  nav: [
    { label: "Product", href: "/#feature" },
    { label: "Features", href: "/#benefits" },
    { label: "How It Works", href: "/#how-to-use" },
    { label: "Pricing", href: "/#pricing" },
    { label: "Contact", href: "mailto:hello@ordio.in" },
  ] satisfies NavLink[],

  mobileNav: [
    { label: "Home", href: "/#hero" },
    { label: "Product", href: "/#feature" },
    { label: "Features", href: "/#benefits" },
    { label: "How It Works", href: "/#how-to-use" },
    { label: "Pricing", href: "/#pricing" },
    { label: "Contact", href: "mailto:hello@ordio.in" },
  ] satisfies NavLink[],

  footerNav: [
    { label: "Product", href: "/#feature" },
    { label: "Features", href: "/#benefits" },
    { label: "How It Works", href: "/#how-to-use" },
    { label: "Pricing", href: "/#pricing" },
    { label: "Contact", href: "mailto:hello@ordio.in" },
  ] satisfies NavLink[],

  cta: {
    nav: { label: "Get Started", href: "/#cta" },
    hero: { label: "Get Started", href: "/#cta" },
    heroSecondary: { label: "See How It Works", href: "/#how-to-use" },
    ctaSecondary: { label: "Explore Ordio", href: "/#feature" },
  },

  social: [
    { label: "LinkedIn", href: "https://in.linkedin.com/", icon: "/icons/linkedin.svg" },
    { label: "X", href: "https://x.com", icon: "/icons/x.svg" },
    { label: "Instagram", href: "https://www.instagram.com/", icon: "/icons/instagram.svg" },
  ] satisfies SocialLink[],

  legal: {
    privacyPolicy: { label: "Privacy Policy", href: "/privacy" },
    termsOfService: { label: "Terms of Service", href: "/terms" },
    lastUpdated: "Last Updated on January, 1, 2025",
  },

  credit: {
    label: "© 2025 Ordio. All rights reserved.",
    href: "",
  },
} as const;

export type SiteConfig = typeof siteConfig;
