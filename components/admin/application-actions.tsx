"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Check, X, Loader2, AlertCircle } from "lucide-react";
import { updateApplicationStatusWithNote } from "@/lib/actions/admin";
import { useRouter } from "next/navigation";

interface ApplicationActionsProps {
  applicationId: string;
  currentStatus: "PENDING" | "APPROVED" | "REJECTED";
}

export function ApplicationActions({ applicationId, currentStatus }: ApplicationActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [reviewNote, setReviewNote] = useState("");
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [error, setError] = useState("");

  const handleAction = async (status: "APPROVED" | "REJECTED") => {
    setLoading(true);
    setError("");
    
    try {
      await updateApplicationStatusWithNote(applicationId, status, reviewNote);
      router.refresh();
      setReviewNote("");
      setShowNoteInput(false);
    } catch (error) {
      console.error("Error updating status:", error);
      setError("Failed to update status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="text-base">Review Actions</CardTitle>
        <CardDescription>
          {currentStatus === "PENDING" 
            ? "Approve or reject this application"
            : "Change the status of this application"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentStatus !== "PENDING" && (
          <div className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
            currentStatus === "APPROVED" 
              ? "bg-green-50 border border-green-200 text-green-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}>
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">
                Currently: {currentStatus}
              </p>
              <p className="text-xs mt-1">
                You can change the status below if needed.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded text-sm">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="reviewNote">Review Note (Optional)</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNoteInput(!showNoteInput)}
              disabled={loading}
            >
              {showNoteInput ? "Hide" : "Add Note"}
            </Button>
          </div>
          {showNoteInput && (
            <Textarea
              id="reviewNote"
              placeholder="Add feedback or comments for the applicant..."
              rows={3}
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              className="resize-none"
              disabled={loading}
            />
          )}
        </div>

        <div className="space-y-2">
          {currentStatus !== "APPROVED" && (
            <Button
              className="w-full bg-green-600 hover:bg-green-700"
              size="lg"
              onClick={() => handleAction("APPROVED")}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Check className="mr-2 h-5 w-5" />
              )}
              {currentStatus === "REJECTED" ? "Change to Approved" : "Approve Application"}
            </Button>
          )}

          {currentStatus !== "REJECTED" && (
            <Button
              className="w-full"
              variant="destructive"
              size="lg"
              onClick={() => handleAction("REJECTED")}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <X className="mr-2 h-5 w-5" />
              )}
              {currentStatus === "APPROVED" ? "Change to Rejected" : "Reject Application"}
            </Button>
          )}
        </div>

        {currentStatus !== "PENDING" && (
          <p className="text-xs text-muted-foreground text-center pt-2">
            ⚠️ Changing status will update the application and notify the user.
          </p>
        )}
      </CardContent>
    </Card>
  );
}