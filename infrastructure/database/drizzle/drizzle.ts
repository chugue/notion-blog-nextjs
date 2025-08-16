import 'dotenv/config';

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@/infrastructure/database/supabase/schema';

const connectionString = process.env.SUPABASE_NEXT_PUBLIC_SUPABASE_URL;

export const client = postgres(connectionString!, { prepare: false });
export const db = drizzle(client, { schema });
