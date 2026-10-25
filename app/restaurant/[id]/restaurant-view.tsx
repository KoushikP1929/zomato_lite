// Screen 2 (client half): fetches one API's answer and prints it. This file
// fetches once, prints once, and computes nothing.

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Review = { id: number; rating: number; comment: string; createdAt: string };

type RestaurantPage = {
  name: string;
  cuisine: string;
  area: string;
  averageRating: number | null;
  totalReviews: number;
  latestReview: Review | null;
  reviews: Review[];
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

function Stars({ filled }: { filled: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${filled} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= filled ? "text-amber-600" : "text-zinc-300"}>
          ★
        </span>
      ))}
    </span>
  );
}

export default function RestaurantView({ id }: { id: string }) {
  const [data, setData] = useState<RestaurantPage | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "notfound" | "error">("loading");

  useEffect(() => {
    setStatus("loading");
    fetch(`/api/restaurants/${id}`)
      .then(async (res) => {
        if (res.status === 404) return setStatus("notfound");
        if (!res.ok) return setStatus("error");
        setData(await res.json());
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, [id]);

  if (status === "loading") {
    return <p className="p-20 text-center text-sm text-zinc-500">Loading…</p>;
  }
  if (status === "notfound" || status === "error") {
    return (
      <p className="p-20 text-center text-sm text-zinc-500">
        {status === "notfound" ? "This restaurant does not exist." : "Could not load this page. Try again."}
      </p>
    );
  }
  if (!data) return null;

  return (
    <main className="mx-auto min-h-screen w-full max-w-[560px] bg-zinc-50 px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">{data.name}</h1>
      <p className="mt-1 text-sm text-zinc-500">
        {data.cuisine} · {data.area}
      </p>

      {data.averageRating === null ? (
        // The honest empty state: nobody has spoken yet. Not a fake 0.0.
        <div className="mt-12 rounded-xl border border-zinc-200 bg-white p-8 text-center">
          <p className="text-lg font-medium text-zinc-900">No reviews yet</p>
          <p className="mt-1 text-sm text-zinc-500">Be the first to say what you ate.</p>
          <Link
            href={`/review/${id}`}
            className="mt-5 inline-block rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
          >
            Write the first review
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-10 flex items-end gap-3">
            {/* The average arrives ready-made. We print it. No adding. No dividing. No sorting. */}
            <p className="text-6xl font-semibold tabular-nums text-zinc-900">{data.averageRating}</p>
            <p className="pb-2 text-sm text-zinc-500">
              {data.totalReviews} {data.totalReviews === 1 ? "review" : "reviews"}
            </p>
          </div>

          {data.latestReview && (
            <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-6">
              <p className="text-xs font-medium uppercase tracking-wider text-amber-700">Latest review</p>
              <div className="mt-3">
                <Stars filled={data.latestReview.rating} />
              </div>
              <p className="mt-3 text-lg text-zinc-900">{data.latestReview.comment}</p>
              <p className="mt-3 text-sm text-zinc-500">{formatDate(data.latestReview.createdAt)}</p>
            </div>
          )}

          <ul className="mt-4 divide-y divide-zinc-200">
            {data.reviews.map((review) => (
              <li key={review.id} className="py-5">
                <div className="flex items-center justify-between">
                  <Stars filled={review.rating} />
                  <span className="text-sm text-zinc-400">{formatDate(review.createdAt)}</span>
                </div>
                <p className="mt-2 text-zinc-800">{review.comment}</p>
              </li>
            ))}
          </ul>

          <div className="mt-10 border-t border-zinc-200 pt-6">
            <Link
              href={`/review/${id}`}
              className="text-sm font-medium text-amber-700 underline decoration-amber-600/40 underline-offset-4 hover:text-amber-800"
            >
              Write a review
            </Link>
          </div>
        </>
      )}
    </main>
  );
}
