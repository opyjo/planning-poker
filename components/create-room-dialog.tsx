"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DECK_OPTIONS, type DeckType, type Room } from "@/lib/types"
import { addRecentRoom } from "@/lib/storage"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface CreateRoomDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateRoomDialog({ open, onOpenChange }: CreateRoomDialogProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedDeck, setSelectedDeck] = useState<DeckType>("fibonacci")
  const [roomName, setRoomName] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateRoom = async () => {
    setIsCreating(true)
    try {
      const roomId = Math.random().toString(36).substring(2, 9)
      const generatedName = roomName.trim() || `Planning Session ${roomId.substring(0, 5)}`

      const room: Room = {
        id: roomId,
        name: generatedName,
        deckType: selectedDeck,
        createdAt: new Date().toISOString(),
      }

      addRecentRoom(room)

      toast({
        title: "Room created",
        description: `${generatedName} is ready!`,
      })

      onOpenChange(false)
      router.push(`/room/${roomId}`)
    } catch (error) {
      console.error("[v0] Failed to create room:", error)
      toast({
        title: "Failed to create room",
        description: "Could not create the room. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Room</DialogTitle>
          <DialogDescription>Configure your planning poker session</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="room-name">Room Name (Optional)</Label>
            <Input
              id="room-name"
              placeholder="e.g., Sprint Planning Q1"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              aria-describedby="room-name-help"
              disabled={isCreating}
            />
            <p id="room-name-help" className="text-xs text-muted-foreground">
              Leave empty to use an automatic name
            </p>
          </div>

          <div className="space-y-3">
            <Label id="deck-type-label">Estimation Deck</Label>
            <div role="radiogroup" aria-labelledby="deck-type-label">
              {(Object.keys(DECK_OPTIONS) as DeckType[]).map((deckType) => {
                const deck = DECK_OPTIONS[deckType]
                const isSelected = selectedDeck === deckType

                return (
                  <button
                    key={deckType}
                    onClick={() => !isCreating && setSelectedDeck(deckType)}
                    role="radio"
                    aria-checked={isSelected}
                    aria-label={`${deck.label}: ${deck.values.join(", ")}`}
                    disabled={isCreating}
                    className={cn(
                      "w-full text-left p-4 rounded-lg border-2 transition-all hover:border-primary/50",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      isSelected ? "border-primary bg-primary/5" : "border-border bg-card",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="font-semibold mb-1">{deck.label}</div>
                        <div className="text-sm text-muted-foreground mb-2">{deck.values.join(", ")}</div>
                      </div>
                      {isSelected && (
                        <div className="flex-shrink-0">
                          <div
                            className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
                            aria-hidden="true"
                          >
                            <Check className="h-3 w-3" />
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isCreating}>
            Cancel
          </Button>
          <Button onClick={handleCreateRoom} aria-label="Create room and start session" disabled={isCreating}>
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                Creating...
              </>
            ) : (
              "Create Room"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
