import { handleSignOut } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  return (
    <form action={handleSignOut}>
      <Button 
        type="submit" 
        variant="ghost" 
        className="w-full justify-start"
      >
        <LogOut className="mr-2 h-4 w-4" />
        Sign Out
      </Button>
    </form>
  );
}