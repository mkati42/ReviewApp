import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, XCircle, FileText, Plus, AlertTriangle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getRiskLevel } from "@/lib/risk-calculator";

type ApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";

interface Application {
  id: string;
  title: string;
  projectType: string;
  description: string;
  status: ApplicationStatus;
  riskScore: number;
  createdAt: Date;
  cost: number;
  duration: number;
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const applications = await prisma.application.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      title: true,
      projectType: true,
      description: true,
      status: true,
      riskScore: true,
      createdAt: true,
      cost: true,
      duration: true,
    },
  }) as Application[];

  const stats = {
    total: applications.length,
    pending: applications.filter((app) => app.status === "PENDING").length,
    approved: applications.filter((app) => app.status === "APPROVED").length,
    rejected: applications.filter((app) => app.status === "REJECTED").length,
    avgRisk: applications.length > 0 
      ? Math.round(applications.reduce((sum, app) => sum + app.riskScore, 0) / applications.length)
      : 0,
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {session.user.name}!
          </h1>
          <p className="text-muted-foreground mt-2">
            Here's an overview of your project applications.
          </p>
        </div>
        <Link href="/dashboard/applications/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Application
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All time submissions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Successfully approved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejected}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Needs attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Risk Score</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgRisk}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Average risk level
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
          <CardDescription>
            Your latest project application submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No applications yet</p>
              <p className="text-sm mt-2">Create your first project application to get started</p>
              <Link href="/dashboard/applications/new">
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Application
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.slice(0, 5).map((application) => {
                const riskInfo = getRiskLevel(application.riskScore);
                
                return (
                  <Link
                    key={application.id}
                    href={`/dashboard/applications/${application.id}`}
                  >
                    <div className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                      {application.status === "PENDING" && (
                        <Clock className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                      )}
                      {application.status === "APPROVED" && (
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      )}
                      {application.status === "REJECTED" && (
                        <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-medium truncate">
                              {application.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {application.projectType.replace(/_/g, ' ')} • 
                              ${application.cost.toLocaleString()} • 
                              {application.duration} days
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`text-xs px-2 py-1 rounded-full bg-${riskInfo.color}-100 text-${riskInfo.color}-800 whitespace-nowrap`}>
                              Risk: {application.riskScore}
                            </span>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                application.status === "PENDING"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : application.status === "APPROVED"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {application.status}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(application.createdAt).toLocaleDateString("tr-TR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}