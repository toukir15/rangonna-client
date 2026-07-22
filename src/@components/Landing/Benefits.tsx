"use client";
import {
  Crown,
  Verified,
  Repeat,
  Cable,
  TruckElectric,
  BaggageClaim,
} from "lucide-react";

interface PremiumBenefit {
  icon: React.ElementType;
  title: string;
  description: string;
}

export function Benefits({ landingData }: any) {
  const premiumBenefits: PremiumBenefit[] = [
    {
      icon: Verified,
      title: landingData?.products[0]?.warranty,
      description:
        "আপনার পণ্যের জন্য নিশ্চিন্ত সুরক্ষা ও নির্ভরতার প্রতিশ্রুতি।",
    },
    {
      icon: Crown,
      title: "১০০% অরিজিনাল",
      description:
        "আমরা শুধুমাত্র আসল ও সর্বোচ্চ মানসম্পন্ন পণ্য সরবরাহ করি, কোনো প্রকার নকল নয়।",
    },
    {
      icon: BaggageClaim,
      title: "ব্যাগ এন্ড বক্স ফ্রি।",
      description:
        "প্রতিটি অর্ডারে থাকছে প্রিমিয়াম ব্যাগ ও আকর্ষণীয় বক্স সম্পূর্ণ ফ্রি।",
    },

    {
      icon: Cable,
      title: "প্রোডাক্ট চেক করে নেওয়ার সুযোগ।",
      description: "ডেলিভারির সময় হাতে নিয়ে যাচাই করে তারপরই গ্রহণ করুন।",
    },
    {
      icon: Repeat,
      title: "৭ দিনের রিপ্লেসমেন্ট",
      description:
        "পণ্য ব্যবহার না করা সাপেক্ষে ৭ দিনের মধ্যে সহজে রিপ্লেসমেন্টের সুবিধা।",
    },
    {
      icon: TruckElectric,
      title: "দ্রুততম সময়ে কুরিয়ার করা হয়।",
      description: "দেশের যেকোনো প্রান্তে দ্রুত ও নিরাপদ ডেলিভারি।",
    },
  ];

  return (
    <div className="bg-gray-100 py-4">
      <div className="max-w-layout mx-auto ">
        <div className="bg-gradient-to-br from-primary-light via-primary-lighter to-primary-light border-primary/20 border rounded-lg ">
          <div className="p-3">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-0.5 mb-4 mt-2">
                <div className="bg-primary/10  border-primary/20  px-6 py-3 h-auto text-primary-dark flex items-center border rounded-lg font-bold text-3xl ">
                  আমাদের থেকে কেন কিনবেন?
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mb-4">
              {premiumBenefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-1.5 p-2 rounded-md bg-white border border-primary/10"
                >
                  <div className="flex-shrink-0">
                    <div className="p-1 rounded-full bg-primary/10 text-primary">
                      <benefit.icon className="w-3 h-3 " />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 pl-1">
                    <div className="text-base font-semibold text-foreground">
                      {benefit?.title}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 leading-tight">
                      {benefit.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
