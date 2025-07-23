import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export function formatDate(date: string) {
  return format(new Date(date), 'PPP', { locale: ko });
}
