import { Outlet } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

const AuthLayout = () => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-slate-100 px-4 py-10">
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-semibold text-brand-dark">
          Carbon Credit Marketplace
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Outlet />
      </CardContent>
    </Card>
    <p className="mt-6 text-xs text-muted-foreground">
      © {new Date().getFullYear()} Carbon Credit Exchange. All rights reserved.
    </p>
  </div>
);

export default AuthLayout;

