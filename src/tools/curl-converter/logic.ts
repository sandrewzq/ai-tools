export type ParsedCurl = {
  error: null;
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string;
  auth: string | null;
};

export function parseCurl(input: string): ParsedCurl | { error: string } {
  if (!input.trim()) return { error: "请输入 cURL 命令" };

  const cmd = input.trim();
  if (!/^\s*curl\b/.test(cmd)) return { error: "输入不是有效的 cURL 命令（必须以 curl 开头）" };

  const urlMatch =
    cmd.match(/curl\s+.*?(?:'([^']+)'|"([^"]+)"|(\S+?))(?:\s|$)/s) || cmd.match(/(?:https?:\/\/[^\s'"]+)/);
  const url = urlMatch ? (urlMatch[1] || urlMatch[2] || urlMatch[3] || urlMatch[0]).replace(/^['"]|['"]$/g, "") : "";

  if (!url) return { error: "未找到 URL（请确保命令中包含 http/https 地址）" };

  const methodMatch = cmd.match(/(?:-X|--request)\s+['"]?(\w+)['"]?/i);
  const method = methodMatch ? methodMatch[1].toUpperCase() : "GET";

  const headers: Record<string, string> = {};
  const quotedHeaderRegex = /(?:-H|--header)\s+['"]([^'"]+)['"]/g;
  let headerMatch: RegExpExecArray | null;
  while ((headerMatch = quotedHeaderRegex.exec(cmd)) !== null) {
    const [key, ...value] = headerMatch[1].split(":");
    headers[key.trim()] = value.join(":").trim();
  }

  const bareHeaderRegex = /(?:-H|--header)\s+(\S+:\s*\S+)/g;
  while ((headerMatch = bareHeaderRegex.exec(cmd)) !== null) {
    const [key, ...value] = headerMatch[1].split(":");
    if (!headers[key.trim()]) {
      headers[key.trim()] = value.join(":").trim();
    }
  }

  const contentTypeMatch = cmd.match(/--(?:json|data-raw|data-binary)/);
  if (contentTypeMatch && !headers["Content-Type"] && !headers["content-type"]) {
    if (contentTypeMatch[0] === "--json") headers["Content-Type"] = "application/json";
    if (contentTypeMatch[0] === "--data-raw" || contentTypeMatch[0] === "--data-binary") {
      headers["Content-Type"] = "application/x-www-form-urlencoded";
    }
  }

  let body = "";
  const quotedBodyMatch = cmd.match(/(?:-d|--data|--data-raw|--data-binary|--json)\s+['"]([^'"]*)['"]/);
  if (quotedBodyMatch) {
    body = quotedBodyMatch[1];
  } else {
    const bareBodyMatch = cmd.match(/(?:-d|--data|--data-raw|--data-binary|--json)\s+(\S+)/);
    if (bareBodyMatch) body = bareBodyMatch[1];
  }

  const authMatch = cmd.match(/(?:-u|--user)\s+['"]([^'"]+)['"]/);
  const auth = authMatch ? authMatch[1] : null;

  return { error: null, url, method, headers, body, auth };
}

export function generateFetch(parsed: ParsedCurl) {
  const { url, method, headers, body } = parsed;
  let code = `fetch("${url}"`;
  if (method !== "GET" || Object.keys(headers).length > 0 || body) {
    code += ", {\n";
    code += `  method: "${method}",\n`;
    if (Object.keys(headers).length > 0) {
      code += "  headers: {\n";
      for (const [key, value] of Object.entries(headers)) {
        code += `    "${key}": "${value}",\n`;
      }
      code += "  },\n";
    }
    if (body) {
      const isJson = (headers["Content-Type"] || "").includes("json");
      code += isJson ? `  body: JSON.stringify(${tryStringify(body)}),\n` : `  body: "${body}",\n`;
    }
    code += "}";
  }
  code += ")\n  .then(res => res.json())\n  .then(data => console.log(data))\n  .catch(err => console.error(err));";
  return code;
}

export function generatePython(parsed: ParsedCurl) {
  const { url, method, headers, body } = parsed;
  let code = "import requests\n\n";
  if (Object.keys(headers).length > 0) {
    code += "headers = {\n";
    for (const [key, value] of Object.entries(headers)) {
      code += `    "${key}": "${value}",\n`;
    }
    code += "}\n\n";
  }
  const headerArg = Object.keys(headers).length > 0 ? ", headers=headers" : "";

  if (body) {
    const isJson = (headers["Content-Type"] || "").includes("json");
    if (isJson) {
      code += `data = ${body}\n\n`;
      code += `response = requests.${method.toLowerCase()}("${url}", json=data${headerArg})\n`;
    } else {
      code += `data = "${body}"\n\n`;
      code += `response = requests.${method.toLowerCase()}("${url}", data=data${headerArg})\n`;
    }
  } else {
    code += `response = requests.${method.toLowerCase()}("${url}"${headerArg})\n`;
  }
  code += "print(response.json())";
  return code;
}

export function generateGo(parsed: ParsedCurl) {
  const { url, method, headers, body } = parsed;
  let code = `package main\n\nimport (\n\t"fmt"\n\t"io"\n\t"net/http"\n\t"strings"\n)\n\nfunc main() {\n`;

  if (body) {
    code += `\tbody := strings.NewReader(\`${body}\`)\n`;
    code += `\treq, err := http.NewRequest("${method}", "${url}", body)\n`;
  } else {
    code += `\treq, err := http.NewRequest("${method}", "${url}", nil)\n`;
  }
  code += `\tif err != nil {\n\t\tpanic(err)\n\t}\n`;

  for (const [key, value] of Object.entries(headers)) {
    code += `\treq.Header.Set("${key}", "${value}")\n`;
  }

  code += `\n\tresp, err := (&http.Client{}).Do(req)`;
  code += `\n\tif err != nil {\n\t\tpanic(err)\n\t}\n\tdefer resp.Body.Close()\n\n\tb, _ := io.ReadAll(resp.Body)\n\tfmt.Println(string(b))\n}`;
  return code;
}

function tryStringify(value: string) {
  try {
    JSON.parse(value);
    return value;
  } catch {
    return `"${value}"`;
  }
}
