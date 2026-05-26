import React from "react";
import { Search } from "lucide-react";

import { Input } from "./input";

interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export function SearchInput({
  placeholder = "Search...",
  value = "",
  onChange,
  className = "",
}: SearchInputProps) {
  return (
    <Input
      type="search"
      value={value}
      placeholder={placeholder}
      aria-label={placeholder}
      leftIcon={<Search className="h-5 w-5" aria-hidden="true" />}
      containerClassName={className}
      inputSize="lg"
      className="rounded-2xl"
      onChange={(event) => onChange?.(event.target.value)}
    />
  );
}
