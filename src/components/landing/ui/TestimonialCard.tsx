import type { Testimonial } from "../types/content";

/**
 * Product capability card with patterned background and branded icon.
 */
export function TestimonialCard({
  testimonial,
  className = "",
}: {
  testimonial: Testimonial;
  className?: string;
}) {
  return (
    <article
      className={`relative flex flex-col justify-between gap-4 overflow-hidden rounded-card p-6 tb:p-[26px] ${className}`}
    >
      <img
        src="/backgrounds/testimonial-card.svg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full rounded-card object-cover"
      />

      <div className="relative flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-pill bg-brand p-2.5 shadow-sm">
            <img
              src={testimonial.avatar}
              alt=""
              aria-hidden="true"
              className="h-[22px] w-[22px] brightness-0 invert"
            />
          </span>
          <div className="flex flex-col">
            <h3 className="font-display text-lg font-bold leading-tight text-ink-900">
              {testimonial.name}
            </h3>
            {testimonial.category && (
              <span className="font-ui text-xs font-semibold uppercase tracking-wider text-brand">
                {testimonial.category}
              </span>
            )}
          </div>
        </div>
      </div>

      <span aria-hidden="true" className="relative h-px w-full bg-line/80" />

      <p className="t-body relative text-sm leading-relaxed text-ink-600">
        {testimonial.quote}
      </p>
    </article>
  );
}
