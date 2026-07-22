// app/refund-policy/page.tsx (বা যেকোনো কম্পোনেন্ট ফাইলে)
import React from "react";

const RefundPolicy: React.FC = () => {
  return (
    <div className="max-w-layout mx-auto text-justify px-3 bg-white border-primary-border border xl:my-8 lg:my-6 pt-6 rounded-lg">
      <h2 className="lg:text-2xl text-xl font-bold ">
        NAVIFORCE.COM.BD এর রিফান্ড পলিসি
      </h2>

      <p className="text-[#777777]">
        পেমেন্ট করা অর্ডার এর প্রোডাক্ট যদি স্টক না থাকে বা কোন প্রোডাক্ট এর
        প্রবলেম এর কারণে রিটার্ন করা হলে অথবা একাধিক প্রোডাক্ট এর মধ্যে থেকে কোন
        একটি প্রোডাক্ট স্টক না থাকলে এবং স্বল্পতম সময়ে প্রোডাক্ট স্টকে আসার
        সম্ভাবনা না থাকলে পেমেন্ট রিফান্ড করে দেয়া হয়। প্রোডাক্ট রিটার্ন এর
        ক্ষেত্রে অবশ্যই প্রোডাক্ট পুনরায় বিক্রিযোগ্য আছে কিনা সেটি ইভালুশন করে
        দেখার পর রিফান্ড এর ব্যাপারে সিধান্ত নেয়া হবে।{" "}
        <a href="/return-policy" className="underline font-medium">
          রিটার্ন পলিসি সম্পর্কে বিস্তারিত জানতে এখানে ক্লিক করুন
        </a>
        ।
      </p>

      <h3 className="md:text-xl text-lg font-semibold md:pt-6 pt-4 pb-2">
        রিফান্ড মেথডসমূহ
      </h3>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 rounded-lg">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left p-3 border-b border-gray-300">
                পেমেন্ট মেথড
              </th>
              <th className="text-left p-3 border-b border-gray-300">
                রিফান্ড মেথড
              </th>
            </tr>
          </thead>
          <tbody className="text-[#555555]">
            <tr>
              <td className="p-3 border-b border-gray-300">
                বিকাশ/ নগদ বা যেকোনো MFS
              </td>
              <td className="p-3 border-b border-gray-300">
                বিকাশ/ নগদ বা যেকোনো MFS
              </td>
            </tr>
            <tr>
              <td className="p-3 border-b border-gray-300">
                ক্রেডিট/ ডেবিট কার্ড
              </td>
              <td className="p-3 border-b border-gray-300">
                ক্রেডিট/ ডেবিট কার্ড
              </td>
            </tr>
            <tr>
              <td className="p-3 border-b border-gray-300">ক্যাশ</td>
              <td className="p-3 border-b border-gray-300">ক্যাশ</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="md:text-xl text-lg font-semibold md:pt-6 pt-4 pb-2">
        রিফান্ডের জন্য প্রয়োজনীয় সময়
      </h3>
      <p className="text-[#777777]">
        রিফান্ড রিকোয়েস্ট এর ডেট থেকে <strong>৭২ ঘণ্টার মধ্যে</strong> যে
        মাধ্যমে পেমেন্ট করা হয়েছে সেই মাধ্যমেই রিফান্ড ইনিশিয়েট করা হবে। ডেবিট
        বা ক্রেডিট কার্ডে পেমেন্ট রিফান্ডের ক্ষেত্রে আপনার একাউন্ট স্টেটমেন্টে
        হিট করতে <strong>৫–১০ বিজনেস ডে</strong> লাগতে পারে। এই সময়ের মধ্যেও
        স্টেটমেন্টে না শো করলে আপনার কার্ড ইস্যুয়ার ব্যাংকের সাথে যোগাযোগ করুন
        অথবা আমাদের কাছে ইমেইল করুন:{" "}
        <a
          href="mailto:woocommerce-1202936-4252248.cloudwaysapps.com@gmail.com"
          className="underline"
        >
          woocommerce-1202936-4252248.cloudwaysapps.com@gmail.com
        </a>{" "}
        (ইমেইলে অবশ্যই অর্ডার নম্বর উল্লেখ করবেন)।
      </p>

      <h3 className="md:text-xl text-lg font-semibold md:pt-6 pt-4 pb-2">
        রিফান্ড চার্জ
      </h3>
      <p className="text-[#777777]">
        রিফান্ডের জন্য সাধারণত কোন চার্জ প্রযোজ্য হবে না—আপনি যে এমাউন্ট পেমেন্ট
        করেছেন সেই এমাউন্টই রিফান্ড করা হবে। তবে প্রোডাক্ট যদি ইতোমধ্যে কুরিয়ারে
        হ্যান্ডওভার করা হয়ে থাকে বা ডেলিভারি হবার পর কোন কারণে (প্রোডাক্টে
        সমস্যা থাকলে এক্সচেঞ্জ বা ওয়ারেন্টি পলিসি প্রযোজ্য) রিটার্ন করে রিফান্ড
        পেতে চান, সেক্ষেত্রে কুরিয়ার চার্জ এবং প্রসেসিং ফি বাবদ{" "}
        <strong>ঢাকার ভিতরে প্রতি অর্ডার ২০০ টাকা</strong> এবং{" "}
        <strong>
          ঢাকার বাইরে প্রতি অর্ডার ২০০ টাকা + পেমেন্ট সেটেলমেন্ট ফি
        </strong>{" "}
        (প্রযোজ্য ক্ষেত্রে) কেটে বাকি টাকা রিফান্ড করা হবে।
      </p>

      <h3 className="md:text-xl text-lg font-semibold md:pt-6 pt-4 pb-2">
        ডিস্কাউন্ট/অফারের রিফান্ড কন্ডিশন
      </h3>
      <p className="text-[#777777]">
        বিকাশ, রকেট, নগদ, ভিসা, মাস্টারকার্ড বা অ্যামেক্স কার্ডে কোনো অফার থেকে
        নেয়া <strong>ডিস্কাউন্ট বা ক্যাশব্যাক ফেরতযোগ্য নয়</strong>। অর্থাৎ,
        আপনি যদি ১০০০ টাকার প্রোডাক্ট ৯০০ টাকায় কিনে থাকেন বা ১০০০ টাকা পেমেন্ট
        করে ক্যাশব্যাক পেয়ে থাকেন, রিফান্ডের ক্ষেত্রে{" "}
        <strong>শুধু আপনার প্রদত্ত এমাউন্ট</strong> (৯০০ টাকা) রিফান্ড করা হবে,
        ক্যাশব্যাক বা ডিস্কাউন্ট অংশ রিফান্ড হবে না।
      </p>

      <p className="pt-6 text-[#777777] md:pb-8 pb-4">Thank you!</p>
    </div>
  );
};

export default RefundPolicy;
