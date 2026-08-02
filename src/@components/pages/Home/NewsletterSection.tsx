"use client";

import { useState } from "react";
import SectionHeader from "./SectionHeader";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      setStatus("err");
      return;
    }
    setStatus("ok");
    setEmail("");
  };

  return (
    <section className="rongonaa-home-section rongonaa-home-section--alt rongonaa-home-section--border">
      <div className="rongonaa-home-section__inner rongonaa-newsletter">
        <SectionHeader
          eyebrow="Stay close"
          title="Join the Rangonaa Circle"
          description="Be first to know about new arrivals, bridal edits, and private offers."
          align="center"
          className="rongonaa-newsletter__header"
        />

        <form className="rongonaa-newsletter__form" onSubmit={onSubmit}>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status !== "idle") setStatus("idle");
            }}
            placeholder="Your email address"
            className="rongonaa-newsletter__input"
            aria-label="Email address"
          />
          <button type="submit" className="rongonaa-newsletter__btn">
            Join
            <span aria-hidden>→</span>
          </button>
        </form>

        <p className="rongonaa-newsletter__note">
          {status === "ok"
            ? "Welcome to the Rangonaa circle."
            : status === "err"
              ? "Enter a valid email."
              : "No spam — only atelier notes & early access."}
        </p>
      </div>
    </section>
  );
}
