"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, Clock, User } from "lucide-react";
import { toast } from "sonner";

export default function InvitationPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const [isAccepting, setIsAccepting] = useState(false);
  
  const invitation = useQuery(api.learners.getInvitation, { token });
  const acceptInvitation = useMutation(api.learners.acceptInvitation);

  const handleAcceptInvitation = async () => {
    if (!invitation) return;

    setIsAccepting(true);
    try {
      const result = await acceptInvitation({ token });
      
      if (result.success) {
        toast.success(result.message);
        // Redirect to the learner page
        if (result.learnerId) {
          router.push(`/mentor/learner/${result.learnerId}`);
        } else {
          router.push("/mentor");
        }
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Failed to accept invitation:", error);
      toast.error("Failed to accept invitation. Please try again.");
    } finally {
      setIsAccepting(false);
    }
  };

  const handleSignInAndAccept = async () => {
    if (!invitation) return;
    
    // Store the token in localStorage to handle after sign-in
    localStorage.setItem("pendingInvitationToken", token);
    
    // Redirect to sign-in with a return URL
    router.push(`/signin?redirect=/invitation/${token}`);
  };

  // Check for pending invitation after potential sign-in
  useEffect(() => {
    const pendingToken = localStorage.getItem("pendingInvitationToken");
    if (pendingToken === token && invitation?.status === "pending") {
      localStorage.removeItem("pendingInvitationToken");
      handleAcceptInvitation();
    }
  }, [invitation, token, handleAcceptInvitation]);

  if (invitation === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading invitation...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (invitation === null) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle>Invalid Invitation</CardTitle>
            <CardDescription>
              This invitation link is invalid or has been removed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => router.push("/signin")} 
              className="w-full"
            >
              Go to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (invitation.status === "expired") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <CardTitle>Invitation Expired</CardTitle>
            <CardDescription>
              This invitation has expired. Please contact {invitation.invitingMentor.name || invitation.invitingMentor.email} for a new invitation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => router.push("/signin")} 
              className="w-full"
            >
              Go to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (invitation.status === "accepted") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle>Already Accepted</CardTitle>
            <CardDescription>
              This invitation has already been accepted.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => router.push("/mentor")} 
              className="w-full"
            >
              Go to Mentor Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Pending invitation
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <User className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle>You&apos;re Invited!</CardTitle>
          <CardDescription>
            You&apos;ve been invited to mentor on Banerry
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              <strong>{invitation.invitingMentor.name || invitation.invitingMentor.email}</strong> has invited you to help mentor:
            </p>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="font-semibold">{invitation.learner.name}</p>
              {invitation.learner.bio && (
                <p className="text-sm text-gray-600 mt-1">{invitation.learner.bio}</p>
              )}
            </div>
          </div>

          <div className="text-xs text-gray-500">
            Invitation sent to: {invitation.email}
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              To accept this invitation, you need to sign in or create an account with the email address this invitation was sent to.
            </p>
            
            <Button 
              onClick={handleSignInAndAccept}
              className="w-full"
              disabled={isAccepting}
            >
              {isAccepting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Sign In to Accept"
              )}
            </Button>
          </div>

          <div className="text-xs text-gray-500 text-center">
            If you already have an account and are signed in, the invitation will be accepted automatically.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}