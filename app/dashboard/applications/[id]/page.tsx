import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, DollarSign, Clock, Link2, AlertTriangle, ArrowLeft } from "lucide-react";
import { getRiskLevel } from "@/lib/risk-calculator";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function UserApplicationDetailPage({ params }: PageProps) {
  const session = await auth();

  const application = await prisma.application.findUnique({
    where: {
      id: params.id,
    },
  });

  if (!application) {
    notFound();
  }

  if (application.userId !== session!.user!.id) {
    redirect("/dashboard");
  }

  const riskInfo = getRiskLevel(application.riskScore);

  const statusColors = {
    PENDING: "bg-yellow-100 text-yellow-800 border-yellow-300",
    APPROVED: "bg-green-100 text-green-800 border-green-300",
    REJECTED: "bg-red-100 text-red-800 border-red-300",
  };

  const riskColors = {
    green: "bg-green-100 text-green-800 border-green-300",
    yellow: "bg-yellow-100 text-yellow-800 border-yellow-300",
    orange: "bg-orange-100 text-orange-800 border-orange-300",
    red: "bg-red-100 text-red-800 border-red-300",
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {application.title}
            </h1>
            <p className="text-muted-foreground mt-1">
              Application Details
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={statusColors[application.status]}>
              {application.status}
            </Badge>
          </div>
        </div>
      </div>

      {application.status === "APPROVED" && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <p className="text-green-800">
              🎉 Your application has been approved!
            </p>
          </CardContent>
        </Card>
      )}

      {application.status === "REJECTED" && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800">
              Your application has been rejected. Please review the feedback below.
            </p>
          </CardContent>
        </Card>
      )}

      {application.status === "PENDING" && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <p className="text-yellow-800">
              ⏳ Your application is under review. We'll notify you once a decision is made.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                  Project Type
                </h3>
                <p className="text-base">
                  {application.projectType.replace(/_/g, ' ')}
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                  Description
                </h3>
                <p className="text-base whitespace-pre-wrap break-words overflow-wrap-anywhere">
                  {application.description}
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                  Technical Description
                </h3>
                <p className="text-base whitespace-pre-wrap break-words overflow-wrap-anywhere">
                  {application.technicalDesc}
                </p>
              </div>

              {application.documentLink && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-1 flex items-center gap-2">
                      <Link2 className="h-4 w-4" />
                      Document Link
                    </h3>
                    <a
                      href={application.documentLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline break-all"
                    >
                      {application.documentLink}
                    </a>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {application.reviewNote && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-base">Review Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{application.reviewNote}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Project Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Budget</p>
                  <p className="font-semibold">
                    ${application.cost.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-semibold">{application.duration} days</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CalendarDays className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Submitted</p>
                  <p className="font-semibold">
                    {new Date(application.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Risk Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Risk Score</span>
                <Badge className={riskColors[riskInfo.color as keyof typeof riskColors] + " text-base px-3"}>
                  {application.riskScore}
                </Badge>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    riskInfo.color === 'green' ? 'bg-green-500' :
                    riskInfo.color === 'yellow' ? 'bg-yellow-500' :
                    riskInfo.color === 'orange' ? 'bg-orange-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${application.riskScore}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {riskInfo.label}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}