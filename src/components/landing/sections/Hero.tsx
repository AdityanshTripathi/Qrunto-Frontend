import { motion } from "motion/react";

import { PhoneMock } from "../ui/PhoneMock";
import { siteConfig } from "../config/site";
import { buttonPress, heroAppear, type AppearSpec } from "../lib/motion";

const offsetTransform = (_: unknown, generated: string) =>
  `translate(var(--tx), var(--ty)) ${generated}`;

/**
 * Hero section with headline, CTAs, three-phone fan, and floating UI chips.
 */
export function Hero({ children }: { children?: React.ReactNode }) {
  return (
    <section
      id="hero"
      className="relative flex w-full flex-col items-center gap-[60px] tb:gap-[50px]"
    >
      <div
        style={{ boxShadow: "var(--shadow-hero-panel)" }}
        className="relative flex w-full flex-col items-center gap-[30px] rounded-b-[50px] px-4 pt-[175px] tb:gap-10 tb:px-0 dk:gap-[55px]"
      >
        {/* Background stack */}
        <div aria-hidden="true" className="absolute inset-0 overflow-hidden rounded-b-[50px]">
          <div className="absolute inset-0 bg-hero" />
          <motion.div
            className="absolute inset-0"
            initial={heroAppear.dots.initial}
            animate={heroAppear.dots.animate}
          >
            <img
              src="/backgrounds/hero-dots.svg"
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          </motion.div>
          <div className="absolute inset-0 bg-[radial-gradient(100%_100%_at_50%_0%,#fff8f0_15%,rgba(255,248,240,0)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-[279px] bg-[linear-gradient(to_bottom,rgba(201,90,50,0),rgba(201,90,50,0.15))]" />
          <div className="absolute inset-x-0 bottom-0 h-[118px] bg-[linear-gradient(to_bottom,rgba(201,90,50,0),rgba(201,90,50,0.08))]" />
        </div>

        {/* Copy */}
        <div className="relative flex w-full max-w-[1145px] flex-col items-center gap-[30px] tb:gap-10">
          <div className="flex w-full flex-col items-center gap-4">
            <motion.div initial={heroAppear.tag.initial} animate={heroAppear.tag.animate}>
              <div
                style={{ boxShadow: "var(--shadow-tag)" }}
                className="flex items-center gap-1 rounded-pill bg-surface-200 py-[6px] pl-3 pr-3"
              >
                <span className="flex items-center gap-2">
                  <span className="rounded-pill bg-brand px-2.5 py-[3px] font-body text-xs font-bold uppercase tracking-wider text-white">
                    Platform
                  </span>
                  <span className="font-body text-xs font-semibold uppercase tracking-wider text-ink-700 tb:text-[13px]">
                    {siteConfig.eyebrow}
                  </span>
                </span>
              </div>
            </motion.div>

            <div className="flex w-full flex-col items-center justify-center gap-5 text-center dk:px-[100px]">
              <motion.h1
                className="t-h1 max-w-[945px]"
                initial={heroAppear.headline.initial}
                animate={heroAppear.headline.animate}
              >
                {siteConfig.tagline}
              </motion.h1>
              <motion.div
                className="flex w-full justify-center dk:px-[200px]"
                initial={heroAppear.paragraphWrap.initial}
                animate={heroAppear.paragraphWrap.animate}
              >
                <motion.p
                  className="t-lead"
                  initial={heroAppear.paragraph.initial}
                  animate={heroAppear.paragraph.animate}
                >
                  {siteConfig.description}
                </motion.p>
              </motion.div>
            </div>
          </div>

          <div className="flex w-full flex-col items-center gap-5 tb:gap-6">
            <div className="flex flex-col items-center gap-4 tb:flex-row">
              <motion.a
                href={siteConfig.cta.hero.href}
                className="flex items-center justify-center rounded-pill bg-brand px-6 py-4 font-body text-lg font-semibold leading-[27px] text-white transition-opacity duration-200 hover:opacity-90"
                initial={heroAppear.ctaButton.initial}
                animate={heroAppear.ctaButton.animate}
                whileHover={buttonPress.whileHover}
                whileTap={buttonPress.whileTap}
              >
                {siteConfig.cta.hero.label}
              </motion.a>
              <motion.a
                href={siteConfig.cta.heroSecondary.href}
                className="flex items-center justify-center rounded-pill border border-line bg-surface-100 px-6 py-4 font-body text-lg font-semibold leading-[27px] text-ink-700 transition-colors duration-200 hover:bg-surface-200"
                initial={heroAppear.ctaButton.initial}
                animate={heroAppear.ctaButton.animate}
                whileHover={buttonPress.whileHover}
                whileTap={buttonPress.whileTap}
              >
                {siteConfig.cta.heroSecondary.label}
              </motion.a>
            </div>

            {/* Trust / Benefit row */}
            <motion.div
              className="flex flex-wrap items-center justify-center gap-2 tb:gap-3"
              initial={heroAppear.figmaNote.initial}
              animate={heroAppear.figmaNote.animate}
            >
              {["QR Ordering", "Live KOT", "Inventory", "CRM & Analytics"].map((item) => (
                <span
                  key={item}
                  className="flex items-center gap-1.5 rounded-pill border border-line/80 bg-white/80 px-3.5 py-1.5 font-body text-sm font-semibold text-ink-700 shadow-sm backdrop-blur-sm"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden="true" />
                  {item}
                </span>
              ))}
            </motion.div>
          </div>
        </div>

        <HeroDevices />
      </div>

      {children}
    </section>
  );
}

