import { motion } from "motion/react";

import { capabilities } from "../data/home";
import { capabilityReveal } from "../lib/motion";

export function Capabilities() {
  return (
    <section
      aria-labelledby="capabilities-heading"
      className="mx-auto flex w-full flex-col items-center gap-[50px] tb:max-w-[622px] tb:gap-[60px] dk:max-w-none dk:flex-row-reverse dk:gap-[60px]"
    >
      <div className="flex w-full flex-col items-center gap-[30px] tb:items-start dk:max-w-[570px] dk:gap-10">
        <div className="flex w-full flex-col items-center gap-4 text-center tb:items-start tb:text-left dk:gap-5">
          <h2 id="capabilities-heading" className="t-h2">
            Powerful tools behind every order.
          </h2>
          <p className="t-body text-ink-400">
            Ordio gives your team the operational tools they need to manage every table, order and
            customer interaction in real time.
          </p>
        </div>

        <ul className="grid w-full grid-cols-1 gap-[14px] tb:grid-cols-2">
          {capabilities.map((capability) => (
            <li
              key={capability.label}
              className="flex items-center gap-[10px] rounded-tile bg-surface-50 p-[14px]"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-brand p-[10px]">
                <img
                  src={capability.icon}
                  alt=""
                  aria-hidden="true"
                  className="h-6 w-6 brightness-0 invert"
                />
              </span>
              <span className="font-ui text-base font-medium leading-6 text-ink-600">
                {capability.label}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <CapabilitiesShowcase />
    </section>
  );
}

function CapabilitiesShowcase() {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      className="relative aspect-[570/509] w-full overflow-hidden rounded-card dk:max-w-[570px]"
    >
      <img
        src="/backgrounds/capabilities-card.svg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full rounded-card object-cover"
      />

      <motion.div
        variants={capabilityReveal(0.2)}
        style={{ boxShadow: "var(--shadow-capability-card)" }}
        className="absolute left-[40.88%] top-[7.07%] w-[41.05%] overflow-hidden rounded-[15px]"
      >
        <img
          src="/illustrations/capabilities-card-tall.svg"
          alt="Order management panel"
          className="h-auto w-full"
        />
      </motion.div>

      <motion.div
        variants={capabilityReveal(0.3)}
        style={{ boxShadow: "var(--shadow-capability-card)" }}
        className="absolute left-[7.89%] top-[33.4%] w-[55.44%] overflow-hidden rounded-card"
      >
        <img
          src="/illustrations/capabilities-card-wide.svg"
          alt="Analytics and revenue panel"
          className="h-auto w-full"
        />
      </motion.div>
    </motion.div>
  );
}
