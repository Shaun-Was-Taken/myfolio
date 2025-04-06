"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SignOutButton, useUser } from "@clerk/nextjs";
import { Upload, Edit, CreditCard, LogOut } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const CustomProfile = () => {
  const { user, isLoaded } = useUser();
  const isMobile = useIsMobile();

  // Don't render anything until user data is loaded
  if (!isLoaded) {
    return null;
  }

  // For mobile view in the mobile menu, show a row layout instead
  if (isMobile && window.location.pathname === '/') {
    return (
      <div className="flex items-center gap-3 py-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user?.imageUrl} />
          <AvatarFallback className="bg-[#f3e5cf]">
            {user?.firstName?.charAt(0) ?? user?.username?.charAt(0) ?? "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {user?.firstName || user?.username || "User"}
          </span>
          <SignOutButton>
            <button className="text-xs text-primary hover:underline">
              Sign Out
            </button>
          </SignOutButton>
        </div>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar>
          <AvatarImage src={user?.imageUrl} />
          <AvatarFallback className="bg-[#f3e5cf]">
            {user?.firstName?.charAt(0) ?? user?.username?.charAt(0) ?? "U"}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-36">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem>
          <CreditCard className="mr-2 h-4 w-4" />
          Billing
        </DropdownMenuItem>
        <SignOutButton>
          <DropdownMenuItem>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </SignOutButton>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CustomProfile;
