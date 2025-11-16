import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { forwardRef } from "react";
import { cn } from "./utils";

const ToggleGroup = ToggleGroupPrimitive.Root;

const ToggleGroupItem = forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item>
>(({ className, ...props }, ref) => (
  <ToggleGroupPrimitive.Item
    ref={ref}
    className={cn(
      "inline-flex min-w-[80px] items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition data-[state=on]:border-transparent data-[state=on]:bg-brand data-[state=on]:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
      className
    )}
    {...props}
  />
));
ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName;

export { ToggleGroup, ToggleGroupItem };

