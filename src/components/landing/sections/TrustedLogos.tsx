import { Marquee } from "../ui/Marquee";
import { restaurantCategories } from "../data/home";

export function TrustedLogos() {
  return (
    <div className="flex w-full max-w-[826px] flex-col items-center gap-5 px-4 tb:px-0">
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="t-body font-semibold text-ink-800">
          Built for modern restaurants &amp; cafés
        </p>
        <p className="t-body text-ink-400">One platform for ordering, operations and growth.</p>
      </div>

      <div className="relative flex h-[45px] w-full items-center">
        <Marquee speed={30} gap={14} copies={4}>
          {restaurantCategories.map((category) => (
            <span
              key={category}
              className="flex h-[42px] shrink-0 items-center rounded-pill border border-line bg-surface-100 px-5 font-ui text-base font-semibold text-ink-600"
            >
              {category}
            </span>
          ))}
        </Marquee>
      </div>
    </div>
  );
}
