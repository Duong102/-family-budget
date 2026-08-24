"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";

function toDigits(value: string): string {
  const negative = value.trim().startsWith("-");
  const digits = value.replace(/\D/g, "");
  return negative && digits ? `-${digits}` : digits;
}

function formatDigits(digits: string): string {
  const negative = digits.startsWith("-");
  const unsigned = negative ? digits.slice(1) : digits;
  const formatted = unsigned.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return negative ? `-${formatted}` : formatted;
}

export function CurrencyInput({
  id,
  name,
  defaultValue,
  required,
  disabled,
  className,
  placeholder,
}: {
  id?: string;
  name: string;
  defaultValue?: number | string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}) {
  const [digits, setDigits] = React.useState(() =>
    toDigits(defaultValue !== undefined && defaultValue !== null ? String(defaultValue) : ""),
  );
  const inputRef = React.useRef<HTMLInputElement>(null);
  const caretDigitsRef = React.useRef<number | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const selStart = input.selectionStart ?? input.value.length;
    caretDigitsRef.current = toDigits(input.value.slice(0, selStart)).length;
    setDigits(toDigits(input.value));
  };

  React.useEffect(() => {
    const el = inputRef.current;
    const digitsBeforeCaret = caretDigitsRef.current;
    if (!el || digitsBeforeCaret === null) return;
    const formatted = formatDigits(digits);
    let caret = formatted.length;
    let seen = 0;
    for (let i = 0; i < formatted.length; i++) {
      if (formatted[i] !== ".") seen++;
      if (seen === digitsBeforeCaret) {
        caret = i + 1;
        break;
      }
    }
    if (digitsBeforeCaret === 0) caret = 0;
    el.setSelectionRange(caret, caret);
  }, [digits]);

  return (
    <>
      <Input
        ref={inputRef}
        id={id}
        inputMode="numeric"
        autoComplete="off"
        placeholder={placeholder}
        value={formatDigits(digits)}
        onChange={handleChange}
        required={required}
        disabled={disabled}
        className={className}
      />
      <input type="hidden" name={name} value={digits} />
    </>
  );
}
