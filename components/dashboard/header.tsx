import { Session } from "next-auth";
import { UserMenu } from "./user-menu";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  user: Session["user"];
  onMenuClick?: () => void;
}

export function DashboardHeader({ user, onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center gap-4 px-4 sm:px-6">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex-1">
          <h1 className="text-xl font-bold">Dashboard</h1>
        </div>

        <UserMenu user={user} />
      </div>
    </header>
  );
}