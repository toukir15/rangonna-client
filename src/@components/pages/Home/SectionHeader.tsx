import Link from "next/link";

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
  align?: "left" | "center";
  className?: string;
};

/** Shared section title — matches /rangonaa SectionHeader */
export default function SectionHeader({
  eyebrow,
  title,
  description,
  href,
  linkLabel = "View all",
  align = "left",
  className = "",
}: SectionHeaderProps) {
  const centered = align === "center";

  return (
    <div
      className={`rongonaa-section-header ${
        centered ? "rongonaa-section-header--center" : ""
      } ${className}`.trim()}
    >
      <div className={centered ? "rongonaa-section-header__center-copy" : ""}>
        {eyebrow ? (
          <p className="rongonaa-section-header__eyebrow">{eyebrow}</p>
        ) : null}
        <h2 className="rongonaa-section-header__title">{title}</h2>
        {eyebrow || description ? (
          <span className="rongonaa-section-header__rule" aria-hidden />
        ) : null}
        {description ? (
          <p className="rongonaa-section-header__desc">{description}</p>
        ) : null}
      </div>

      {href ? (
        <Link href={href} className="rongonaa-section-header__link">
          {linkLabel}
          <span aria-hidden>→</span>
        </Link>
      ) : null}
    </div>
  );
}
