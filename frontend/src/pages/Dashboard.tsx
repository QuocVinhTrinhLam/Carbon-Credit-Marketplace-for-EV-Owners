import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { StatCard } from "../components/common/StatCard";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "../components/ui/dialog";
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
  const [showCreate, setShowCreate] = useState(false);
  const [showCertDialog, setShowCertDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [certAmount, setCertAmount] = useState<number | "">("");
  const [requestingCert, setRequestingCert] = useState(false);
  const [certMessage, setCertMessage] = useState<string | null>(null);
  const [certProjectName, setCertProjectName] = useState<string>("");
  const [certRef, setCertRef] = useState<string>("");
  const [certBody, setCertBody] = useState<string>("");
  const [certSerial, setCertSerial] = useState<string>("");
  const [certNotes, setCertNotes] = useState<string>("");
  

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
  const myListingsQuery = useFetch(
    ["my-listings", user?.id],
    () => listingService.getListingsBySeller(Number(user?.id)),
    { enabled: Boolean(user?.id) }
  );

  const totalCreditsOwned = useMemo(() => {
    if (!portfolioQuery.data) return 0;
    // Sum all VALID certificates (both ISSUED from transactions and REQUESTED from CVA)
    return portfolioQuery.data
      .filter((c: any) => c.status === "VALID")
      .reduce((sum: number, c: any) => sum + (Number(c.quantity || 0)), 0);
  }, [portfolioQuery.data]);

  // Listing creation form state
  const [title, setTitle] = useState("");
  const [carbonAmount, setCarbonAmount] = useState<number | "">("");
  // price per credit (VND) - default value; total price auto-updates by quantity
  const [pricePerCredit, setPricePerCredit] = useState<number>(140000);
  const [isVoluntary, setIsVoluntary] = useState(false);
  const [isCompliance, setIsCompliance] = useState(false);
  const [isIndividual, setIsIndividual] = useState(false);
  const [isEnterprise, setIsEnterprise] = useState(false);
  const [benefitsInput, setBenefitsInput] = useState("");
  const [benefitsFlags, setBenefitsFlags] = useState({
    "emission reduction": false,
    "community support": false,
    biodiversity: false,
    "renewable energy": false
  });
  const [province, setProvince] = useState("");
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setCreating(true);
      try {
      // Clamp price per credit to allowed range
      const minPrice = 140000;
      const maxPrice = 270000;
      const pricePer = Math.max(minPrice, Math.min(maxPrice, Number(pricePerCredit || 0)));
      const total = Number(carbonAmount || 0) * pricePer;
      // Compose a short description from selected options (backend expects a description field)
      const categoryParts: string[] = [];
      if (isVoluntary) categoryParts.push("Voluntary");
      if (isCompliance) categoryParts.push("Compliance");
      const buyerParts: string[] = [];
      if (isIndividual) buyerParts.push("Individual");
      if (isEnterprise) buyerParts.push("Enterprise");
      const selectedBenefits = Object.entries(benefitsFlags)
        .filter(([, v]) => v)
        .map(([k]) => k);
      const composedDescription = `Categories: ${categoryParts.join(", ") || "-"}; Buyer types: ${buyerParts.join(", ") || "-"}; Benefits: ${selectedBenefits.join(", ") || "-"}; Province: ${province || "-"}`;

      const payload = {
        title,
        description: composedDescription,
        carbonAmount: Number(carbonAmount),
        // send price per credit (backend maps this to pricePerCredit)
        price: Number(pricePer),
        sellerId: Number(user?.id)
      };
      await listingService.createListing(payload as any);
      // refresh user's listing requests
      if (myListingsQuery && myListingsQuery.refetch) await myListingsQuery.refetch();
      setCreateSuccess("Listing request submitted — pending CVA review");
      setShowCreate(false);
      // Reset form
      setTitle("");
      setIsVoluntary(false);
      setIsCompliance(false);
      setIsIndividual(false);
      setIsEnterprise(false);
      setBenefitsInput("");
      setBenefitsFlags({ "emission reduction": false, "community support": false, biodiversity: false, "renewable energy": false });
      setProvince("");
      setCarbonAmount("");
      setPricePerCredit(140000);
    } catch (err) {
      setCreateError("Failed to submit listing request. Please try again.");
    } finally {
      setCreating(false);
    }
  };

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
            <Link to="/marketplace">Browse marketplace</Link>
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
          portfolioCount={portfolioQuery.data ? portfolioQuery.data.filter((c: any) => c.status === "VALID").length : 0}
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
            <Dialog open={showCreate} onOpenChange={setShowCreate}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create new listing</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateListing} className="space-y-3 mt-4">
                  <div>
                    <label className="block text-sm font-medium">Listing title</label>
                    <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full rounded-md border px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Categories</label>
                    <div className="mt-2 flex flex-wrap gap-3">
                      <label className="inline-flex items-center gap-2">
                        <input type="checkbox" checked={isVoluntary} onChange={(e) => setIsVoluntary(e.target.checked)} />
                        <span className="text-sm">Voluntary</span>
                      </label>
                      <label className="inline-flex items-center gap-2">
                        <input type="checkbox" checked={isCompliance} onChange={(e) => setIsCompliance(e.target.checked)} />
                        <span className="text-sm">Compliance</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Buyer types</label>
                    <div className="mt-2 flex flex-wrap gap-3">
                      <label className="inline-flex items-center gap-2">
                        <input type="checkbox" checked={isIndividual} onChange={(e) => setIsIndividual(e.target.checked)} />
                        <span className="text-sm">Individual</span>
                      </label>
                      <label className="inline-flex items-center gap-2">
                        <input type="checkbox" checked={isEnterprise} onChange={(e) => setIsEnterprise(e.target.checked)} />
                        <span className="text-sm">Enterprise</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Benefits</label>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {[
                        "emission reduction",
                        "community support",
                        "biodiversity",
                        "renewable energy"
                      ].map((b) => (
                        <label key={b} className="inline-flex items-center gap-2">
                          <input type="checkbox" checked={(benefitsFlags as any)[b]} onChange={(e) => setBenefitsFlags(prev => ({ ...prev, [b]: e.target.checked }))} />
                          <span className="text-sm">{b.charAt(0).toUpperCase() + b.slice(1)}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Province / Area</label>
                    <select value={province} onChange={(e) => setProvince(e.target.value)} className="mt-1 block w-full rounded-md border px-3 py-2">
                      <option value="">Select province</option>
                      {[
                        "Hanoi","Ho Chi Minh City","Da Nang","Hai Phong","Can Tho","Binh Duong","Dong Nai","Hue","Nha Trang","Quang Ninh","Bac Ninh","Thanh Hoa","Nghe An","Binh Thuan","Vinh Phuc","Long An","Hai Duong","Tra Vinh"
                      ].map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Quantity (tCO₂e)</label>
                    <input type="number" value={carbonAmount as any} onChange={(e) => setCarbonAmount(e.target.value === "" ? "" : Number(e.target.value))} className="mt-1 block w-full rounded-md border px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Price per tCO₂e (VND)</label>
                    <input type="number" min={140000} max={270000} value={pricePerCredit} onChange={(e) => setPricePerCredit(Number(e.target.value || 140000))} className="mt-1 block w-full rounded-md border px-3 py-2" />
                    <p className="text-xs text-muted-foreground mt-1">Allowed range: 140,000 — 270,000 VND per tCO₂e</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Total price (VND)</label>
                    <input type="text" value={(Number(carbonAmount || 0) * Number(pricePerCredit || 0)).toLocaleString('vi-VN')} readOnly className="mt-1 block w-full rounded-md border px-3 py-2 bg-slate-50" />
                  </div>
                  {createError && <p className="text-sm text-red-600">{createError}</p>}
                              <DialogFooter>
                                <div className="flex gap-2">
                                  <Button type="submit" disabled={creating}>{creating ? "Submitting..." : "Submit listing request"}</Button>
                                  <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
                                </div>
                              </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={() => setShowCreate(true)}>
              Create new listing
            </Button>
            <Dialog open={showCertDialog} onOpenChange={setShowCertDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Request Certificate Issuance</DialogTitle>
                </DialogHeader>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  if (!user?.id) return;
                  setRequestingCert(true);
                  setCertMessage(null);
                  try {
                    await creditService.requestCertificate({
                      ownerId: user.id,
                      amount: Number(certAmount || 0),
                      projectName: certProjectName || undefined,
                      certificationRef: certRef || undefined,
                      certificationBody: certBody || undefined,
                      serialNumber: certSerial || undefined,
                      notes: certNotes || undefined
                    });
                    setCertMessage("Certificate request submitted successfully");
                    if (portfolioQuery && portfolioQuery.refetch) await portfolioQuery.refetch();
                    setShowCertDialog(false);
                    setCertAmount("");
                    setCertProjectName(""); setCertRef(""); setCertBody(""); setCertSerial(""); setCertNotes("");
                  } catch (err) {
                    setCertMessage("Failed to submit certificate request");
                  } finally {
                    setRequestingCert(false);
                  }
                }} className="space-y-3 mt-4">
                  <div>
                    <label className="block text-sm font-medium">Amount (tCO₂e)</label>
                    <input type="number" min={0} step="0.01" value={certAmount as any} onChange={(e) => setCertAmount(e.target.value === "" ? "" : Number(e.target.value))} className="mt-1 block w-full rounded-md border px-3 py-2" />
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Total credits owned: {totalCreditsOwned ? Number(totalCreditsOwned).toLocaleString('vi-VN') : '—'} tCO₂e</span>
                      <div className="flex items-center gap-2">
                        <button type="button" className="text-sm underline text-emerald-600" onClick={() => {
                          if (totalCreditsOwned) setCertAmount(Number(totalCreditsOwned) || 0);
                        }}>Use total owned</button>
                        <button type="button" className="text-sm underline text-slate-600" onClick={() => {
                          setCertAmount(1);
                        }}>Use 1</button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium">Project name</label>
                    <input value={certProjectName} onChange={(e) => setCertProjectName(e.target.value)} className="mt-1 block w-full rounded-md border px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Certification reference</label>
                    <input value={certRef} onChange={(e) => setCertRef(e.target.value)} className="mt-1 block w-full rounded-md border px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Issuing body</label>
                    <input value={certBody} onChange={(e) => setCertBody(e.target.value)} className="mt-1 block w-full rounded-md border px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Serial number</label>
                    <input value={certSerial} onChange={(e) => setCertSerial(e.target.value)} className="mt-1 block w-full rounded-md border px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Notes</label>
                    <textarea value={certNotes} onChange={(e) => setCertNotes(e.target.value)} className="mt-1 block w-full rounded-md border px-3 py-2" />
                  </div>
                  {certMessage && <p className="text-sm text-green-600">{certMessage}</p>}
                  <DialogFooter>
                    <div className="flex gap-2">
                      <Button type="submit" disabled={requestingCert}>{requestingCert ? "Requesting..." : "Request Certificate"}</Button>
                      <Button variant="ghost" onClick={() => setShowCertDialog(false)}>Cancel</Button>
                    </div>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={() => setShowCertDialog(true)}>
              Request Certificate
            </Button>
          </CardContent>
        </Card>
      </section>


      {createSuccess && (
        <div className="mb-4 rounded-md bg-green-50 p-4 text-green-800">
          {createSuccess}
        </div>
      )}

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>My listing requests</CardTitle>
        </CardHeader>
        <CardContent>
          {myListingsQuery.isLoading ? (
            <Skeleton className="h-20 w-full" />
          ) : myListingsQuery.data && myListingsQuery.data.length > 0 ? (
            myListingsQuery.data.map((l) => (
                <div key={l.id} className="flex items-center justify-between border-b py-2">
                <div>
                  <p className="font-medium">{l.name}</p>
                  <p className="text-xs text-muted-foreground">{l.summary}</p>
                </div>
                <div className="text-sm">
                  <span className="mr-3">{Number(l.totalCredits).toLocaleString('vi-VN')} tCO₂e</span>
                  <span className="font-medium">{Number(l.pricePerCredit).toLocaleString('vi-VN')} VND/tCO₂e</span>
                  <div className="text-xs text-muted-foreground">Status: {l.status}</div>
                </div>
              </div>
            ))
          ) : (
            <EmptyState message="You don't have any listing requests yet." />
          )}
        </CardContent>
      </Card>

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
                      {Number(listing.pricePerCredit).toLocaleString('vi-VN')} VND/tCO₂e
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

