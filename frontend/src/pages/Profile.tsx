import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";
import { Input } from "../components/ui/input";
import { Skeleton } from "../components/ui/skeleton";
import { toast } from "../components/ui/sonner";
import { useAuth } from "../hooks/useAuth";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  organization: z.string().optional()
});

type FormValues = z.infer<typeof schema>;

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      organization: ""
    }
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
        organization: ""
      });
    }
  }, [form, user]);

  const onSubmit = (values: FormValues) => {
    // Usually would send to backend. Here we just show toast.
    toast.success("Profile updated");
    console.log("Profile update payload", values);
  };

  if (!user) {
    return <Skeleton className="h-48 w-full rounded-xl" />;
  }

  return (
    <div className="space-y-6">
      <header className="rounded-xl border bg-white px-6 py-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage personal details, review account roles, and configure platform preferences.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Account details</CardTitle>
            <CardDescription>Information used for authentication and notifications.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full name</FormLabel>
                        <FormControl>
                          <Input {...field} />
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
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="organization"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization</FormLabel>
                      <FormControl>
                        <Input placeholder="Green Earth Initiative" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">Save changes</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account role</CardTitle>
              <CardDescription>
                Access permissions and capabilities.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border bg-slate-50 p-4 text-sm">
                <p className="font-semibold text-slate-900 capitalize">{user.role.toLowerCase()}</p>
                <p className="mt-2 text-muted-foreground">
                  Roles determine what actions you can perform across the marketplace. Contact an administrator to request changes.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Danger zone</CardTitle>
              <CardDescription>
                Log out from all sessions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Logging out clears your current session and removes stored tokens from this device.
              </p>
              <Button variant="destructive" onClick={logout}>
                Log out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

