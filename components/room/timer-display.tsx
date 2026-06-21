"use client"

import { useEffect, useState, useRef } from "react"
import { Timer } from "lucide-react"
import { cn } from "@/lib/utils"

interface TimerDisplayProps {
  duration: number
  isActive: boolean
  startedAt?: number
  onComplete?: () => void
}

export function TimerDisplay({ duration, isActive, startedAt, onComplete }: TimerDisplayProps) {
  const [timeLeft, setTimeLeft] = useState(duration)
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    if (!isActive) {
      setTimeLeft(duration)
      return
    }

    const calculateTimeLeft = () => {
      if (startedAt) {
        const elapsed = Math.floor((Date.now() - startedAt) / 1000)
        return Math.max(0, duration - elapsed)
      }
      return duration
    }

    setTimeLeft(calculateTimeLeft())

    const interval = setInterval(() => {
      const remaining = calculateTimeLeft()
      setTimeLeft(remaining)
      if (remaining <= 0) {
        clearInterval(interval)
        onCompleteRef.current?.()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [isActive, duration, startedAt])

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