function HeroDevices() {
  return (
    <>
      {/* Mobile layout: Swipe carousel */}
      <div className="flex w-full snap-x snap-mandatory overflow-x-auto gap-4 px-4 pb-10 tb:hidden" aria-hidden="true">
        <div className="w-[85vw] shrink-0 snap-center [--w:100%]">
          <PhoneMock screen="/images/app-hero-center.png" alt="The Rooftree Digital Menu" priority showNotch={false} />
        </div>
        <div className="w-[85vw] shrink-0 snap-center [--w:100%]">
          <PhoneMock screen="/images/app-hero-left.png" alt="Point of Sale Order Management" priority showNotch={false} />
        </div>
        <div className="w-[85vw] shrink-0 snap-center [--w:100%]">
          <PhoneMock screen="/images/app-hero-right.png" alt="Order Tracking and Status" priority showNotch={false} />
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden tb:block hero-stage relative" aria-hidden="true">
        <motion.div
          className="hero-layer hero-phone-side hero-phone-left"
          initial={heroAppear.phoneLeft.initial}
          animate={heroAppear.phoneLeft.animate}
          transformTemplate={offsetTransform}
        >
          <PhoneMock screen="/images/app-hero-left.png" alt="Point of Sale Order Management" priority showNotch={false} />
        </motion.div>

        <motion.div
          className="hero-layer hero-phone-side hero-phone-right"
          initial={heroAppear.phoneRight.initial}
          animate={heroAppear.phoneRight.animate}
          transformTemplate={offsetTransform}
        >
          <PhoneMock screen="/images/app-hero-right.png" alt="Order Tracking and Status" priority showNotch={false} />
        </motion.div>

        <motion.div
          className="hero-layer hero-phone-center"
          initial={heroAppear.phoneCenter.initial}
          animate={heroAppear.phoneCenter.animate}
          transformTemplate={offsetTransform}
        >
          <PhoneMock screen="/images/app-hero-center.png" alt="The Rooftree Digital Menu" priority showNotch={false} />
        </motion.div>

        {/* Floating UI chips */}
        <HeroChip
          className="hero-chip hero-chip-liked"
          src="/illustrations/hero-badge-liked.svg"
          width={157}
          height={44}
          radius={100}
          shadow="var(--shadow-hero-pill)"
          appear={heroAppear.chipEarly}
        />
        <HeroChip
          className="hero-chip hero-chip-message"
          src="/illustrations/hero-card-message.svg"
          width={279}
          height={111}
          radius={16}
          shadow="var(--shadow-hero-card)"
          appear={heroAppear.chipLate}
        />
        <HeroChip
          className="hero-chip hero-chip-profile"
          src="/illustrations/hero-card-profile.svg"
          width={216}
          height={63}
          radius={10}
          shadow="var(--shadow-hero-bar)"
          appear={heroAppear.chipLate}
        />
        <HeroChip
          className="hero-chip hero-chip-tabs"
          src="/illustrations/hero-badge-tabs.svg"
          width={234}
          height={44}
          radius={74}
          shadow="var(--shadow-hero-tab)"
          appear={heroAppear.chipEarly}
        />
      </div>
    </>
  );
}

function HeroChip({
  className,
  src,
  width,
  height,
  radius,
  shadow,
  appear,
}: {
  className: string;
  src: string;
  width: number;
  height: number;
  radius: number;
  shadow: string;
  appear: AppearSpec;
}) {
  return (
    <motion.div
      className={`hero-layer ${className}`}
      style={{ boxShadow: shadow, borderRadius: radius }}
      initial={appear.initial}
      animate={appear.animate}
      transformTemplate={offsetTransform}
    >
      <img
        src={src}
        alt=""
        width={width}
        height={height}
        className="h-auto w-full"
        style={{ borderRadius: radius, width: "100%", height: "auto" }}
      />
    </motion.div>
  );
}
