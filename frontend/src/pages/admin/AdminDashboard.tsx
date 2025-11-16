import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface AdminStats {
  totalUsers: number;
  totalListings: number;
  totalTransactions: number;
  totalRevenue: number;
}

interface UserData {
  id: number;
  email: string;
  fullName: string;
  roles: { id: number; name: string }[];
  createdAt: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalListings: 0,
    totalTransactions: 0,
    totalRevenue: 0,
  });
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is admin
    const userStr = localStorage.getItem("auth_user");
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.role !== "admin") {
        navigate("/dashboard", { replace: true });
        return;
      }
    }

    fetchAdminData();
  }, [navigate]);

  const fetchAdminData = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("/api/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.data || []);
        setStats({
          totalUsers: data.total || 0,
          totalListings: 0,
          totalTransactions: 0,
          totalRevenue: 0,
        });
      }
    } catch (error) {
      console.error("Failed to fetch admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("auth_user");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold">🔐 Admin Panel</h1>
              <nav className="flex space-x-4">
                <button
                  onClick={() => navigate("/admin/dashboard")}
                  className="bg-white/20 px-4 py-2 rounded hover:bg-white/30 transition"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => navigate("/admin/users")}
                  className="bg-white/20 px-4 py-2 rounded hover:bg-white/30 transition"
                >
                  Users
                </button>
                <button
                  onClick={() => navigate("/admin/transactions")}
                  className="bg-white/20 px-4 py-2 rounded hover:bg-white/30 transition"
                >
                  Transactions
                </button>
                <button
                  onClick={() => navigate("/admin/wallets")}
                  className="bg-white/20 px-4 py-2 rounded hover:bg-white/30 transition"
                >
                  Wallets
                </button>
                <button
                  onClick={() => navigate("/admin/listings")}
                  className="bg-white/20 px-4 py-2 rounded hover:bg-white/30 transition"
                >
                  Listings
                </button>
                <button
                  onClick={() => navigate("/admin/reports")}
                  className="bg-white/20 px-4 py-2 rounded hover:bg-white/30 transition"
                >
                  Reports
                </button>
              </nav>
            </div>
            <button
              onClick={handleLogout}
              className="bg-white text-red-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon="👥"
            color="from-blue-500 to-blue-600"
          />
          <StatCard
            title="Listings"
            value={stats.totalListings}
            icon="📝"
            color="from-green-500 to-green-600"
          />
          <StatCard
            title="Transactions"
            value={stats.totalTransactions}
            icon="💰"
            color="from-yellow-500 to-yellow-600"
          />
          <StatCard
            title="Revenue"
            value={`${stats.totalRevenue.toLocaleString()} VND`}
            icon="💵"
            color="from-purple-500 to-purple-600"
          />
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6">All Users</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Full Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Roles</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Created At</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-sm">{user.id}</td>
                    <td className="px-4 py-3 text-sm">{user.email}</td>
                    <td className="px-4 py-3 text-sm font-medium">{user.fullName}</td>
                    <td className="px-4 py-3">
                      {user.roles && user.roles.length > 0 ? (
                        <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-semibold">
                          {user.roles.map((r) => r.name).join(", ")}
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
                          USER
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString()}
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

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: string;
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <div
      className={`bg-gradient-to-r ${color} text-white rounded-xl p-6 shadow-lg transform hover:scale-105 transition duration-200`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-90 font-medium">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className="text-5xl opacity-80">{icon}</div>
      </div>
    </div>
  );
}

