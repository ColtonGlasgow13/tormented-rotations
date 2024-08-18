"use client";

import React, { useState } from "react";

interface DiabloInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const DiabloInput: React.FC<DiabloInputProps> = ({
  value,
  onChange,
  placeholder = "ILikeTrains#12345",
  disabled = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isValid, setIsValid] = useState(true);

  const validateInput = (input: string) => {
    const regex = /#\d{4,}$/;
    return regex.test(input);
  };

  const handleFocus = () => !disabled && setIsFocused(true);
  const handleBlur = () => {
    setIsFocused(false);
    setIsValid(validateInput(value));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (!disabled) {
      onChange(newValue);
      setIsValid(validateInput(newValue));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!disabled && e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
      setIsValid(validateInput(value));
    }
  };

  return (
    <div className="relative">
      <input
        className={`w-full py-3 px-6 text-lg font-bold transition-transform duration-200 transform ${
          disabled
            ? "bg-gray-600 text-gray-400 border-gray-600 cursor-not-allowed"
            : `${isFocused ? "scale-105 border-red-600" : "scale-100"} ${
                isValid ? "bg-gray-900" : "bg-red-900"
              } border-2 ${
                isValid ? "border-red-800" : "border-red-600"
              } text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-800`
        }`}
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
      />
      {!isValid && !disabled && (
        <p className="text-red-600 mt-1">
          {'Use your full Battle.net username, eg. "ILoveDiablo#1234"'}
        </p>
      )}
    </div>
  );
};

export default DiabloInput;
