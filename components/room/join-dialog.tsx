"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Loader2 } from "lucide-react"

interface JoinDialogProps {
  open: boolean
  onJoin: (name: string, isSpectator: boolean) => void
  isLoading?: boolean
}

export function JoinDialog({ open, onJoin, isLoading = false }: JoinDialogProps) {
  const [name, setName] = useState("")
  const [isSpectator, setIsSpectator] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim() && !isLoading) {
      onJoin(name.trim(), isSpectator)
    }
  }

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Join Planning Poker Room</DialogTitle>
          <DialogDescription>Enter your name to join the session</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              className="text-base"
              disabled={isLoading}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="spectator" className="text-base">
                Join as Spectator
              </Label>
              <p className="text-sm text-muted-foreground">Watch without voting</p>
            </div>
            <Switch id="spectator" checked={isSpectator} onCheckedChange={setIsSpectator} disabled={isLoading} />
          </div>
          <Button type="submit" className="w-full" disabled={!name.trim() || isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                Joining...
              </>
            ) : (
              "Join Room"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
