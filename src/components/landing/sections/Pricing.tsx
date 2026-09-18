import { useState } from "react";

import { PricingCard } from "../ui/PricingCard";
import { SectionHeader } from "../ui/SectionHeader";
import { pricingPlans } from "../data/home";

type Billing = "monthly" | "yearly";

const OPTIONS: { value: Billing; label: string }[] = [
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

export function Pricing() {
  const [billing, setBilling] = useState<Billing>("monthly");

  return (
    <section
      id="pricing"
      aria-labelledby="pricing-heading"
      className="flex w-full flex-col items-center gap-[50px] tb:gap-[60px]"
    >
      <div className="w-full tb:max-w-[835px]">
        <SectionHeader
          headingId="pricing-heading"
          label="Pricing"
          labelIcon="/icons/label-pricing.svg"
          heading="Plans that grow with your restaurant."
          paragraph="Simple pricing for restaurants of every size. Contact us to find the right plan."
          paragraphInset="tb:px-[180px]"
        />
      </div>

      <div className="flex w-full flex-col items-center gap-10 tb:max-w-none">
        <div
          role="radiogroup"
          aria-label="Billing period"
          style={{ boxShadow: "inset 1px 1px 4px rgba(255,255,255,0.08)" }}
          className="flex items-center rounded-[1000px] bg-surface-100 p-2"
        >
          {OPTIONS.map((option) => {
            const active = billing === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setBilling(option.value)}
                style={active ? { boxShadow: "var(--shadow-toggle)" } : undefined}
                className={`t-body rounded-pill px-6 py-3 transition-colors duration-300 ${
                  active ? "bg-white text-ink-900" : "bg-white/0 text-ink-500"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <div className="flex w-full flex-col items-stretch gap-5 tb:flex-row tb:justify-center">
          {pricingPlans.map((plan) => (
            <PricingCard key={plan.name} plan={plan} billing={billing} />
          ))}
        </div>
      </div>
    </section>
  );
}
