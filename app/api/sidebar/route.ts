// 기존 노션 구독이 /api/sidebar를 바라보고 있는 전환기 동안 유지하는 별칭.
// 구독 URL을 /api/notion/webhook으로 옮긴 뒤에는 이 파일을 삭제해도 된다.
export { POST } from '../notion/webhook/route';
