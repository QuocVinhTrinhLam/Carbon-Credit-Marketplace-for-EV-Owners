import { Button } from "./button";
import { cn } from "./utils";

type PaginationProps = {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  className?: string;
};

export function Pagination({
  page,
  pageCount,
  onPageChange,
  className
}: PaginationProps) {
  if (pageCount <= 1) return null;

  const pages = Array.from({ length: pageCount }, (_, index) => index + 1);

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 rounded-lg border bg-white px-4 py-3",
        className
      )}
    >
      <Button
        variant="outline"
        size="sm"
        disabled={page === 1}
        onClick={() => onPageChange(Math.max(page - 1, 1))}
      >
        Previous
      </Button>
      <div className="flex items-center gap-1">
        {pages.map((item) => (
          <Button
            key={item}
            variant={item === page ? "default" : "ghost"}
            size="sm"
            onClick={() => onPageChange(item)}
          >
            {item}
          </Button>
        ))}
      </div>
      <Button
        variant="outline"
        size="sm"
        disabled={page === pageCount}
        onClick={() => onPageChange(Math.min(page + 1, pageCount))}
      >
        Next
      </Button>
    </div>
  );
}

