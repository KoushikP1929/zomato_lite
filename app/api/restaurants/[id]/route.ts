// GET /api/restaurants/[id]
// The waiter who brings the bill. Reads facts, computes answers, shapes the
// response like the screen it feeds. The average exists only at the moment
// someone asks - it is never stored.

import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

type ReviewRow = {
  id: number;
  rating: number;
  comment: string;
  created_at: Date | string;
};

const toReview = (row: ReviewRow) => ({
  id: row.id,
  rating: row.rating,
  comment: row.comment,
  createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const restaurantId = Number(id);

  if (!Number.isInteger(restaurantId)) {
    return Response.json({ error: "Restaurant not found" }, { status: 404 });
  }

  const matches = await sql.query(
    "SELECT name, cuisine, area FROM restaurants WHERE id = $1",
    [restaurantId],
  );

  if (matches.length === 0) {
    return Response.json({ error: "Restaurant not found" }, { status: 404 });
  }
  const restaurant = matches[0]; // { name, cuisine, area }

  // Answer 1 - how many people have spoken, and what do they say on average?
  // AVG over zero rows is NULL, COUNT over zero rows is 0. Both are facts
  // about "nobody has spoken yet", and we pass that honesty through.
  const [stats] = await sql.query(
    "SELECT COUNT(*)::int AS total, ROUND(AVG(rating)::numeric, 1) AS average_rating FROM reviews WHERE restaurant_id = $1",
    [restaurantId],
  );

  // Answer 2 - the newest voice, if any.
  const latest = (await sql.query(
    "SELECT id, rating, comment, created_at FROM reviews WHERE restaurant_id = $1 ORDER BY created_at DESC LIMIT 1",
    [restaurantId],
  ))[0] as ReviewRow | undefined;

  // Answer 3 - every other voice, newest first (the page shows the newest one
  // separately, so we do not hand the same review twice).
  const olderRows = (latest
    ? await sql.query(
        "SELECT id, rating, comment, created_at FROM reviews WHERE restaurant_id = $1 AND id <> $2 ORDER BY created_at DESC",
        [restaurantId, latest.id],
      )
    : []) as ReviewRow[];

  return Response.json({
    name: restaurant.name,
    cuisine: restaurant.cuisine,
    area: restaurant.area,
    averageRating: stats.average_rating === null ? null : Number(stats.average_rating),
    totalReviews: stats.total,
    latestReview: latest ? toReview(latest) : null,
    reviews: olderRows.map(toReview),
  });
}
