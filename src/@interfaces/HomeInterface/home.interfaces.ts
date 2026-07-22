import { StaticImageData } from "next/image";

export interface ISlide {
  image: StaticImageData;
  title: string;
  description?: string;
  link: string;
}

export interface HeroSliderProps {
  slides: ISlide[];
}
