import type { Block } from 'notion-types';

/**
 * notion-types v7.10+ 에서 NotionMapBox<T>가
 * `{ role, value: T }` 또는 `{ role, value: { role, value: T } }` 유니온이므로,
 * 중첩 구조를 풀어서 실제 Block을 반환합니다.
 */
export function unwrapBlock(entry: unknown): Block | undefined {
  if (!entry || typeof entry !== 'object') return undefined;
  const obj = entry as Record<string, unknown>;
  if ('type' in obj && typeof obj.type === 'string') return obj as unknown as Block;
  if ('value' in obj) return unwrapBlock(obj.value);
  return undefined;
}
