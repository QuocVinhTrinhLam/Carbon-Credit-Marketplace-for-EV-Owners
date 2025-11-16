import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Skeleton } from "../components/ui/skeleton";
import { useFetch } from "../hooks/useFetch";
import { listingService } from "../services/listing";

const ListingsPage = () => {
  const listingsQuery = useFetch(["listings"], () => listingService.getListings());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");

  const filteredListings = useMemo(() => {
    if (!listingsQuery.data) return [];
    return listingsQuery.data.filter((listing) => {
      const matchesSearch =
        listing.name.toLowerCase().includes(search.toLowerCase()) ||
        listing.location.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "ALL" || listing.status === statusFilter;
      const matchesCategory =
        categoryFilter === "ALL" || listing.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [listingsQuery.data, search, statusFilter, categoryFilter]);

  return (
    <div className="space-y-6">
      <header className="rounded-xl border bg-white px-6 py-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Marketplace listings
            </h1>
            <p className="text-sm text-muted-foreground">
              Explore verified carbon credit projects ready for investment or offsetting.
            </p>
          </div>
          <Button asChild>
            <Link to="/transactions">View purchase history</Link>
          </Button>
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-4">
          <Input
            placeholder="Search by project or location"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="md:col-span-2"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="SOLD_OUT">Sold out</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All categories</SelectItem>
              <SelectItem value="Forestry">Forestry</SelectItem>
              <SelectItem value="Renewable">Renewable</SelectItem>
              <SelectItem value="Community">Community</SelectItem>
              <SelectItem value="Industrial">Industrial</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      <ScrollArea className="h-[calc(100vh-300px)] rounded-xl border bg-white">
        <div className="grid gap-4 p-6 lg:grid-cols-2 xl:grid-cols-3">
          {listingsQuery.isLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-48 w-full rounded-xl" />
            ))
          ) : filteredListings.length > 0 ? (
            filteredListings.map((listing) => (
              <Card
                key={listing.id}
                className="flex h-full flex-col border border-slate-200 shadow-sm transition hover:shadow-lg"
              >
                <CardHeader className="space-y-3 pb-3">
                  <div className="flex items-center justify-between">
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
                  <CardTitle className="text-lg">{listing.name}</CardTitle>
                  <CardDescription className="text-xs uppercase tracking-wide text-muted-foreground">
                    {listing.location} · {listing.vintageYear}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {listing.summary}
                    </p>
                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs uppercase text-muted-foreground">Credits available</p>
                        <p className="font-semibold text-slate-900">
                          {listing.availableCredits.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase text-muted-foreground">Price per credit</p>
                        <p className="font-semibold text-slate-900">
                          {listing.pricePerCredit.toLocaleString('vi-VN')} VND
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase text-muted-foreground">Certification</p>
                        <p className="font-semibold text-slate-900">
                          {listing.certification}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase text-muted-foreground">Total supply</p>
                        <p className="font-semibold text-slate-900">
                          {listing.totalCredits.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" asChild>
                    <Link to={`/listings/${listing.id}`}>View details</Link>
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full rounded-lg border border-dashed border-slate-200 bg-slate-50 py-16 text-center text-sm text-muted-foreground">
              No listings match your filters. Adjust filters or check back later.
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ListingsPage;

