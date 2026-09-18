import { AnimatePresence, motion } from "motion/react";
import { useId, useState } from "react";

import type { FaqItem } from "../types/content";

/**
 * FAQ accordion. One panel open at a time.
 */
export function Accordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const baseId = useId();

  return (
    <div className="flex w-full flex-col gap-5 tb:gap-6">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const panelId = `${baseId}-panel-${index}`;
        const buttonId = `${baseId}-button-${index}`;

        return (
          <div key={item.question} className="w-full rounded-panel bg-surface-100">
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="flex w-full items-center gap-3 px-6 py-4 text-left tb:px-[30px]"
              >
                <span className="t-h3 flex-1">{item.question}</span>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-pill bg-ink-600">
                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                    className="flex"
                  >
                    <img src="/icons/plus.svg" alt="" width={24} height={24} aria-hidden="true" />
                  </motion.span>
                </span>
              </button>
            </h3>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.44, 0, 0.56, 1] }}
                  className="overflow-hidden"
                >
                  <p className="px-6 pb-4 pt-6 font-body text-[17px] font-medium leading-[25.5px] text-ink-500 tb:px-[30px]">
                    {item.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
