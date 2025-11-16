import { FileText, ShieldAlert, ShieldCheck } from "lucide-react";
import { useMemo } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { useAuth } from "../hooks/useAuth";
import { useFetch } from "../hooks/useFetch";
import { creditService } from "../services/credit";

const CreditsPage = () => {
  const { user } = useAuth();
  const portfolioQuery = useFetch(
    ["portfolio", user?.id],
    () => creditService.getPortfolio(user!.id),
    { enabled: Boolean(user?.id) }
  );
  const certificatesQuery = useFetch(["certificates"], () =>
    creditService.getCertificates()
  );

  const summary = useMemo(() => {
    if (!portfolioQuery.data) {
      return { totalCredits: 0, valid: 0, expiringSoon: 0 };
    }
    const totalCredits = portfolioQuery.data.reduce(
      (acc, item) => acc + item.quantity,
      0
    );
    const valid = portfolioQuery.data.filter(
      (item) => item.status === "VALID"
    ).length;
    const expiringSoon = portfolioQuery.data.filter((item) => {
      const expires = new Date(item.expiresAt);
      const difference =
        expires.getTime() - Date.now();
      return difference < 1000 * 60 * 60 * 24 * 90; // 90 days
    }).length;
    return { totalCredits, valid, expiringSoon };
  }, [portfolioQuery.data]);

  return (
    <div className="space-y-6">
      <header className="rounded-xl border bg-white px-6 py-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Carbon credits</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage retirement-ready carbon assets and explore new opportunities to diversify your sustainability portfolio.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          title="Total credits owned"
          value={summary.totalCredits.toLocaleString()}
          subLabel="Across all certificates"
          icon={<ShieldCheck className="h-6 w-6 text-emerald-600" />}
          isLoading={portfolioQuery.isLoading}
        />
        <SummaryCard
          title="Valid certificates"
          value={summary.valid.toString()}
          subLabel="Verified & active"
          icon={<FileText className="h-6 w-6 text-emerald-600" />}
          isLoading={portfolioQuery.isLoading}
        />
        <SummaryCard
          title="Expiring soon"
          value={summary.expiringSoon.toString()}
          subLabel="Within 90 days"
          icon={<ShieldAlert className="h-6 w-6 text-orange-500" />}
          isLoading={portfolioQuery.isLoading}
        />
      </section>

      <Tabs defaultValue="portfolio">
        <TabsList>
          <TabsTrigger value="portfolio">My portfolio</TabsTrigger>
          <TabsTrigger value="market">Marketplace supply</TabsTrigger>
        </TabsList>

        <TabsContent value="portfolio">
          <Card>
            <CardHeader>
              <CardTitle>Owned certificates</CardTitle>
              <CardDescription>
                Detailed view of certificates currently under your account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {portfolioQuery.isLoading ? (
                <LoadingTable />
              ) : portfolioQuery.data && portfolioQuery.data.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Certification</TableHead>
                      <TableHead>Issued</TableHead>
                      <TableHead>Expires</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {portfolioQuery.data.map((certificate) => (
                      <TableRow key={certificate.id}>
                        <TableCell className="font-medium">
                          {certificate.projectName}
                        </TableCell>
                        <TableCell>
                          <StatusPill status={certificate.status} />
                        </TableCell>
                        <TableCell>{certificate.quantity.toLocaleString()}</TableCell>
                        <TableCell>{certificate.certification}</TableCell>
                        <TableCell>
                          {new Date(certificate.issuedDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {new Date(certificate.expiresAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <EmptyState message="You don’t own any certificates yet. Browse available credits in the marketplace to get started." />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="market">
          <Card>
            <CardHeader>
              <CardTitle>Verified supply</CardTitle>
              <CardDescription>
                Browse curated certificates issued by partners and project developers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {certificatesQuery.isLoading ? (
                <LoadingTable />
              ) : certificatesQuery.data && certificatesQuery.data.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Issued</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {certificatesQuery.data.map((certificate) => (
                      <TableRow key={certificate.id}>
                        <TableCell className="font-medium">
                          {certificate.projectName}
                        </TableCell>
                        <TableCell>{certificate.quantity.toLocaleString()}</TableCell>
                        <TableCell>
                          <StatusPill status={certificate.status} />
                        </TableCell>
                        <TableCell>
                          {new Date(certificate.issuedDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {new Date(certificate.expiresAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm">
                            Request details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <EmptyState message="No certificates available at the moment. Check back soon for new listings." />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

function SummaryCard({
  title,
  value,
  subLabel,
  icon,
  isLoading
}: {
  title: string;
  value: string;
  subLabel: string;
  icon: React.ReactNode;
  isLoading: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-semibold text-muted-foreground">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-7 w-24" />
        ) : (
          <div className="text-2xl font-semibold text-slate-900">{value}</div>
        )}
        <p className="text-xs text-muted-foreground">{subLabel}</p>
      </CardContent>
    </Card>
  );
}

function StatusPill({ status }: { status: "VALID" | "EXPIRED" | "PENDING" }) {
  const variant =
    status === "VALID" ? "success" : status === "EXPIRED" ? "destructive" : "secondary";
  return (
    <span
      className={
        variant === "success"
          ? "rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700"
          : variant === "destructive"
            ? "rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-600"
            : "rounded-full bg-slate-200 px-2 py-1 text-xs font-medium text-slate-700"
      }
    >
      {status.toLowerCase()}
    </span>
  );
}

function LoadingTable() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 py-12 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

export default CreditsPage;

