import { DayPicker } from "react-day-picker";
import { cn } from "./utils";
import "react-day-picker/dist/style.css";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, ...props }: CalendarProps) {
  return (
    <DayPicker
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption:
          "flex justify-center pt-1 relative items-center text-sm font-medium",
        caption_label: "text-sm font-semibold",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          "h-8 w-8 bg-transparent p-0 opacity-50 hover:opacity-100 transition"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-medium text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: cn(
          "relative h-9 w-9 text-center text-sm p-0 focus-within:relative focus-within:z-20",
          "aria-selected:rounded-md aria-selected:bg-brand aria-selected:text-white"
        ),
        day: cn(
          "h-9 w-9 p-0 font-normal",
          "hover:bg-slate-100",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand"
        ),
        day_selected:
          "bg-brand text-white hover:bg-brand focus:bg-brand focus:text-white",
        day_today: "text-brand font-semibold",
        day_outside: "text-muted-foreground opacity-50",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle: "aria-selected:bg-brand/80",
        day_hidden: "invisible"
      }}
      {...props}
    />
  );
}

export { Calendar };

