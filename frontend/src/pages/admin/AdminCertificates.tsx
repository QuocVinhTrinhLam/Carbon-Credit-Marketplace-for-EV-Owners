import React, { useState } from "react";
import { CheckCircle, XCircle, Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { useFetch } from "../../hooks/useFetch";
import { creditService } from "../../services/credit";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../components/ui/alert-dialog";

const AdminCertificatesPage = () => {
  const navigate = useNavigate();
  const [approving, setApproving] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [selectedCert, setSelectedCert] = useState<any | null>(null);
  const [action, setAction] = useState<"approve" | "reject" | null>(null);

  const { data: pendingCerts, isLoading, refetch } = useFetch(
    ["pending-certificates"],
    () => creditService.getPendingCertificates(),
    { enabled: true }
  );

  const handleApprove = async (certificateId: string | number) => {
    setApproving(String(certificateId));
    try {
      await creditService.approveCertificate(certificateId);
      refetch();
      setSelectedCert(null);
      setAction(null);
    } catch (error) {
      console.error("Failed to approve certificate:", error);
    } finally {
      setApproving(null);
    }
  };

  const handleReject = async (certificateId: string | number) => {
    setRejecting(String(certificateId));
    try {
      await creditService.rejectCertificate(certificateId);
      refetch();
      setSelectedCert(null);
      setAction(null);
    } catch (error) {
      console.error("Failed to reject certificate:", error);
    } finally {
      setRejecting(null);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <h1 className="text-2xl font-bold">🎯 Certificate Requests</h1>
              <button
                onClick={() => navigate("/admin/dashboard")}
                className="text-sm bg-white/20 px-4 py-2 rounded hover:bg-white/30 transition"
              >
                ← Dashboard
              </button>
            </div>
            <button
              onClick={handleLogout}
              className="bg-white text-emerald-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="space-y-6">

      <Card>
        <CardHeader>
          <CardTitle>Pending Requests</CardTitle>
          <CardDescription>
            {pendingCerts?.length || 0} pending certificate request(s) awaiting CVA approval
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <div className="h-10 bg-slate-100 rounded animate-pulse"></div>
              <div className="h-10 bg-slate-100 rounded animate-pulse"></div>
              <div className="h-10 bg-slate-100 rounded animate-pulse"></div>
            </div>
          ) : pendingCerts && pendingCerts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User ID</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Certification Body</TableHead>
                  <TableHead>Serial Number</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingCerts.map((cert) => (
                  <TableRow key={cert.id}>
                    <TableCell className="font-medium">{cert.ownerId}</TableCell>
                    <TableCell>{cert.quantity || cert.amount}</TableCell>
                    <TableCell>{cert.projectName || "-"}</TableCell>
                    <TableCell>{cert.certificationBody || "-"}</TableCell>
                    <TableCell>{cert.serialNumber || "-"}</TableCell>
                    <TableCell className="max-w-xs truncate">{cert.notes || "-"}</TableCell>
                    <TableCell>{new Date(cert.issuedDate).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => {
                          setSelectedCert(cert);
                          setAction("approve");
                        }}
                        disabled={approving === cert.id}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        {approving === cert.id ? (
                          <>
                            <Loader className="h-4 w-4 mr-1 animate-spin" />
                            Approving...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setSelectedCert(cert);
                          setAction("reject");
                        }}
                        disabled={rejecting === cert.id}
                      >
                        {rejecting === cert.id ? (
                          <>
                            <Loader className="h-4 w-4 mr-1 animate-spin" />
                            Rejecting...
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 py-12 text-center text-sm text-muted-foreground">
              No pending certificate requests at the moment.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!selectedCert && !!action} onOpenChange={() => setSelectedCert(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {action === "approve" ? "Approve Certificate?" : "Reject Certificate?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {action === "approve"
                ? `This will change the certificate status from PENDING to VALID and notify the user.`
                : `This will permanently delete the certificate request and notify the user of rejection.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {selectedCert && (
            <div className="space-y-2 text-sm">
              <p><strong>User ID:</strong> {selectedCert.ownerId}</p>
              <p><strong>Amount:</strong> {selectedCert.quantity || selectedCert.amount} credits</p>
              <p><strong>Project:</strong> {selectedCert.projectName || "-"}</p>
              <p><strong>Certification Body:</strong> {selectedCert.certificationBody || "-"}</p>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (action === "approve") {
                  handleApprove(selectedCert.id);
                } else {
                  handleReject(selectedCert.id);
                }
              }}
              className={action === "approve" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
            >
              {action === "approve" ? "Approve" : "Reject"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
        </div>
      </div>
    </div>
  );
};

export default AdminCertificatesPage;