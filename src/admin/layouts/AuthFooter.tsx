import Image from "next/image";
import FooterLogo from "../assets/images/logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebook,
  faInstagram,
  faLinkedin,
  faTwitter,
} from "@fortawesome/free-brands-svg-icons";
import whiteNaviforce from "../assets/images/whiteFotterLogo.png";
import { useGlobalContext } from "@admin/context/GlobalContext";

export default function AuthFooter() {
  const { isDarkMode } = useGlobalContext();
  return (
    <footer className="dark:bg-gray-800 bg-white text-gray-800 md:py-4 py-2 2xl:px-4 px-3 rounded-md p-20 2xl:mx-4 mx-3 mb-1">
      <div className="mx-auto md:flex justify-between items-center">
        {/* Logo and Text Section */}
        <div className="flex md:items-center ">
          {isDarkMode ? (
            <Image
              src={whiteNaviforce}
              alt={""}
              className="md:h-14 md:w-auto h-10 w-14 "
            />
          ) : (
            <Image
              src={FooterLogo}
              alt={""}
              className="md:h-14 md:w-auto h-10 w-14 "
            />
          )}

          <div className="md:text-base text-sm font-semibold md:ml-10 ml-5 dark:text-gray-300">
            <span>EcomIntelligence.Com</span>
            <div className="md:text-sm text-xs md:mt-0 mt-1">
              © {new Date().getFullYear()} EcomIntelligence.Com. All Rights
              Reserved.
            </div>
          </div>
        </div>

        {/* Social Media Section */}
        <div className="flex md:space-x-4 space-x-8 text-lg items-center justify-center md:mt-4 2xl:mt-6 mt-3 dark:text-gray-300">
          <FontAwesomeIcon icon={faFacebook} className="cursor-pointer" />
          <FontAwesomeIcon icon={faTwitter} className="cursor-pointer" />
          <FontAwesomeIcon icon={faInstagram} className="cursor-pointer" />
          <FontAwesomeIcon icon={faLinkedin} className="cursor-pointer" />
        </div>
      </div>
    </footer>
  );
}
