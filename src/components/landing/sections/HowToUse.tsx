import { motion } from "motion/react";

import { SectionHeader } from "../ui/SectionHeader";
import { howToUseSteps } from "../data/home";
import { washReveal } from "../lib/motion";

export function HowToUse() {
  return (
    <section
      id="how-to-use"
      aria-labelledby="how-to-use-heading"
      className="flex w-full flex-col items-center gap-[50px] tb:gap-[60px]"
    >
      <SectionHeader
        headingId="how-to-use-heading"
        label="How It Works"
        labelIcon="/icons/label-how-to-use.svg"
        heading="From QR scan to payment in seconds."
        paragraph="Ordio connects customers, waiters and restaurant operations in four simple steps."
        paragraphInset="tb:px-[180px] dk:px-[320px]"
      />

      <ol className="flex w-full snap-x snap-mandatory overflow-x-auto gap-5 pb-6 px-4 -mx-4 tb:mx-0 tb:px-0 tb:grid tb:max-w-none tb:grid-cols-2 dk:grid-cols-4 tb:overflow-visible tb:pb-0">
        {howToUseSteps.map((step, i) => (
          <li key={step.title} className="w-[85vw] shrink-0 snap-center tb:w-full">
            <article className="relative flex h-full min-h-[480px] w-full flex-col justify-between overflow-hidden rounded-card bg-[#FBF8F5] shadow-sm ring-1 ring-ink-900/5">
              <img
                src="/backgrounds/how-to-use-card.svg"
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 h-full w-full rounded-card object-cover"
              />

              <motion.span
                aria-hidden="true"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
                variants={washReveal}
                className="pointer-events-none absolute inset-x-0 bottom-0 h-[70%] bg-[linear-gradient(to_bottom,rgba(201,90,50,0),rgba(201,90,50,0.18))]"
              />

              <div className="relative z-10 flex flex-col items-center px-6 pb-6 pt-8 text-center tb:px-5">
                <span className="mb-2 block font-display text-[13px] font-bold uppercase tracking-widest text-brand">
                  0{i + 1} — {["Scan", "Order", "Serve", "Pay"][i]}
                </span>
                <h3 className="t-h3 mb-2">{step.title}</h3>
                <p className="t-body text-sm text-ink-600">{step.description}</p>
              </div>

              <div className="relative z-10 flex w-full flex-1 justify-center px-[5%]">
                <div className="relative mt-auto w-full overflow-hidden rounded-t-[18px] border-t border-x border-line bg-white shadow-xl">
                  <img
                    src={step.screen}
                    alt={step.screenAlt}
                    className="h-auto w-full object-contain object-top"
                    style={{ width: "100%", height: "auto" }}
                  />
                </div>
              </div>
            </article>
          </li>
        ))}
      </ol>
    </section>
  );
}
