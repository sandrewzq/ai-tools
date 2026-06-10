import { drawQR } from "./data.js";

export function renderQR(result, canvas, versionEl, sizeEl, errorEl, placeholderEl) {
  if (result.error) {
    errorEl.textContent = result.error;
    errorEl.classList.remove("hidden");
    canvas.style.display = "none";
    placeholderEl.style.display = "block";
    versionEl.textContent = "";
    sizeEl.textContent = "";
    return;
  }

  errorEl.textContent = "";
  errorEl.classList.add("hidden");

  const { totalSize } = drawQR(canvas, result.matrix, result.size);
  canvas.style.display = "block";
  canvas.style.maxWidth = "280px";
  canvas.style.width = "100%";
  canvas.style.height = "auto";
  placeholderEl.style.display = "none";
  versionEl.textContent = `版本 ${result.version}`;
  sizeEl.textContent = `${result.size}×${result.size} (${totalSize}px)`;
}

export function renderEmpty(canvas, versionEl, sizeEl, errorEl, placeholderEl) {
  canvas.style.display = "none";
  placeholderEl.style.display = "block";
  versionEl.textContent = "";
  sizeEl.textContent = "";
  errorEl.textContent = "";
  errorEl.classList.add("hidden");
}
