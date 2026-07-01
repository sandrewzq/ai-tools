import { escapeHtml } from "../../shared/format";

export type RegexMatch = {
  full: string;
  index: number;
  end: number;
  groups: string[];
  groupNames: string[];
};

export function testRegex(pattern: string, flags: string, text: string) {
  if (!pattern) return { error: "请输入正则表达式", matches: [], groupNames: [], count: 0 };
  if (!text) return { error: "请输入测试文本", matches: [], groupNames: [], count: 0 };

  let regex: RegExp;
  try {
    regex = new RegExp(pattern, flags);
  } catch (error) {
    return { error: `正则语法错误：${error instanceof Error ? error.message : String(error)}`, matches: [], groupNames: [], count: 0 };
  }

  const matches: RegexMatch[] = [];
  const groupNames = Array.from(String(regex).matchAll(/\(\?<(\w+)>/g)).map((match) => match[1]);
  let match: RegExpExecArray | null;

  if (flags.includes("g")) {
    while ((match = regex.exec(text)) !== null) {
      matches.push({ full: match[0], index: match.index, end: match.index + match[0].length, groups: match.slice(1), groupNames });
      if (match[0].length === 0) regex.lastIndex += 1;
    }
  } else {
    match = regex.exec(text);
    if (match) matches.push({ full: match[0], index: match.index, end: match.index + match[0].length, groups: match.slice(1), groupNames });
  }

  return { error: null, matches, groupNames, count: matches.length };
}

export function highlightMatches(text: string, matches: RegexMatch[]) {
  if (!matches.length) return escapeHtml(text);
  const sorted = [...matches].sort((a, b) => b.index - a.index);
  let result = text;
  for (const match of sorted) {
    const before = escapeHtml(result.slice(0, match.index));
    const highlighted = `<mark class="regex-match">${escapeHtml(match.full)}</mark>`;
    const after = escapeHtml(result.slice(match.end));
    result = before + highlighted + after;
  }
  return result;
}
