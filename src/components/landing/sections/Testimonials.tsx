import { Marquee } from "../ui/Marquee";
import { SectionHeader } from "../ui/SectionHeader";
import { TestimonialCard } from "../ui/TestimonialCard";
import { testimonialsMobile, testimonialsRowOne, testimonialsRowTwo } from "../data/home";

export function Testimonials() {
  return (
    <section
      id="testimonials"
      aria-labelledby="testimonials-heading"
      className="flex w-full flex-col items-center gap-[50px] tb:gap-20"
    >
      <SectionHeader
        headingId="testimonials-heading"
        label="Platform"
        labelIcon="/icons/label-testimonials.svg"
        heading="Built around the way modern restaurant teams work."
        paragraph="Ordio brings customers, waiters and restaurant operations together in one connected platform."
        paragraphInset="px-4 tb:px-[180px] dk:px-[320px]"
      />

      {/* Tablet + desktop: two marquee rows */}
      <div className="hidden w-full flex-col gap-5 tb:flex">
        <Marquee speed={40} direction="left" gap={20} copies={3}>
          {testimonialsRowOne.map((t) => (
            <TestimonialCard key={t.name} testimonial={t} className="h-[280px] w-[345px]" />
          ))}
        </Marquee>
        <Marquee speed={40} direction="right" gap={20} copies={3}>
          {testimonialsRowTwo.map((t) => (
            <TestimonialCard key={t.name} testimonial={t} className="h-[280px] w-[345px]" />
          ))}
        </Marquee>
      </div>

      {/* Phone: stacked cards */}
      <div className="flex w-full flex-col items-center gap-5 tb:hidden">
        {testimonialsMobile.map((t) => (
          <TestimonialCard key={t.name} testimonial={t} className="h-[247px] w-full" />
        ))}
        <p className="flex items-center gap-1 font-ui text-lg font-semibold leading-[27px] text-ink-600">
          Ordio — Restaurant Ordering & Operations
          <img src="/icons/arrow-up-right.svg" alt="" width={20} height={20} aria-hidden="true" />
        </p>
      </div>
    </section>
  );
}
