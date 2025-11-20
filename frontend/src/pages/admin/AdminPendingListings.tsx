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

export default function AdminPendingListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("/api/admin/listings/pending", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setListings(data.data || []);
      } else {
        console.error("Failed to fetch pending listings", response.status);
      }
    } catch (error) {
      console.error("Failed to fetch pending listings:", error);
    } finally {
      setLoading(false);
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
        fetchPending();
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
        fetchPending();
      }
    } catch (error) {
      console.error("Failed to reject listing:", error);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <h1 className="text-2xl font-bold">🛠 Pending Listings Review</h1>
              <button
                onClick={() => navigate("/admin/listings")}
                className="text-sm bg-white/20 px-4 py-2 rounded hover:bg-white/30"
              >
                ← All Listings
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
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6">Pending Listings ({listings.length})</h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Title</th>
                  <th className="px-4 py-3 text-left">Carbon Amount</th>
                  <th className="px-4 py-3 text-left">Price</th>
                  <th className="px-4 py-3 text-left">Seller ID</th>
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
