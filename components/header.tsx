"use client"

import Link from "next/link"
import { ThemeToggle } from "./theme-toggle"
import type { ReactNode } from "react"

interface HeaderProps {
  rightContent?: ReactNode
}

export function Header({ rightContent }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
            PP
          </div>
          <span className="font-semibold text-lg">Planning Poker</span>
        </Link>
        <div className="flex items-center gap-2">
          {rightContent}
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
