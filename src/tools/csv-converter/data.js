const DELIMITERS = { comma: ",", semicolon: ";", tab: "\t", pipe: "|" };

export function parseCsv(input, options = {}) {
  try {
    const text = input.trim();
    if (!text) return { error: "请输入 CSV 内容" };
    const delimiter = options.delimiter === "auto" || !options.delimiter ? detectDelimiter(text) : DELIMITERS[options.delimiter] || options.delimiter;
    const rows = readRows(text, delimiter);
    if (!rows.length) return { error: "没有可解析的数据行" };
    const hasHeader = options.hasHeader !== false;
    const headers = hasHeader ? rows[0].map((cell, index) => cell || `column_${index + 1}`) : rows[0].map((_, index) => `column_${index + 1}`);
    const dataRows = hasHeader ? rows.slice(1) : rows;
    const objects = dataRows.map((row) => headers.reduce((acc, header, index) => {
      acc[header] = row[index] ?? "";
      return acc;
    }, {}));
    return { error: null, delimiter, headers, rows: objects, rawRows: dataRows };
  } catch (error) {
    return { error: `CSV 解析失败：${error.message}` };
  }
}

function detectDelimiter(text) {
  const firstLine = text.split(/\r?\n/)[0] || "";
  return [",", ";", "\t", "|"].map((delimiter) => ({ delimiter, count: firstLine.split(delimiter).length })).sort((a, b) => b.count - a.count)[0].delimiter;
}

function readRows(text, delimiter) {
  const rows = [];
  let row = [];
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

export function csvToJson(input, options = {}) {
  const parsed = parseCsv(input, options);
  if (parsed.error) return { error: parsed.error, output: "" };
  return { ...parsed, output: JSON.stringify(parsed.rows, null, 2) };
}

export function getCsvStats(parsed) {
  return {
    columns: parsed.headers.length,
    rows: parsed.rows.length,
    delimiter: parsed.delimiter === "\t" ? "Tab" : parsed.delimiter,
  };
}

export function getCsvExample() {
  return 'name,role,note\nAlice,dev,"hello, world"\nBob,ops,"line"';
}
