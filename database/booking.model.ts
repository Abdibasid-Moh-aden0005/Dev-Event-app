import { Schema, model, models, type Document, type Model, Types } from "mongoose";
import "./event.model"; // Ensure Event model is registered in Mongoose

/**
 * TypeScript interface representing a Booking document in MongoDB.
 */
export interface IBooking {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export type BookingDocument = IBooking & Document;

/**
 * Standard RFC 5322 compliant regex for basic email format validation.
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const bookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event ID is required"],
      index: true, // Indexed for faster event-specific query lookups
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [EMAIL_REGEX, "Please provide a valid email address"],
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Pre-save middleware:
 * 1. Validates email format before saving.
 * 2. Verifies that the referenced Event document exists in the database.
 */
bookingSchema.pre("save", async function (this: BookingDocument) {
  // Validate email format
  if (this.isModified("email") && !EMAIL_REGEX.test(this.email)) {
    throw new Error(`Invalid email format: "${this.email}".`);
  }

  // Verify referenced Event exists
  if (this.isModified("eventId")) {
    const eventModel = models.Event || model("Event");
    const eventExists = await eventModel.exists({ _id: this.eventId });

    if (!eventExists) {
      throw new Error(`Referenced Event with ID "${this.eventId.toString()}" does not exist.`);
    }
  }
});

export const Booking: Model<IBooking> =
  (models.Booking as Model<IBooking>) || model<IBooking>("Booking", bookingSchema);

export default Booking;
