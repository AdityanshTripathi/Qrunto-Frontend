import type { PricingPlan } from "../types/content";

/**
 * Pricing plan card with patterned background, plan details, and feature list.
 */
export function PricingCard({
  plan,
  billing,
}: {
  plan: PricingPlan;
  billing: "monthly" | "yearly";
}) {
  const price = billing === "monthly" ? plan.priceMonthly : plan.priceYearly;
  const isContactUs = price === "Contact Us";

  return (
    <article className="relative flex w-full flex-col rounded-card p-[10px] tb:max-w-[360px]">
      <img
        src="/backgrounds/pricing-card.svg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full rounded-card object-cover"
      />

      {plan.tag && (
        <span
          style={{ boxShadow: "var(--shadow-price-tag)" }}
          className="absolute right-5 top-5 z-10 flex items-center rounded-pill bg-surface-50 px-3 py-[5px] font-ui text-sm font-medium leading-[21px] text-brand tb:text-[15px] tb:leading-[22.5px]"
        >
          {plan.tag}
        </span>
      )}

      <div className="relative flex flex-col gap-6 p-4 tb:p-5">
        <div className="flex flex-col gap-3">
          <h3 className="font-display text-[22px] font-bold leading-[33px] text-ink-900">
            {plan.name}
          </h3>
          <div className="flex flex-col gap-4">
            <p className="flex items-end gap-[6px]">
              <span
                className={`font-body font-semibold text-ink-800 ${
                  isContactUs
                    ? "text-[28px] leading-[36px]"
                    : "text-[58px] leading-[58px]"
                }`}
              >
                {price}
              </span>
              {!isContactUs && plan.period && (
                <span className="t-body text-ink-500">{plan.period}</span>
              )}
            </p>
            <p className="t-body text-ink-500">{plan.description}</p>
          </div>
        </div>

        <a
          href={plan.cta.href}
          className="flex w-full items-center justify-center rounded-pill bg-brand px-6 py-[14px] font-body text-lg font-semibold leading-[27px] text-white transition-opacity duration-200 hover:opacity-90"
        >
          {plan.cta.label}
        </a>
      </div>

      <div
        style={{ boxShadow: "var(--shadow-price-list)" }}
        className="relative flex flex-col gap-4 rounded-panel bg-white p-4 tb:p-6"
      >
        <p className="font-display text-lg font-bold leading-[27px] text-ink-800">
          What&apos;s Included
        </p>
        <ul className="flex flex-col gap-3">
          {plan.features.map((feature) => (
            <li key={feature.label} className="flex items-center gap-2">
              <img
                src={feature.included ? "/icons/check-active.svg" : "/icons/check-inactive.svg"}
                alt=""
                aria-hidden="true"
                className="h-[22px] w-[22px] shrink-0"
              />
              <span
                className={`font-ui text-base font-medium leading-6 ${
                  feature.included ? "text-ink-800" : "text-ink-300 line-through"
                }`}
              >
                {feature.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
