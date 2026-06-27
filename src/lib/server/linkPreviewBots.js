const PREVIEW_BOT_RE =
  /facebookexternalhit|facebot|whatsapp|twitterbot|linkedinbot|slackbot|telegrambot|discordbot|embedly|quora link preview|redditbot|pinterestbot|vkshare|skypeuripreview|googlebot/i;

export function isPreviewBot(userAgent = "") {
  return PREVIEW_BOT_RE.test(userAgent);
}

export function isPrefetchRequest(headers) {
  const purpose = headers.get("purpose") || headers.get("sec-purpose") || "";
  return purpose.toLowerCase().includes("prefetch");
}

export function shouldSkipShareRedeem(headers) {
  const userAgent = headers.get("user-agent") || "";
  return isPreviewBot(userAgent) || isPrefetchRequest(headers);
}
