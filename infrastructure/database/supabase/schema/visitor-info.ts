import { VisitorInfo } from '@/domain/entities/visitor-info.entity';
import { index, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

export const visitorInfo = pgTable(
  'visitor_info',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    ipHash: text('ip_hash').notNull(),
    userAgent: text('user_agent').notNull(),
    date: timestamp('date').notNull(),
    visitedPathnames: text('visited_pathnames').array().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    ipHashIdx: index('visitor_info_ip_hash_idx').on(table.ipHash),
    userAgentIdx: index('visitor_info_user_agent_idx').on(table.userAgent),
    dateIdx: index('visitor_info_date_idx').on(table.date),
    visitedPathnamesIdx: index('visitor_info_visited_pathnames_idx').on(table.visitedPathnames),
    ipDateUnique: uniqueIndex('visitor_info_ip_hash_date_unique').on(table.ipHash, table.date), // 👈 복합 유니크
  })
);

export type VisitorInfoSelect = typeof visitorInfo.$inferSelect;
export type VisitorInfoInsert = typeof visitorInfo.$inferInsert;

export const visitorInfoToDomain = (record: VisitorInfoSelect): VisitorInfo => {
  return {
    id: record.id,
    ipHash: record.ipHash,
    userAgent: record.userAgent,
    date: record.date,
    visitedPathnames: record.visitedPathnames,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
};

export const visitorInfoToDb = (domain: VisitorInfo): VisitorInfoInsert => {
  return {
    ipHash: domain.ipHash,
    userAgent: domain.userAgent,
    date: domain.date,
    visitedPathnames: domain.visitedPathnames,
  };
};
