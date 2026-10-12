function decodeHeader(value) {
  if (!value) return null;
  try {
    return decodeURIComponent(value).slice(0, 80);
  } catch {
    return value.slice(0, 80);
  }
}

function detectDevice(ua) {
  if (/ipad|tablet|playbook|silk/i.test(ua)) return "tablet";
  if (/mobi|iphone|ipod|android.*mobile|windows phone/i.test(ua)) return "mobile";
  return "desktop";
}

function detectBrowser(ua) {
  if (/edg\//i.test(ua)) return "Edge";
  if (/opr\/|opera/i.test(ua)) return "Opera";
  if (/samsungbrowser/i.test(ua)) return "Samsung Internet";
  if (/firefox|fxios/i.test(ua)) return "Firefox";
  if (/chrome|crios/i.test(ua)) return "Chrome";
  if (/safari/i.test(ua)) return "Safari";
  return "Other";
}

function detectOs(ua) {
  if (/windows/i.test(ua)) return "Windows";
  if (/iphone|ipad|ipod/i.test(ua)) return "iOS";
  if (/android/i.test(ua)) return "Android";
  if (/mac os x|macintosh/i.test(ua)) return "macOS";
  if (/cros/i.test(ua)) return "ChromeOS";
  if (/linux/i.test(ua)) return "Linux";
  return "Other";
}

function referrerHost(value) {
  if (!value) return null;
  try {
    return new URL(value).hostname.slice(0, 80) || null;
  } catch {
    return null;
  }
}

/** Coarse, privacy-friendly viewer details (no IP address is stored). */
export function getViewerInfo(headers) {
  const ua = headers.get("user-agent") || "";
  return {
    country: decodeHeader(headers.get("x-vercel-ip-country")),
    region: decodeHeader(headers.get("x-vercel-ip-country-region")),
    city: decodeHeader(headers.get("x-vercel-ip-city")),
    device: detectDevice(ua),
    browser: detectBrowser(ua),
    os: detectOs(ua),
    referrer: referrerHost(headers.get("referer")),
  };
}
