/**
 * Phone device mock — bezel SVG with an app screenshot inset.
 * Adapted from Next.js Image to standard <img> for Vite.
 */
export function PhoneMock({
  screen,
  alt,
  width,
  priority = false,
  className = "",
  showNotch = true,
}: {
  screen: string;
  alt: string;
  width?: number;
  priority?: boolean;
  className?: string;
  sizes?: string;
  showNotch?: boolean;
}) {
  const w = width ? `${width}px` : "var(--w)";

  return (
    <div
      className={`relative shrink-0 ${className}`}
      style={{
        width: w,
        aspectRatio: "364 / 736",
        borderRadius: `calc(${w} * 0.1236)`,
      }}
    >
      <img
        src="/illustrations/phone-frame.svg"
        alt=""
        aria-hidden="true"
        loading={priority ? "eager" : "lazy"}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ borderRadius: `calc(${w} * 0.1236)` }}
      />
      <div
        className="absolute overflow-hidden"
        style={{
          inset: `calc(${w} * 0.03846) calc(${w} * 0.04396)`,
          borderRadius: `calc(${w} * 0.1236)`,
        }}
      >
        <img
          src={screen}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          className="absolute inset-0 h-full w-full object-cover"
        />
        {showNotch && (
          <img
            src="/illustrations/phone-notch.svg"
            alt=""
            aria-hidden="true"
            className="absolute left-1/2 -translate-x-1/2"
            style={{
              top: `calc(${w} * 0.0302)`,
              width: `calc(${w} * 0.2225)`,
              height: "auto",
            }}
          />
        )}
      </div>
    </div>
  );
}
