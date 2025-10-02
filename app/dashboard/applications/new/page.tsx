import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApplicationForm } from "@/components/dashboard/application-form";

export default async function NewApplicationPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Application</h1>
          <p className="text-muted-foreground mt-1">
            Submit a new application for review
          </p>
        </div>
      </div>

      <ApplicationForm />

      <Card className="max-w-2xl border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
        <CardHeader>
          <CardTitle className="text-base">What happens next?</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>1. Your application will be submitted for review</p>
          <p>2. Our team will review your submission</p>
          <p>3. You'll receive a notification once a decision is made</p>
          <p>4. You can track the status from your dashboard</p>
        </CardContent>
      </Card>
    </div>
  );
}