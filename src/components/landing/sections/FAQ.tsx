import { Accordion } from "../ui/Accordion";
import { faqs } from "../data/home";

export function FAQ() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="flex w-full flex-col items-center gap-[50px] tb:gap-[60px]"
    >
      <div className="flex w-full flex-col items-center gap-3 tb:gap-[14px] tb:max-w-[794px]">
        <span className="pill-label">
          <img src="/icons/label-faq.svg" alt="" width={20} height={20} aria-hidden="true" />
          <span className="t-label">FAQ's</span>
        </span>
        <h2 id="faq-heading" className="t-h2 text-center">
          Frequently Asked Questions
        </h2>
      </div>

      <div className="w-full tb:max-w-[794px]">
        <Accordion items={faqs} />
      </div>
    </section>
  );
}
