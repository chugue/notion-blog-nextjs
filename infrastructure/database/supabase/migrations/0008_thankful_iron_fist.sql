

-- 1. 같은 날짜의 중복 데이터 병합 (visited_pathnames 합치기)
WITH duplicates AS (
  SELECT 
    ip_hash,
    date_trunc('day', date AT TIME ZONE 'Asia/Seoul')::date as date_kst,
    user_agent,
    array_agg(DISTINCT pathname) as merged_pathnames,
    (array_agg(id ORDER BY created_at))[1] as keep_id,  -- 👈 MIN 대신 첫 번째 id 선택
    MIN(created_at) as first_created,
    MAX(updated_at) as last_updated
  FROM visitor_info,
  LATERAL unnest(visited_pathnames) as pathname
  GROUP BY ip_hash, date_trunc('day', date AT TIME ZONE 'Asia/Seoul')::date, user_agent
)
UPDATE visitor_info v
SET 
  visited_pathnames = d.merged_pathnames,
  updated_at = d.last_updated
FROM duplicates d
WHERE v.id = d.keep_id;

-- 2. 중복 레코드 삭제 (keep_id만 남기고 나머지 삭제)
DELETE FROM visitor_info
WHERE id NOT IN (
  SELECT (array_agg(id ORDER BY created_at))[1]  -- 👈 MIN 대신 첫 번째 id 선택
  FROM visitor_info
  GROUP BY ip_hash, date_trunc('day', date AT TIME ZONE 'Asia/Seoul')::date
);

-- 3. 이제 타입 변경 (KST 날짜로)
ALTER TABLE "visitor_info" 
ALTER COLUMN "date" TYPE date 
USING (date AT TIME ZONE 'Asia/Seoul')::date;


