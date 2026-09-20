# Frequent Next.js & React Errors & Solutions

This document serves as a reference for common errors encountered in this Next.js project, detailing their root causes, explicit code examples, and solutions.

---

## 1. Only Plain Objects Can Be Passed to Client Components from Server Components

### Error Message
```text
Error: Only plain objects can be passed to Client Components from Server Components. 
Objects with toJSON methods are not supported. Convert it manually to a simple value before passing it to props.
  <... _id={{i0: 6986476, i1: 1437655, i2: 2053533, i3: ...}} title=... createdAt=... updatedAt=...>
```

### Root Cause
1. **React Server Components (RSC) Boundary**: When data crosses from a Server Component (or Server Action) to a Client Component (`"use client"`), React serializes the props into a special JSON-like payload stream.
2. **MongoDB / Mongoose Non-Plain Objects**:
   - `_id` is an instance of BSON `ObjectId` with internal buffer/methods and a custom `toJSON()` function.
   - `createdAt` and `updatedAt` are JavaScript `Date` instances.
   - Even when using Mongoose `.lean()`, `_id` remains a BSON `ObjectId`, which is not a plain JavaScript object `{ ... }`.

### Explicit Example

#### ❌ Problematic Code
```tsx
// lib/actions/event.action.ts
"use server";
import { Event } from "@/database";

export const getSimilarEvents = async (slug: string) => {
  await connectToDatabase();
  const event = await Event.findOne({ slug });
  
  // Returns raw Mongoose lean objects containing BSON ObjectIds & Dates
  return await Event.find({
    _id: { $ne: event?._id },
    tags: { $in: event?.tags },
  }).lean();
};
```

```tsx
// app/events/[slug]/page.tsx (Server Component)
import EventCard from "@/components/EventCard"; // Client Component ("use client")
import { getSimilarEvents } from "@/lib/actions/event.action";

const EventDetails = async ({ params }) => {
  const similarEvents = await getSimilarEvents(params.slug);

  return (
    <div>
      {similarEvents.map((event) => (
        // ❌ Error triggered here across Server -> Client boundary
        <EventCard key={event._id} {...event} />
      ))}
    </div>
  );
};
```

#### ✅ Solution
Serialize the query result into plain JSON before returning from the server action or passing to client components.

```tsx
// lib/actions/event.action.ts
"use server";
import { Event } from "@/database";

export const getSimilarEvents = async (slug: string) => {
  try {
    await connectToDatabase();
    const event = await Event.findOne({ slug });

    const similarEvents = await Event.find({
      _id: { $ne: event?._id },
      tags: { $in: event?.tags },
    }).lean();

    // ✅ Converts BSON ObjectId and Date objects into plain serializable JSON
    return JSON.parse(JSON.stringify(similarEvents));
  } catch (error) {
    return [];
  }
};
```

Alternatively, map and sanitize the objects explicitly:
```tsx
return similarEvents.map((doc) => ({
  ...doc,
  _id: doc._id.toString(),
  createdAt: doc.createdAt?.toISOString(),
  updatedAt: doc.updatedAt?.toISOString(),
}));
```

---

## 2. Next.js Image Dimension Warning (`has either width or height modified, but not the other`)

### Error Message
```text
[browser] Image with src "http://localhost:3000/icons/calendar.svg" has either width or height modified, but not the other. 
If you use CSS to change the size of your image, also include the styles 'width: "auto"' or 'height: "auto"' to maintain the aspect ratio.
```

### Root Cause
1. **Tailwind CSS Preflight Reset**: Tailwind CSS automatically applies default base styles:
   ```css
   img, svg, video {
     max-width: 100%;
     height: auto;
   }
   ```
2. **Next.js `<Image />` Validation**:
   - When Next.js renders `<Image width={14} height={14} ... />`, it expects both dimensions to be respected or for CSS modifications to explicitly preserve the aspect ratio.
   - When Tailwind or a custom CSS rule (e.g. `.poster { width: 100%; }` or `.banner { max-height: 457px; }`) alters one dimension without the corresponding `width: auto` or `height: auto`, Next.js logs a browser console warning to prevent unwanted image distortion or layout shifts.

### Explicit Example

#### ❌ Problematic Code
```tsx
// Icon image without responsive aspect-ratio classes
<Image 
  src="/icons/calendar.svg" 
  alt="calendar" 
  width={14} 
  height={14} 
/>

// Cloudinary / Banner image where CSS changes width/height without auto
<Image
  src={image}
  alt="Event Banner"
  width={800}
  height={800}
  className="banner" // .banner sets width: 100% or max-height
/>
```

#### ✅ Solution

##### A. For Icons / Static SVGs
Add `className="w-auto h-auto"`:
```tsx
<Image 
  src="/icons/calendar.svg" 
  alt="calendar" 
  width={14} 
  height={14} 
  className="w-auto h-auto"
/>
```

##### B. For Responsive Cards & Banners
Add `className="... w-auto h-auto"` or `style={{ width: "100%", height: "auto" }}`:
```tsx
<Image
  src={image}
  alt="Event Banner"
  width={800}
  height={800}
  className="banner w-auto h-auto"
/>
```

---

## 3. Image Detected as Largest Contentful Paint (LCP) Warning

### Error Message
```text
[browser] Image with src "https://res.cloudinary.com/..." was detected as the Largest Contentful Paint (LCP). 
Please add the `loading="eager"` property if this image is above the fold.
Read more: https://nextjs.org/docs/app/api-reference/components/image#loading
```

### Root Cause
- By default, Next.js `<Image />` components are lazily loaded (`loading="lazy"`).
- When a large image (like an event banner or hero image) appears "above the fold" (visible immediately without scrolling), lazy loading delays its download, hurting Core Web Vitals (LCP metric).
- Next.js detects this and prompts you to prioritize the image.

### Explicit Example

#### ❌ Problematic Code
```tsx
// Above-the-fold banner rendered with default lazy loading
<Image
  src={image}
  alt="Event Banner"
  width={800}
  height={800}
  className="banner w-auto h-auto"
/>
```

#### ✅ Solution
Add the `priority` property (which internally sets `loading="eager"` and adds preloading for optimal LCP):
```tsx
<Image
  src={image}
  alt="Event Banner"
  width={800}
  height={800}
  className="banner w-auto h-auto"
  priority
/>
```
