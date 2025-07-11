"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignIn() {
  const { signIn } = useAuthActions();
  
  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-purple-700">Banerry</CardTitle>
          <CardDescription>
            Sign in to access your speech and transition assistance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              void signIn("resend", formData);
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Input
                name="email"
                placeholder="Enter your email"
                type="email"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Send sign-in link
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
