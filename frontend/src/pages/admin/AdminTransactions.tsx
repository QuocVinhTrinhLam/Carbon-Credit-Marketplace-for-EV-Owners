import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Transaction {
  id: number;
  buyerId: number;
  sellerId: number;
  listingId: number;
  amount: number;
  status: string;
  createdAt: string;
}

interface WalletTransaction {
  id: number;
  wallet: {
    user: {
      id: number;
      email: string;
      fullName: string;
    };
  };
  type: string;
  amount: number;
  status: string;
  paymentMethod?: string;
  description?: string;
  createdAt: string;
}

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>([]);
  const [activeTab, setActiveTab] = useState<"marketplace" | "wallet">("marketplace");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTransactions();
    fetchWalletTransactions();
    
    // Auto refresh mỗi 5 giây để cập nhật transactions mới
    const interval = setInterval(() => {
      fetchTransactions();
      fetchWalletTransactions();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchTransactions = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("/api/admin/transactions", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setTransactions(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWalletTransactions = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("/api/admin/wallets/transactions?limit=200", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setWalletTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error("Failed to fetch wallet transactions:", error);
    }
  };

  const handleConfirm = async (txId: number) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`/api/admin/transactions/${txId}/confirm`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        alert("Transaction confirmed!");
        fetchTransactions();
      }
    } catch (error) {
      console.error("Failed to confirm transaction:", error);
    }
  };

  const handleComplete = async (txId: number) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`/api/admin/transactions/${txId}/complete`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        alert("Transaction completed!");
        fetchTransactions();
      }
    } catch (error) {
      console.error("Failed to complete transaction:", error);
    }
  };

  const handleCancel = async (txId: number) => {
    if (!confirm("Cancel this transaction?")) return;

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`/api/admin/transactions/${txId}/cancel`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        alert("Transaction cancelled!");
        fetchTransactions();
      }
    } catch (error) {
      console.error("Failed to cancel transaction:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800",
      CONFIRMED: "bg-blue-100 text-blue-800",
      COMPLETED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[status] || "bg-gray-100"}`}>
        {status}
      </span>
    );
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <h1 className="text-2xl font-bold">💰 Transaction Management</h1>
              <button
                onClick={() => navigate("/admin/dashboard")}
                className="text-sm bg-white/20 px-4 py-2 rounded hover:bg-white/30"
              >
                ← Dashboard
              </button>
            </div>
            <button
              onClick={() => navigate("/login")}
              className="bg-white text-red-600 px-4 py-2 rounded-lg font-semibold"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex space-x-4 border-b">
            <button
              onClick={() => setActiveTab("marketplace")}
              className={`px-4 py-2 font-semibold ${
                activeTab === "marketplace"
                  ? "border-b-2 border-red-600 text-red-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Marketplace Transactions ({transactions.length})
            </button>
            <button
              onClick={() => setActiveTab("wallet")}
              className={`px-4 py-2 font-semibold ${
                activeTab === "wallet"
                  ? "border-b-2 border-red-600 text-red-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Wallet Top-ups ({walletTransactions.length})
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6">
            {activeTab === "marketplace" 
              ? `Marketplace Transactions (${transactions.length})`
              : `Wallet Top-ups (${walletTransactions.length})`
            }
          </h2>

          {activeTab === "marketplace" ? (
            <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Buyer ID</th>
                  <th className="px-4 py-3 text-left">Seller ID</th>
                  <th className="px-4 py-3 text-left">Amount</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{tx.id}</td>
                    <td className="px-4 py-3">{tx.buyerId || "N/A"}</td>
                    <td className="px-4 py-3">{tx.sellerId || "N/A"}</td>
                    <td className="px-4 py-3 font-semibold">{tx.amount.toLocaleString()} VND</td>
                    <td className="px-4 py-3">{getStatusBadge(tx.status)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(tx.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        {tx.status === "PENDING" && (
                          <button
                            onClick={() => handleConfirm(tx.id)}
                            className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600"
                          >
                            Confirm
                          </button>
                        )}
                        {tx.status === "CONFIRMED" && (
                          <button
                            onClick={() => handleComplete(tx.id)}
                            className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600"
                          >
                            Complete
                          </button>
                        )}
                        <button
                          onClick={() => handleCancel(tx.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left">ID</th>
                    <th className="px-4 py-3 text-left">User</th>
                    <th className="px-4 py-3 text-left">Email</th>
                    <th className="px-4 py-3 text-left">Type</th>
                    <th className="px-4 py-3 text-left">Amount</th>
                    <th className="px-4 py-3 text-left">Payment Method</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {walletTransactions.map((wt) => (
                    <tr key={wt.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">{wt.id}</td>
                      <td className="px-4 py-3 font-medium">
                        {wt.wallet?.user?.fullName || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm">{wt.wallet?.user?.email || "N/A"}</td>
                      <td className="px-4 py-3">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          {wt.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-green-600">
                        +{wt.amount.toLocaleString('vi-VN')} VND
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {wt.paymentMethod || "N/A"}
                      </td>
                      <td className="px-4 py-3">
                        {wt.status === "SUCCESS" ? (
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                            SUCCESS
                          </span>
                        ) : wt.status === "PENDING" ? (
                          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold">
                            PENDING
                          </span>
                        ) : (
                          <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-semibold">
                            FAILED
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(wt.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                        {wt.description || "—"}
                      </td>
                    </tr>
                  ))}
                  {walletTransactions.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                        No wallet transactions found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

