"use client";
import React, { useState } from "react";

interface SwitchProps {
  onToggle: (value: boolean) => void;
  default?: boolean;
}

const Switch: React.FC<SwitchProps> = ({
  onToggle,
  default: defaultValue = false,
}) => {
  const [isOn, setIsOn] = useState<boolean>(defaultValue);

  const handleToggle = () => {
    setIsOn((prev) => {
      const newValue = !prev;
      onToggle(newValue);
      return newValue;
    });
  };

  return (
    <div
      onClick={handleToggle}
      style={{
        display: "inline-flex",
        alignItems: "center",
        cursor: "pointer",
        backgroundColor: isOn ? "#4caf50" : "#ccc",
        borderRadius: "15px",
        width: "40px",
        height: "20px",
        padding: "2px",
        transition: "background-color 0.3s",
      }}
    >
      <div
        style={{
          width: "16px",
          height: "16px",
          backgroundColor: "#fff",
          borderRadius: "50%",
          transform: isOn ? "translateX(20px)" : "translateX(0)",
          transition: "transform 0.3s",
        }}
      ></div>
    </div>
  );
};

export default Switch;
