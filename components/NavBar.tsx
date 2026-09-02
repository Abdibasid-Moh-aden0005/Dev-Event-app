"use client";

import Image from "next/image";
import Link from "next/link";
import posthog from "posthog-js";

const NavBar = () => {
  const handleNavClick = (label: string) => {
    posthog.capture("nav_link_clicked", { link_label: label });
  };
  return (
    <header>
      <nav>
        <Link href="/" className="logo" onClick={() => handleNavClick("Logo")}>
          <Image src="/icons/logo.png" alt="Logo" width={24} height={24} />
          Dev Events
        </Link>
        <ul>
          <Link href="/" onClick={() => handleNavClick("Home")}>Home</Link>
          <Link href="/" onClick={() => handleNavClick("Event")}>Event</Link>
          <Link href="/" onClick={() => handleNavClick("Create Event")}>Create Event</Link>
        </ul>
      </nav>
    </header>
  );
};

export default NavBar;
