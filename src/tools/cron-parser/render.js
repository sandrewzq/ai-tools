export function renderExamples(examples, container) {
  container.innerHTML = examples
    .map(
      (item) => `
        <button class="ghost-btn cron-example-btn" type="button" data-cron-example="${item.value}">
          ${item.label}
        </button>
      `,
    )
    .join("");
}

export function renderCronResult(result, summaryEl, fieldsEl, errorEl) {
  errorEl.classList.add("hidden");
  errorEl.textContent = "";
  summaryEl.innerHTML = `<div class="cron-summary-card">${result.summary}</div>`;
  fieldsEl.innerHTML = `
    <div class="cron-fields-grid">
      ${result.fields
        .map(
          (field) => `
            <div class="cron-field-card">
              <span class="cron-field-name">${field.label}</span>
              <code class="cron-field-token">${field.token}</code>
              <p class="cron-field-desc">${field.description}</p>
            </div>
          `,
        )
        .join("")}
    </div>
  `;
}

export function renderCronError(message, summaryEl, fieldsEl, errorEl) {
  summaryEl.innerHTML = "";
  fieldsEl.innerHTML = "";
  errorEl.textContent = message;
  errorEl.classList.remove("hidden");
}

export function renderCronEmpty(summaryEl, fieldsEl, errorEl) {
  summaryEl.innerHTML = `<p class="cron-empty">输入 Cron 表达式后，这里会显示中文解释。</p>`;
  fieldsEl.innerHTML = "";
  errorEl.classList.add("hidden");
  errorEl.textContent = "";
}
