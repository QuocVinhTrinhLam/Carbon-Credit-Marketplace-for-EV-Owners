import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { ArrowUp, ArrowDown } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Skeleton } from "../components/ui/skeleton";
import { useFetch } from "../hooks/useFetch";
import { listingService } from "../services/listing";

function parseListingDescription(summary: string | undefined) {
  const result: {
    categories?: string[];
    buyerTypes?: string[];
    benefits?: string;
    province?: string;
    raw?: string;
  } = {};
  if (!summary) return { raw: "" };
  // expected format: "Categories: X; Buyer types: Y; Benefits: Z; Province: P"
  summary.split(";").forEach((part) => {
    const [k, ...rest] = part.split(":");
    if (!k) return;
    const key = k.trim().toLowerCase();
    const val = rest.join(":").trim();
    if (!val) return;
    if (key.startsWith("categories")) result.categories = val.split(",").map(s => s.trim());
    else if (key.startsWith("buyer")) result.buyerTypes = val.split(",").map(s => s.trim());
    else if (key.startsWith("benefits")) result.benefits = val;
    else if (key.startsWith("province")) result.province = val;
  });
  result.raw = summary;
  return result;
}

const MarketplacePage = () => {
  const listingsQuery = useFetch(["listings"], () => listingService.getListings());
  const [search, setSearch] = useState("");
  // New filters: price (above/below 200k), province, label/group
  const [priceFilter, setPriceFilter] = useState<string>("ALL");
  const [provinceFilter, setProvinceFilter] = useState<string>("ALL");
  const [benefitsFilter, setBenefitsFilter] = useState<string>("ALL");
  const [benefitsSelected, setBenefitsSelected] = useState<Record<string, boolean>>({
    "emission reduction": false,
    "community support": false,
    biodiversity: false,
    "renewable energy": false
  });

  const filteredListings = useMemo(() => {
    if (!listingsQuery.data) return [];
    return listingsQuery.data.filter((listing) => {
      const q = search.toLowerCase();
      const matchesSearch =
        listing.name.toLowerCase().includes(q) ||
        listing.location.toLowerCase().includes(q);

      // price filter: above/below 200,000 VND per credit
      const priceThreshold = 200000;
      const matchesPrice =
        priceFilter === "ALL" ||
        (priceFilter === "ABOVE" && Number(listing.pricePerCredit) > priceThreshold) ||
        (priceFilter === "BELOW" && Number(listing.pricePerCredit) <= priceThreshold);

      // province filter: check parsed province first, fallback to listing.location
      const parsed = parseListingDescription(listing.summary);
      const listingProvince = (parsed.province || listing.location || "").toLowerCase();
      const matchesProvince = provinceFilter === "ALL" || listingProvince === provinceFilter.toLowerCase();

      // benefits filter: check parsed benefits text or listing summary against selected checkboxes
      const benefitsText = (parsed.benefits || listing.summary || "").toLowerCase();
      const selected = Object.entries(benefitsSelected).filter(([, v]) => v).map(([k]) => k.toLowerCase());
      let matchesBenefits = true;
      if (selected.length > 0) {
        matchesBenefits = selected.some(s => benefitsText.includes(s));
      } else if (benefitsFilter && benefitsFilter !== "ALL") {
        // backward-compat: single select value
        matchesBenefits = benefitsText.includes(benefitsFilter.toLowerCase());
      }

      return matchesSearch && matchesPrice && matchesProvince && matchesBenefits;
    });
  }, [listingsQuery.data, search, priceFilter, provinceFilter, benefitsFilter]);

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
          <Select value={priceFilter} onValueChange={setPriceFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Price" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All prices</SelectItem>
              <SelectItem value="ABOVE">
                <div className="flex items-center gap-2">
                  <ArrowUp className="h-5 w-5 text-emerald-600" />
                  <span className="font-medium">Above 200,000</span>
                </div>
              </SelectItem>
              <SelectItem value="BELOW">
                <div className="flex items-center gap-2">
                  <ArrowDown className="h-5 w-5 text-rose-600" />
                  <span className="font-medium">200,000 or below</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <Select value={provinceFilter} onValueChange={setProvinceFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Province / Area" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All provinces</SelectItem>
              {[
                "Hanoi","Ho Chi Minh City","Da Nang","Hai Phong","Can Tho","Binh Duong","Dong Nai","Hue","Nha Trang","Quang Ninh","Bac Ninh","Thanh Hoa","Nghe An","Binh Thuan","Vinh Phuc","Long An","Hai Duong","Tra Vinh"
              ].map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex flex-col gap-2">
            <span className="text-sm text-muted-foreground">Benefits</span>
            <div className="flex flex-wrap gap-3">
              {[
                "emission reduction",
                "community support",
                "biodiversity",
                "renewable energy"
              ].map((b) => (
                <label key={b} className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!benefitsSelected[b]}
                    onChange={(e) => setBenefitsSelected(prev => ({ ...prev, [b]: e.target.checked }))}
                  />
                  <span className="text-sm">{b.charAt(0).toUpperCase() + b.slice(1)}</span>
                </label>
              ))}
            </div>
          </div>
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
                    {(() => {
                      const parsed = parseListingDescription(listing.summary);
                      if ((parsed.categories && parsed.categories.length) || (parsed.buyerTypes && parsed.buyerTypes.length)) {
                        return (
                          <div className="space-y-1 text-sm text-muted-foreground">
                            {parsed.categories && parsed.categories.length > 0 && (
                              <p>Categories: {parsed.categories.join(", ")}</p>
                            )}
                            {parsed.buyerTypes && parsed.buyerTypes.length > 0 && (
                              <p>Buyer types: {parsed.buyerTypes.join(", ")}</p>
                            )}
                            {parsed.province && <p>Province: {parsed.province}</p>}
                            {parsed.benefits && <p>Benefits: {parsed.benefits}</p>}
                          </div>
                        );
                      }
                      return <p className="text-sm text-muted-foreground">{listing.summary}</p>;
                    })()}
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
                    <Link to={`/marketplace/${listing.id}`}>View details</Link>
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

export default MarketplacePage;

