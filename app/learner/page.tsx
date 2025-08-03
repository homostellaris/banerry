"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Loader2, AlertCircle, Home } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Header from "../_common/header";
import Link from "next/link";
import RecentLearners from "../_learners/recent";

export default function LearnerPage() {
  const [passphrase, setPassphrase] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Only validate when we have a passphrase and user clicked submit
  const learner = useQuery(
    api.learners.validate,
    isValidating && passphrase.trim()
      ? { passphrase: passphrase.trim() }
      : "skip"
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passphrase.trim()) {
      setError("Please enter your access code");
      return;
    }

    setIsValidating(true);
    setError("");
  };

  // Handle the validation result
  useEffect(() => {
    if (isValidating && learner !== undefined) {
      if (learner) {
        window.localStorage.setItem("passphrase", passphrase.trim());
        // Success - navigate to the learner page
        router.push(`/learner/${passphrase.trim()}`);
      } else {
        // Invalid passphrase
        setError("Invalid access code. Please check and try again.");
        setIsValidating(false);
      }
    }
  }, [learner, isValidating, passphrase, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassphrase(e.target.value);
    setError(""); // Clear error when user types
    setIsValidating(false); // Reset validation state
  };

  return (
    <>
      <Header>
        <nav className="flex items-center gap-4">
          <Link href="/">
            <Home className="h-6 w-6 text-purple-700" />
          </Link>
          <RecentLearners />
        </nav>
      </Header>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-purple-700 mb-2">
              Welcome to Banerry
            </h1>
            <p className="text-gray-600">
              Enter your access code to view your scripts
            </p>
          </div>

          <Card className="shadow-lg border-0">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl text-gray-800">
                Access Your Scripts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="passphrase" className="text-sm font-medium">
                    Access Code
                  </Label>
                  <Input
                    id="passphrase"
                    type="text"
                    value={passphrase}
                    onChange={handleInputChange}
                    placeholder="your-access-code"
                    className="text-center text-lg"
                    disabled={isValidating}
                  />
                  <p className="text-xs text-gray-500 text-center">
                    This should be three words separated by dashes
                  </p>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                    <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                    <span className="text-sm text-red-700">{error}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={!passphrase.trim() || isValidating}
                >
                  {isValidating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      Access My Scripts
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-xs text-gray-500 text-center">
                  Don't have an access code? Ask your mentor to share one with
                  you.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
