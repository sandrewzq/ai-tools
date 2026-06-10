export function renderUuidList(uuids, container) {
  container.innerHTML = uuids.map((uuid, i) => `
    <div class="uuid-row">
      <code>${uuid}</code>
      <button class="ghost-btn uuid-copy-btn" data-uuid="${uuid}" data-index="${i}" title="复制">复制</button>
    </div>
  `).join("");
}
