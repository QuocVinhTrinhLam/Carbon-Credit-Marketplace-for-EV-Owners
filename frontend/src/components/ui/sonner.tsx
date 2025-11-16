import { Toaster as SonnerToaster, toast } from "sonner";

export const Toaster = () => (
  <SonnerToaster
    position="top-right"
    theme="light"
    richColors
    closeButton
    toastOptions={{
      className: "border border-slate-200 bg-white text-slate-900 shadow-lg"
    }}
  />
);

export { toast };

