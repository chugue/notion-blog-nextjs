import 'dotenv/config';

import * as schema from '@/infrastructure/database/supabase/schema';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const connectionString = process.env.SUPABASE_NEXT_PUBLIC_SUPABASE_URL;

export const client = postgres(connectionString!, { prepare: false });
export const db = drizzle(client, { schema });

export type DrizzleClient = ReturnType<typeof drizzle>;
export type Transaction = Parameters<Parameters<DrizzleClient['transaction']>[0]>[0];
