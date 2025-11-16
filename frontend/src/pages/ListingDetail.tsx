import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, Leaf, ShieldCheck, Trees } from "lucide-react";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";
import { Input } from "../components/ui/input";
import { Skeleton } from "../components/ui/skeleton";
import { toast } from "../components/ui/sonner";
import { GradientAreaChart } from "../components/ui/chart";
import { useFetch } from "../hooks/useFetch";
import { listingService } from "../services/listing";
import { transactionService } from "../services/transaction";
import { useAuth } from "../hooks/useAuth";

const purchaseSchema = z.object({
  quantity: z
    .number({ invalid_type_error: "Quantity is required" })
    .min(1, "You must purchase at least 1 credit")
});

type PurchaseFormValues = z.infer<typeof purchaseSchema>;

const ListingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const listingQuery = useFetch(
    ["listing", id],
    () => listingService.getById(id!),
    { enabled: Boolean(id) }
  );

  const priceTrendData = useMemo(() => {
    if (!listingQuery.data) return [];
    return Array.from({ length: 6 }).map((_, index) => ({
      month: new Date(Date.now() - index * 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en", {
        month: "short"
      }),
      price: listingQuery.data.pricePerCredit * (1 + Math.sin(index) * 0.05)
    })).reverse();
  }, [listingQuery.data]);

  const buyMutation = useMutation({
    mutationFn: (payload: { listingId: string; buyerId: string; quantity?: number }) =>
      transactionService.buy(payload),
    onSuccess: () => {
      toast.success("Purchase request submitted successfully");
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      navigate("/transactions");
    },
    onError: () => {
      toast.error("Unable to complete purchase. Please try again.");
    }
  });

  const form = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: { quantity: 100 }
  });

  const onSubmit = (values: PurchaseFormValues) => {
    if (!id || !user) {
      toast.error("You need to be logged in to purchase.");
      return;
    }
    buyMutation.mutate({
      listingId: id,
      buyerId: user.id,
      quantity: values.quantity
    });
  };

  if (listingQuery.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-56 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!listingQuery.data) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 py-20 text-center">
        <p className="text-sm text-muted-foreground">
          Listing not found or no longer available.
        </p>
        <Button asChild variant="outline">
          <Link to="/listings">Back to listings</Link>
        </Button>
      </div>
    );
  }

  const listing = listingQuery.data;
  const estimatedCost = form.watch("quantity") * listing.pricePerCredit;

  return (
    <div className="space-y-6">
      <Button variant="ghost" className="gap-2 text-sm" asChild>
        <Link to="/listings">
          <ChevronLeft className="h-4 w-4" />
          Back to listings
        </Link>
      </Button>

      <Card>
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <Badge variant="secondary">{listing.category}</Badge>
            <Badge
              variant={
                listing.status === "ACTIVE"
                  ? "success"
                  : listing.status === "SOLD_OUT"
                    ? "destructive"
                    : "outline"
              }
            >
              {listing.status.replace("_", " ")}
            </Badge>
          </div>
          <CardTitle className="text-2xl">{listing.name}</CardTitle>
          <CardDescription>
            {listing.location} · Vintage {listing.vintageYear} · {listing.certification}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <div className="grid gap-4 rounded-xl border bg-slate-50 p-4 sm:grid-cols-3">
              <Metric icon={<Leaf className="h-5 w-5 text-emerald-600" />} label="Available credits">
                {listing.availableCredits.toLocaleString()}
              </Metric>
              <Metric
                icon={<ShieldCheck className="h-5 w-5 text-emerald-600" />}
                label="Certification"
              >
                {listing.certification}
              </Metric>
              <Metric icon={<Trees className="h-5 w-5 text-emerald-600" />} label="Price per tCO₂e">
                {listing.pricePerCredit.toLocaleString('vi-VN')} VND
              </Metric>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Project summary
              </h3>
              <p className="mt-3 leading-relaxed text-slate-700">
                {listing.summary}
              </p>
            </div>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Price history (simulated)</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                <GradientAreaChart
                  data={priceTrendData}
                  dataKey={"price"}
                  xKey={"month"}
                />
              </CardContent>
            </Card>
          </div>
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">
              Purchase credits
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose quantity of credits to reserve. Our team will review and finalize the transaction.
            </p>
            <Form {...form}>
              <form className="mt-6 space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={listing.availableCredits}
                          {...field}
                          onChange={(event) =>
                            field.onChange(Number(event.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">
                        Maximum available: {listing.availableCredits.toLocaleString()} credits
                      </p>
                    </FormItem>
                  )}
                />
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs uppercase text-muted-foreground">
                    Estimated total
                  </p>
                  <p className="text-2xl font-semibold text-slate-900">
                    {estimatedCost.toLocaleString('vi-VN')} VND
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Price calculated at {listing.pricePerCredit.toLocaleString('vi-VN')} VND per credit.
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={buyMutation.isPending}>
                  {buyMutation.isPending ? "Submitting..." : "Submit purchase request"}
                </Button>
              </form>
            </Form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

function Metric({
  icon,
  label,
  children
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg bg-white p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="text-lg font-semibold text-slate-900">{children}</div>
    </div>
  );
}

export default ListingDetailPage;

