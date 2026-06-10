import { escapeHtml } from "../../shared/format.js";
import { CATEGORIES } from "./data.js";

export function renderCategoryTabs(activeKey, container, onClick) {
  const fragment = document.createDocumentFragment();

  CATEGORIES.forEach((cat) => {
    const btn = document.createElement("button");
    btn.className = `category-tab${cat.key === activeKey ? " active" : ""}`;
    btn.type = "button";
    btn.dataset.category = cat.key;
    btn.textContent = cat.label;
    btn.addEventListener("click", () => onClick(cat.key));
    fragment.appendChild(btn);
  });

  container.innerHTML = "";
  container.appendChild(fragment);
}

export function updateActiveTab(activeKey, container) {
  container.querySelectorAll(".category-tab").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.category === activeKey);
  });
}

export function renderTemplateCards(templates, favorites, container) {
  if (templates.length === 0) return;

  const fragment = document.createDocumentFragment();

  templates.forEach((tpl) => {
    const isFaved = favorites.has(tpl.id);
    const card = document.createElement("article");
    card.className = "prompt-card";
    card.dataset.id = tpl.id;
    card.innerHTML = `
      <div class="prompt-card-header">
        <div class="prompt-card-title-row">
          <strong>${escapeHtml(tpl.title)}</strong>
          <div class="prompt-card-actions">
            <button class="fav-btn${isFaved ? " faved" : ""}" type="button" data-action="fav" data-id="${tpl.id}" aria-label="${isFaved ? "取消收藏" : "收藏"}">
              ${isFaved ? "★" : "☆"}
            </button>
            <button class="copy-btn" type="button" data-action="copy" data-id="${tpl.id}" aria-label="复制提示词">
              复制
            </button>
          </div>
        </div>
        <p class="prompt-card-desc">${escapeHtml(tpl.description)}</p>
      </div>
      <div class="prompt-card-tags">
        ${tpl.tags.map((tag) => `<span class="prompt-card-tag">${escapeHtml(tag)}</span>`).join("")}
      </div>
      <div class="prompt-card-body">
        <pre>${escapeHtml(tpl.prompt)}</pre>
      </div>
    `;
    fragment.appendChild(card);
  });

  container.innerHTML = "";
  container.appendChild(fragment);
}

export function applySearchFilter(templates, query) {
  if (!query || !query.trim()) return templates;

  const q = query.trim().toLowerCase();
  return templates.filter(
    (tpl) =>
      tpl.title.toLowerCase().includes(q) ||
      tpl.tags.some((tag) => tag.toLowerCase().includes(q)) ||
      tpl.prompt.toLowerCase().includes(q),
  );
}

export function showToast(message, container) {
  container.textContent = message;
  container.classList.remove("hidden");
  container.classList.add("toast-visible");

  clearTimeout(container._timeout);
  container._timeout = setTimeout(() => {
    container.classList.remove("toast-visible");
    container.classList.add("hidden");
  }, 2000);
}
