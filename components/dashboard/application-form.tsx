"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createApplication } from "@/lib/actions/applications";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertCircle, Info } from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="flex-1">
      {pending ? "Submitting..." : "Submit Application"}
    </Button>
  );
}

export function ApplicationForm() {
  const [state, formAction] = useActionState(createApplication, null);
  const [projectType, setProjectType] = useState("");

  useEffect(() => {
    if (state?.success === false && state.error) {
      console.error(state.error);
    }
  }, [state]);

  return (
    <Card className="max-w-4xl">
      <CardHeader>
        <CardTitle>New Project Application</CardTitle>
        <CardDescription>
          Fill in the project details below. Your application will be automatically assessed for risk factors.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          {state?.success === false && state.error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Error</p>
                <p className="text-sm">{state.error}</p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">
              Project Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              placeholder="e.g., Customer Portal Redesign"
              required
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="projectType">
              Project Type <span className="text-red-500">*</span>
            </Label>
            <Select name="projectType" required onValueChange={setProjectType}>
              <SelectTrigger>
                <SelectValue placeholder="Select project type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WEB_DEVELOPMENT">Web Development</SelectItem>
                <SelectItem value="MOBILE_APP">Mobile App</SelectItem>
                <SelectItem value="DATA_ANALYSIS">Data Analysis</SelectItem>
                <SelectItem value="INFRASTRUCTURE">Infrastructure</SelectItem>
                <SelectItem value="SECURITY">Security</SelectItem>
                <SelectItem value="RESEARCH">Research & Development</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Project Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Provide a brief overview of the project goals and objectives..."
              rows={4}
              required
              minLength={20}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Minimum 20 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="technicalDesc">
              Technical Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="technicalDesc"
              name="technicalDesc"
              placeholder="Describe technical requirements, architecture, technologies to be used, integration points, technical challenges, etc..."
              rows={6}
              required
              minLength={50}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Minimum 50 characters. Include technical stack, dependencies, and potential challenges.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">
                Duration (days) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="duration"
                name="duration"
                type="number"
                min="1"
                placeholder="30"
                required
              />
              <p className="text-xs text-muted-foreground">
                Estimated project duration in days
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost">
                Estimated Cost ($) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="cost"
                name="cost"
                type="number"
                min="0"
                step="0.01"
                placeholder="10000"
                required
              />
              <p className="text-xs text-muted-foreground">
                Total estimated project cost
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="documentLink">
              Document Link (Optional)
            </Label>
            <Input
              id="documentLink"
              name="documentLink"
              type="url"
              placeholder="https://docs.google.com/..."
            />
            <div className="flex items-start gap-2 text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
              <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p>
                Share a link to your project documentation, requirements doc, or related files (Google Docs, Notion, etc.)
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <Info className="h-4 w-4" />
              Automatic Risk Assessment
            </h4>
            <p className="text-xs text-muted-foreground">
              Your application will be automatically assessed based on:
            </p>
            <ul className="text-xs text-muted-foreground mt-2 space-y-1 ml-4 list-disc">
              <li><strong>Cost:</strong> Higher budgets increase risk score</li>
              <li><strong>Duration:</strong> Longer projects have higher risk</li>
              <li><strong>Project Type:</strong> Some types are inherently more complex</li>
              <li><strong>Technical Complexity:</strong> Based on your technical description</li>
            </ul>
          </div>

          <div className="flex gap-3 pt-4">
            <SubmitButton />
            <Link href="/dashboard" className="flex-1">
              <Button type="button" variant="outline" className="w-full">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}