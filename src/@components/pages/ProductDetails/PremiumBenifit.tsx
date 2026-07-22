"use client";

import {
  ShieldCheck,
  BadgeCheck,
  Gift,
  PackageSearch,
  RefreshCcw,
  Truck,
} from "lucide-react";

interface PremiumBenefit {
  icon: React.ElementType;
  title: string;
  description: string;
}

export function PremiumBenefits({ singleWatch }: any) {
  const categories: string[] = singleWatch?.categories || [];

  const specialCategories = ["sunglass", "wallet", "perfume"];

  const isSpecialCategory = categories.some((cat) =>
    specialCategories.includes(cat),
  );

  const premiumBenefits: PremiumBenefit[] = [
    {
      icon: ShieldCheck,
      title: singleWatch?.warranty,
      description:
        "আপনার পণ্যের জন্য নিশ্চিন্ত সুরক্ষা ও নির্ভরতার প্রতিশ্রুতি।",
    },
    {
      icon: BadgeCheck,
      title: "১০০% অরিজিনাল",
      description:
        "আমরা শুধুমাত্র আসল ও সর্বোচ্চ মানসম্পন্ন পণ্য সরবরাহ করি, কোনো প্রকার নকল নয়।",
    },
    {
      icon: Gift,
      title: "ব্যাগ এন্ড বক্স ফ্রি",
      description:
        "প্রতিটি অর্ডারে থাকছে প্রিমিয়াম ব্যাগ ও আকর্ষণীয় বক্স সম্পূর্ণ ফ্রি।",
    },
    {
      icon: PackageSearch,
      title: "প্রোডাক্ট চেক করে নেওয়ার সুযোগ",
      description: "ডেলিভারির সময় হাতে নিয়ে যাচাই করে তারপরই গ্রহণ করুন।",
    },
    {
      icon: RefreshCcw,
      title: "৭ দিনের রিপ্লেসমেন্ট",
      description:
        "পণ্য ব্যবহার না করা সাপেক্ষে ৭ দিনের মধ্যে সহজে রিপ্লেসমেন্টের সুবিধা।",
    },
    {
      icon: Truck,
      title: "দ্রুততম সময়ে কুরিয়ার করা হয়",
      description: "দেশের যেকোনো প্রান্তে দ্রুত ও নিরাপদ ডেলিভারি।",
    },
  ];

  const filteredBenefits = premiumBenefits.filter((benefit, index) => {
    // sunglass / wallet / perfume হলে first 2 benefits hide হবে
    if (isSpecialCategory && index < 2) return false;

    // sunglass / wallet / perfume হলে ৭ দিনের রিপ্লেসমেন্ট hide হবে
    if (benefit.title === "৭ দিনের রিপ্লেসমেন্ট") {
      return !isSpecialCategory;
    }

    return true;
  });

  return (
    <div className="rongonaa-product-section overflow-hidden">
      <div className="rongonaa-product-section-head">
        <h3>কেন আমাদের কাছ থেকে কিনবেন?</h3>
      </div>
      <div className="p-3 sm:p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {filteredBenefits.map((benefit, index) => {
            const Icon = benefit.icon;

            return (
              <div
                key={index}
                className="premium-card flex flex-col items-center text-center p-4 rounded-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full premium-gradient text-white shadow-md">
                  <Icon className="h-6 w-6" />
                </div>

                <h3 className="text-base font-bold text-secondary">
                  {benefit.title}
                </h3>

                <p className="mt-1 text-xs leading-relaxed text-secondary/60">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
