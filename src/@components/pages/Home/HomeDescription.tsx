"use client";

import Link from "next/link";
import { useState } from "react";

const trustPoints = [
  {
    title: "১০০% অরিজিনাল",
    text: "প্রতিটি পণ্যে মান ও সততার নিশ্চয়তা।",
  },
  {
    title: "ক্যাশ অন ডেলিভারি",
    text: "হাতে পেয়ে চেক করে তারপর পেমেন্ট।",
  },
  {
    title: "দ্রুত ডেলিভারি",
    text: "সারা দেশে নিরাপদ ও দ্রুত পৌঁছানো।",
  },
];

export default function HomeDescription() {
  const [expanded, setExpanded] = useState(false);

  return (
    <section
      className="rongonaa-home-about"
      aria-labelledby="rongonaa-home-about-heading"
    >
      <div className="rongonaa-home-about__inner">
        <div className="rongonaa-home-about__header">
          <p className="rongonaa-home-about__eyebrow">About Rongonaa</p>
          <h2
            id="rongonaa-home-about-heading"
            className="rongonaa-home-about__title"
          >
            Rongonaa — মায়েদের trusted store in Bangladesh
          </h2>
          <span className="rongonaa-home-about__rule" aria-hidden />
          <p className="rongonaa-home-about__lead">
            মায়েদের জন্য নিরাপদ ও প্রিমিয়াম পণ্য — quality, safety আর fast
            delivery এক জায়গায়।
          </p>
        </div>

        <div className="rongonaa-home-about__trust">
          {trustPoints.map((item) => (
            <div key={item.title} className="rongonaa-home-about__trust-item">
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          ))}
        </div>

        <div
          className={`rongonaa-home-about__body${
            expanded ? " is-expanded" : ""
          }`}
        >
          <p>
            Rongonaa বাংলাদেশের মায়েদের জন্য একটি trusted online store। আমরা
            প্রতিদিনের প্রয়োজনীয় প্রিমিয়াম পণ্য সাজানোর চেষ্টা করি — যাতে আপনি
            ঘরে বসেই নিশ্চিন্তে অর্ডার করতে পারেন।
          </p>

          <h3>কেন Rongonaa?</h3>
          <p>
            আমাদের ফোকাস সহজ কেনাকাটা, স্পষ্ট তথ্য এবং নির্ভরযোগ্য সাপোর্ট।
            পণ্য দেখে অর্ডার করুন, প্রয়োজনে{" "}
            <Link href="/contact-us">Contact Us</Link> বা{" "}
            <a
              href="https://api.whatsapp.com/send/?phone=%2B8801768509905&text&type=phone_number&app_absent=0"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp
            </a>{" "}
            এ মেসেজ দিন। ইমেইল:{" "}
            <a href="mailto:support@rongonaa.com">support@rongonaa.com</a> ·
            কল: <a href="tel:01805049380">01805049380</a>।
          </p>

          <h3>কীভাবে কিনবেন?</h3>
          <p>
            ক্যাটাগরি থেকে পছন্দের পণ্য বেছে নিন, কার্টে যোগ করুন এবং সহজে
            চেকআউট করুন। বিস্তারিত জানতে দেখুন{" "}
            <Link href="/how-to-buy">How to Buy</Link>,{" "}
            <Link href="/delivery-return-policy">Delivery & Return</Link> এবং{" "}
            <Link href="/replacement-warranty">Replacement Warranty</Link>।
          </p>

          <h3>আমাদের প্রতিশ্রুতি</h3>
          <p>
            Rongonaa-তে কেনাকাটা মানে শুধু পণ্য কেনা নয় — নিরাপদ অভিজ্ঞতা। আমরা
            অরিজিনাল প্রোডাক্ট, স্বচ্ছ প্রাইসিং এবং দ্রুত ডেলিভারিতে বিশ্বাস
            করি। আরও জানতে ভিজিট করুন{" "}
            <Link href="/about-us">About Rongonaa</Link>।
          </p>
        </div>

        <div className="rongonaa-home-about__actions">
          <button
            type="button"
            className="rongonaa-home-about__toggle"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
          >
            {expanded ? "View Less" : "View More"}
          </button>
        </div>
      </div>
    </section>
  );
}
