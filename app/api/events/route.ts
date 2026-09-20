import { NextResponse, NextRequest } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { Event } from "@/database";
import connectToDatabase from "@/lib/mongodb";

// Post method : Create a new event
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const formData = await req.formData();
    let event;
    try {
      event = Object.fromEntries(formData.entries());
    } catch {
      return NextResponse.json(
        { message: "Invalid form data format!" },
        { status: 400 },
      );
    }

    const file = formData.get("image") as File;

    if (!file)
      return NextResponse.json(
        { message: "Image file is required" },
        { status: 400 },
      );

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { resource_type: "image", folder: "DevEvents" },
          (error, results) => {
            if (error) return reject(error);

            resolve(results);
          },
        )
        .end(buffer);
    });

    event.image = (uploadResult as { secure_url: string }).secure_url;

    const rawTags = formData.get("tags") as string;
    const rawAgenda = formData.get("agenda") as string;

    const tags = typeof rawTags === "string" ? JSON.parse(rawTags) : rawTags;
    const agenda = typeof rawAgenda === "string" ? JSON.parse(rawAgenda) : rawAgenda;

    const eventCreated = await Event.create({ ...event, tags, agenda });
    return NextResponse.json(
      {
        message: "Created successfully",
        event: eventCreated,
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Internal server error!",
        error: error instanceof Error ? error.message : "Error occurred!",
      },
      { status: 500 },
    );
  }
}

// GET method : Get all events

export async function GET() {
  try {
    await connectToDatabase();
    const events = await Event.find().sort({ createdAt: -1 });
    if (!events || events.length === 0) {
      return NextResponse.json(
        {
          message: "There is nothing to fetch !",
          events: [],
        },
        { status: 200 },
      );
    }

    return NextResponse.json(
      {
        message: "fetched successfully",
        events,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Internal server error !",
        error: error instanceof Error ? error.message : "Error happened !",
      },
      { status: 500 },
    );
  }
}
