import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarDays, DollarSign, Clock, FileText, Link2, AlertTriangle, Mail } from "lucide-react";
import { getRiskLevel } from "@/lib/risk-calculator";
import { ApplicationActions } from "@/components/admin/application-actions";
import { AuditLogDisplay } from "@/components/admin/audit-log-display";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function ApplicationDetailPage({ params }: PageProps) {
  await auth();

  const application = await prisma.application.findUnique({
    where: {
      id: params.id,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      auditLogs: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!application) {
    notFound();
  }

  const riskInfo = getRiskLevel(application.riskScore);
  const initials = application.user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U";

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
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-start justify-between">
        <div>
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="mb-2">
              ← Back to Applications
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">
            {application.title}
          </h1>
          <p className="text-muted-foreground mt-1">
            Application Details & Review
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={statusColors[application.status]}>
            {application.status}
          </Badge>
          <Badge className={riskColors[riskInfo.color as keyof typeof riskColors]}>
            Risk: {application.riskScore}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
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
                <p className="text-base whitespace-pre-wrap break-words">
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

          <Card className="border-orange-200 bg-orange-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Risk Analysis
              </CardTitle>
              <CardDescription>
                Automatic risk assessment based on project parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Risk Score</span>
                <Badge className={riskColors[riskInfo.color as keyof typeof riskColors] + " text-lg px-4 py-1"}>
                  {application.riskScore} / 100
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Risk Level</span>
                  <span className="font-semibold">{riskInfo.label}</span>
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
              </div>

              <Separator />

              <div className="space-y-3 text-sm">
                <h4 className="font-semibold">Risk Factors:</h4>
                <div className="grid gap-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Budget Impact</span>
                    <span className="font-medium">
                      {application.cost >= 100000 ? '40 pts - Very High' :
                       application.cost >= 50000 ? '35 pts - High' :
                       application.cost >= 20000 ? '25 pts - Medium' :
                       application.cost >= 5000 ? '15 pts - Low-Med' : '5 pts - Low'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Timeline Risk</span>
                    <span className="font-medium">
                      {application.duration >= 180 ? '30 pts - Long' :
                       application.duration >= 90 ? '20 pts - Medium' :
                       application.duration >= 30 ? '12 pts - Short-Med' : '5 pts - Short'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Project Type</span>
                    <span className="font-medium">
                      {application.projectType === 'SECURITY' ? '20 pts - Critical' :
                       application.projectType === 'INFRASTRUCTURE' ? '18 pts - High' :
                       application.projectType === 'RESEARCH' ? '15 pts - Med-High' :
                       application.projectType === 'MOBILE_APP' ? '12 pts - Medium' :
                       application.projectType === 'DATA_ANALYSIS' ? '10 pts - Standard' :
                       application.projectType === 'WEB_DEVELOPMENT' ? '8 pts - Low' : '10 pts - Standard'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Complexity</span>
                    <span className="font-medium">
                      {application.technicalDesc.length > 1000 ? 'High' :
                       application.technicalDesc.length > 500 ? 'Medium' :
                       application.technicalDesc.length > 200 ? 'Low-Med' : 'Low'}
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="text-xs text-muted-foreground space-y-1">
                <p className="font-semibold">How Risk Score is Calculated:</p>
                <p>• Cost: Higher budgets increase risk (max 40 pts)</p>
                <p>• Duration: Longer projects have more risk (max 30 pts)</p>
                <p>• Type: Some project types are riskier (max 20 pts)</p>
                <p>• Complexity: Based on technical description (max 10 pts)</p>
                <p className="pt-1">Total ranges from 0 to 100</p>
              </div>
            </CardContent>
          </Card>

          {application.reviewNote && (
            <Card className="border-blue-200 bg-blue-50/50">
              <CardHeader>
                <CardTitle className="text-base">Review Note</CardTitle>
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
              <CardTitle className="text-base">Submitted By</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={application.user.image || ""} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{application.user.name}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {application.user.email}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

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
                    {new Date(application.createdAt).toLocaleDateString("tr-TR", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {application.updatedAt.getTime() !== application.createdAt.getTime() && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <FileText className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last Updated</p>
                    <p className="font-semibold">
                      {new Date(application.updatedAt).toLocaleDateString("tr-TR", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <ApplicationActions 
            applicationId={application.id} 
            currentStatus={application.status}
          />
        </div>
      </div>

      <AuditLogDisplay logs={application.auditLogs} />
    </div>
  );
}