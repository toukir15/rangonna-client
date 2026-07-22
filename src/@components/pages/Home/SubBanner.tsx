"use client";
import React from "react";
import subBannerOne from "@/@assets/subFeateure/Naviforce-men-Watches.jpg";
import subBannerTwo from "@/@assets/subFeateure/Women-Watches.jpg";
import subBannerThree from "@/@assets/subFeateure/Smart-Watches-jpg-webp.webp";
import subBannerFour from "@/@assets/subFeateure/Couple-Watches.jpg";
import Image from "next/image";
import Link from "next/link";

const SubBanner: React.FC = () => {
  const subSlides = [
    {
      image: subBannerOne,
      title: "Slide 1",
      link: "/watches/men",
    },
    {
      image: subBannerTwo,
      title: "Slide 2",
      link: "/watches/women",
    },
    {
      image: subBannerThree,
      title: "Slide 3",
      link: "/watches/smart-watches",
    },
    {
      image: subBannerFour,
      title: "Slide 4",
      link: "/watches/couple",
    },
  ];

  return (
    <div className="max-w-layout mx-auto">
      <div className="grid xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 xs:gap-2 sm:gap-3 md:gap-4 mt-4 ">
        {subSlides.map((items, index) => (
          <Link key={index} href={items.link}>
            <Image src={items.image} alt={""} className="w-full" />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SubBanner;
