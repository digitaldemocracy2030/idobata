import React from "react";
import type { ChangeEvent, FC, InputHTMLAttributes } from "react";
import { Input as ShadcnInput } from "./shadcn-input";
import { Label } from "./shadcn-label";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
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
  className,
  ...props
}) => {
  return (
    <div className="mb-4">
      <Label
        htmlFor={name}
        className="block text-foreground font-medium mb-2"
      >
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <ShadcnInput
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`${error ? "border-destructive" : ""} ${className || ""}`}
        {...props}
      />
      {error && <p className="text-destructive text-sm mt-1">{error}</p>}
    </div>
  );
};

export default Input;
