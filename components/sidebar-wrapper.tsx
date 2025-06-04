"use client";

import { Suspense } from "react";
import { Sidebar } from "./sidebar";

interface SidebarWrapperProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SidebarWrapper({ isOpen, onClose }: SidebarWrapperProps) {
  return (
    <Suspense fallback={
      <div className="fixed top-0 right-0 z-50 h-full w-80 bg-white shadow-lg flex items-center justify-center">
        加载中...
      </div>
    }>
      <Sidebar isOpen={isOpen} onClose={onClose} />
    </Suspense>
  );
} 