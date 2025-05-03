import React from "react";
import type { ChangeEvent, FC } from "react";

interface InputProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}

const Input: FC<InputProps> = ({
  label,
  name,
  value,
  onChange,
  error,
  type = "text",
  required = false,
  placeholder,
}) => {
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-foreground font-medium mb-2">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border ${
          error ? "border-destructive" : "border-input"
        } rounded focus:outline-none focus:ring-2 focus:ring-ring`}
      />
      {error && <p className="text-destructive text-sm mt-1">{error}</p>}
    </div>
  );
};

export default Input;
