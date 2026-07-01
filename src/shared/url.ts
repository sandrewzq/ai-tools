export function joinUrl(baseUrl: string, path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  return `${baseUrl.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

export function shouldUseProxy() {
  return window.location.protocol === "http:" && window.location.port === "8080";
}
