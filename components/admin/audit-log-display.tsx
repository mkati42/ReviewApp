import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FileText, ArrowRightLeft, MessageSquare, Plus } from "lucide-react";

interface AuditLog {
  id: string;
  action: string;
  fieldName: string | null;
  oldValue: string | null;
  newValue: string | null;
  createdAt: Date;
  user: {
    name: string | null;
    email: string;
    image: string | null;
  };
}

interface AuditLogDisplayProps {
  logs: AuditLog[];
}

export function AuditLogDisplay({ logs }: AuditLogDisplayProps) {
  const getActionIcon = (action: string) => {
    switch (action) {
      case "CREATED":
        return <Plus className="h-4 w-4 text-blue-600" />;
      case "STATUS_CHANGED":
        return <ArrowRightLeft className="h-4 w-4 text-purple-600" />;
      case "REVIEW_NOTE_ADDED":
        return <MessageSquare className="h-4 w-4 text-green-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActionText = (log: AuditLog) => {
    switch (log.action) {
      case "CREATED":
        return "created this application";
      case "STATUS_CHANGED":
        return (
          <>
            changed status from{" "}
            <span className="font-semibold">{log.oldValue}</span> to{" "}
            <span className="font-semibold">{log.newValue}</span>
          </>
        );
      case "REVIEW_NOTE_ADDED":
        return "added a review note";
      case "UPDATED":
        return `updated ${log.fieldName}`;
      default:
        return "performed an action";
    }
  };

  if (logs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Activity Log</CardTitle>
          <CardDescription>No activity recorded yet</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Activity Log</CardTitle>
        <CardDescription>
          History of all changes made to this application
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {logs.map((log) => {
            const initials = log.user.name
              ?.split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase() || "U";

            return (
              <div
                key={log.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
              >
                <div className="flex-shrink-0 mt-1">
                  {getActionIcon(log.action)}
                </div>
                
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-start gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={log.user.image || ""} />
                      <AvatarFallback className="text-xs">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{log.user.name}</span>{" "}
                        {getActionText(log)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(log.createdAt).toLocaleString("tr-TR", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}