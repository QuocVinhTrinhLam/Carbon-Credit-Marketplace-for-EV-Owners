import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";
import { Input } from "../components/ui/input";
import { toast } from "../components/ui/sonner";

const schema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must have at least 6 characters")
});

type FormValues = z.infer<typeof schema>;

const LoginPage = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const onSubmit = async (values: FormValues) => {
    const success = await login(values.email, values.password);
    if (success) {
      toast.success("Welcome back!");
      
      // Check role and redirect accordingly
      const userStr = localStorage.getItem("auth_user");
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.role === "admin") {
          navigate("/admin/dashboard", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
      } else {
        navigate("/dashboard", { replace: true });
      }
    } else {
      toast.error("Unable to log in. Please check your credentials.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-semibold text-slate-900">Sign in to your account</h2>
        <p className="text-sm text-muted-foreground">
          Manage carbon credit listings, wallet balances, and track market activity.
        </p>
      </div>
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="you@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </Form>
      <p className="text-center text-xs text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link to="/register" className="font-semibold text-brand hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;

