import type { RichNode } from "@prisma/writer/flow";
/** Insert a complete blank physical page at a known page boundary. */
export function insertBlankPage(
  content: RichNode,
  page: number,
  placement: string,
  pageMap: Record<string, number> = {},
): RichNode {
  const nodes = [...(content.content ?? [])];
  let inferredPage=1;
  const pages=nodes.map(n=>{
    if(n.type==='pageBreak'||(n.type==='sectionBreak'&&n.attrs?.kind!=='continuous'))inferredPage++;
    return Number(n.attrs?.page)||pageMap[String(n.attrs?.id)]||inferredPage;
  });
  const target = placement === "above" ? page : page + 1;
  let index =
    placement === "end"
      ? nodes.length
      : nodes.findIndex((n,i) => n.type!=='pageBreak'&&n.type!=='sectionBreak'&&pages[i] >= target);
  if (index < 0) index = nodes.length;
  const blank: RichNode = {
    type: "paragraph",
    attrs: { id: crypto.randomUUID(), spaceAfter: 0 },
  };
  if (index === 0) {
    nodes.unshift(blank, { type: "pageBreak" });
    return { ...content, content: nodes };
  }
  if (index === nodes.length) {
    nodes.push({ type: "pageBreak" }, blank);
    return { ...content, content: nodes };
  }
  if (nodes[index - 1].type === "pageBreak")
    nodes.splice(index - 1, 1, { type: "pageBreak" }, blank, {
      type: "pageBreak",
    });
  else
    nodes.splice(index, 0, { type: "pageBreak" }, blank, { type: "pageBreak" });
  return { ...content, content: nodes };
}
