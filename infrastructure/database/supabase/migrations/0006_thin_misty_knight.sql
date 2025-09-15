-- 1) 백업 테이블 생성 (선택사항)
CREATE TABLE IF NOT EXISTS visitor_info_backup AS TABLE visitor_info WITH NO DATA;
INSERT INTO visitor_info_backup SELECT * FROM visitor_info;

-- 2) 임시 컬럼 추가
ALTER TABLE visitor_info ADD COLUMN IF NOT EXISTS date_tmp timestamp without time zone;

-- 3) 안전한 변환
UPDATE visitor_info SET date_tmp = date::timestamp;

-- 4) 기존 인덱스 제거
DROP INDEX IF EXISTS visitor_info_date_idx;
DROP INDEX IF EXISTS visitor_info_ip_hash_date_unique;

-- 5) 컬럼 교체
ALTER TABLE visitor_info DROP COLUMN date;
ALTER TABLE visitor_info RENAME COLUMN date_tmp TO date;
ALTER TABLE visitor_info ALTER COLUMN date SET NOT NULL;

-- 6) 인덱스 재생성
CREATE INDEX IF NOT EXISTS visitor_info_date_idx ON visitor_info(date);
CREATE UNIQUE INDEX IF NOT EXISTS visitor_info_ip_hash_date_unique ON visitor_info(ip_hash, date);