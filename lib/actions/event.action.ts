"use server";

import { Event } from "@/database";
import connectToDatabase from "../mongodb";

/**
 * Finds other events that share at least one tag with the requested event.
 *
 * @param slug The event slug to exclude from the results.
 * @returns Plain, serializable event objects, or an empty array if lookup fails.
 */
export const getSimilarEvents = async (slug: string) => {
  try {
    await connectToDatabase();
    const event = await Event.findOne({ slug });

    const similarEvents = await Event.find({
      _id: { $ne: event?._id },
      tags: { $in: event?.tags },
    }).lean();

    return JSON.parse(JSON.stringify(similarEvents));
  } catch {
    return [];
  }
};
