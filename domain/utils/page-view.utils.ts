export const crawlingBotCheck = (userAgent: string) => {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  const botRegex =
    /\b(?:googlebot|bingbot|yandexbot|duckduckbot|baiduspider|ahrefsbot|semrushbot|mj12bot|baiduspider)\b/;
  return botRegex.test(ua);
};
