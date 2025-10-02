"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle, Clock, XCircle, Check, X, ExternalLink } from "lucide-react";
import { updateApplicationStatus } from "@/lib/actions/admin";
import Link from "next/link";

type ApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";

interface Application {
  id: string;
  title: string;
  description: string | null;
  status: ApplicationStatus;
  createdAt: Date;
  riskScore: number;
  cost: number;
  duration: number;
  user: {
    name: string | null;
    email: string;
    image: string | null;
  };
}

interface Props {
  applications: Application[];
}

export function ApplicationManagement({ applications }: Props) {
  const [filter, setFilter] = useState<ApplicationStatus | "ALL">("ALL");
  const [loading, setLoading] = useState<string | null>(null);

  const filteredApps = applications.filter((app) =>
    filter === "ALL" ? true : app.status === filter
  );

  const handleStatusChange = async (applicationId: string, status: "APPROVED" | "REJECTED") => {
    setLoading(applicationId);
    try {
      await updateApplicationStatus(applicationId, status);
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setLoading(null);
    }
  };

  const getStatusIcon = (status: ApplicationStatus) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "APPROVED":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "REJECTED":
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    const styles = {
      PENDING: "bg-yellow-100 text-yellow-800",
      APPROVED: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800",
    };

    return (
      <span className={`text-xs px-2 py-1 rounded-full ${styles[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>All Applications</CardTitle>
            <CardDescription>
              Review and manage user applications
            </CardDescription>
          </div>

          <div className="flex gap-2">
            <Button
              variant={filter === "ALL" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("ALL")}
            >
              All ({applications.length})
            </Button>
            <Button
              variant={filter === "PENDING" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("PENDING")}
            >
              Pending ({applications.filter((a) => a.status === "PENDING").length})
            </Button>
            <Button
              variant={filter === "APPROVED" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("APPROVED")}
            >
              Approved ({applications.filter((a) => a.status === "APPROVED").length})
            </Button>
            <Button
              variant={filter === "REJECTED" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("REJECTED")}
            >
              Rejected ({applications.filter((a) => a.status === "REJECTED").length})
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredApps.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No applications found
            </div>
          ) : (
            filteredApps.map((application) => {
              const initials = application.user.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase() || "U";

              return (
                <Link
                  key={application.id}
                  href={`/admin/applications/${application.id}`}
                  className="block"
                >
                  <div className="flex items-start gap-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <Avatar>
                        <AvatarImage src={application.user.image || ""} />
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-base truncate">
                              {application.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              by {application.user.name || "Unknown"} ({application.user.email})
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800 whitespace-nowrap">
                              Risk: {application.riskScore || 0}
                            </span>
                            {getStatusBadge(application.status)}
                          </div>
                        </div>

                        {application.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {application.description}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                          <span>
                            💰 ${(application.cost || 0).toLocaleString()}
                          </span>
                          <span>
                            ⏱️ {application.duration || 0} days
                          </span>
                          <span>
                            Created:{" "}
                            {new Date(application.createdAt).toLocaleDateString("tr-TR", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {application.status === "PENDING" && (
                      <div className="flex gap-2 flex-shrink-0" onClick={(e) => e.preventDefault()}>
                        <Button
                          size="sm"
                          variant="default"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleStatusChange(application.id, "APPROVED");
                          }}
                          disabled={loading === application.id}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleStatusChange(application.id, "REJECTED");
                          }}
                          disabled={loading === application.id}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}