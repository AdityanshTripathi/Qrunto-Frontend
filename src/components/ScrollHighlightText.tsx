import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ScrollHighlightProps {
  text?: string;
  className?: string;
  dimColor?: string;
  highlightColor?: string;
  accentWordColor?: string;
  accentWords?: string[];
  scrollStart?: string;
  scrollEnd?: string;
}

export const ScrollHighlightText: React.FC<ScrollHighlightProps> = ({
  text = "From the moment a customer scans the QR code to the moment the order reaches the kitchen, every part of your restaurant works together.",
  className = "",
  dimColor = "rgba(255, 255, 255, 0.18)",
  highlightColor = "#FFFFFF",
  accentWordColor = "#FF6B00",
  accentWords = ["QR", "code", "kitchen,", "works", "together."],
  scrollStart = "top 75%",
  scrollEnd = "bottom 45%",
}) => {
  const containerRef = useRef<HTMLParagraphElement>(null);
  const words = text.trim().split(/\s+/).filter(Boolean);

  useEffect(() => {
    const paragraph = containerRef.current;
    if (!paragraph) return;

    const targets = paragraph.querySelectorAll('.scroll-highlight-word');

    const ctx = gsap.context(() => {
      // Set initial dim color
      targets.forEach((target) => {
        gsap.set(target, { color: dimColor, opacity: 0.6 });
      });

      // Progressively illuminate each word on scroll
      targets.forEach((target, index) => {
        const isAccent = target.getAttribute('data-accent') === 'true';
        const targetColor = isAccent ? accentWordColor : highlightColor;

        gsap.to(target, {
          color: targetColor,
          opacity: 1,
          duration: 0.3,
          ease: 'power1.out',
          scrollTrigger: {
            trigger: paragraph,
            start: `${20 + (index / targets.length) * 50}% 80%`,
            end: `${30 + (index / targets.length) * 50}% 60%`,
            scrub: 0.5,
          },
        });
      });
    }, paragraph);

    return () => {
      ctx.revert();
    };
  }, [text, dimColor, highlightColor, accentWordColor, accentWords, scrollStart, scrollEnd]);

  return (
    <p
      ref={containerRef}
      className={`inline-block select-none ${className}`}
      style={{ color: dimColor }}
    >
      {words.map((word, index) => {
        const isAccent = accentWords.some((w) =>
          word.toLowerCase().replace(/[^a-z0-9]/g, '') === w.toLowerCase().replace(/[^a-z0-9]/g, '')
        );

        return (
          <React.Fragment key={`${word}-${index}`}>
            <span
              className="scroll-highlight-word inline-block transition-colors will-change-transform"
              data-accent={isAccent ? 'true' : 'false'}
              style={{ color: dimColor }}
            >
              {word}
            </span>
            {index < words.length - 1 ? ' ' : null}
          </React.Fragment>
        );
      })}
    </p>
  );
};

export default ScrollHighlightText;
