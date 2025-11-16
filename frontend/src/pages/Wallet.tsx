import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";
import { Input } from "../components/ui/input";
import { Skeleton } from "../components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { toast } from "../components/ui/sonner";
import { useAuth } from "../hooks/useAuth";
import { useFetch } from "../hooks/useFetch";
import { walletService } from "../services/wallet";
import { paymentService } from "../services/payment";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Label } from "../components/ui/label";
import { CreditCard, Wallet as WalletIcon } from "lucide-react";
import { useState } from "react";

const topUpSchema = z.object({
  amount: z
    .number({ invalid_type_error: "Amount is required" })
    .min(10, "Minimum top-up is 10"),
  paymentMethod: z.enum(["direct", "vnpay"], {
    required_error: "Please select a payment method"
  })
});

type TopUpFormValues = z.infer<typeof topUpSchema>;

const WalletPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const walletQuery = useFetch(
    ["wallet", user?.id],
    () => walletService.getWallet(user!.id),
    {
      enabled: Boolean(user?.id)
    }
  );

  const transactionsQuery = useFetch(
    ["wallet-transactions", user?.id],
    () => walletService.getTransactions(user!.id),
    {
      enabled: Boolean(user?.id)
    }
  );

  const topUpMutation = useMutation({
    mutationFn: (payload: { userId: string; amount: number }) =>
      walletService.topUp(payload.userId, payload.amount),
    onSuccess: () => {
      toast.success("Wallet topped up successfully");
      queryClient.invalidateQueries({ queryKey: ["wallet", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["wallet-transactions", user?.id] });
    },
    onError: () => {
      toast.error("Unable to top up wallet. Please try again.");
    }
  });

  const vnpayTopUpMutation = useMutation({
    mutationFn: async (payload: { userId: number; amount: number }) => {
      const paymentUrl = await paymentService.createVnpayTopup(payload.userId, payload.amount);
      // Redirect to VNPay
      window.location.href = paymentUrl;
    },
    onError: (error: any) => {
      toast.error(error.message || "Unable to create VNPay payment. Please try again.");
    }
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 rounded-xl border bg-white px-6 py-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Wallet</h1>
          <p className="text-sm text-muted-foreground">
            Monitor cash balance and transaction history. Use the top-up option to stay ready for marketplace opportunities.
          </p>
        </div>
        <TopUpDialog
          onSubmit={(amount, paymentMethod) => {
            if (!user) return;
            if (paymentMethod === "vnpay") {
              vnpayTopUpMutation.mutate({ userId: Number(user.id), amount });
            } else {
              topUpMutation.mutate({ userId: user.id, amount });
            }
          }}
          isLoading={topUpMutation.isPending || vnpayTopUpMutation.isPending}
        />
      </header>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base text-muted-foreground">Current balance</CardTitle>
              <p className="mt-1 text-3xl font-semibold text-slate-900">
                {walletQuery.isLoading
                  ? "—"
                  : `${(walletQuery.data?.balance ?? 0).toLocaleString('vi-VN')} VND`}
              </p>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <SummaryMetric
              label="Available for trading"
              value={
                walletQuery.isLoading
                  ? undefined
                  : `${(walletQuery.data?.balance ?? 0).toLocaleString('vi-VN')} VND`
              }
            />
            <SummaryMetric
              label="Last top-up"
              value={
                transactionsQuery.isLoading
                  ? undefined
                  : transactionsQuery.data?.find((transaction) => transaction.type === "TOP_UP")
                    ? `${transactionsQuery.data
                          ?.find((transaction) => transaction.type === "TOP_UP")!
                          .amount.toLocaleString('vi-VN')} VND`
                    : "—"
              }
            />
            <SummaryMetric
              label="Last updated"
              value={
                walletQuery.data?.lastUpdated
                  ? new Date(walletQuery.data.lastUpdated).toLocaleString()
                  : "—"
              }
            />
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Transaction history</CardTitle>
          <CardDescription>All wallet movements including top-ups and settlements.</CardDescription>
        </CardHeader>
        <CardContent>
          {transactionsQuery.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : transactionsQuery.data && transactionsQuery.data.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Balance after</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactionsQuery.data.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">
                      {transaction.type === "TOP_UP" ? "Top up" : transaction.type === "PURCHASE" ? "Purchase" : "Sale"}
                    </TableCell>
                    <TableCell>{transaction.description ?? "—"}</TableCell>
                    <TableCell>
                      {new Date(transaction.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {transaction.amount > 0 ? "+" : "-"}
                      {Math.abs(transaction.amount).toLocaleString('vi-VN')} VND
                    </TableCell>
                    <TableCell className="text-right">
                      {transaction.balanceAfter.toLocaleString('vi-VN')} VND
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 py-10 text-center text-sm text-muted-foreground">
              No transactions found. Once you start trading, history will appear here.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

function SummaryMetric({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold text-slate-900">
        {value ?? <Skeleton className="h-5 w-24" />}
      </p>
    </div>
  );
}

type TopUpDialogProps = {
  onSubmit: (amount: number, paymentMethod: "direct" | "vnpay") => void;
  isLoading: boolean;
};

function TopUpDialog({ onSubmit, isLoading }: TopUpDialogProps) {
  const [open, setOpen] = useState(false);
  const form = useForm<TopUpFormValues>({
    resolver: zodResolver(topUpSchema),
    defaultValues: {
      amount: 500,
      paymentMethod: "vnpay"
    }
  });

  const handleSubmit = (values: TopUpFormValues) => {
    onSubmit(values.amount, values.paymentMethod);
    if (values.paymentMethod === "direct") {
      form.reset();
      setOpen(false);
    }
    // For VNPay, keep dialog open until redirect happens
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Top up wallet</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Top up your wallet</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (VND)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={10000}
                      placeholder="Minimum 10,000 VND (có thể nạp bất kỳ số tiền nào)"
                      {...field}
                      onChange={(event) => field.onChange(Number(event.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Payment Method</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-2"
                    >
                      <div className="flex items-center space-x-3 space-y-0 rounded-md border p-4 hover:bg-slate-50">
                        <RadioGroupItem value="vnpay" id="vnpay" />
                        <Label
                          htmlFor="vnpay"
                          className="flex flex-1 cursor-pointer items-center gap-3 font-normal"
                        >
                          <CreditCard className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="font-medium">VNPay</p>
                            <p className="text-xs text-muted-foreground">
                              Pay via bank, credit card, or e-wallet
                            </p>
                          </div>
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-3 space-y-0 rounded-md border p-4 hover:bg-slate-50">
                        <RadioGroupItem value="direct" id="direct" />
                        <Label
                          htmlFor="direct"
                          className="flex flex-1 cursor-pointer items-center gap-3 font-normal"
                        >
                          <WalletIcon className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="font-medium">Direct Credit (Demo)</p>
                            <p className="text-xs text-muted-foreground">
                              Instant credit for testing purposes
                            </p>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Processing..." : "Confirm top-up"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default WalletPage;

