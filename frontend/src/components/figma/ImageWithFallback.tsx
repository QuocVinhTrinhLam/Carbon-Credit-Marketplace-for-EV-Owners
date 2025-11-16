import { useState } from "react";
import { cn } from "../ui/utils";

type ImageWithFallbackProps = {
  src: string;
  alt: string;
  fallback?: string;
  className?: string;
};

const DEFAULT_FALLBACK =
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80";

export function ImageWithFallback({
  src,
  alt,
  fallback = DEFAULT_FALLBACK,
  className
}: ImageWithFallbackProps) {
  const [currentSrc, setCurrentSrc] = useState(src);

  return (
    <img
      src={currentSrc}
      alt={alt}
      onError={() => setCurrentSrc(fallback)}
      className={cn("h-full w-full rounded-xl object-cover", className)}
    />
  );
}

