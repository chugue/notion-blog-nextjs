import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export const formatDate = (date: string) => {
  return format(new Date(date), 'PPP', { locale: ko });
};

export const dateToStringYYYYMMDD = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');

  return `${y}-${m}-${d}`;
};

export const getKstDate = () => {
  const kstDate = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
  kstDate.setHours(0, 0, 0, 0);
  return kstDate;
};

export const getKstDateString = (): string => {
  return dateToStringYYYYMMDD(getKstDate());
};

export const getStartEndOfUTC = (date: Date) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  return { startOfDay, endOfDay };
};

export const getADayBefore = (date: Date) => {
  const yesterday = new Date(date);
  yesterday.setDate(date.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  return yesterday;
};
