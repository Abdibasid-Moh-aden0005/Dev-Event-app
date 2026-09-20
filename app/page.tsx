import EventCard from "@/components/EventCard";
import ExploreBtn from "@/components/ExploreBtn";
import { IEvent } from "@/database";
import { notFound } from "next/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

/**
 * Renders featured events returned by the events API.
 *
 * If the request cannot be completed, the page renders with an empty list.
 */
const page = async () => {
  let events: IEvent[] = [];
  try {
    const res = await fetch(`${BASE_URL}/api/events`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      notFound();
    }
    const data = await res.json();
    events = data.events || [];
  } catch (error) {
    console.error("Failed to fetch events:", error);
  }
  return (
    <section>
      <h1 className="text-center">
        The Hub for Every Dev <br /> Event You Can&apos;t Miss
      </h1>
      <p className="text-center mt-5">
        Hackathons, Meetups, and Conferences, All in One Place
      </p>
      <ExploreBtn />
      <div id="events" className="mt-20 space-y-7">
        <h3>Featured Events</h3>
        <ul className="events">
          {events &&
            events.length !== 0 &&
            events.map((event: IEvent, index: number) => (
              <li key={index} className="list-none">
                <EventCard {...event} />
              </li>
            ))}
        </ul>
      </div>
    </section>
  );
};

export default page;
