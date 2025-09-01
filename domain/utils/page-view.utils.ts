export const crawlingBotCheck = (userAgent: string) => {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();

  if (ua.startsWith('vercel-')) return true;
  if (ua.includes('Mediapartners-Google')) return true;
  const botRegex =
    /\b(?:googlebot|bingbot|yandexbot|duckduckbot|baiduspider|ahrefsbot|semrushbot|mj12bot|baiduspider)\b/;
  return botRegex.test(ua);
};
