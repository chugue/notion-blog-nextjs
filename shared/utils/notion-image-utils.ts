export const BROWSER_USER_AGENT =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

/**
 * URL이나 Content-Type으로 GIF인지 확인
 */
export function isGif(url: string, contentType: string | null): boolean {
    const urlLower = url.toLowerCase();
    const isGifUrl = urlLower.includes('.gif') || urlLower.includes('%2Egif');
    const isGifContentType = contentType?.includes('image/gif') ?? false;
    return isGifUrl || isGifContentType;
}

/**
 * attachment: URL을 Notion 영구 URL로 변환
 */
export function convertToNotionImageUrl(url: string, blockId: string, spaceId?: string): string {
    // 이미 HTTP URL이면 그대로 반환
    if (url.startsWith('http')) {
        return url;
    }

    // attachment: 스킴인 경우 Notion 영구 URL로 변환
    if (url.startsWith('attachment:')) {
        const encodedPath = encodeURIComponent(url);
        const params = new URLSearchParams({
            table: 'block',
            id: blockId,
        });
        if (spaceId) {
            params.set('spaceId', spaceId);
        }
        return `https://www.notion.so/image/${encodedPath}?${params.toString()}`;
    }

    return url;
}

/**
 * 이미지 fetch with retry (503 에러 시 재시도)
 */
export async function fetchImageWithRetry(
    url: string,
    options?: { maxRetries?: number; logPrefix?: string }
): Promise<Response> {
    const { maxRetries = 3, logPrefix = '[image-fetch]' } = options ?? {};
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const response = await fetch(url, {
                headers: {
                    'User-Agent': BROWSER_USER_AGENT,
                    Accept: 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
                    'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
                },
                cache: 'no-store',
            });

            if (response.status === 503 && attempt < maxRetries) {
                console.log(`${logPrefix} 503 received, retrying (${attempt}/${maxRetries})...`);
                await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
                continue;
            }

            return response;
        } catch (error) {
            lastError = error as Error;
            if (attempt < maxRetries) {
                console.log(`${logPrefix} Fetch error, retrying (${attempt}/${maxRetries})...`);
                await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
            }
        }
    }

    throw lastError || new Error('Max retries exceeded');
}
