import { cva, type VariantProps } from "class-variance-authority";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";
import { forwardRef } from "react";
import { cn } from "./utils";

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4",
  {
    variants: {
      variant: {
        default: "bg-white text-slate-900",
        success: "border-emerald-300 bg-emerald-50 text-emerald-900",
        destructive: "border-red-300 bg-red-50 text-red-900",
        info: "border-blue-300 bg-blue-50 text-blue-900"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

const variantIconMap = {
  default: Info,
  success: CheckCircle,
  destructive: AlertTriangle,
  info: Info
};

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {}

const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, children, ...props }, ref) => {
    const Icon = variantIconMap[variant ?? "default"];
    return (
      <div
        ref={ref}
        role="alert"
        className={cn(alertVariants({ variant }), className)}
        {...props}
      >
        <Icon className="h-4 w-4" />
        {children}
      </div>
    );
  }
);
Alert.displayName = "Alert";

const AlertTitle = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };

