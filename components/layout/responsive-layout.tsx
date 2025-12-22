"use client"

import React from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"

interface ResponsiveLayoutProps {
  children: React.ReactNode
}

export function ResponsiveLayout({ children }: ResponsiveLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true) // Default open on desktop
  const [isMobile, setIsMobile] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const isLoginPage = pathname === "/login"

  React.useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      if (mobile) {
        setSidebarOpen(false) // Close sidebar on mobile by default
      }
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Auth check
  React.useEffect(() => {
    const storedUser = localStorage.getItem("tfm_auth_user")
    if (!storedUser && !isLoginPage) {
      router.push("/login")
    }
  }, [isLoginPage, router])

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

  if (isLoginPage) {
    return <main className="min-h-screen bg-background">{children}</main>
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isMobile={isMobile} />
      <div
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${sidebarOpen && !isMobile ? "ml-64" : "ml-0"
          }`}
      >
        <Header onMenuClick={toggleSidebar} />
        <main className="flex-1 overflow-auto p-4 lg:p-6 customScrollbarWidth">{children}</main>
      </div>
    </div>
  )
}
