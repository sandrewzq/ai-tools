export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return { ok: true, message: "已复制" };
  } catch {
    return { ok: false, message: "复制失败，请手动复制" };
  }
}
