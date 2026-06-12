import { Pool, types } from "pg";

// Type OID 1114 = TIMESTAMP, 1184 = TIMESTAMPTZ
// pg secara default mengembalikan keduanya sebagai string tanpa timezone suffix,
// sehingga browser salah menginterpretasikan sebagai local time.
// Fix: parse di sisi server menjadi ISO string dengan "Z" agar selalu jelas UTC.
types.setTypeParser(1114, (val: string) => new Date(val + "Z").toISOString());
types.setTypeParser(1184, (val: string) => new Date(val).toISOString());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  keepAlive: true,
});

export default pool;
