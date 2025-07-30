import { formatDate } from '@/shared/utils/format-date';

describe('Shared Utils - Format Date', () => {
  describe('formatDate', () => {
    it('유효한 날짜 문자열을 한국어 형식으로 포맷해야 한다', () => {
      // Given
      const dateString = '2024-01-15';

      // When
      const result = formatDate(dateString);

      // Then
      expect(result).toBe('2024년 1월 15일');
    });

    it('ISO 날짜 문자열을 올바르게 포맷해야 한다', () => {
      // Given
      const isoDateString = '2024-12-25T09:30:00.000Z';

      // When
      const result = formatDate(isoDateString);

      // Then
      expect(result).toBe('2024년 12월 25일');
    });

    it('다른 날짜 형식도 올바르게 처리해야 한다', () => {
      // Given
      const dateString = '2024/03/08';

      // When
      const result = formatDate(dateString);

      // Then
      expect(result).toBe('2024년 3월 8일');
    });

    it('잘못된 날짜 문자열이 주어지면 에러를 던져야 한다', () => {
      // Given
      const invalidDateString = 'invalid-date';

      // When & Then
      expect(() => formatDate(invalidDateString)).toThrow();
    });

    it('빈 문자열이 주어지면 에러를 던져야 한다', () => {
      // Given
      const emptyString = '';

      // When & Then
      expect(() => formatDate(emptyString)).toThrow();
    });
  });
});
