function decodeHtmlEntities(input: string) {
  return input
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

export function htmlToPlainText(html: string) {
  const noScript = html.replace(/<script[\s\S]*?<\/script>/gi, " ");
  const noStyle = noScript.replace(/<style[\s\S]*?<\/style>/gi, " ");
  const withBreaks = noStyle
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<\/li>/gi, "\n");
  const stripped = withBreaks.replace(/<[^>]+>/g, " ");
  const decoded = decodeHtmlEntities(stripped);
  return decoded.replace(/[ \t]+/g, " ").replace(/\n\s+/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}
