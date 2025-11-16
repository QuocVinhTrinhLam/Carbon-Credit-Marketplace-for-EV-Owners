import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Listing {
  id: number;
  title: string;
  price: number;
  carbonAmount: number;
  status: string;
  sellerId: number;
}

export default function AdminListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [stats, setStats] = useState({ total: 0, open: 0, sold: 0, cancelled: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchListings();
    fetchStats();
  }, []);

  const fetchListings = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("/api/admin/listings", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setListings(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch listings:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("/api/admin/listings/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const handleApprove = async (id: number) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`/api/admin/listings/${id}/approve`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        alert("Listing approved!");
        fetchListings();
      }
    } catch (error) {
      console.error("Failed to approve listing:", error);
    }
  };

  const handleReject = async (id: number) => {
    const reason = prompt("Reason for rejection:");
    if (!reason) return;

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`/api/admin/listings/${id}/reject?reason=${encodeURIComponent(reason)}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        alert("Listing rejected!");
        fetchListings();
      }
    } catch (error) {
      console.error("Failed to reject listing:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this listing permanently?")) return;

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`/api/admin/listings/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        alert("Listing deleted!");
        fetchListings();
      }
    } catch (error) {
      console.error("Failed to delete listing:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      OPEN: "bg-green-100 text-green-800",
      SOLD: "bg-blue-100 text-blue-800",
      CANCELLED: "bg-red-100 text-red-800",
      APPROVED: "bg-purple-100 text-purple-800",
      REJECTED: "bg-gray-100 text-gray-800",
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
              <h1 className="text-2xl font-bold">📝 Listing Management</h1>
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
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow">
            <p className="text-gray-600 text-sm">Total</p>
            <p className="text-3xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow">
            <p className="text-gray-600 text-sm">Open</p>
            <p className="text-3xl font-bold text-green-600">{stats.open}</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow">
            <p className="text-gray-600 text-sm">Sold</p>
            <p className="text-3xl font-bold text-blue-600">{stats.sold}</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow">
            <p className="text-gray-600 text-sm">Cancelled</p>
            <p className="text-3xl font-bold text-red-600">{stats.cancelled}</p>
          </div>
        </div>

        {/* Listings Table */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6">All Listings ({listings.length})</h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Title</th>
                  <th className="px-4 py-3 text-left">Carbon Amount</th>
                  <th className="px-4 py-3 text-left">Price</th>
                  <th className="px-4 py-3 text-left">Seller ID</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {listings.map((listing) => (
                  <tr key={listing.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{listing.id}</td>
                    <td className="px-4 py-3 font-medium">{listing.title}</td>
                    <td className="px-4 py-3">{listing.carbonAmount} kg</td>
                    <td className="px-4 py-3 font-semibold">{listing.price.toLocaleString()} VND</td>
                    <td className="px-4 py-3">{listing.sellerId}</td>
                    <td className="px-4 py-3">{getStatusBadge(listing.status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApprove(listing.id)}
                          className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(listing.id)}
                          className="bg-yellow-500 text-white px-3 py-1 rounded text-xs hover:bg-yellow-600"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleDelete(listing.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600"
                        >
                          Delete
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

