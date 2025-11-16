import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface ReportData {
  period: { start: string; end: string };
  newUsers: number;
  transactionCount: number;
  totalVolume: number;
  topSellers: any[];
  topBuyers: any[];
}

export default function AdminReports() {
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const navigate = useNavigate();

  const generateReport = async () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `/api/admin/dashboard/reports/comprehensive?startDate=${startDate}T00:00:00&endDate=${endDate}T23:59:59`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setReport(data);
      } else {
        alert("Failed to generate report");
      }
    } catch (error) {
      console.error("Failed to generate report:", error);
      alert("Error generating report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <h1 className="text-2xl font-bold">📊 Reports & Analytics</h1>
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
        {/* Report Generator */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Generate Comprehensive Report</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={generateReport}
                disabled={loading}
                className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Generating..." : "Generate Report"}
              </button>
            </div>
          </div>
        </div>

        {/* Report Results */}
        {report && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg p-6 shadow">
                <p className="text-gray-600 text-sm">New Users</p>
                <p className="text-3xl font-bold text-blue-600">{report.newUsers}</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow">
                <p className="text-gray-600 text-sm">Transactions</p>
                <p className="text-3xl font-bold text-green-600">{report.transactionCount}</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow">
                <p className="text-gray-600 text-sm">Total Volume</p>
                <p className="text-3xl font-bold text-purple-600">
                  {report.totalVolume.toLocaleString()} VND
                </p>
              </div>
            </div>

            {/* Top Sellers */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-4">🏆 Top Sellers</h3>
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left">User ID</th>
                    <th className="px-4 py-2 text-left">Email</th>
                    <th className="px-4 py-2 text-left">Total Sales</th>
                    <th className="px-4 py-2 text-left">Transactions</th>
                  </tr>
                </thead>
                <tbody>
                  {report.topSellers.map((seller: any, idx: number) => (
                    <tr key={idx} className="border-b">
                      <td className="px-4 py-2">{seller.userId}</td>
                      <td className="px-4 py-2">{seller.email}</td>
                      <td className="px-4 py-2 font-semibold">{seller.totalSales?.toLocaleString()} VND</td>
                      <td className="px-4 py-2">{seller.transactionCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Top Buyers */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-4">🛒 Top Buyers</h3>
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left">User ID</th>
                    <th className="px-4 py-2 text-left">Email</th>
                    <th className="px-4 py-2 text-left">Total Purchases</th>
                    <th className="px-4 py-2 text-left">Transactions</th>
                  </tr>
                </thead>
                <tbody>
                  {report.topBuyers.map((buyer: any, idx: number) => (
                    <tr key={idx} className="border-b">
                      <td className="px-4 py-2">{buyer.userId}</td>
                      <td className="px-4 py-2">{buyer.email}</td>
                      <td className="px-4 py-2 font-semibold">{buyer.totalPurchases?.toLocaleString()} VND</td>
                      <td className="px-4 py-2">{buyer.transactionCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

