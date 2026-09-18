/**
 * Section header: pill label → heading → optional paragraph.
 */
export function SectionHeader({
  label,
  labelIcon,
  heading,
  paragraph,
  align = "center",
  paragraphInset,
  headingId,
}: {
  label?: string;
  labelIcon?: string;
  heading: string;
  paragraph?: string;
  align?: "center" | "start";
  paragraphInset?: string;
  headingId?: string;
}) {
  const centered = align === "center";

  return (
    <div
      className={`flex w-full flex-col gap-3 tb:gap-[14px] ${centered ? "items-center" : "items-start"}`}
    >
      {label && (
        <span className="pill-label">
          {labelIcon && (
            <img
              src={labelIcon}
              alt=""
              aria-hidden="true"
              className="shrink-0"
              style={{ width: "20px", height: "20px" }}
            />
          )}
          <span className="t-label">{label}</span>
        </span>
      )}

      <div
        className={`flex w-full flex-col gap-[14px] tb:gap-5 ${centered ? "items-center text-center" : "items-start"}`}
      >
        <h2 id={headingId} className="t-h2">
          {heading}
        </h2>
        {paragraph && (
          <div
            className={`flex w-full justify-center ${paragraphInset ?? ""}`}
          >
            <p className="t-body text-ink-400">{paragraph}</p>
          </div>
        )}
      </div>
    </div>
  );
}
