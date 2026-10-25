// Screen 1 (client half): a form that collects three facts and hands them to
// the backend. It replaces no backend rule - it only keeps Submit grey until
// the form is complete. Kindness, not security.

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ReviewForm({ restaurantId }: { restaurantId: string }) {
  const router = useRouter();

  const [restaurantName, setRestaurantName] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // One contract, reused: the same GET that feeds screen 2 tells us the name.
  useEffect(() => {
    fetch(`/api/restaurants/${restaurantId}`)
      .then(async (res) => (res.ok ? res.json() : null))
      .then((data) => setRestaurantName(data?.name ?? ""))
      .catch(() => setRestaurantName(""));
  }, [restaurantId]);

  const canSubmit = rating !== null && comment.trim().length > 0 && !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Number() only reshapes URL text to match the agreed JSON contract -
        // no rules live in this line.
        body: JSON.stringify({ restaurantId: Number(restaurantId), rating, comment }),
      });
      const payload = await res.json().catch(() => null);

      if (res.ok) {
        router.push(`/restaurant/${restaurantId}`);
        return;
      }
      // The backend owns the rules. We display exactly what it said.
      setError(payload?.error ?? "Something went wrong. Please try again.");
      setSubmitting(false);
    } catch {
      setError("Could not reach the server. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-[560px] bg-zinc-50 px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
        {restaurantName || "Write a review"}
      </h1>
      {restaurantName && <p className="mt-1 text-sm text-zinc-500">What did you think?</p>}

      <form onSubmit={handleSubmit} className="mt-10">
        <label className="block text-sm font-medium text-zinc-900">Rating</label>
        <div className="mt-2 flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              aria-label={`Rate ${n} out of 5`}
              onClick={() => setRating(n)}
              className={`h-11 w-11 rounded-lg text-2xl leading-none transition-colors ${
                rating !== null && n <= rating ? "text-amber-600" : "text-zinc-300 hover:text-zinc-400"
              }`}
            >
              ★
            </button>
          ))}
        </div>

        <label htmlFor="comment" className="mt-8 block text-sm font-medium text-zinc-900">
          Your review
        </label>
        <textarea
          id="comment"
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="What did you eat? What would you tell a friend?"
          className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:border-amber-600 focus:outline-none"
        />

        {error && (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className={`mt-8 w-full rounded-lg px-4 py-3 text-sm font-medium text-white transition-colors ${
            canSubmit ? "bg-amber-600 hover:bg-amber-700" : "cursor-not-allowed bg-zinc-300"
          }`}
        >
          {submitting ? "Posting…" : "Submit review"}
        </button>
      </form>
    </main>
  );
}
