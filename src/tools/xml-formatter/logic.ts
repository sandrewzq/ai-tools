export type XmlNode = {
  name: string;
  attributes: Record<string, string>;
  children: Array<XmlNode | string>;
};

function parseAttributes(text: string) {
  const attrs: Record<string, string> = {};
  text.replace(/([:\w-]+)\s*=\s*("[^"]*"|'[^']*')/g, (_, key: string, value: string) => {
    attrs[key] = value.slice(1, -1);
    return "";
  });
  return attrs;
}

function parseXmlText(input: string) {
  const text = input.trim();
  if (!text) return { error: "请输入 XML 内容", root: null };
  const tagPattern = /<[^>]+>|[^<]+/g;
  const root: XmlNode = { name: "#document", attributes: {}, children: [] };
  const stack: XmlNode[] = [root];
  let match: RegExpExecArray | null;

  while ((match = tagPattern.exec(text))) {
    const token = match[0];
    if (!token.trim() || token.startsWith("<?") || token.startsWith("<!--")) continue;
    if (token.startsWith("</")) {
      const name = token.slice(2, -1).trim();
      const current = stack.pop();
      if (!current || current.name !== name) return { error: `闭合标签不匹配：${name}`, root: null };
    } else if (token.startsWith("<")) {
      const selfClosing = token.endsWith("/>");
      const inner = token.slice(1, selfClosing ? -2 : -1).trim();
      const spaceIndex = inner.search(/\s/);
      const name = spaceIndex === -1 ? inner : inner.slice(0, spaceIndex);
      const attrText = spaceIndex === -1 ? "" : inner.slice(spaceIndex + 1);
      const node: XmlNode = { name, attributes: parseAttributes(attrText), children: [] };
      stack[stack.length - 1].children.push(node);
      if (!selfClosing) stack.push(node);
    } else {
      stack[stack.length - 1].children.push(token.trim());
    }
  }

  if (stack.length !== 1) return { error: `标签未闭合：${stack[stack.length - 1].name}`, root: null };
  const elementChildren = root.children.filter((node) => typeof node !== "string");
  if (elementChildren.length !== 1) return { error: "XML 必须有且只有一个根节点", root: null };
  return { error: null, root: elementChildren[0] as XmlNode };
}

function escapeAttr(value: string) {
  return String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

function escapeText(value: string) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function nodeToXml(node: XmlNode, indent = 0): string {
  const space = " ".repeat(indent);
  const attrs = Object.entries(node.attributes).map(([key, value]) => ` ${key}="${escapeAttr(value)}"`).join("");
  if (!node.children.length) return `${space}<${node.name}${attrs}/>`;
  if (node.children.length === 1 && typeof node.children[0] === "string") return `${space}<${node.name}${attrs}>${escapeText(node.children[0])}</${node.name}>`;
  const children = node.children.map((child) => (typeof child === "string" ? `${" ".repeat(indent + 2)}${escapeText(child)}` : nodeToXml(child, indent + 2))).join("\n");
  return `${space}<${node.name}${attrs}>\n${children}\n${space}</${node.name}>`;
}

function nodeToCompactXml(node: XmlNode): string {
  const attrs = Object.entries(node.attributes).map(([key, value]) => ` ${key}="${escapeAttr(value)}"`).join("");
  if (!node.children.length) return `<${node.name}${attrs}/>`;
  return `<${node.name}${attrs}>${node.children.map((child) => (typeof child === "string" ? escapeText(child) : nodeToCompactXml(child))).join("")}</${node.name}>`;
}

export function formatXml(input: string) {
  const parsed = parseXmlText(input);
  if (parsed.error || !parsed.root) return { error: parsed.error, output: "" };
  return { error: null, output: nodeToXml(parsed.root), tree: parsed.root };
}

export function compactXml(input: string) {
  const parsed = parseXmlText(input);
  if (parsed.error || !parsed.root) return { error: parsed.error, output: "" };
  return { error: null, output: nodeToCompactXml(parsed.root), tree: parsed.root };
}

export function xmlToJson(input: string) {
  const parsed = parseXmlText(input);
  if (parsed.error || !parsed.root) return { error: parsed.error, output: "" };
  return { error: null, output: JSON.stringify(parsed.root, null, 2), tree: parsed.root };
}

export function getXmlStats(tree: XmlNode, output: string) {
  return { root: tree?.name || "-", nodes: countNodes(tree), lines: output ? output.split("\n").length : 0, attrs: countAttrs(tree) };
}

function countNodes(node: XmlNode | string | null): number {
  if (!node || typeof node === "string") return 0;
  return 1 + node.children.reduce((sum, child) => sum + countNodes(child), 0);
}

function countAttrs(node: XmlNode | string | null): number {
  if (!node || typeof node === "string") return 0;
  return Object.keys(node.attributes).length + node.children.reduce((sum, child) => sum + countAttrs(child), 0);
}
