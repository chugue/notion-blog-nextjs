export const convertToImageProxy = (rawSrc: string) => {
  try {
    const u = new URL(rawSrc);
    const isNotionSignedS3 =
      u.hostname === 'prod-files-secure.s3.us-west-2.amazonaws.com' ||
      u.hostname.endsWith('.amazonaws.com');

    // 본문 이미지: 블록 ID를 몰라서 Notion /image로 변환하지 않고 프록시 사용
    if (isNotionSignedS3) {
      return `/api/image-proxy?url=${encodeURIComponent(rawSrc)}`;
    }

    return rawSrc;
  } catch {
    return rawSrc;
  }
};
