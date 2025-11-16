import { useMemo, useState } from "react";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Skeleton } from "../components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { useAuth } from "../hooks/useAuth";
import { useFetch } from "../hooks/useFetch";
import { transactionService } from "../services/transaction";

const TransactionsPage = () => {
  const { user } = useAuth();
  const transactionsQuery = useFetch(
    ["transactions", user?.id],
    () => transactionService.getTransactions(user!.id),
    { enabled: Boolean(user?.id) }
  );
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [type, setType] = useState("ALL");

  const filteredTransactions = useMemo(() => {
    if (!transactionsQuery.data) return [];
    return transactionsQuery.data.filter((transaction) => {
      const matchesSearch = transaction.listingName
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesStatus =
        status === "ALL" || transaction.status === status;
      const matchesType = type === "ALL" || transaction.type === type;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [transactionsQuery.data, search, status, type]);

  return (
    <div className="space-y-6">
      <header className="rounded-xl border bg-white px-6 py-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Transactions</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review and track all purchase and sale orders executed across the carbon credit marketplace.
        </p>
        <div className="mt-6 grid gap-3 lg:grid-cols-4">
          <Input
            className="lg:col-span-2"
            placeholder="Search by listing name"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="FAILED">Failed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger>
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All types</SelectItem>
              <SelectItem value="BUY">Buy</SelectItem>
              <SelectItem value="SELL">Sell</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Activity log</CardTitle>
          <CardDescription>
            Each row represents a completed, pending, or failed trade involving carbon credits.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactionsQuery.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : filteredTransactions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Listing</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Price / credit</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">
                      {transaction.listingName}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {transaction.type.toLowerCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={transaction.status} />
                    </TableCell>
                    <TableCell>{transaction.quantity.toLocaleString()}</TableCell>
                    <TableCell>
                      {transaction.pricePerCredit.toLocaleString('vi-VN')} VND
                    </TableCell>
                    <TableCell>
                      {transaction.totalAmount.toLocaleString('vi-VN')} VND
                    </TableCell>
                    <TableCell>
                      {new Date(transaction.createdAt).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 py-12 text-center text-sm text-muted-foreground">
              No transactions found. Execute a trade to see it listed here.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

function StatusBadge({
  status
}: {
  status: "PENDING" | "COMPLETED" | "FAILED";
}) {
  const variant =
    status === "COMPLETED"
      ? "success"
      : status === "FAILED"
        ? "destructive"
        : "secondary";
  return (
    <Badge variant={variant}>
      {status.toLowerCase()}
    </Badge>
  );
}

export default TransactionsPage;

