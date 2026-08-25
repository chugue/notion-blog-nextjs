---
quick_id: 260825-wl1
status: complete
date: 2026-08-25
---

# Summary: notion-client User-Agent 헤더 추가

## 변경
- `infrastructure/database/external-api/notion-client.ts`: `new NotionAPI({ kyOptions: { headers: { 'user-agent': ... } } })`.
  UA는 `NOTION_PRIVATE_API_USER_AGENT` env로 덮어쓸 수 있음.

## 검증
- 수정 전: `getPage('3c59c76c-…')` → `Unexpected token '<'` (Cloudflare 403 HTML)
- 수정 후: 동일 호출 → OK, 114 blocks
- `tsc --noEmit`: 해당 파일 에러 없음 (기존 `__tests__` mock 타입 에러만 존재, 무관)

## 후속
- 배포는 사용자가 수행. 배포 후 신규 글 첫 요청이 Notion 페치 → Supabase 캐시 저장.
