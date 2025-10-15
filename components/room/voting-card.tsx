"use client"

import { cn } from "@/lib/utils"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { ConfidenceLevel } from "@/lib/types"

interface VotingCardProps {
  value: string
  selected: boolean
  onSelect: (confidence?: ConfidenceLevel) => void
  disabled?: boolean
}

export function VotingCard({ value, selected, onSelect, disabled }: VotingCardProps) {
  const [showConfidence, setShowConfidence] = useState(false)

  const handleVoteWithConfidence = (confidence: ConfidenceLevel) => {
    onSelect(confidence)
    setShowConfidence(false)
  }

  return (
    <Popover open={showConfidence && !disabled} onOpenChange={setShowConfidence}>
      <PopoverTrigger asChild>
        <button
          onClick={() => !disabled && setShowConfidence(true)}
          disabled={disabled}
          aria-label={`Vote ${value}${selected ? " - currently selected" : ""}`}
          aria-pressed={selected}
          aria-disabled={disabled}
          className={cn(
            "relative flex items-center justify-center rounded-lg border-2 transition-all duration-200",
            "h-24 w-16 text-2xl font-bold",
            "hover:scale-105 active:scale-95",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            selected
              ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/25"
              : "border-border bg-card hover:border-primary/50 hover:bg-accent",
          )}
        >
          {value}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2">
        <div className="space-y-1" role="menu" aria-label="Select confidence level">
          <p className="text-xs font-medium text-muted-foreground mb-2">Select confidence level:</p>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-50"
            onClick={() => handleVoteWithConfidence("low")}
            role="menuitem"
            aria-label="Low confidence"
          >
            Low Confidence
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-yellow-600 hover:text-yellow-600 hover:bg-yellow-50"
            onClick={() => handleVoteWithConfidence("medium")}
            role="menuitem"
            aria-label="Medium confidence"
          >
            Medium Confidence
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-green-600 hover:text-green-600 hover:bg-green-50"
            onClick={() => handleVoteWithConfidence("high")}
            role="menuitem"
            aria-label="High confidence"
          >
            High Confidence
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
