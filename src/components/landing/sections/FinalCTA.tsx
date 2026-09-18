import { motion } from "motion/react";

import { PhoneMock } from "../ui/PhoneMock";
import { siteConfig } from "../config/site";
import { buttonPress, ctaPhoneReveal } from "../lib/motion";

export function FinalCTA() {
  return (
    <section
      id="cta"
      aria-labelledby="cta-heading"
      className="relative flex w-full justify-center pt-[clamp(250px,40vw,450px)]"
    >
      <CtaArtwork />

      <div className="relative z-10 flex w-full flex-col items-center gap-10 tb:max-w-[795px]">
        <div className="flex w-full flex-col items-start gap-5 text-left tb:items-center tb:px-[50px] tb:text-center">
          <h2 id="cta-heading" className="t-h2">
            Run your restaurant smarter with Ordio.
          </h2>
          <p className="t-body text-ink-400">
            From orders and kitchen operations to inventory, CRM and analytics — manage your restaurant from one powerful platform.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 tb:flex-row">
          <a
            href={siteConfig.cta.hero.href}
            className="flex items-center justify-center rounded-pill bg-brand px-8 py-4 font-body text-lg font-semibold leading-[27px] text-white transition-opacity duration-200 hover:opacity-90"
          >
            <motion.span whileHover={buttonPress.whileHover} whileTap={buttonPress.whileTap}>
              {siteConfig.cta.hero.label}
            </motion.span>
          </a>
          <a
            href={siteConfig.cta.ctaSecondary.href}
            className="flex items-center justify-center rounded-pill border border-line bg-surface-100 px-8 py-4 font-body text-lg font-semibold leading-[27px] text-ink-700 transition-colors duration-200 hover:bg-surface-200"
          >
            {siteConfig.cta.ctaSecondary.label}
          </a>
        </div>
      </div>
    </section>
  );
}

function CtaArtwork() {
  return (
    <motion.div
      aria-hidden="true"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      className="pointer-events-none absolute left-1/2 top-0 flex w-full max-w-[1200px] -translate-x-1/2 items-end justify-center pt-8"
    >
      {/* Dotted backdrop */}
      <div className="absolute inset-x-0 top-0 h-[600px] overflow-hidden">
        <img
          src="/backgrounds/cta-dots.svg"
          alt=""
          className="absolute left-1/2 top-0 max-w-none -translate-x-1/2 opacity-70"
        />
      </div>

      <div className="relative z-0 flex w-full items-end justify-center px-4 tb:gap-6 dk:gap-10">
        {/* Side phone Left */}
        <motion.div
          variants={ctaPhoneReveal(-15)}
          className="hidden tb:block relative w-[240px] shrink-0 dk:w-[280px] [--w:100%]"
          style={{ marginBottom: "20px" }}
        >
          <PhoneMock screen="/images/app-cta-left.png" alt="Menu Management" priority showNotch={false} />
        </motion.div>

        {/* Center phone */}
        <div className="relative w-[85vw] max-w-[320px] shrink-0 dk:max-w-[380px] [--w:100%]">
          <PhoneMock screen="/images/app-cta-center.png" alt="Restaurant Dashboard" priority showNotch={false} />
        </div>

        {/* Side phone Right */}
        <motion.div
          variants={ctaPhoneReveal(15)}
          className="hidden tb:block relative w-[240px] shrink-0 dk:w-[280px] [--w:100%]"
          style={{ marginBottom: "20px" }}
        >
          <PhoneMock screen="/images/app-cta-right.png" alt="Business Analytics" priority showNotch={false} />
        </motion.div>
      </div>

      {/* Cream fade */}
      <span className="absolute inset-x-0 bottom-0 z-20 h-[300px] bg-[linear-gradient(to_top,#fff8f0_20%,rgba(255,248,240,0)_100%)]" />
    </motion.div>
  );
}
