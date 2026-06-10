export function renderResult(result, matchContainer, highlightContainer, statsContainer) {
  if (result.error) {
    matchContainer.innerHTML = `<div class="regex-error">${escapeHtml(result.error)}</div>`;
    highlightContainer.innerHTML = "";
    statsContainer.innerHTML = "";
    return;
  }

  // 统计
  statsContainer.innerHTML = `
    <div class="regex-stats">
      <span>匹配: <strong>${result.count}</strong></span>
      <span>捕获组: <strong>${result.groupNames.length}</strong></span>
    </div>
  `;

  // 高亮文本
  highlightContainer.innerHTML = highlightMatches(result.matches);

  // 匹配详情列表
  if (result.matches.length === 0) {
    matchContainer.innerHTML = '<div class="empty-state">无匹配结果</div>';
    return;
  }

  let html = "";
  result.matches.forEach((m, i) => {
    html += `<div class="regex-match-item">
      <span class="regex-match-num">#${i + 1}</span>
      <code class="regex-match-text">${escapeHtml(m.full)}</code>
      <span class="regex-match-pos">${m.index}-${m.end}</span>`;
    if (m.groups.length > 0) {
      html += '<div class="regex-groups">';
      m.groups.forEach((g, gi) => {
        const name = m.groupNames[gi] || `$${gi + 1}`;
        html += `<span class="regex-group"><var>${name}</var>: <em>${escapeHtml(g !== undefined ? g : "(未匹配)")}</em></span>`;
      });
      html += "</div>";
    }
    html += "</div>";
  });

  matchContainer.innerHTML = html;
}

export function renderEmpty(matchContainer, highlightContainer, statsContainer) {
  matchContainer.innerHTML = '<div class="empty-state">在左侧输入正则和测试文本</div>';
  highlightContainer.innerHTML = "";
  statsContainer.innerHTML = "";
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function highlightMatches(text, matches) {
  if (!matches || matches.length === 0) return escapeHtml(text);
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
