import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button";
import { cn } from "./utils";

type CarouselProps = {
  children: React.ReactNode;
  className?: string;
};

export const Carousel = ({ children, className }: CarouselProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const scroll = (direction: "left" | "right") => {
    const node = containerRef.current;
    if (!node) return;
    const offset = direction === "left" ? -320 : 320;
    node.scrollBy({ left: offset, behavior: "smooth" });
  };

  return (
    <div className={cn("relative", className)}>
      <div
        ref={containerRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4"
      >
        {children}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2">
        <Button
          variant="ghost"
          size="icon"
          className="pointer-events-auto rounded-full bg-white shadow"
          onClick={() => scroll("left")}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
        <Button
          variant="ghost"
          size="icon"
          className="pointer-events-auto rounded-full bg-white shadow"
          onClick={() => scroll("right")}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

