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
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const kst = new Date(utc + 9 * 3600000); // UTC+9 (한국 시간)
  return kst;
};

export const getStartEndOfDay = (date: Date) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  return { startOfDay, endOfDay };
};

export const getYesterday = (date: Date) => {
  const yesterday = new Date(date);
  yesterday.setDate(date.getDate() - 1);
  return yesterday;
};
