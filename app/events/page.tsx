import type { Metadata } from "next";
import { getEvents } from "@/lib/content";
import { EventsPage } from "@/components/sections/events";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Events & workshops",
  description:
    "Workshops, CTFs and industry nights at ISET Charguia. Past event galleries, upcoming registrations and the season calendar.",
  alternates: { canonical: "/events" },
};

export default async function Page() {
  const events = await getEvents();
  return <EventsPage events={events} />;
}
