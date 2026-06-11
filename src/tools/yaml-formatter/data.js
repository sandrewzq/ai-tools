function parseScalar(value) {
  const text = value.trim();
  if (text === "") return "";
  if (text === "null" || text === "~") return null;
  if (text === "true") return true;
  if (text === "false") return false;
  if (/^-?\d+(\.\d+)?$/.test(text)) return Number(text);
  if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) return text.slice(1, -1);
  return text;
}

function stripComment(line) {
  let quote = "";
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if ((char === '"' || char === "'") && line[i - 1] !== "\\") quote = quote === char ? "" : char;
    if (char === "#" && !quote) return line.slice(0, i);
  }
  return line;
}

function normalizeLines(input) {
  return input
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map(stripComment)
    .filter((line) => line.trim());
}

function parseBlock(lines, start, indent) {
  const isArray = lines[start]?.slice(indent).trimStart().startsWith("- ");
  const result = isArray ? [] : {};
  let index = start;

  while (index < lines.length) {
    const line = lines[index];
    const currentIndent = line.match(/^ */)[0].length;
    if (currentIndent < indent) break;
    if (currentIndent > indent) throw new Error(`第 ${index + 1} 行缩进不正确`);

    const content = line.slice(indent).trim();
    if (isArray) {
      if (!content.startsWith("- ")) break;
      const itemText = content.slice(2).trim();
      if (!itemText) {
        const child = parseBlock(lines, index + 1, indent + 2);
        result.push(child.value);
        index = child.index;
      } else if (/^[^:]+:\s*/.test(itemText)) {
        const [key, ...rest] = itemText.split(":");
        const obj = { [key.trim()]: parseScalar(rest.join(":").trim()) };
        index += 1;
        while (index < lines.length && lines[index].match(/^ */)[0].length > indent) {
          const childIndent = lines[index].match(/^ */)[0].length;
          if (childIndent !== indent + 2) break;
          const childContent = lines[index].slice(childIndent).trim();
          const [childKey, ...childRest] = childContent.split(":");
          obj[childKey.trim()] = childRest.join(":").trim() ? parseScalar(childRest.join(":").trim()) : parseBlock(lines, index + 1, childIndent + 2).value;
          index += 1;
        }
        result.push(obj);
      } else {
        result.push(parseScalar(itemText));
        index += 1;
      }
      continue;
    }

    const colonIndex = content.indexOf(":");
    if (colonIndex === -1) throw new Error(`第 ${index + 1} 行缺少键值分隔符 :`);
    const key = content.slice(0, colonIndex).trim();
    const rawValue = content.slice(colonIndex + 1).trim();
    if (!key) throw new Error(`第 ${index + 1} 行键名不能为空`);
    if (!rawValue) {
      const child = parseBlock(lines, index + 1, indent + 2);
      result[key] = child.value;
      index = child.index;
    } else {
      result[key] = parseScalar(rawValue);
      index += 1;
    }
  }

  return { value: result, index };
}

export function parseYaml(input) {
  try {
    const lines = normalizeLines(input);
    if (!lines.length) return { error: "请输入 YAML 内容" };
    const parsed = parseBlock(lines, 0, lines[0].match(/^ */)[0].length).value;
    return { error: null, parsed };
  } catch (error) {
    return { error: error.message };
  }
}

function formatValue(value, indent = 0) {
  const space = " ".repeat(indent);
  if (Array.isArray(value)) {
    return value.map((item) => {
      if (item && typeof item === "object") return `${space}-\n${formatValue(item, indent + 2)}`;
      return `${space}- ${scalarToYaml(item)}`;
    }).join("\n");
  }
  if (value && typeof value === "object") {
    return Object.entries(value).map(([key, item]) => {
      if (item && typeof item === "object") return `${space}${key}:\n${formatValue(item, indent + 2)}`;
      return `${space}${key}: ${scalarToYaml(item)}`;
    }).join("\n");
  }
  return `${space}${scalarToYaml(value)}`;
}

function scalarToYaml(value) {
  if (value === null) return "null";
  if (typeof value === "string") return /[:#\n]|^\s|\s$/.test(value) ? JSON.stringify(value) : value;
  return String(value);
}

export function formatYaml(input) {
  const result = parseYaml(input);
  if (result.error) return { error: result.error, output: "" };
  return { error: null, output: formatValue(result.parsed), parsed: result.parsed };
}

export function compactYaml(input) {
  const result = parseYaml(input);
  if (result.error) return { error: result.error, output: "" };
  return { error: null, output: JSON.stringify(result.parsed), parsed: result.parsed };
}

export function yamlToJson(input) {
  const result = parseYaml(input);
  if (result.error) return { error: result.error, output: "" };
  return { error: null, output: JSON.stringify(result.parsed, null, 2), parsed: result.parsed };
}

export function jsonToYaml(input) {
  try {
    const parsed = JSON.parse(input);
    return { error: null, output: formatValue(parsed), parsed };
  } catch (error) {
    return { error: `JSON 解析失败：${error.message}`, output: "" };
  }
}

export function getYamlStats(parsed, output) {
  return {
    type: Array.isArray(parsed) ? "Array" : "Object",
    lines: output ? output.split("\n").length : 0,
    chars: output?.length || 0,
    keys: countKeys(parsed),
  };
}

function countKeys(value) {
  if (Array.isArray(value)) return value.reduce((sum, item) => sum + countKeys(item), 0);
  if (value && typeof value === "object") return Object.keys(value).length + Object.values(value).reduce((sum, item) => sum + countKeys(item), 0);
  return 0;
}
