import React from "react";
import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarButtonProps {
  onClick: () => void;
}

export function SidebarButton({ onClick }: SidebarButtonProps) {
  return (
    <Button
      onClick={onClick}
      className={cn(
        "fixed bottom-6 right-6 z-40 shadow-lg rounded-full w-14 h-14 p-0",
        "bg-blue-600 hover:bg-blue-700 transition-all",
        "flex items-center justify-center"
      )}
    >
      <Bot className="w-6 h-6 text-white" />
    </Button>
  );
}