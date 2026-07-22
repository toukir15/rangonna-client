/* eslint-disable no-console */
import React from "react";
interface BanglaTextProps {
  unicodeString: string;
}
const BanglaText: React.FC<BanglaTextProps> = ({ unicodeString }) => {
  const convertToBangla = (unicodeString: string): string => {
    const formattedString = unicodeString.replace(
      /u([0-9a-fA-F]{4})/g,
      "\\u$1"
    );

    try {
      return JSON.parse(`"${formattedString}"`);
    } catch (e) {
      console.error("Error converting to Bangla: ", e);
      return unicodeString;
    }
  };

  return <>{convertToBangla(unicodeString)}</>;
};

export default BanglaText;
