"use client";

import Image from "next/image";
import posthog from "posthog-js";

const ExploreBtn = () => {
  return (
    <button
      onClick={() => {
        console.log("here we are");
        posthog.capture("explore_events_clicked");
      }}
      type="button"
      id="explore-btn"
      className="mt-7 mx-auto"
    >
      <a href="#events">
        Explore Events
        <Image
          src="/icons/arrow-down.svg"
          alt="arrow-down"
          width={0}
          height={0}
          className="w-auto h-auto"
        />
      </a>
    </button>
  );
};

export default ExploreBtn;
