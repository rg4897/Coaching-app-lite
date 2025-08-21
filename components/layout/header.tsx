"use client"

import { useLiveData } from "@/hooks/use-live-data"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

interface HeaderProps {
  onMenuClick?: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { settings } = useLiveData()

  return (
    <header className="h-16 border-b bg-background flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </Button>
      </div>
      <div className="flex items-center space-x-4">
        {/* <span className="text-sm text-muted-foreground">Admin Portal</span> */}
      </div>
    </header>
  )
}
