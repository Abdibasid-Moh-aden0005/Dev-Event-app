"use client";

import { IEvent } from "@/database";
import Image from "next/image";
import Link from "next/link";
import posthog from "posthog-js";

/**
 * Renders a link to an event's detail page and tracks clicks in PostHog.
 */
const EventCard = ({ title, image, slug, location, date, time }: IEvent) => {
  const handleClick = () => {
    posthog.capture("event_card_clicked", {
      event_slug: slug,
      event_title: title,
      event_location: location,
      event_date: date,
    });
  };

  return (
    <Link href={`/events/${slug}`} id="event-card" onClick={handleClick}>
      <Image
        src={image}
        alt={title}
        width={410}
        height={300}
        className="poster w-auto h-auto"
      />

      <div className="flex flex-row gap-2">
        <Image
          src="/icons/pin.svg"
          alt="location"
          width={14}
          height={14}
          className="w-auto h-auto"
        />
        <p>{location}</p>
      </div>

      <p className="title">{title}</p>

      <div className="datetime">
        <div>
          <Image
            src="/icons/calendar.svg"
            alt="date"
            width={14}
            height={14}
            className="w-auto h-auto"
          />
          <p>{date}</p>
        </div>
        <div>
          <Image
            src="/icons/clock.svg"
            alt="time"
            width={14}
            height={14}
            className="w-auto h-auto"
          />
          <p>{time}</p>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
