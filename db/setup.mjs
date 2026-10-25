// npm run db:setup
// Carries the blueprint (schema.sql) and the first facts (seed.sql) into the
// real database, then prints every row so we can see what was created.

import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const sql = neon(process.env.DATABASE_URL);

const read = (file) => readFileSync(join(here, file), "utf8");
const statements = (text) =>
  text
    .split(/;\s*\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

for (const statement of [...statements(read("schema.sql")), ...statements(read("seed.sql"))]) {
  await sql.query(statement);
}

const restaurants = await sql`SELECT id, name, cuisine, area FROM restaurants ORDER BY id`;
const reviews = await sql`
  SELECT id, restaurant_id, rating, comment, created_at
  FROM reviews
  ORDER BY id
`;

console.log("restaurants:");
console.table(restaurants);
console.log("reviews:");
console.table(
  reviews.map((r) => ({
    ...r,
    created_at: new Date(r.created_at).toLocaleString("en-GB"),
  })),
);
console.log("Done. Two tables, one restaurant, three reviews.");
