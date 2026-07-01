type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

function parseScalar(value: string): JsonValue {
  const text = value.trim();
  if (text === "") return "";
  if (text === "null" || text === "~") return null;
  if (text === "true") return true;
  if (text === "false") return false;
  if (/^-?\d+(\.\d+)?$/.test(text)) return Number(text);
  if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) return text.slice(1, -1);
  return text;
}

function stripComment(line: string) {
  let quote = "";
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if ((char === '"' || char === "'") && line[i - 1] !== "\\") quote = quote === char ? "" : char;
    if (char === "#" && !quote) return line.slice(0, i);
  }
  return line;
}

function normalizeLines(input: string) {
  return input.replace(/\r\n/g, "\n").split("\n").map(stripComment).filter((line) => line.trim());
}

function parseBlock(lines: string[], start: number, indent: number): { value: JsonValue; index: number } {
  const isArray = lines[start]?.slice(indent).trimStart().startsWith("- ");
  const result: JsonValue[] | Record<string, JsonValue> = isArray ? [] : {};
  let index = start;

  while (index < lines.length) {
    const line = lines[index];
    const currentIndent = line.match(/^ */)?.[0].length ?? 0;
    if (currentIndent < indent) break;
    if (currentIndent > indent) throw new Error(`第 ${index + 1} 行缩进不正确`);

    const content = line.slice(indent).trim();
    if (isArray) {
      if (!content.startsWith("- ")) break;
      const itemText = content.slice(2).trim();
      if (!itemText) {
        const child = parseBlock(lines, index + 1, indent + 2);
        (result as JsonValue[]).push(child.value);
        index = child.index;
      } else if (/^[^:]+:\s*/.test(itemText)) {
        const [key, ...rest] = itemText.split(":");
        (result as JsonValue[]).push({ [key.trim()]: parseScalar(rest.join(":").trim()) });
        index += 1;
      } else {
        (result as JsonValue[]).push(parseScalar(itemText));
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
      (result as Record<string, JsonValue>)[key] = child.value;
      index = child.index;
    } else {
      (result as Record<string, JsonValue>)[key] = parseScalar(rawValue);
      index += 1;
    }
  }

  return { value: result, index };
}

export function parseYaml(input: string) {
  try {
    const lines = normalizeLines(input);
    if (!lines.length) return { error: "请输入 YAML 内容", parsed: null };
    const parsed = parseBlock(lines, 0, lines[0].match(/^ */)?.[0].length ?? 0).value;
    return { error: null, parsed };
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error), parsed: null };
  }
}

function scalarToYaml(value: JsonValue): string {
  if (value === null) return "null";
  if (typeof value === "string") return /[:#\n]|^\s|\s$/.test(value) ? JSON.stringify(value) : value;
  return String(value);
}

function formatValue(value: JsonValue, indent = 0): string {
  const space = " ".repeat(indent);
  if (Array.isArray(value)) {
    return value.map((item) => (item && typeof item === "object" ? `${space}-\n${formatValue(item, indent + 2)}` : `${space}- ${scalarToYaml(item)}`)).join("\n");
  }
  if (value && typeof value === "object") {
    return Object.entries(value).map(([key, item]) => (item && typeof item === "object" ? `${space}${key}:\n${formatValue(item, indent + 2)}` : `${space}${key}: ${scalarToYaml(item)}`)).join("\n");
  }
  return `${space}${scalarToYaml(value)}`;
}

export function formatYaml(input: string) {
  const result = parseYaml(input);
  if (result.error || result.parsed === null) return { error: result.error, output: "" };
  return { error: null, output: formatValue(result.parsed), parsed: result.parsed };
}

export function compactYaml(input: string) {
  const result = parseYaml(input);
  if (result.error || result.parsed === null) return { error: result.error, output: "" };
  return { error: null, output: JSON.stringify(result.parsed), parsed: result.parsed };
}

export function yamlToJson(input: string) {
  const result = parseYaml(input);
  if (result.error || result.parsed === null) return { error: result.error, output: "" };
  return { error: null, output: JSON.stringify(result.parsed, null, 2), parsed: result.parsed };
}

export function jsonToYaml(input: string) {
  try {
    const parsed = JSON.parse(input) as JsonValue;
    return { error: null, output: formatValue(parsed), parsed };
  } catch (error) {
    return { error: `JSON 解析失败：${error instanceof Error ? error.message : String(error)}`, output: "" };
  }
}

export function getYamlStats(parsed: JsonValue, output: string) {
  return { type: Array.isArray(parsed) ? "Array" : "Object", lines: output ? output.split("\n").length : 0, chars: output.length, keys: countKeys(parsed) };
}

function countKeys(value: JsonValue): number {
  if (Array.isArray(value)) return value.reduce<number>((sum, item) => sum + countKeys(item), 0);
  if (value && typeof value === "object") return Object.keys(value).length + Object.values(value).reduce<number>((sum, item) => sum + countKeys(item), 0);
  return 0;
}
