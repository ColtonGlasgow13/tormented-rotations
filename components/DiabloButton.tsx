"use client";

import React, { useState } from "react";

interface DiabloButtonProps {
  bossName: string; // Changed label to bossName
  averageTime: string; // New prop for average time until group formation
  onClick: () => void;
  disabled?: boolean;
}

const DiabloButton: React.FC<DiabloButtonProps> = ({
  bossName,
  averageTime,
  onClick,
  disabled = false,
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const handleMouseDown = () => setIsPressed(true);
  const handleMouseUp = () => setIsPressed(false);

  return (
    <button
      className={`relative inline-block py-6 px-12 text-2xl font-bold uppercase transition-transform duration-150 transform ${
        disabled
          ? "bg-gray-600 text-gray-400 border-gray-600 cursor-not-allowed"
          : `text-gray-100 ${isPressed ? "scale-95 bg-red-900" : "scale-100"} ${
              isPressed ? "bg-red-900" : "bg-gray-900"
            } border-2 border-red-800 shadow-[0_4px_0_#8a0303,0_4px_15px_rgba(0,0,0,0.75)] hover:bg-red-800 hover:border-gray-100 hover:-translate-y-2 hover:shadow-[0_6px_0_#8a0303,0_6px_20px_rgba(0,0,0,0.85)]`
      }`}
      onClick={!disabled ? onClick : undefined}
      onMouseDown={!disabled ? handleMouseDown : undefined}
      onMouseUp={!disabled ? handleMouseUp : undefined}
      onMouseLeave={!disabled ? handleMouseUp : undefined}
      disabled={disabled}
    >
      <div className="flex flex-col items-center">
        <span className="text-lg text-gray-400">Find a group for</span>{" "}
        <span className="text-4xl mb-8">{bossName}</span>{" "}
        <span className="text-lg text-gray-400">Average queue time:</span>{" "}
        <span className="text-4xl mt-2">{averageTime}</span>{" "}
      </div>
    </button>
  );
};

export default DiabloButton;
