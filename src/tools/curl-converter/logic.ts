export type ParsedCurl = {
  error: null;
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string;
};

export function parseCurl(input: string): ParsedCurl | { error: string } {
  const cmd = input.trim();
  if (!cmd) return { error: "请输入 cURL 命令" };
  if (!/^\s*curl\b/.test(cmd)) return { error: "输入不是有效的 cURL 命令" };
  const urlMatch = cmd.match(/https?:\/\/[^\s'"]+/) || cmd.match(/curl\s+['"]([^'"]+)['"]/);
  const url = urlMatch ? (urlMatch[1] || urlMatch[0]).replace(/^['"]|['"]$/g, "") : "";
  if (!url) return { error: "未找到 URL" };
  const methodMatch = cmd.match(/(?:-X|--request)\s+['"]?(\w+)['"]?/i);
  const method = methodMatch ? methodMatch[1].toUpperCase() : "GET";
  const headers: Record<string, string> = {};
  for (const match of cmd.matchAll(/(?:-H|--header)\s+['"]([^'"]+)['"]/g)) {
    const [key, ...value] = match[1].split(":");
    headers[key.trim()] = value.join(":").trim();
  }
  const bodyMatch = cmd.match(/(?:-d|--data|--data-raw|--json)\s+['"]([^'"]*)['"]/);
  return { error: null, url, method: bodyMatch && method === "GET" ? "POST" : method, headers, body: bodyMatch?.[1] || "" };
}

export function generateFetch(parsed: ParsedCurl) {
  return `fetch("${parsed.url}", {\n  method: "${parsed.method}",\n  headers: ${JSON.stringify(parsed.headers, null, 2)},\n  body: ${parsed.body ? JSON.stringify(parsed.body) : "undefined"}\n});`;
}

export function generatePython(parsed: ParsedCurl) {
  return `import requests\n\nresponse = requests.${parsed.method.toLowerCase()}("${parsed.url}", headers=${JSON.stringify(parsed.headers)}, data=${JSON.stringify(parsed.body)})\nprint(response.text)`;
}

export function generateGo(parsed: ParsedCurl) {
  return `req, _ := http.NewRequest("${parsed.method}", "${parsed.url}", strings.NewReader(${JSON.stringify(parsed.body)}))`;
}
