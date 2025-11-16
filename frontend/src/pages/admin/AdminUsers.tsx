import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface User {
  id: number;
  email: string;
  fullName: string;
  roles: { id: number; name: string }[];
  createdAt: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: number) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`/api/admin/users/${userId}/approve`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        alert("User approved successfully!");
        fetchUsers();
      }
    } catch (error) {
      console.error("Failed to approve user:", error);
    }
  };

  const handleBan = async (userId: number) => {
    if (!confirm("Are you sure you want to ban this user?")) return;

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`/api/admin/users/${userId}/ban`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        alert("User banned successfully!");
        fetchUsers();
      }
    } catch (error) {
      console.error("Failed to ban user:", error);
    }
  };

  const handleAssignRole = async (userId: number, roleName: string) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`/api/admin/users/${userId}/roles/${roleName}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        alert(`Role ${roleName} assigned successfully!`);
        fetchUsers();
      }
    } catch (error) {
      console.error("Failed to assign role:", error);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <h1 className="text-2xl font-bold">👥 User Management</h1>
              <button
                onClick={() => navigate("/admin/dashboard")}
                className="text-sm bg-white/20 px-4 py-2 rounded hover:bg-white/30 transition"
              >
                ← Dashboard
              </button>
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

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">All Users ({users.length})</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Full Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Roles</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Created</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{user.id}</td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3 font-medium">{user.fullName}</td>
                    <td className="px-4 py-3">
                      {user.roles && user.roles.length > 0 ? (
                        user.roles.map((r) => (
                          <span
                            key={r.id}
                            className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-semibold mr-1"
                          >
                            {r.name}
                          </span>
                        ))
                      ) : (
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                          USER
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApprove(user.id)}
                          className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleBan(user.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                        >
                          Ban
                        </button>
                        <button
                          onClick={() => handleAssignRole(user.id, "CVA")}
                          className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                        >
                          Make CVA
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

