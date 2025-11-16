import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import MainLayout from "../layouts/MainLayout";
import { useAuth } from "../hooks/useAuth";

const LoginPage = lazy(() => import("../pages/Login"));
const RegisterPage = lazy(() => import("../pages/Register"));
const DashboardPage = lazy(() => import("../pages/Dashboard"));
const WalletPage = lazy(() => import("../pages/Wallet"));
const ListingsPage = lazy(() => import("../pages/Listings"));
const ListingDetailPage = lazy(() => import("../pages/ListingDetail"));
const CreditsPage = lazy(() => import("../pages/Credits"));
const TransactionsPage = lazy(() => import("../pages/Transactions"));
const ProfilePage = lazy(() => import("../pages/Profile"));
const VnpayReturnPage = lazy(() => import("../pages/VnpayReturn"));
const AdminDashboardPage = lazy(() => import("../pages/admin/AdminDashboard"));
const AdminUsersPage = lazy(() => import("../pages/admin/AdminUsers"));
const AdminTransactionsPage = lazy(() => import("../pages/admin/AdminTransactions"));
const AdminWalletsPage = lazy(() => import("../pages/admin/AdminWallets"));
const AdminListingsPage = lazy(() => import("../pages/admin/AdminListings"));
const AdminReportsPage = lazy(() => import("../pages/admin/AdminReports"));

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="text-muted-foreground">Loading...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AdminRoute({ children }: { children: JSX.Element }) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="text-muted-foreground">Loading...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export const AppRouter = () => (
  <Suspense
    fallback={
      <div className="flex min-h-screen items-center justify-center">
        <span className="text-muted-foreground">Loading...</span>
      </div>
    }
  >
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={
        <AdminRoute>
          <AdminDashboardPage />
        </AdminRoute>
      } />
      <Route path="/admin/users" element={
        <AdminRoute>
          <AdminUsersPage />
        </AdminRoute>
      } />
      <Route path="/admin/transactions" element={
        <AdminRoute>
          <AdminTransactionsPage />
        </AdminRoute>
      } />
      <Route path="/admin/wallets" element={
        <AdminRoute>
          <AdminWalletsPage />
        </AdminRoute>
      } />
      <Route path="/admin/listings" element={
        <AdminRoute>
          <AdminListingsPage />
        </AdminRoute>
      } />
      <Route path="/admin/reports" element={
        <AdminRoute>
          <AdminReportsPage />
        </AdminRoute>
      } />

      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/listings" element={<ListingsPage />} />
        <Route path="/listings/:id" element={<ListingDetailPage />} />
        <Route path="/credits" element={<CreditsPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route 
          path="/vnpay-return" 
          element={
            <ProtectedRoute>
              <VnpayReturnPage />
            </ProtectedRoute>
          } 
        />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  </Suspense>
);

