import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export const formatDate = (date: string) => {
  return format(new Date(date), 'PPP', { locale: ko });
};

export const dateToKoreaDateString = (date: Date) => {
  return date.toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });
};
