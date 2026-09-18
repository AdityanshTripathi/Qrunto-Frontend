import { SectionHeader } from "../ui/SectionHeader";
import { benefits } from "../data/home";

export function Benefits() {
  return (
    <section
      id="benefits"
      aria-labelledby="benefits-heading"
      className="flex w-full flex-col gap-[50px] tb:gap-[60px] dk:gap-20"
    >
      <SectionHeader
        headingId="benefits-heading"
        label="Why Ordio"
        labelIcon="/icons/label-benefits.svg"
        heading="Built to make restaurants run better."
        paragraph="From faster ordering to smarter operations — every feature is designed to help restaurants deliver a better experience."
        paragraphInset="tb:px-[180px] dk:px-[320px]"
      />

      <ul className="flex w-full snap-x snap-mandatory overflow-x-auto gap-5 pb-6 px-4 -mx-4 tb:mx-0 tb:px-0 tb:grid tb:grid-cols-2 dk:grid-cols-3 tb:overflow-visible tb:pb-0">
        {benefits.map((benefit) => (
          <li
            key={benefit.title}
            className="group relative flex w-[85vw] shrink-0 snap-center flex-col items-center gap-6 overflow-hidden rounded-card px-6 py-[30px] tb:w-full tb:gap-[30px] tb:px-[30px] tb:py-10"
          >
            <img
              src="/backgrounds/benefit-card.svg"
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full rounded-card object-cover"
            />

            <span
              style={{ boxShadow: "var(--shadow-benefit-icon)" }}
              className="relative flex h-[62px] w-[62px] shrink-0 items-center justify-center rounded-pill transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1"
            >
              <img
                src="/backgrounds/benefit-icon.svg"
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full rounded-pill object-cover"
              />
              <img
                src={benefit.icon}
                alt=""
                aria-hidden="true"
                className="relative h-[34px] w-[34px]"
              />
            </span>

            <div className="relative flex flex-col items-center gap-[6px] text-center">
              <h3 className="t-h3">{benefit.title}</h3>
              <p className="t-body text-ink-400">{benefit.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
