"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAuthActions } from "@convex-dev/auth/react";
import { Loader2 } from "lucide-react";
import posthog from "posthog-js";
import { useState } from "react";
import { toast } from "sonner";

export default function SignInForm() {
  const { signIn } = useAuthActions();
  const [isLoading, setIsLoading] = useState(false);
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [email, setEmail] = useState("");

  return (
    <>
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          setIsLoading(true);

          try {
            const formData = new FormData(event.currentTarget);
            const emailValue = formData.get("email") as string;
            setEmail(emailValue);

            await signIn("resend-otp", {
              email: emailValue,
            });

            posthog.capture("sign_in_otp_requested", {
              email: emailValue,
            });
            setShowOtpModal(true);
          } catch (error) {
            posthog.captureException(error);
            toast.error("Error", {
              description:
                "Failed to send verification code. Please try again.",
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
            "Send code"
          )}
        </Button>
      </form>

      <Dialog open={showOtpModal} onOpenChange={setShowOtpModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter verification code</DialogTitle>
            <DialogDescription>
              We sent a verification code to {email}. Please enter it below.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={async (event) => {
              event.preventDefault();
              setIsOtpLoading(true);

              try {
                const formData = new FormData(event.currentTarget);
                const code = formData.get("code") as string;

                await signIn("resend-otp", {
                  email,
                  code,
                  redirectTo: "/mentor",
                });

                posthog.identify(email, { email });
                posthog.capture("sign_in_completed", {
                  email,
                });
                toast.success("Successfully signed in!");
                setShowOtpModal(false);
              } catch (error) {
                posthog.captureException(error);
                toast.error("Error", {
                  description: "Invalid verification code. Please try again.",
                });
              } finally {
                setIsOtpLoading(false);
              }
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Input
                name="code"
                placeholder="Enter verification code"
                type="text"
                required
                disabled={isOtpLoading}
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setShowOtpModal(false)}
                disabled={isOtpLoading}
              >
                Cancel
              </Button>
              <Button type="submit" className="w-full" disabled={isOtpLoading}>
                {isOtpLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
