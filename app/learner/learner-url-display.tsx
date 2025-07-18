"use client";

import type React from "react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check, ExternalLink } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export default function LearnerUrlDisplay({
  name,
  passphrase,
}: {
  name: string;
  passphrase: string;
}) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  if (!passphrase) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-orange-800">
            Learner Access Link
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-orange-600">Loading link...</p>
        </CardContent>
      </Card>
    );
  }

  const fullUrl = `${window.location.origin}/learner/${passphrase}`;

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-green-800">
          Learner Access Link
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <p className="text-xs text-green-600">
          Share this link with {name} to access their scripts:
        </p>

        <div className="flex items-center gap-2 p-2 bg-white rounded border">
          <code className="text-sm flex-1 text-gray-700 break-all">
            {fullUrl}
          </code>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(fullUrl)}
            className="flex-shrink-0"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => copyToClipboard(fullUrl)}
            disabled={copied}
          >
            {copied ? "Copied!" : "Copy Link"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(fullUrl, "_blank")}
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            Open
          </Button>
        </div>

        <p className="text-xs text-green-600">
          Easy to remember: <strong>{passphrase}</strong>
        </p>
      </CardContent>
    </Card>
  );
}
