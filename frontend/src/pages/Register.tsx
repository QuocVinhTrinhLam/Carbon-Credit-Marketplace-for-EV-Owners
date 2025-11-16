import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { z } from "zod";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";
import { Input } from "../components/ui/input";
import { toast } from "../components/ui/sonner";

const schema = z
  .object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(6, "Password must have at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirmation is required"),
    organization: z.string().optional()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"]
  });

type FormValues = z.infer<typeof schema>;

const RegisterPage = () => {
  const { register: registerUser, isLoading } = useAuth();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      organization: ""
    }
  });

  const onSubmit = async (values: FormValues) => {
    setErrorMessage(null);

    const success = await registerUser(
      values.email,
      values.password,
      values.name
    );

    if (success) {
      toast.success("Account created successfully. Please sign in.");
      navigate("/login");
    } else {
      setErrorMessage(
        "Unable to register. Please check your information or try again later."
      );
      toast.error("Unable to register. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-semibold text-slate-900">Create your account</h2>
        <p className="text-sm text-muted-foreground">
          Join the Carbon Credit Marketplace to list, verify, and manage sustainable projects.
        </p>
      </div>
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full name</FormLabel>
                <FormControl>
                  <Input placeholder="Jane Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
            name="organization"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organization (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Green Earth Initiative" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid gap-4 sm:grid-cols-2">
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
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {errorMessage ? (
            <p className="text-sm font-medium text-red-600">{errorMessage}</p>
          ) : null}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Create account"}
          </Button>
        </form>
      </Form>
      <p className="text-center text-xs text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-brand hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default RegisterPage;

