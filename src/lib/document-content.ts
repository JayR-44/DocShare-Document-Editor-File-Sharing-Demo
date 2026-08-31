import type { RichTextContent } from "./types";

const paragraph = (text: string) => ({ type: "paragraph", content: text ? [{ type: "text", text }] : undefined });

export function markdownToDocument(rawText: string): RichTextContent {
  const content: Record<string, unknown>[] = [];
  const lines = rawText.replace(/\r\n/g, "\n").split("\n");
  for (let index = 0; index < lines.length;) {
    const line = lines[index];
    const heading = line.match(/^(#{1,2})\s+(.+)$/);
    if (heading) { content.push({ type: "heading", attrs: { level: heading[1].length }, content: [{ type: "text", text: heading[2] }] }); index += 1; continue; }
    const bullet = line.match(/^[-*]\s+(.+)$/);
    const ordered = line.match(/^\d+[.)]\s+(.+)$/);
    if (bullet || ordered) {
      const pattern = bullet ? /^[-*]\s+(.+)$/ : /^\d+[.)]\s+(.+)$/;
      const items: Record<string, unknown>[] = [];
      while (index < lines.length) { const item = lines[index].match(pattern); if (!item) break; items.push({ type: "listItem", content: [paragraph(item[1])] }); index += 1; }
      content.push({ type: bullet ? "bulletList" : "orderedList", content: items }); continue;
    }
    if (line.trim()) content.push(paragraph(line));
    index += 1;
  }
  return { type: "doc", content: content.length ? content : [paragraph("")] };
}
