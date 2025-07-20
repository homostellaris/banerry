"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function SignIn() {
  const { signIn } = useAuthActions();
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-purple-700">
            Banerry
          </CardTitle>
          <CardDescription>
            {/* Sign in to access your speech and transition assistance */}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={async (event) => {
              event.preventDefault();
              setIsLoading(true);

              try {
                const formData = new FormData(event.currentTarget);
                const email = formData.get("email") as string;

                // await signIn("resend", formData);
                await signIn("resend", { ...formData, redirectTo: "/mentor" });

                toast.success("Sign-in link sent!", {
                  description: `Check your email at ${email} for the sign-in link.`,
                });
              } catch (error) {
                toast.error("Error", {
                  description: "Failed to send sign-in link. Please try again.",
                });
              } finally {
                setIsLoading(false);
              }
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Input
                name="email"
                placeholder="Enter your email"
                type="email"
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                </>
              ) : (
                "Send sign-in link"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
