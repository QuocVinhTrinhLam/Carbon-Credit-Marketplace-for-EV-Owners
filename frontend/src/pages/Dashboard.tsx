import { useMemo } from "react";
import { Link } from "react-router-dom";
import { StatCard } from "../components/common/StatCard";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { GradientAreaChart } from "../components/ui/chart";
import { Skeleton } from "../components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { useAuth } from "../hooks/useAuth";
import { useFetch } from "../hooks/useFetch";
import { creditService } from "../services/credit";
import { listingService } from "../services/listing";
import { transactionService } from "../services/transaction";
import { walletService } from "../services/wallet";

const DashboardPage = () => {
  const { user } = useAuth();

  const walletQuery = useFetch(
    ["wallet", user?.id],
    () => walletService.getWallet(user!.id),
    {
      enabled: Boolean(user?.id)
    }
  );

  const transactionsQuery = useFetch(
    ["transactions", user?.id],
    () => transactionService.getTransactions(user!.id),
    {
      enabled: Boolean(user?.id)
    }
  );

  const portfolioQuery = useFetch(
    ["portfolio", user?.id],
    () => creditService.getPortfolio(user!.id),
    {
      enabled: Boolean(user?.id)
    }
  );

  const listingsQuery = useFetch(["listings"], () => listingService.getListings());

  const chartData = useMemo(() => {
    if (!transactionsQuery.data) return [];
    return transactionsQuery.data.slice(-7).map((transaction) => ({
      date: new Date(transaction.createdAt).toLocaleDateString(),
      volume: transaction.totalAmount
    }));
  }, [transactionsQuery.data]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 px-6 py-8 text-white shadow-lg">
        <h1 className="text-2xl font-semibold">
          Hello {user?.name?.split(" ")[0] ?? "there"}, welcome back 👋
        </h1>
        <p className="max-w-2xl text-sm text-emerald-100">
          Track live performance of your carbon credit portfolio, manage marketplace listings, and keep your wallet healthy — all in one place.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" asChild>
            <Link to="/listings">Browse marketplace</Link>
          </Button>
          <Button variant="outline" className="bg-white/10 text-white hover:bg-white/20 hover:text-white" asChild>
            <Link to="/wallet">Manage wallet</Link>
          </Button>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCards
          walletQueryPending={walletQuery.isLoading}
          balance={walletQuery.data?.balance ?? 0}
          currency="VND"
          portfolioCount={portfolioQuery.data?.length ?? 0}
          listingsActive={listingsQuery.data?.filter((listing) => listing.status === "ACTIVE").length ?? 0}
          tradesCount={transactionsQuery.data?.length ?? 0}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle>Trading volume</CardTitle>
            <span className="text-xs text-muted-foreground">Last 7 trades</span>
          </CardHeader>
          <CardContent className="h-72">
            {transactionsQuery.isLoading ? (
              <Skeleton className="h-full w-full rounded-xl" />
            ) : (
              <GradientAreaChart
                title=""
                data={chartData}
                dataKey={"volume"}
                xKey={"date"}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button asChild variant="outline">
              <Link to="/transactions">View all transactions</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/credits">Manage certificates</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/listings">Create new listing</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="h-full">
          <CardHeader className="pb-4">
            <CardTitle>Recent transactions</CardTitle>
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
                    <TableHead>Listing</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactionsQuery.data.slice(0, 5).map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">
                        {transaction.listingName}
                      </TableCell>
                      <TableCell>
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{transaction.quantity.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        {(transaction.totalAmount).toLocaleString('vi-VN')} VND
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState message="No transactions yet. Start trading carbon credits to see your activity here." />
            )}
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader className="pb-4">
            <CardTitle>Active listings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {listingsQuery.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : listingsQuery.data && listingsQuery.data.length > 0 ? (
              listingsQuery.data.slice(0, 5).map((listing) => (
                <div
                  key={listing.id}
                  className="flex flex-col rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-slate-900">{listing.name}</p>
                    <span className="text-xs font-medium text-emerald-600">
                      ${listing.pricePerCredit.toFixed(2)}/tCO₂e
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {listing.location} · {listing.availableCredits.toLocaleString()} credits available
                  </p>
                </div>
              ))
            ) : (
              <EmptyState message="No listings published yet. Create one to start selling carbon credits." />
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

type StatCardsProps = {
  walletQueryPending: boolean;
  balance: number;
  currency: string;
  portfolioCount: number;
  listingsActive: number;
  tradesCount: number;
};

function StatCards({
  walletQueryPending,
  balance,
  currency,
  portfolioCount,
  listingsActive,
  tradesCount
}: StatCardsProps) {
  if (walletQueryPending) {
    return (
      <>
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </>
    );
  }
  return (
    <>
      <StatCard
        title="Wallet balance"
        value={`${balance.toLocaleString('vi-VN')} VND`}
        delta={{ value: "+5.4% MoM", trend: "up" }}
      />
      <StatCard
        title="Certificates owned"
        value={portfolioCount.toString()}
        delta={{ value: `${portfolioCount > 0 ? "+1 new" : "No new"}`, trend: "up" }}
      />
      <StatCard
        title="Active listings"
        value={listingsActive.toString()}
        delta={{ value: "Marketplace", trend: "up" }}
      />
      <StatCard
        title="Lifetime trades"
        value={tradesCount.toString()}
        delta={{ value: `${tradesCount > 0 ? "+2 recent" : "New"}`, trend: "up" }}
      />
    </>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

export default DashboardPage;

