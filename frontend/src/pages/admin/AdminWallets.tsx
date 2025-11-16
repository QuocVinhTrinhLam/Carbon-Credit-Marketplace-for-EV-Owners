import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface WalletInfo {
  userId: number;
  userEmail: string;
  userFullName: string;
  moneyBalance: number;
  carbonBalance?: number;
}

export default function AdminWallets() {
  const [wallets, setWallets] = useState<WalletInfo[]>([]);
  const [stats, setStats] = useState({
    totalMoney: 0,
    totalCarbon: 0,
    walletsCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("/api/admin/wallets", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setWallets(data.wallets || []);
        setStats({
          totalMoney: data.totalMoneyInSystem || 0,
          totalCarbon: data.totalCarbonCredits || 0,
          walletsCount: data.moneyWalletsCount || 0,
        });
      }
    } catch (error) {
      console.error("Failed to fetch wallets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustBalance = async (userId: number, type: "money" | "carbon") => {
    const amount = prompt(`Enter amount to adjust (can be negative):`);
    if (!amount) return;

    const reason = prompt("Reason for adjustment:") || "Admin adjustment";
    const token = localStorage.getItem("token");

    try {
      const endpoint =
        type === "money"
          ? `/api/admin/wallets/user/${userId}/adjust`
          : `/api/admin/wallets/user/${userId}/adjust-carbon`;

      const response = await fetch(`${endpoint}?amount=${amount}&reason=${encodeURIComponent(reason)}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        alert("Balance adjusted successfully!");
        fetchWallets();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || "Failed to adjust balance"}`);
      }
    } catch (error) {
      console.error("Failed to adjust balance:", error);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <h1 className="text-2xl font-bold">💳 Wallet Management</h1>
              <button
                onClick={() => navigate("/admin/dashboard")}
                className="text-sm bg-white/20 px-4 py-2 rounded hover:bg-white/30"
              >
                ← Dashboard
              </button>
            </div>
            <button
              onClick={() => {
                localStorage.clear();
                navigate("/login");
              }}
              className="bg-white text-red-600 px-4 py-2 rounded-lg font-semibold"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg">
            <p className="text-sm opacity-90">Total Money in System</p>
            <p className="text-3xl font-bold mt-2">{stats.totalMoney.toLocaleString()} VND</p>
          </div>
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg">
            <p className="text-sm opacity-90">Total Carbon Credits</p>
            <p className="text-3xl font-bold mt-2">{stats.totalCarbon.toLocaleString()} kg</p>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
            <p className="text-sm opacity-90">Total Wallets</p>
            <p className="text-3xl font-bold mt-2">{stats.walletsCount}</p>
          </div>
        </div>

        {/* Wallets Table */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6">All Wallets</h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left">User ID</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Full Name</th>
                  <th className="px-4 py-3 text-left">Money Balance</th>
                  <th className="px-4 py-3 text-left">Carbon Balance</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {wallets.map((wallet) => (
                  <tr key={wallet.userId} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{wallet.userId}</td>
                    <td className="px-4 py-3">{wallet.userEmail}</td>
                    <td className="px-4 py-3 font-medium">{wallet.userFullName}</td>
                    <td className="px-4 py-3 font-semibold text-green-600">
                      {wallet.moneyBalance.toLocaleString()} VND
                    </td>
                    <td className="px-4 py-3 font-semibold text-blue-600">
                      {wallet.carbonBalance?.toLocaleString() || 0} kg
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAdjustBalance(wallet.userId, "money")}
                          className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600"
                        >
                          Adjust Money
                        </button>
                        <button
                          onClick={() => handleAdjustBalance(wallet.userId, "carbon")}
                          className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600"
                        >
                          Adjust Carbon
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

