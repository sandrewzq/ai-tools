const DELIMITERS: Record<string, string> = { comma: ",", semicolon: ";", tab: "\t", pipe: "|" };

export type CsvOptions = {
  delimiter?: string;
  hasHeader?: boolean;
};

export function parseCsv(input: string, options: CsvOptions = {}) {
  try {
    const text = input.trim();
    if (!text) return { error: "请输入 CSV 内容" };
    const delimiter = options.delimiter === "auto" || !options.delimiter ? detectDelimiter(text) : DELIMITERS[options.delimiter] || options.delimiter;
    const rawRows = readRows(text, delimiter);
    if (!rawRows.length) return { error: "没有可解析的数据行" };
    const hasHeader = options.hasHeader !== false;
    const headers = hasHeader ? rawRows[0].map((cell, index) => cell || `column_${index + 1}`) : rawRows[0].map((_, index) => `column_${index + 1}`);
    const dataRows = hasHeader ? rawRows.slice(1) : rawRows;
    const rows = dataRows.map((row) => headers.reduce<Record<string, string>>((acc, header, index) => {
      acc[header] = row[index] ?? "";
      return acc;
    }, {}));
    return { error: null, delimiter, headers, rows, rawRows: dataRows };
  } catch (error) {
    return { error: `CSV 解析失败：${error instanceof Error ? error.message : String(error)}` };
  }
}

function detectDelimiter(text: string) {
  const firstLine = text.split(/\r?\n/)[0] || "";
  return [",", ";", "\t", "|"].map((delimiter) => ({ delimiter, count: firstLine.split(delimiter).length })).sort((a, b) => b.count - a.count)[0].delimiter;
}

function readRows(text: string, delimiter: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (char === '"') {
      if (quoted && next === '"') {
        cell += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === delimiter && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  if (quoted) throw new Error("存在未闭合的引号");
  row.push(cell);
  rows.push(row);
  return rows.filter((item) => item.some((cellValue) => cellValue !== ""));
}

export function csvToJson(input: string, options: CsvOptions = {}) {
  const parsed = parseCsv(input, options);
  if (parsed.error || !("rows" in parsed)) return { error: parsed.error, output: "" };
  return { ...parsed, output: JSON.stringify(parsed.rows, null, 2) };
}

export function getCsvStats(parsed: { headers: string[]; rows: Record<string, string>[]; delimiter: string }) {
  return { columns: parsed.headers.length, rows: parsed.rows.length, delimiter: parsed.delimiter === "\t" ? "Tab" : parsed.delimiter };
}

export function getCsvExample() {
  return 'name,role,note\nAlice,dev,"hello, world"\nBob,ops,"line"';
}
