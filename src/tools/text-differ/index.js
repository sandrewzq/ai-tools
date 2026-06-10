import * as dom from "../../shared/dom-cache.js";
import { diffLines, getDiffStats } from "./diff.js";
import * as render from "./render.js";

export const meta = {
  id: "text-differ",
  route: "#text-differ",
  title: "文本比对器",
  kicker: "Text Differ",
  description: "对比两段文本的差异，高亮显示新增、删除和未变行，适合比较 AI 回复或文档版本。",
};

export function init() {
  bindEvents();
  render.renderEmpty(dom.textDiffer.diffOutput, dom.textDiffer.statsContainer);
}

export function destroy() {}

function bindEvents() {
  dom.textDiffer.compareBtn.addEventListener("click", doCompare);
  dom.textDiffer.resetBtn.addEventListener("click", resetAll);
  dom.textDiffer.swapBtn.addEventListener("click", swapTexts);

  // Ctrl+Enter 快捷比对
  dom.textDiffer.textA.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") doCompare();
  });
  dom.textDiffer.textB.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") doCompare();
  });
}

function doCompare() {
  const textA = dom.textDiffer.textA.value;
  const textB = dom.textDiffer.textB.value;

  if (!textA.trim() && !textB.trim()) {
    render.renderEmpty(dom.textDiffer.diffOutput, dom.textDiffer.statsContainer);
    return;
  }

  const diffResult = diffLines(textA, textB);
  const stats = getDiffStats(diffResult);

  render.renderDiffResult(diffResult, dom.textDiffer.diffOutput);
  render.renderDiffStats(stats, dom.textDiffer.statsContainer);
}

function resetAll() {
  dom.textDiffer.textA.value = "";
  dom.textDiffer.textB.value = "";
  render.renderEmpty(dom.textDiffer.diffOutput, dom.textDiffer.statsContainer);
}

function swapTexts() {
  const temp = dom.textDiffer.textA.value;
  dom.textDiffer.textA.value = dom.textDiffer.textB.value;
  dom.textDiffer.textB.value = temp;
}
