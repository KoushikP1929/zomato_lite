// Server page: resolves THIS address (/restaurant/3, /restaurant/999...) via
// await params at request time. instant=false declares this segment answers
// fresh, per request - the honest choice for a page fed by live reviews.
export const instant = false;

import RestaurantView from "./restaurant-view";

export default async function RestaurantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <RestaurantView id={id} />;
}
