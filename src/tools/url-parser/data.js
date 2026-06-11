export function parseUrl(input) {
  try {
    const text = input.trim();
    if (!text) return { error: "请输入 URL" };
    const url = new URL(text.includes("://") ? text : `https://${text}`);
    const query = [...url.searchParams.entries()].map(([key, value], index) => ({ index: index + 1, key, value }));
    return {
      error: null,
      parts: {
        href: url.href,
        protocol: url.protocol,
        username: url.username,
        password: url.password ? "••••••" : "",
        host: url.host,
        hostname: url.hostname,
        port: url.port || defaultPort(url.protocol),
        pathname: url.pathname,
        search: url.search,
        hash: url.hash,
        origin: url.origin,
      },
      query,
      queryJson: queryToJson(query),
    };
  } catch (error) {
    return { error: `URL 解析失败：${error.message}` };
  }
}

function defaultPort(protocol) {
  if (protocol === "https:") return "443";
  if (protocol === "http:") return "80";
  return "";
}

function queryToJson(query) {
  return query.reduce((acc, item) => {
    if (Object.prototype.hasOwnProperty.call(acc, item.key)) {
      acc[item.key] = Array.isArray(acc[item.key]) ? [...acc[item.key], item.value] : [acc[item.key], item.value];
    } else {
      acc[item.key] = item.value;
    }
    return acc;
  }, {});
}

export function buildUrl(query) {
  return query.map(({ key, value }) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join("&");
}

export function getUrlExamples() {
  return [
    "https://api.example.com:8443/v1/chat?model=gpt-4o&stream=true#result",
    "https://user:secret@example.com/path/to?a=1&a=2&empty=#top",
  ];
}
