import * as dom from "../../shared/dom-cache.js";
import { getStorageItem, setStorageItem } from "../../shared/storage.js";
import { TEMPLATES } from "./data.js";
import * as render from "./render.js";

export const meta = {
  id: "prompt-templates",
  route: "#prompt-templates",
  title: "提示词模板库",
  kicker: "Prompt Library",
  description: "按场景分类的精选中英文提示词模板，支持一键复制和收藏。",
};

const STORAGE_KEY = "prompt-templates-favorites";

let favorites = new Set();
let activeCategory = "all";
let searchQuery = "";
let searchTimer = null;

export function init() {
  loadFavorites();
  bindEvents();
  renderCategoryTabs();
  renderCards();
}

export function destroy() {
  // 无特殊清理需求
}

function loadFavorites() {
  try {
    const raw = getStorageItem(STORAGE_KEY);
    if (raw) {
      favorites = new Set(JSON.parse(raw));
    }
  } catch {
    favorites = new Set();
  }
}

function saveFavorites() {
  setStorageItem(STORAGE_KEY, JSON.stringify([...favorites]));
}

function bindEvents() {
  // 分类标签点击 — 事件委托
  dom.promptTemplates.categoryTabs.addEventListener("click", (e) => {
    const btn = e.target.closest(".category-tab");
    if (!btn) return;
    activeCategory = btn.dataset.category;
    render.updateActiveTab(activeCategory, dom.promptTemplates.categoryTabs);
    renderCards();
  });

  // 搜索输入（防抖 200ms）
  dom.promptTemplates.searchInput.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      searchQuery = dom.promptTemplates.searchInput.value;
      renderCards();
    }, 200);
  });

  // 卡片容器事件委托（复制、收藏、展开）
  dom.promptTemplates.cardsContainer.addEventListener("click", (e) => {
    // 复制按钮
    const copyBtn = e.target.closest("[data-action='copy']");
    if (copyBtn) {
      e.stopPropagation();
      const id = copyBtn.dataset.id;
      const tpl = TEMPLATES.find((t) => t.id === id);
      if (tpl) copyPrompt(tpl.prompt);
      return;
    }

    // 收藏按钮
    const favBtn = e.target.closest("[data-action='fav']");
    if (favBtn) {
      e.stopPropagation();
      const id = favBtn.dataset.id;
      toggleFavorite(id, favBtn);
      return;
    }

    // 点击卡片非按钮区域 → 展开/收起
    const card = e.target.closest(".prompt-card");
    if (card) {
      card.querySelector(".prompt-card-body").classList.toggle("expanded");
    }
  });
}

function renderCategoryTabs() {
  render.renderCategoryTabs(activeCategory, dom.promptTemplates.categoryTabs, (key) => {
    activeCategory = key;
    render.updateActiveTab(activeCategory, dom.promptTemplates.categoryTabs);
    renderCards();
  });
}

function renderCards() {
  let filtered = activeCategory === "all"
    ? [...TEMPLATES]
    : TEMPLATES.filter((t) => t.category === activeCategory);

  if (searchQuery.trim()) {
    filtered = render.applySearchFilter(filtered, searchQuery);
  }

  if (filtered.length === 0) {
    dom.promptTemplates.cardsContainer.innerHTML = "";
    dom.promptTemplates.emptyState.classList.remove("hidden");
  } else {
    dom.promptTemplates.emptyState.classList.add("hidden");
    render.renderTemplateCards(filtered, favorites, dom.promptTemplates.cardsContainer);
  }
}

function toggleFavorite(id, button) {
  if (favorites.has(id)) {
    favorites.delete(id);
    button.classList.remove("faved");
    button.textContent = "☆";
    button.setAttribute("aria-label", "收藏");
  } else {
    favorites.add(id);
    button.classList.add("faved");
    button.textContent = "★";
    button.setAttribute("aria-label", "取消收藏");
  }
  saveFavorites();
}

async function copyPrompt(text) {
  try {
    await navigator.clipboard.writeText(text);
    render.showToast("已复制到剪贴板", dom.promptTemplates.toast);
  } catch {
    render.showToast("复制失败，请手动选择文本", dom.promptTemplates.toast);
  }
}
