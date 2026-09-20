"use client";

import { useState } from "react";

/**
 * Renders an email signup form that shows a confirmation after three seconds.
 *
 * Submission is handled only in client state and does not persist the email.
 */
const BookEvent = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // function for handling submit :
  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    setTimeout(() => {
      setSubmitted(true);
    }, 3000);
  };
  return (
    <div id="book-event">
      {submitted ? (
        <p className="text-sm">Thank you for signing up!</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              id="email"
              placeholder="Enter your email address"
            />
          </div>

          <button type="submit" className="button-submit">
            Submit
          </button>
        </form>
      )}
    </div>
  );
};

export default BookEvent;
