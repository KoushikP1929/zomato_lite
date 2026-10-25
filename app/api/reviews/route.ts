// POST /api/reviews
// The waiter who takes orders. Validates in a fixed order, writes exactly one
// fact (a row of reviews), answers with the new row's id.

import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);

  if (body === null || typeof body !== "object") {
    return Response.json({ error: "Request body must be JSON" }, { status: 400 });
  }

  const { restaurantId, rating, comment } = body as {
    restaurantId?: unknown;
    rating?: unknown;
    comment?: unknown;
  };

  // Check 1 — is rating a whole number between 1 and 5?
  if (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return Response.json(
      { error: "Rating must be a whole number between 1 and 5" },
      { status: 400 },
    );
  }

  // Check 2 — is comment a non-empty string after trimming whitespace?
  if (typeof comment !== "string" || comment.trim().length === 0) {
    return Response.json({ error: "Comment cannot be empty" }, { status: 400 });
  }

  // Check 3 — does the restaurant actually exist? (This one is a database lookup.)
  if (typeof restaurantId !== "number" || !Number.isInteger(restaurantId)) {
    return Response.json(
      { error: "Send restaurantId as the number of the restaurant you reviewed" },
      { status: 400 },
    );
  }
  const matches = await sql.query(
    "SELECT id FROM restaurants WHERE id = $1",
    [restaurantId],
  );
  if (matches.length === 0) {
    return Response.json(
      { error: `Restaurant ${restaurantId} does not exist` },
      { status: 400 },
    );
  }

  // All checks passed — store one fact. Only one. Nothing else changes.
  const newRows = await sql.query(
    "INSERT INTO reviews (restaurant_id, rating, comment) VALUES ($1, $2, $3) RETURNING id",
    [restaurantId, rating, comment!.trim()],
  );

  return Response.json({ success: true, reviewId: newRows[0].id }, { status: 201 });
}
