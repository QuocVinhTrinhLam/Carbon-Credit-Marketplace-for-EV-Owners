import { useMemo } from "react";
import { Input } from "./input";

type InputOTPProps = {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export function InputOTP({
  length = 6,
  value,
  onChange,
  className
}: InputOTPProps) {
  const slots = useMemo(() => Array.from({ length }), [length]);

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        {slots.map((_, index) => (
          <Input
            key={index}
            value={value[index] ?? ""}
            onChange={(event) => {
              const val = event.target.value.replace(/\D/g, "");
              const chars = value.split("");
              chars[index] = val.slice(-1);
              const next = chars.join("").slice(0, length);
              onChange(next);
            }}
            maxLength={1}
            inputMode="numeric"
            className="h-12 w-10 text-center text-lg"
          />
        ))}
      </div>
    </div>
  );
}

