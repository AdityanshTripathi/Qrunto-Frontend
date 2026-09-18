import { useEffect, useRef, useState } from "react";

/**
 * Infinite horizontal marquee using CSS keyframes on the compositor.
 */
export function Marquee({
  children,
  speed = 30,
  direction = "left",
  gap = 14,
  copies = 4,
  className = "",
}: {
  children: React.ReactNode[];
  speed?: number;
  direction?: "left" | "right";
  gap?: number;
  copies?: number;
  className?: string;
}) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const measure = () => {
      const copyWidth = (track.scrollWidth + gap) / copies;
      if (copyWidth > 0) setDuration(copyWidth / speed);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    return () => observer.disconnect();
  }, [copies, gap, speed]);

  const items = Array.from({ length: copies }, (_, copy) => ({ copy }));

  return (
    <div className={`w-full overflow-hidden ${className}`}>
      <ul
        ref={trackRef}
        className="flex w-max items-center"
        style={{
          gap: `${gap}px`,
          "--marquee-copies": String(copies),
          animationName: duration ? (direction === "left" ? "marquee-left" : "marquee-right") : "none",
          animationDuration: `${duration}s`,
          animationTimingFunction: "linear",
          animationIterationCount: "infinite",
          willChange: "transform",
        } as React.CSSProperties}
      >
        {items.map(({ copy }) =>
          children.map((child, i) => (
            <li key={`${copy}-${i}`} className="shrink-0" aria-hidden={copy > 0 || undefined}>
              {child}
            </li>
          )),
        )}
      </ul>
    </div>
  );
}
