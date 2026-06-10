// cURL 命令解析器

export function parseCurl(input) {
  if (!input.trim()) return { error: "请输入 cURL 命令" };

  const cmd = input.trim();

  // 必须包含 curl
  if (!/^\s*curl\b/.test(cmd)) return { error: "输入不是有效的 cURL 命令（必须以 curl 开头）" };

  // 提取 URL（支持单引号、双引号、无引号）
  const urlMatch =
    cmd.match(/curl\s+.*?(?:'([^']+)'|"([^"]+)"|(\S+?))(?:\s|$)/s) ||
    cmd.match(/(?:https?:\/\/[^\s'"]+)/);
  const url = urlMatch ? (urlMatch[1] || urlMatch[2] || urlMatch[3] || urlMatch[0]).replace(/^['"]|['"]$/g, "") : "";

  if (!url) return { error: "未找到 URL（请确保命令中包含 http/https 地址）" };

  // 方法
  const methodMatch = cmd.match(/(?:-X|--request)\s+['"]?(\w+)['"]?/i);
  const method = methodMatch ? methodMatch[1].toUpperCase() : "GET";

  // Headers（支持 -H / --header + 冒号分隔值）
  const headers = {};
  const headerRegex = /(?:-H|--header)\s+['"]([^'"]+)['"]/g;
  let hMatch;
  while ((hMatch = headerRegex.exec(cmd)) !== null) {
    const [k, ...v] = hMatch[1].split(":");
    headers[k.trim()] = v.join(":").trim();
  }
  // 无引号的 header
  const headerRegex2 = /(?:-H|--header)\s+(\S+:\s*\S+)/g;
  while ((hMatch = headerRegex2.exec(cmd)) !== null) {
    const [k, ...v] = hMatch[1].split(":");
    if (!headers[k.trim()]) {
      headers[k.trim()] = v.join(":").trim();
    }
  }

  // Content-Type 简写
  const ctMatch = cmd.match(/--(?:json|data-raw|data-binary)/);
  if (ctMatch && !headers["Content-Type"] && !headers["content-type"]) {
    if (ctMatch[0] === "--json") headers["Content-Type"] = "application/json";
    if (ctMatch[0] === "--data-raw" || ctMatch[0] === "--data-binary") {
      headers["Content-Type"] = "application/x-www-form-urlencoded";
    }
  }

  // Body
  let body = "";
  const bodyMatch = cmd.match(/(?:-d|--data|--data-raw|--data-binary|--json)\s+['"]([^'"]*)['"]/);
  if (bodyMatch) body = bodyMatch[1];
  else {
    const bodyMatch2 = cmd.match(/(?:-d|--data|--data-raw|--data-binary|--json)\s+(\S+)/);
    if (bodyMatch2) body = bodyMatch2[1];
  }

  // Auth (-u user:pass 或 --user)
  const authMatch = cmd.match(/(?:-u|--user)\s+['"]([^'"]+)['"]/);
  const auth = authMatch ? authMatch[1] : null;

  return { error: null, url, method, headers, body, auth };
}

export function generateFetch(parsed) {
  const { url, method, headers, body } = parsed;
  let code = `fetch("${url}"`;
  if (method !== "GET" || Object.keys(headers).length > 0 || body) {
    code += ", {\n";
    code += `  method: "${method}",\n`;
    if (Object.keys(headers).length > 0) {
      code += "  headers: {\n";
      for (const [k, v] of Object.entries(headers)) {
        code += `    "${k}": "${v}",\n`;
      }
      code += "  },\n";
    }
    if (body) {
      const isJSON = (headers["Content-Type"] || "").includes("json");
      code += isJSON ? `  body: JSON.stringify(${tryStringify(body)}),\n` : `  body: "${body}",\n`;
    }
    code += "}";
  }
  code += ")\n  .then(res => res.json())\n  .then(data => console.log(data))\n  .catch(err => console.error(err));";
  return code;
}

export function generatePython(parsed) {
  const { url, method, headers, body } = parsed;
  let code = "import requests\n\n";
  if (Object.keys(headers).length > 0) {
    code += "headers = {\n";
    for (const [k, v] of Object.entries(headers)) {
      code += `    "${k}": "${v}",\n`;
    }
    code += "}\n\n";
  }
  const headerArg = Object.keys(headers).length > 0 ? ", headers=headers" : "";

  if (body) {
    const isJSON = (headers["Content-Type"] || "").includes("json");
    if (isJSON) {
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

export function generateGo(parsed) {
  const { url, method, headers, body } = parsed;
  let code = `package main\n\nimport (\n\t"fmt"\n\t"io"\n\t"net/http"\n\t"strings"\n)\n\nfunc main() {\n`;

  if (body) {
    const isJSON = (headers["Content-Type"] || "").includes("json");
    code += `\tbody := strings.NewReader(\`${body}\`)\n`;
    code += `\treq, err := http.NewRequest("${method}", "${url}", body)\n`;
  } else {
    code += `\treq, err := http.NewRequest("${method}", "${url}", nil)\n`;
  }
  code += `\tif err != nil {\n\t\tpanic(err)\n\t}\n`;

  for (const [k, v] of Object.entries(headers)) {
    code += `\treq.Header.Set("${k}", "${v}")\n`;
  }

  if (body) {
    code += `\n\tresp, err := (&http.Client{}).Do(req)`;
  } else {
    code += `\n\tresp, err := (&http.Client{}).Do(req)`;
  }
  code += `\n\tif err != nil {\n\t\tpanic(err)\n\t}\n\tdefer resp.Body.Close()\n\n\tb, _ := io.ReadAll(resp.Body)\n\tfmt.Println(string(b))\n}`;
  return code;
}

function tryStringify(str) {
  try {
    JSON.parse(str);
    return str;
  } catch {
    return `"${str}"`;
  }
}
