// 正则匹配引擎

export function testRegex(pattern, flags, text) {
  if (!pattern) return { error: "请输入正则表达式", matches: [], groups: [] };
  if (!text) return { error: "请输入测试文本", matches: [], groups: [] };

  let regex;
  try {
    regex = new RegExp(pattern, flags);
  } catch (e) {
    return { error: `正则语法错误: ${e.message}`, matches: [], groups: [] };
  }

  const matches = [];
  const groupNames = [];
  let match;

  // 收集命名捕获组
  try {
    const nameMatch = String(regex).match(/\(\?<(\w+)>/g);
    if (nameMatch) {
      groupNames.push(...nameMatch.map(m => m.slice(3, -1)));
    }
  } catch {}

  if (flags.includes("g")) {
    while ((match = regex.exec(text)) !== null) {
      matches.push({
        full: match[0],
        index: match.index,
        end: match.index + match[0].length,
        groups: match.slice(1),
        groupNames,
      });
      if (match[0].length === 0) regex.lastIndex++;
    }
  } else {
    match = regex.exec(text);
    if (match) {
      matches.push({
        full: match[0],
        index: match.index,
        end: match.index + match[0].length,
        groups: match.slice(1),
        groupNames,
      });
    }
  }

  return { error: null, matches, groupNames, count: matches.length };
}

export function highlightMatches(text, matches) {
  if (!matches || matches.length === 0) return escapeHtml(text);

  // 按索引排序，从后往前插避免索引偏移
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

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
