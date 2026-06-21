"use client"

import { useRef, useEffect, useState } from "react"
import { User, Eye, CheckCircle2 } from "lucide-react"
import type { Participant } from "@/lib/types"
import { cn } from "@/lib/utils"

interface ParticipantCardProps {
  participant: Participant
  showVote?: boolean
}

export function ParticipantCard({ participant, showVote }: ParticipantCardProps) {
  const hasVoted = participant.vote !== undefined
  const prevHasVotedRef = useRef(hasVoted)
  const [highlight, setHighlight] = useState(false)

  useEffect(() => {
    if (!prevHasVotedRef.current && hasVoted) {
      setHighlight(true)
      const timer = setTimeout(() => setHighlight(false), 1000)
      return () => clearTimeout(timer)
    }
    prevHasVotedRef.current = hasVoted
  }, [hasVoted])

  const confidenceColors = {
    low: "bg-red-500",
    medium: "bg-yellow-500",
    high: "bg-green-500",
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between p-3 rounded-lg border border-border bg-card transition-all duration-300",
        highlight && "ring-2 ring-primary/50 bg-primary/5",
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
          {participant.isSpectator ? <Eye className="h-4 w-4" /> : <User className="h-4 w-4" />}
        </div>
        <div>
          <p className="font-medium text-sm">{participant.name}</p>
          <p className="text-xs text-muted-foreground">{participant.isSpectator ? "Spectator" : "Voter"}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {!participant.isSpectator && (
          <>
            {showVote && participant.vote ? (
              <div className="flex items-center gap-2">
                {participant.confidence && (
                  <div
                    className={cn("h-2 w-2 rounded-full", confidenceColors[participant.confidence])}
                    title={`${participant.confidence} confidence`}
                  />
                )}
                <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground font-bold text-sm">
                  {participant.vote}
                </div>
              </div>
            ) : hasVoted ? (
              <CheckCircle2
                className={cn(
                  "h-5 w-5 text-primary transition-transform duration-300",
                  highlight && "scale-125",
                )}
              />
            ) : (
              <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
            )}
          </>
        )}
      </div>
    </div>
  )
}
