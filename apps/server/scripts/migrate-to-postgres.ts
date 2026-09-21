/**
 * migrate-to-postgres.ts — legacy JSON → Supabase Postgres migration.
 *
 * Generic: reads JSON files given via CLI args (array of records or a single
 * record) and upserts them into a Postgres table via Supabase. Upserts by
 * `id` — no data loss on re-runs.
 *
 * Usage:
 *   npx tsx apps/server/scripts/migrate-to-postgres.ts data/users.json:profiles data/listings.json:listings
 *   npx tsx apps/server/scripts/migrate-to-postgres.ts --from-live profiles users
 *
 * --from-live pulls each table from a live deployment (LIVE_API_URL, e.g.
 * https://api.example.com/api/xk9-admin-console-7f3a/users/export) into a
 * local JSON file first, then inserts.
 *
 * Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (required for writes),
 *      LIVE_API_URL (required with --from-live)
 */
import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import http from 'node:http';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const LIVE_API_URL = process.env.LIVE_API_URL;

const args = process.argv.slice(2);
const fromLive = args.includes('--from-live');

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function fetchJson(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    mod
      .get(url, { headers: { Accept: 'application/json, text/csv' } }, (res) => {
        let raw = '';
        res.on('data', (c) => (raw += c));
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 400) {
            return reject(new Error(`HTTP ${res.statusCode} from ${url}`));
          }
          try {
            resolve(JSON.parse(raw));
          } catch {
            resolve(parseCsv(raw));
          }
        });
      })
      .on('error', reject);
  });
}

/** Minimal CSV parser for the /users/export format. */
function parseCsv(text: string): any[] {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  const parseLine = (line: string) => {
    const out: string[] = [];
    let cur = '';
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQ) {
        if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
        else if (ch === '"') inQ = false;
        else cur += ch;
      } else if (ch === '"') inQ = true;
      else if (ch === ',') { out.push(cur); cur = ''; }
      else cur += ch;
    }
    out.push(cur);
    return out;
  };
  const headers = parseLine(lines[0]);
  return lines.slice(1).map((l) => {
    const vals = parseLine(l);
    const row: any = {};
    headers.forEach((h, i) => (row[h] = vals[i] === '' ? null : vals[i]));
    return row;
  });
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function upsertTable(table: string, records: any[]) {
  if (!records.length) {
    console.log(`[skip] ${table}: no records`);
    return;
  }
  const batches = chunk(records, 500);
  let inserted = 0;
  for (const batch of batches) {
    const { error } = await supabase.from(table).upsert(batch, { onConflict: 'id' });
    if (error) throw new Error(`${table}: ${error.message}`);
    inserted += batch.length;
  }
  console.log(`[ok] ${table}: upserted ${inserted} records`);
}

async function main() {
  const targets = args.filter((a) => !a.startsWith('--'));
  if (!targets.length) {
    console.error('Usage: tsx scripts/migrate-to-postgres.ts <file.json>:<table> ... | --from-live <table> ...');
    process.exit(1);
  }

  for (const target of targets) {
    try {
      let records: any[] = [];
      if (fromLive) {
        if (!LIVE_API_URL) {
          throw new Error('--from-live requires LIVE_API_URL env var');
        }
        const table = target.includes(':') ? target.split(':')[1] : target;
        const url = `${LIVE_API_URL.replace(/\/$/, '')}/xk9-admin-console-7f3a/users/export`;
        console.log(`[live] pulling ${table} from ${url}`);
        const data = await fetchJson(url);
        records = Array.isArray(data) ? data : data.users ?? [];
        const localFile = path.resolve(`migrate-${table}-${Date.now()}.json`);
        fs.writeFileSync(localFile, JSON.stringify(records, null, 2));
        console.log(`[live] saved ${records.length} records to ${localFile}`);
        await upsertTable(table, records);
      } else {
        const [file, table] = target.split(':');
        if (!file || !table) throw new Error(`Invalid target "${target}" — expected <file.json>:<table>`);
        const raw = JSON.parse(fs.readFileSync(path.resolve(file), 'utf-8'));
        records = Array.isArray(raw) ? raw : [raw];
        await upsertTable(table, records);
      }
    } catch (err: any) {
      console.error(`[fail] ${target}: ${err.message}`);
      process.exitCode = 1;
    }
  }
}

main();