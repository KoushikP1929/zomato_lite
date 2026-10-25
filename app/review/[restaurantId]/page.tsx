// Server page: resolves THIS address via await params at request time.
// instant=false declares this segment answers fresh, per request.
export const instant = false;

import ReviewForm from "./review-form";

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ restaurantId: string }>;
}) {
  const { restaurantId } = await params;
  return <ReviewForm restaurantId={restaurantId} />;
}
