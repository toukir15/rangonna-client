/**
 * Quill leaves a trailing empty block (<p><br></p>) which adds visible gap on the storefront.
 * Strip only at the end; do not mutate during live typing (use at export / submit / read-only preview).
 */
export function stripTrailingEmptyQuillParagraphs(html: string): string {
  let s = (html || "").trimEnd();
  const re = /(?:<p>\s*<br\s*\/?>\s*<\/p>|<p>\s*<\/p>)\s*$/i;
  while (re.test(s)) {
    s = s.replace(re, "").trimEnd();
  }
  return s.trim();
}
