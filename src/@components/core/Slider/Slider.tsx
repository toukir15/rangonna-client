// "use client";
// import {
//   HeroSliderProps,
//   ISlide,
// } from "@/@interfaces/HomeInterface/home.interfaces";
// import Image from "next/image";
// import Link from "next/link";
// import React, { useState, useEffect, useRef } from "react";

// const HeroSlider = ({ slides }: HeroSliderProps) => {
//   const [currentSlide, setCurrentSlide] = useState<number>(0);
//   const [isDragging, setIsDragging] = useState<boolean>(false);
//   const [startX, setStartX] = useState<number>(0);
//   const [currentTranslate, setCurrentTranslate] = useState<number>(0);
//   const [prevTranslate, setPrevTranslate] = useState<number>(0);
//   const sliderRef = useRef<HTMLDivElement>(null);
//   const timerRef = useRef<NodeJS.Timeout | null>(null);

//   // Auto play
//   useEffect(() => {
//     timerRef.current && clearInterval(timerRef.current);
//     timerRef.current = setInterval(() => goToSlide(currentSlide + 1), 3000);
//     return () => {
//       timerRef.current && clearInterval(timerRef.current);
//     };
//   }, [currentSlide, slides.length]);

//   const goToSlide = (index: number) => {
//     if (!slides.length) return;
//     if (index < 0) index = slides.length - 1;
//     else if (index >= slides.length) index = 0;
//     setCurrentSlide(index);
//     setCurrentTranslate(-index * 100);
//     setPrevTranslate(-index * 100);
//   };

//   const goToIndex = (index: number) => {
//     setIsDragging(false);
//     goToSlide(index);
//   };

//   const handleStart = (clientX: number) => {
//     setIsDragging(true);
//     setStartX(clientX);
//     timerRef.current && clearInterval(timerRef.current);
//   };

//   const handleMove = (clientX: number) => {
//     if (!isDragging || !sliderRef.current) return;
//     const diff = clientX - startX;
//     setCurrentTranslate(
//       prevTranslate + (diff / sliderRef.current.offsetWidth) * 100
//     );
//   };

//   const handleEnd = () => {
//     if (!isDragging) return;
//     setIsDragging(false);
//     const movedBy = currentTranslate - prevTranslate;
//     if (movedBy < -10) goToSlide(currentSlide + 1);
//     else if (movedBy > 10) goToSlide(currentSlide - 1);
//     else setCurrentTranslate(prevTranslate);
//   };

//   return (
//     <div
//       className={`
//         relative w-full overflow-hidden
//         h-[180px] sm:h-[220px] md:h-[280px] lg:h-[340px] xl:h-[400px]
//       `}
//       onMouseLeave={handleEnd}
//       onMouseUp={handleEnd}
//     >
//       <div
//         ref={sliderRef}
//         className="flex h-full transition-transform duration-300 ease-out select-none will-change-transform"
//         style={{ transform: `translateX(${currentTranslate}%)` }}
//         onTouchStart={(e) => handleStart(e.touches[0].clientX)}
//         onTouchMove={(e) => handleMove(e.touches[0].clientX)}
//         onTouchEnd={handleEnd}
//         onMouseDown={(e) => handleStart(e.clientX)}
//         onMouseMove={(e) => e.buttons === 1 && handleMove(e.clientX)}
//       >
//         {slides.map((slide: ISlide, i) => (
//           <Link
//             href={slide.link}
//             key={i}
//             className="relative min-w-full h-full"
//           >
//             <Image
//               src={slide.image}
//               alt={slide.title || "image"}
//               fill
//               priority={i === 0}
//               placeholder="blur"
//               blurDataURL="/tiny-blur.jpg"
//               className="object-cover"
//               sizes="(max-width: 368px) 100vw, (max-width: 1200px) 1440px, 100vw"
//             />
//           </Link>
//         ))}
//       </div>

//       {/* Dot navigation */}
//       <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
//         {slides.map((_, i) => (
//           <button
//             key={i}
//             aria-label={`Go to slide ${i + 1}`}
//             className={`w-2 h-2 rounded-full border border-white/70 ${i === currentSlide ? "bg-white" : "bg-white/40"
//               }`}
//             onClick={() => goToIndex(i)}
//           />
//         ))}
//       </div>
//     </div>
//   );
// };

