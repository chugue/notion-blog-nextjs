/**
 * Notion recordMap 영속 캐시 워밍 스크립트 (resumable).
 *
 * 비공개 notion-client는 미인증이라 짧은 시간에 ~55회 이상 연속 호출하면 IP 차단되고
 * 한동안 풀리지 않는다. 그래서 이 스크립트는:
 *   - 이미 캐시된 글은 건너뛴다(재실행 안전).
 *   - 직렬 + 간격으로 천천히 페치한다.
 *   - 차단(HTML 응답)이 연속되면 멈춘다 → 쿨다운 후 다시 실행하면 남은 글만 이어서 채운다.
 *
 * 사용: node scripts/seed-record-map-cache.mjs   (필요시 여러 번)
 * 환경변수: NOTION_TOKEN, NOTION_DATABASE_ID, DATABASE_URL (.env 또는 .env.local)
 */
import { Client } from '@notionhq/client';
import { NotionAPI } from 'notion-client';
import postgres from 'postgres';
import fs from 'fs';

for (const file of ['.env', '.env.local']) {
  if (!fs.existsSync(file)) continue;
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
  }
}

const SPACING_MS = Number(process.env.SEED_SPACING_MS ?? 350);
const BLOCK_COOLDOWN_MS = Number(process.env.SEED_BLOCK_COOLDOWN_MS ?? 8000);
const MAX_CONSECUTIVE_BLOCKS = Number(process.env.SEED_MAX_CONSECUTIVE_BLOCKS ?? 4);

const notion = new Client({ auth: process.env.NOTION_TOKEN, notionVersion: '2022-06-28' });
const api = new NotionAPI();
const sql = postgres(process.env.DATABASE_URL, { prepare: false });

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const isBlock = (e) =>
  /not valid JSON|<!doctype|<html/i.test(e?.message ?? '');

async function publishedIds() {
  const ids = [];
  let cursor;
  do {
    const r = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID,
      filter: { and: [{ property: 'isPublic', select: { equals: 'Public' } }] },
      start_cursor: cursor,
    });
    r.results.forEach((p) => ids.push(p.id));
    cursor = r.has_more ? r.next_cursor : undefined;
  } while (cursor);
  return ids;
}

const all = await publishedIds();
const cached = new Set((await sql`SELECT id FROM notion_record_maps`).map((r) => r.id));
const todo = all.filter((id) => !cached.has(id));
console.log(`published=${all.length} cached=${cached.size} remaining=${todo.length}`);

let ok = 0;
let consecutiveBlocks = 0;

for (const id of todo) {
  try {
    const rm = await api.getPage(id);
    if (!rm?.block || !Object.keys(rm.block).length) throw new Error('empty recordMap');

    await sql`INSERT INTO notion_record_maps (id, record_map, fetched_at)
              VALUES (${id}, ${sql.json(rm)}, now())
              ON CONFLICT (id) DO UPDATE SET record_map = EXCLUDED.record_map, fetched_at = now()`;
    ok++;
    consecutiveBlocks = 0;
    process.stdout.write('.');
    await wait(SPACING_MS);
  } catch (e) {
    if (isBlock(e)) {
      consecutiveBlocks++;
      process.stdout.write('B');
      if (consecutiveBlocks >= MAX_CONSECUTIVE_BLOCKS) {
        console.log(
          `\nNotion is blocking (${consecutiveBlocks} in a row). Stopping — re-run after a cooldown to continue.`
        );
        break;
      }
      await wait(BLOCK_COOLDOWN_MS);
    } else {
      process.stdout.write('x');
    }
  }
}

const total = (await sql`SELECT count(*)::int n FROM notion_record_maps`)[0].n;
console.log(`\nseeded this run=${ok} | total cached=${total}/${all.length}`);
await sql.end();
