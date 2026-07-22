// app/replacement-warranty/page.tsx (Next.js) অথবা যেকোনো কম্পোনেন্ট ফাইলে
import React from "react";

const page: React.FC = () => {
  return (
    <div className="max-w-layout mx-auto text-justify px-3 bg-white border-primary-border border xl:my-8 lg:my-6 pt-6 rounded-lg">
      {/* Bangla Section */}
      <h2 className="lg:text-2xl text-xl font-bold ">
        NAVIFORCE রিপ্লেসমেন্ট ওয়ারেন্টি পলিসি
      </h2>

      <p className="text-[#777777]">
        আমরা NAVIFORCE.COM.BD এ সবসময় অরিজিনাল এবং অথেনটিক প্রোডাক্ট বিক্রয় করি।
        আমাদের বেশিরভাগ প্রোডাক্টেই ব্র্যান্ড ওয়ারেন্টি থাকে, কিছু প্রোডাক্ট
        থাকে ওয়ারেন্টি ছাড়া। যেসব প্রোডাক্টে ওয়ারেন্টি থাকে, সেগুলো ওয়েবসাইটে
        উল্লেখ থাকে অথবা ক্ষেত্র বিশেষে ওয়ারেন্টি কার্ড থাকে। যেকোন প্রোডাক্টের{" "}
        <strong>রিপ্লেসমেন্ট ওয়ারেন্টি</strong> পিরিয়ডে সর্বোচ্চ{" "}
        <strong>একবার</strong> প্রোডাক্টটি রিপ্লেস করা হয়; পরবর্তীতে সমস্যা হলে
        (ওয়ারেন্টি মেয়াদের মধ্যে) তা <strong>সার্ভিস ওয়ারেন্টি</strong> হিসেবে
        কভার করা হবে। অর্থাৎ, রিপ্লেসমেন্ট কেবল একবারই প্রযোজ্য।
      </p>

      <h3 className="md:text-xl text-lg font-semibold md:pt-6 pt-4 pb-2">
        যে যে ক্ষেত্রে রিপ্লেসমেন্ট পাবেন
      </h3>
      <ul className="list-disc list-inside text-[#777777] space-y-1">
        <li>ম্যানুফ্যাকচারিং ত্রুটি।</li>
        <li>অপারেটিং সিস্টেম সম্পর্কিত সমস্যা (কোনো অ্যাপ সম্পর্কিত নয়)।</li>
        <li>
          ডিভাইস সমস্যার কারণে পাওয়ার না আসা।{" "}
          <span className="italic">
            (এক্সেসরিজ যেমন—রিমোট, কিবোর্ড, ব্যাটারি, লাইট ইত্যাদির জন্য
            ওয়ারেন্টি প্রযোজ্য নয়)
          </span>
        </li>
        <li>প্রোডাক্ট ৬০% পারফরম্যান্সেও রিস্টার্ট নেয় বা কাজ না করে।</li>
      </ul>

      <p className="pt-4 text-[#777777]">
        সাধারণত, যেসব প্রোডাক্টে রিপ্লেসমেন্ট ওয়ারেন্টি থাকে সেখানে সমস্যা
        প্রমাণিত হলে রিপ্লেস করা হয় (ক্রাইটেরিয়া মিট করলে)। তবে কিছু কারণে
        রিপ্লেসমেন্ট অযোগ্য হতে পারে—নিচে কিছু উদাহরণ দেয়া হলো:
      </p>

      <h3 className="md:text-xl text-lg font-semibold pt-4 pb-2">
        যে যে ক্ষেত্রে রিপ্লেসমেন্ট প্রযোজ্য নয়
      </h3>
      <ul className="list-disc list-inside text-[#777777] space-y-1">
        <li>প্রোডাক্ট ইউজ করা হলে রিপ্লেসমেন্ট/এক্সচেঞ্জ প্রযোজ্য নয়।</li>
        <li>বেল্ট, চেইন, ব্যাটারি—এগুলোর কোন ওয়ারেন্টি নেই।</li>
        <li>ফিজিক্যাল ড্যামেজ/ভাঙা/পোড়া ইত্যাদি থাকলে।</li>
        <li>
          অরিজিনাল সফটওয়্যার/ওয়ারেন্টি স্টিকার না থাকলে বা টেম্পার করা হলে।
        </li>
        <li>
          অস্বাভাবিক ব্যবহার বা অনুপযুক্ত পরিবেশে ব্যবহার (যেখানে ব্যবহার উপযোগী
          নয়)।
        </li>
        <li>
          একবার রিপ্লেস পাওয়া পণ্যের পরবর্তী সময়ে আর ওয়ারেন্টি প্রযোজ্য নয়।
        </li>
        <li>
          স্টক স্বল্পতায় রিপ্লেসমেন্টে বিলম্ব হতে পারে; সম্পূর্ণ অনুপস্থিত হলে
          পরিবর্তে <strong>সার্ভিস ওয়ারেন্টি</strong> অফার করা হতে পারে।
        </li>
      </ul>

      <p className="pt-4 text-[#777777]">
        প্রোডাক্ট বা ক্রয় সংশ্লিষ্ট অন্য কোনো ইস্যু থাকলে আমাদের{" "}
        <a href="/return-policy" className="underline font-medium">
          রিটার্ন পলিসি
        </a>{" "}
        কিংবা{" "}
        <a href="/terms" className="underline font-medium">
          টার্মস এন্ড কন্ডিশন
        </a>{" "}
        দেখুন—সেখানে বিস্তারিত নির্দেশনা রয়েছে।
      </p>

      {/* English Section */}
      <h2 className="md:text-2xl text-xl font-bold md:pt-8 pt-4 pb-4">
        Replacement Warranty Policy
      </h2>

      <p className="text-[#777777]">
        We at <strong>NAVIFORCE.COM.BD</strong> offer genuine, authentic
        products. Many items come with brand warranty and some do not. If a
        product has a warranty, it will be clearly mentioned on the website,
        invoice, or provided via a warranty card. A{" "}
        <strong>replacement warranty</strong> is valid{" "}
        <strong>one time only</strong>. If the product faces further issues
        later within the warranty period, it will be covered as{" "}
        <strong>service warranty</strong> (not replacement again).
      </p>

      <h3 className="text-xl font-semibold md:pt-6 pt-4 pb-2">
        You are eligible for replacement if
      </h3>
      <ul className="list-disc list-inside text-[#777777] space-y-1">
        <li>There is a manufacturing fault.</li>
        <li>OS-related fault (not for any third-party Apps).</li>
        <li>
          No power due to device issue.{" "}
          <span className="italic">
            (No warranty for accessories such as Remote, Keyboard, Battery,
            Light, etc.)
          </span>
        </li>
        <li>
          The product keeps restarting or is not running even at 60% of its
          performance.
        </li>
      </ul>

      <h3 className="text-xl font-semibold md:pt-6 pt-4 pb-2">
        Replacement will NOT be applicable if
      </h3>
      <ul className="list-disc list-inside text-[#777777] space-y-1">
        <li>There is any physical damage or burn.</li>
        <li>
          The product is not with original software or the warranty seal/sticker
          is void/removed.
        </li>
        <li>Product is used abnormally or in an unsuitable environment.</li>
        <li>
          If an item is already replaced once, there won’t be any further
          warranty (no second replacement).
        </li>
        <li>
          In case of stock unavailability, replacement may take longer. If the
          product cannot be sourced in near future, a{" "}
          <strong>service warranty</strong> may be offered instead.
        </li>
      </ul>

      <p className="pt-4 text-[#777777] md:pb-8 pb-4">
        Further Reads: For other issues with your product or purchase, please
        review our detailed{" "}
        <a href="/return-policy" className="underline font-medium">
          Return Policy
        </a>{" "}
        and Terms & Conditions.
      </p>
    </div>
  );
};

export default page;