// export default HeroSlider;

"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { StaticImageData } from "next/image";

export interface ISlide {
  image: string | StaticImageData;
  title?: string;
  description?: string;
  link: string;
}

export interface HeroSliderProps {
  slides: ISlide[];
  mobileSlides?: ISlide[]; // 👈 এটা add করো
}

const HeroSlider = ({ slides, mobileSlides = [] }: HeroSliderProps) => {
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [startX, setStartX] = useState<number>(0);
  const [currentTranslate, setCurrentTranslate] = useState<number>(0);
  const [prevTranslate, setPrevTranslate] = useState<number>(0);
  const [isMobileView, setIsMobileView] = useState<boolean>(false);

  const sliderRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const activeSlides =
    isMobileView && mobileSlides.length > 0 ? mobileSlides : slides;

  useEffect(() => {
    const checkScreen = () => {
      setIsMobileView(window.innerWidth <= 768);
    };

    checkScreen();
    window.addEventListener("resize", checkScreen);

    return () => {
      window.removeEventListener("resize", checkScreen);
    };
  }, []);

  useEffect(() => {
    setCurrentSlide(0);
    setCurrentTranslate(0);
    setPrevTranslate(0);
  }, [isMobileView]);

  useEffect(() => {
    if (!activeSlides.length) return;

    timerRef.current && clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      goToSlide(currentSlide + 1);
    }, 3000);

    return () => {
      timerRef.current && clearInterval(timerRef.current);
    };
  }, [currentSlide, activeSlides.length]);

  const goToSlide = (index: number) => {
    if (!activeSlides.length) return;

    if (index < 0) index = activeSlides.length - 1;
    else if (index >= activeSlides.length) index = 0;

    setCurrentSlide(index);
    setCurrentTranslate(-index * 100);
    setPrevTranslate(-index * 100);
  };

  const goToIndex = (index: number) => {
    setIsDragging(false);
    goToSlide(index);
  };

  const handleStart = (clientX: number) => {
    setIsDragging(true);
    setStartX(clientX);
    timerRef.current && clearInterval(timerRef.current);
  };

  const handleMove = (clientX: number) => {
    if (!isDragging || !sliderRef.current) return;

    const diff = clientX - startX;
    setCurrentTranslate(
      prevTranslate + (diff / sliderRef.current.offsetWidth) * 100,
    );
  };

  const handleEnd = () => {
    if (!isDragging) return;

    setIsDragging(false);
    const movedBy = currentTranslate - prevTranslate;

    if (movedBy < -10) goToSlide(currentSlide + 1);
    else if (movedBy > 10) goToSlide(currentSlide - 1);
    else setCurrentTranslate(prevTranslate);
  };

  if (!activeSlides.length) return null;

  return (
    <div
      className="
        relative w-full overflow-hidden
        h-[180px] sm:h-[220px] md:h-[280px] lg:h-[340px] xl:h-[400px]
      "
      onMouseLeave={handleEnd}
      onMouseUp={handleEnd}
    >
      <div
        ref={sliderRef}
        className="flex h-full transition-transform duration-300 ease-out select-none will-change-transform"
        style={{ transform: `translateX(${currentTranslate}%)` }}
        onTouchStart={(e) => handleStart(e.touches[0].clientX)}
        onTouchMove={(e) => handleMove(e.touches[0].clientX)}
        onTouchEnd={handleEnd}
        onMouseDown={(e) => handleStart(e.clientX)}
        onMouseMove={(e) => e.buttons === 1 && handleMove(e.clientX)}
      >
        {activeSlides.map((slide: ISlide, i: number) => (
          <Link
            href={slide.link || "/"}
            key={i}
            className="relative min-w-full h-full block"
          >
            <Image
              src={slide.image}
              alt={slide.title || `slide-${i + 1}`}
              fill
              priority={i === 0}
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 1440px"
              unoptimized={typeof slide.image === "string"}
            />
          </Link>
        ))}
      </div>

      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
        {activeSlides.map((_, i) => (
          <button
            key={i}
            aria-label={`Go to slide ${i + 1}`}
            className={`w-2 h-2 rounded-full border border-white/70 ${
              i === currentSlide ? "bg-white" : "bg-white/40"
            }`}
            onClick={() => goToIndex(i)}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;
