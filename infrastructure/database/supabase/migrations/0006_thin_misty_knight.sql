-- 기존 date 컬럼을 자정(00:00:00)으로 정규화
-- KST 기준 날짜의 자정을 UTC로 저장
UPDATE site_metrics
SET date = date_trunc('day', date AT TIME ZONE 'Asia/Seoul') AT TIME ZONE 'Asia/Seoul' AT TIME ZONE 'UTC'
WHERE date != date_trunc('day', date AT TIME ZONE 'Asia/Seoul') AT TIME ZONE 'Asia/Seoul' AT TIME ZONE 'UTC';

-- 인덱스 재구성 (선택사항)
REINDEX INDEX site_metrics_date_idx;