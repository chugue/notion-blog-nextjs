-- 1) 백업(선택)
CREATE TABLE IF NOT EXISTS site_metrics_backup AS TABLE site_metrics WITH NO DATA;
INSERT INTO site_metrics_backup SELECT * FROM site_metrics;

-- 2) 임시 칼럼 추가
ALTER TABLE site_metrics ADD COLUMN IF NOT EXISTS date_tmp timestamp without time zone;

-- 3) 안전한 변환 시도 (YYYY-MM-DD / YYYYMMDD 처리)
UPDATE site_metrics
SET date_tmp = CASE
  WHEN date::text ~ '^\d{4}-\d{2}-\d{2}([ T].*)?$' THEN date::timestamp without time zone
  WHEN date::text ~ '^[0-9]{8}$' THEN to_date(date::text, 'YYYYMMDD')::timestamp without time zone
  ELSE NULL
END;

-- 4) 변환 실패 행이 있으면 마이그레이션 중단(에러 발생)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM site_metrics WHERE date IS NOT NULL AND date_tmp IS NULL) THEN
    RAISE EXCEPTION 'Non-convertible rows exist. Run: SELECT id, date::text FROM site_metrics WHERE date IS NOT NULL AND date_tmp IS NULL;';
  END IF;
END
$$;

-- 5) 기존 인덱스/제약 제거(안전하게 IF EXISTS)
DROP INDEX IF EXISTS site_metrics_date_idx;
ALTER TABLE site_metrics DROP CONSTRAINT IF EXISTS site_metrics_date_key;

-- 6) 칼럼 교체
ALTER TABLE site_metrics DROP COLUMN date;
ALTER TABLE site_metrics RENAME COLUMN date_tmp TO date;

-- 7) 인덱스/유니크 재생성
CREATE UNIQUE INDEX IF NOT EXISTS site_metrics_date_idx ON site_metrics(date);
-- 필요한 경우 아래 주석 해제
-- ALTER TABLE site_metrics ADD CONSTRAINT site_metrics_date_key UNIQUE (date);