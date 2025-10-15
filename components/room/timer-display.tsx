"use client"

import { useEffect, useState } from "react"
import { Timer } from "lucide-react"
import { cn } from "@/lib/utils"

interface TimerDisplayProps {
  duration: number
  isActive: boolean
  onComplete?: () => void
}

export function TimerDisplay({ duration, isActive, onComplete }: TimerDisplayProps) {
  const [timeLeft, setTimeLeft] = useState(duration)

  useEffect(() => {
    if (!isActive) {
      setTimeLeft(duration)
      return
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          onComplete?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isActive, duration, onComplete])

  const percentage = (timeLeft / duration) * 100
  const isLow = percentage < 25

  return (
    <div className="flex items-center gap-3">
      <Timer className={cn("h-5 w-5", isLow && isActive && "text-destructive")} />
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium">Time Remaining</span>
          <span className={cn("text-sm font-mono font-bold", isLow && isActive && "text-destructive")}>
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-1000 ease-linear rounded-full",
              isLow && isActive ? "bg-destructive" : "bg-primary",
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  )
}
