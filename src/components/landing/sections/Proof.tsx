import { valueProps } from "../data/home";

export function Proof() {
  return (
    <section
      aria-labelledby="proof-heading"
      className="flex w-full flex-col items-center gap-10 tb:gap-[50px] dk:gap-[70px]"
    >
      <div className="flex w-full justify-center dk:px-[120px]">
        <h2 id="proof-heading" className="t-h2 text-center">
          Everything your restaurant needs, in one platform.
        </h2>
      </div>

      <ul className="flex w-full max-w-[317px] flex-col items-center gap-5 tb:max-w-none tb:flex-row tb:items-stretch">
        {valueProps.map((prop) => (
          <li
            key={prop.title}
            className="relative flex w-full flex-col items-center justify-center gap-4 overflow-hidden rounded-card bg-surface-50 px-6 py-[30px] text-center tb:px-[30px] tb:py-10"
          >
            <img
              src="/backgrounds/proof-dots.svg"
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 w-[587px] max-w-none -translate-x-1/2 -translate-y-1/2 object-contain opacity-50"
            />
            <span className="relative flex h-14 w-14 items-center justify-center rounded-pill bg-brand p-3">
              <img
                src={prop.icon}
                alt=""
                aria-hidden="true"
                className="h-7 w-7 brightness-0 invert"
              />
            </span>
            <div className="relative flex flex-col gap-2">
              <p className="font-display text-[22px] font-bold leading-[30px] text-ink-800">
                {prop.title}
              </p>
              <p className="t-body max-w-[280px] text-ink-400">{prop.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
