import { timingSafeEqual } from 'node:crypto';

const LEGEND_ENDPOINT = process.env.LEGEND_ENDPOINT || 'http://127.0.0.1:8092';
const LEGEND_SERVICE_TOKEN = process.env.LEGEND_SERVICE_TOKEN || '';
const PPPOE_TABLE = 'pppoe_sessions';

type LegendRecord<T> = { record_id: string; payload: T };

function legendHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${LEGEND_SERVICE_TOKEN}`
  };
}

export function legendConfigured(): boolean {
  return LEGEND_SERVICE_TOKEN.length >= 32;
}

export async function persistRecord(table: string, id: string, payload: object): Promise<boolean> {
  if (!legendConfigured()) return false;
  try {
    const response = await fetch(`${LEGEND_ENDPOINT}/api/v1/records/${table}/${id}`, {
      method: 'PUT',
      headers: legendHeaders(),
      body: JSON.stringify({ payload }),
      signal: AbortSignal.timeout(1500)
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function persistSession(session: { id: string }): Promise<boolean> {
  return persistRecord(PPPOE_TABLE, session.id, session);
}

export async function hydrateSessions<T extends { id: string }>(target: Map<string, T>): Promise<number> {
  if (!legendConfigured()) return 0;
  try {
    const response = await fetch(`${LEGEND_ENDPOINT}/api/v1/records/${PPPOE_TABLE}?limit=1000`, {
      headers: legendHeaders(),
      signal: AbortSignal.timeout(3000)
    });
    if (!response.ok) return 0;
    const records = (await response.json()) as LegendRecord<T>[];
    for (const record of records) target.set(record.payload.id, record.payload);
    return records.length;
  } catch {
    return 0;
  }
}

export function isAuthorizedBearer(header: string | undefined, expected: string): boolean {
  if (!header?.startsWith('Bearer ') || expected.length < 32) return false;
  const provided = Buffer.from(header.slice('Bearer '.length));
  const reference = Buffer.from(expected);
  return provided.length === reference.length && timingSafeEqual(provided, reference);
}

