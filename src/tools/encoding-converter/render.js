export function renderResult(result, outputElement, errorElement) {
  errorElement.textContent = "";
  errorElement.classList.add("hidden");
  outputElement.value = result;
}

export function renderError(error, outputElement, errorElement) {
  outputElement.value = "";
  errorElement.textContent = error;
  errorElement.classList.remove("hidden");
}

export function renderEmpty(outputElement, errorElement) {
  outputElement.value = "";
  errorElement.textContent = "";
  errorElement.classList.add("hidden");
}
