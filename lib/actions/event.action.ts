"use server";

import { Event } from "@/database";
import connectToDatabase from "../mongodb";

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
