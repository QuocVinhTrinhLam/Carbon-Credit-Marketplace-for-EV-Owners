import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import { forwardRef } from "react";
import { cn } from "./utils";

const HoverCard = HoverCardPrimitive.Root;
const HoverCardTrigger = HoverCardPrimitive.Trigger;
const HoverCardPortal = HoverCardPrimitive.Portal;

const HoverCardContent = forwardRef<
  React.ElementRef<typeof HoverCardPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <HoverCardPortal>
    <HoverCardPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-64 rounded-lg border bg-white p-4 text-sm shadow-lg animate-in fade-in-0 zoom-in-95",
        className
      )}
      {...props}
    />
  </HoverCardPortal>
));
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName;

export { HoverCard, HoverCardTrigger, HoverCardContent };

