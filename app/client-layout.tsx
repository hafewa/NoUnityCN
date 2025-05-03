"use client"

import { useState } from "react"
import { SidebarWrapper } from "@/components/sidebar-wrapper"
import { SidebarButton } from "@/components/sidebar-button"
import Clarity from '@microsoft/clarity';

interface ClientLayoutProps {
  children: React.ReactNode
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const projectId = process.env.CLARITY_PROJECT_ID;
  if (!process.env.CLARITY_PROJECT_ID) {
    throw new Error('CLARITY_PROJECT_ID is not defined');
  }
  Clarity.init(projectId!);
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      {children}
      <SidebarButton onClick={toggleSidebar} />
      <SidebarWrapper isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </>
  )
} 