import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

import { featureCards } from "../data/home";

const CYCLE_MS = 3000;

const SWAP: import("motion/react").Transition = {
  type: "spring",
  stiffness: 500,
  damping: 60,
  mass: 1,
};

const CATEGORIES = ["Inventory", "CRM & Loyalty", "Marketing"];

/**
 * Key Features product shot with auto-cycling cards and tab bar.
 */
export function FeatureShowcase() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % featureCards.length);
    }, CYCLE_MS);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="relative flex w-full flex-col gap-6 dk:w-1/2 dk:max-w-[600px] shrink-0">

      {/* Desktop/Tablet: Category Tab Bar */}
      <div className="hidden tb:flex items-center gap-2 self-center rounded-pill bg-surface-100 p-1.5 border border-line">
        {CATEGORIES.map((cat, i) => (
          <button
            key={cat}
            type="button"
            onClick={() => setIndex(i)}
            className={`cursor-pointer rounded-pill px-4 py-2 font-ui text-sm font-semibold transition-colors duration-300 ${
              i === index
                ? "bg-brand text-white shadow-sm"
                : "bg-transparent text-ink-500 hover:text-ink-900"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Desktop/Tablet: Rotating Card */}
      <div className="hidden tb:flex relative w-full justify-center">
        <div className="relative w-full max-w-[500px] overflow-hidden rounded-[24px] border border-line bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
          <AnimatePresence mode="wait">
            <motion.div
              key={featureCards[index]}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0, transition: SWAP }}
              exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
              className="relative flex w-full"
            >
              <img
                src={featureCards[index]}
                alt="Ordio restaurant ordering interface"
                className="h-auto w-full object-contain object-top"
                style={{ width: "100%", height: "auto" }}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile: Horizontal Swipe Carousel */}
      <div className="flex w-full snap-x snap-mandatory overflow-x-auto gap-4 px-4 pb-6 -mx-4 tb:hidden">
        {featureCards.map((card, i) => (
          <div key={card} className="w-[85vw] shrink-0 snap-center flex flex-col gap-4">
            <div className="flex w-full items-center justify-center rounded-pill bg-surface-100 p-2 border border-line">
              <span className="font-ui text-sm font-semibold text-brand">{CATEGORIES[i]}</span>
            </div>
            <div className="relative w-full overflow-hidden rounded-[20px] border border-line bg-white shadow-md">
              <img
                src={card}
                alt={CATEGORIES[i]}
                className="h-auto w-full object-contain object-top"
                style={{ width: "100%", height: "auto" }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
