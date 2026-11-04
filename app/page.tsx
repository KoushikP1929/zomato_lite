// The lobby: its only job is to send every visitor to the restaurant.
// One redirect, no heartbeat, nothing to think about.
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/restaurant/1");
}
