import * as CommandPrimitive from "cmdk";
import { Search } from "lucide-react";
import { forwardRef } from "react";
import { cn } from "./utils";

const Command = forwardRef<
  React.ElementRef<typeof CommandPrimitive.Command>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Command>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Command
    ref={ref}
    className={cn(
      "flex h-full w-full flex-col overflow-hidden rounded-lg border bg-white text-slate-900",
      className
    )}
    {...props}
  />
));
Command.displayName = CommandPrimitive.Command.displayName;

const CommandInput = forwardRef<
  React.ElementRef<typeof CommandPrimitive.CommandInput>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.CommandInput>
>(({ className, ...props }, ref) => (
  <div className="flex items-center border-b px-3">
    <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
    <CommandPrimitive.CommandInput
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground",
        className
      )}
      {...props}
    />
  </div>
));
CommandInput.displayName = CommandPrimitive.CommandInput.displayName;

const CommandList = forwardRef<
  React.ElementRef<typeof CommandPrimitive.CommandList>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.CommandList>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.CommandList
    ref={ref}
    className={cn("max-h-72 overflow-y-auto", className)}
    {...props}
  />
));
CommandList.displayName = CommandPrimitive.CommandList.displayName;

const CommandEmpty = CommandPrimitive.CommandEmpty;
const CommandGroup = CommandPrimitive.CommandGroup;
const CommandItem = CommandPrimitive.CommandItem;
const CommandSeparator = CommandPrimitive.CommandSeparator;
const CommandShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cn(
      "ml-auto text-xs tracking-wide text-muted-foreground",
      className
    )}
    {...props}
  />
);

export {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut
};

