import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export const formatDate = (date: string) => {
  return format(new Date(date), 'PPP', { locale: ko });
};

export const dateToKoreaDateString = (date: Date) => {
  return date.toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });
};

export const getKST = () => {
  const now = new Date();
  // 한국 시간대로 변환된 새로운 Date 객체 생성
  const kstDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
  return kstDate;
};

export const getStartEndOfDay = (date: Date) => {
  const startOfDay = date;
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = date;
  endOfDay.setHours(23, 59, 59, 999);
  return { startOfDay, endOfDay };
};

export const getYesterday = (date: Date) => {
  return new Date(date.setDate(date.getDate() - 1));
};
