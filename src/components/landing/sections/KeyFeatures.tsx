import { FeatureShowcase } from "../ui/FeatureShowcase";
import { featureHighlights, allFeatures } from "../data/home";

export function KeyFeatures() {
  return (
    <section
      id="feature"
      aria-labelledby="feature-heading"
      className="mx-auto flex w-full flex-col items-center gap-[50px] tb:max-w-[622px] tb:gap-[60px] dk:max-w-none dk:flex-row dk:gap-[60px]"
    >
      <div className="flex w-full flex-col items-center gap-[30px] tb:items-start dk:max-w-[570px] dk:gap-10">
        <div className="flex w-full flex-col items-center gap-6 tb:items-start dk:gap-[30px]">
          <h2 id="feature-heading" className="t-h2 text-center tb:text-left">
            Everything your restaurant needs.
          </h2>
          <p className="t-body text-center text-ink-400 tb:text-left">
            From the first scan to the final payment, Ordio connects every part of the dining
            experience.
          </p>

          <ul className="flex w-full flex-col items-stretch gap-4 tb:items-start">
            {featureHighlights.map((item) => (
              <li
                key={item.label}
                className="flex items-center justify-center gap-[5px] rounded-tile bg-surface-100 py-2 pl-[10px] pr-[18px] tb:w-auto tb:self-start tb:rounded-pill"
              >
                <img
                  src={item.icon}
                  alt=""
                  aria-hidden="true"
                  className="h-6 w-6 shrink-0"
                />
                <span className="font-ui text-base font-medium leading-6 text-ink-700">
                  {item.label}
                </span>
              </li>
            ))}
          </ul>

          <ul className="grid w-full grid-cols-2 gap-x-4 gap-y-2 tb:grid-cols-2">
            {allFeatures.map((feature) => (
              <li key={feature} className="flex items-center gap-2 font-ui text-sm text-ink-600">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand" aria-hidden="true" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <a
          href="/#cta"
          className="flex items-center justify-center gap-2 self-center rounded-pill bg-brand px-6 py-4 font-body text-base font-semibold leading-6 text-white transition-opacity duration-200 hover:opacity-90 tb:self-start"
        >
          Explore Ordio
          <img src="/icons/arrow-right.svg" alt="" width={18} height={18} aria-hidden="true" />
        </a>
      </div>

      <FeatureShowcase />
    </section>
  );
}
