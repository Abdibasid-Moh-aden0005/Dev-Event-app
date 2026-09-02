import { Schema, model, models, type Document, type Model } from "mongoose";

/**
 * TypeScript interface representing an Event document in MongoDB.
 */
export interface IEvent {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: "online" | "offline" | "hybrid" | string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type EventDocument = IEvent & Document;

/**
 * Converts a string into a clean, URL-friendly slug.
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove non-alphanumeric characters except spaces/hyphens
    .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with a single hyphen
    .replace(/^-+|-+$/g, ""); // Remove leading and trailing hyphens
}

/**
 * Normalizes a date string into ISO standard format (YYYY-MM-DD).
 */
function normalizeDate(dateStr: string): string {
  const parsed = new Date(dateStr);
  if (isNaN(parsed.getTime())) {
    throw new Error(`Invalid date format: "${dateStr}". Please provide a valid date.`);
  }
  return parsed.toISOString().split("T")[0];
}

/**
 * Validates and normalizes time strings into standard 24-hour "HH:mm" format.
 */
function normalizeTime(timeStr: string): string {
  const trimmed = timeStr.trim();

  // Match 24-hour format (e.g. "14:30", "9:00", "09:00")
  const match24 = trimmed.match(/^([01]?[0-9]|2[0-3]):([0-5][0-9])$/);
  if (match24) {
    const hours = match24[1].padStart(2, "0");
    const minutes = match24[2];
    return `${hours}:${minutes}`;
  }

  // Match 12-hour format with AM/PM (e.g. "2:30 PM", "02:30pm", "9:15 am")
  const match12 = trimmed.match(/^(0?[1-9]|1[0-2]):([0-5][0-9])\s*([ap]m)$/i);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = match12[2];
    const modifier = match12[3].toLowerCase();

    if (modifier === "pm" && hours < 12) {
      hours += 12;
    } else if (modifier === "am" && hours === 12) {
      hours = 0;
    }

    return `${String(hours).padStart(2, "0")}:${minutes}`;
  }

  throw new Error(
    `Invalid time format: "${timeStr}". Expected "HH:mm" (e.g. "14:30") or "hh:mm AM/PM" (e.g. "02:30 PM").`
  );
}

const eventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
      validate: {
        validator: (v: string) => v.trim().length > 0,
        message: "Event title cannot be empty",
      },
    },
    slug: {
      type: String,
      unique: true,
      index: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, "Event description is required"],
      trim: true,
      validate: {
        validator: (v: string) => v.trim().length > 0,
        message: "Event description cannot be empty",
      },
    },
    overview: {
      type: String,
      required: [true, "Event overview is required"],
      trim: true,
      validate: {
        validator: (v: string) => v.trim().length > 0,
        message: "Event overview cannot be empty",
      },
    },
    image: {
      type: String,
      required: [true, "Event image URL is required"],
      trim: true,
      validate: {
        validator: (v: string) => v.trim().length > 0,
        message: "Event image cannot be empty",
      },
    },
    venue: {
      type: String,
      required: [true, "Event venue is required"],
      trim: true,
      validate: {
        validator: (v: string) => v.trim().length > 0,
        message: "Event venue cannot be empty",
      },
    },
    location: {
      type: String,
      required: [true, "Event location is required"],
      trim: true,
      validate: {
        validator: (v: string) => v.trim().length > 0,
        message: "Event location cannot be empty",
      },
    },
    date: {
      type: String,
      required: [true, "Event date is required"],
      trim: true,
    },
    time: {
      type: String,
      required: [true, "Event time is required"],
      trim: true,
    },
    mode: {
      type: String,
      required: [true, "Event mode is required"],
      enum: {
        values: ["online", "offline", "hybrid"],
        message: "{VALUE} is not a supported mode (must be online, offline, or hybrid)",
      },
      trim: true,
    },
    audience: {
      type: String,
      required: [true, "Event target audience is required"],
      trim: true,
      validate: {
        validator: (v: string) => v.trim().length > 0,
        message: "Event audience cannot be empty",
      },
    },
    agenda: {
      type: [String],
      required: [true, "Event agenda is required"],
      validate: {
        validator: (arr: string[]) => Array.isArray(arr) && arr.length > 0 && arr.every((item) => item.trim().length > 0),
        message: "Agenda must contain at least one non-empty item",
      },
    },
    organizer: {
      type: String,
      required: [true, "Event organizer is required"],
      trim: true,
      validate: {
        validator: (v: string) => v.trim().length > 0,
        message: "Event organizer cannot be empty",
      },
    },
    tags: {
      type: [String],
      required: [true, "Event tags are required"],
      validate: {
        validator: (arr: string[]) => Array.isArray(arr) && arr.length > 0 && arr.every((item) => item.trim().length > 0),
        message: "Tags must contain at least one non-empty tag",
      },
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Pre-save middleware:
 * 1. Generates/regenerates slug when title is modified.
 * 2. Normalizes date into ISO standard (YYYY-MM-DD).
 * 3. Normalizes time into 24-hour (HH:mm) format.
 */
eventSchema.pre("save", function (this: EventDocument) {
  if (this.isModified("title")) {
    this.slug = slugify(this.title);
  }

  if (this.isModified("date")) {
    this.date = normalizeDate(this.date);
  }

  if (this.isModified("time")) {
    this.time = normalizeTime(this.time);
  }
});

export const Event: Model<IEvent> =
  (models.Event as Model<IEvent>) || model<IEvent>("Event", eventSchema);

export default Event;
