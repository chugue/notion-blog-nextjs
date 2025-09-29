import { getKST } from '@/shared/utils/format-date';
import { cookies } from 'next/headers';

export const getKstMidnightExpiry = (): { expires: Date; maxAge: number } => {
  const now = new Date();
  // KST 기준 현재 시각 얻기 (구성요소 추출용)
  const kstNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
  const year = kstNow.getFullYear();
  const month = kstNow.getMonth();
  const date = kstNow.getDate();

  // KST의 다음 자정(00:00)을 UTC ms로 계산: Date.UTC(...)는 UTC 기준이므로 9시간을 빼준다.
  const nextMidnightUtcMs = Date.UTC(year, month, date + 1, 0, 0, 0) - 9 * 60 * 60 * 1000;
  const expires = new Date(nextMidnightUtcMs);

  // 만료까지 남은 초 계산, 최대 86400초(1일)
  let maxAge = Math.floor((expires.getTime() - Date.now()) / 1000);
  if (maxAge > 86400) maxAge = 86400;
  if (maxAge < 0) maxAge = 0;

  return { expires, maxAge };
};

export const checkCookies = async () => {
  const cookieStore = await cookies();
  const cookie = cookieStore.get('visitor-cookie');
  const todayKST = getKST().toISOString();
  let isNewVisitor = true;

  if (!cookie || cookie.value !== todayKST) {
    cookieStore.set({
      name: 'visitor-cookie',
      value: todayKST,
      expires: getKstMidnightExpiry().expires,
      maxAge: getKstMidnightExpiry().maxAge,
      httpOnly: true,
      secure: true,
      path: '/',
    });
    isNewVisitor = true;
    return isNewVisitor;
  }

  if (cookie && cookie.value === todayKST) {
    isNewVisitor = false;
    return isNewVisitor;
  }

  return isNewVisitor;
};
