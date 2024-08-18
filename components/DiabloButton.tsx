"use client";

import { client } from "@/utils/amplifyUtils";
import React, { useState } from "react";

interface DiabloButtonProps {
  label: string;
}

const DiabloButton: React.FC<DiabloButtonProps> = ({ label }) => {
  const [isPressed, setIsPressed] = useState(false);

  const handleMouseDown = () => setIsPressed(true);
  const handleMouseUp = () => setIsPressed(false);

  const createRequest = async () => {
    await client.models.Request.create({ username: "testUsername" });
  };

  return (
    <button
      className={`relative inline-block py-3 px-6 text-lg font-bold text-gray-100 uppercase transition-transform duration-150 transform ${
        isPressed ? "scale-95 bg-red-900" : "scale-100"
      } ${
        isPressed ? "bg-red-900" : "bg-gray-900"
      } border-2 border-red-800 shadow-[0_4px_0_#8a0303,0_4px_15px_rgba(0,0,0,0.75)] hover:bg-red-800 hover:border-gray-100 hover:-translate-y-2 hover:shadow-[0_6px_0_#8a0303,0_6px_20px_rgba(0,0,0,0.85)]`}
      onClick={createRequest}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {label}
    </button>
  );
};

export default DiabloButton;
