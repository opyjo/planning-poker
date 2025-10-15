"use client"

import { useState } from "react"
import { Share2, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

interface ShareDialogProps {
  roomId: string
}

export function ShareDialog({ roomId }: ShareDialogProps) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()
  const roomUrl = typeof window !== "undefined" ? `${window.location.origin}/room/${roomId}` : ""

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(roomUrl)
      setCopied(true)
      toast({
        title: "Link copied",
        description: "Room link copied to clipboard",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("[v0] Failed to copy:", error)
      toast({
        title: "Failed to copy",
        description: "Could not copy link to clipboard",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" aria-label="Share room with team members">
          <Share2 className="h-4 w-4 mr-2" aria-hidden="true" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Room</DialogTitle>
          <DialogDescription>Share this room with your team members to start voting together</DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="link" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="link">Link</TabsTrigger>
            <TabsTrigger value="qr">QR Code</TabsTrigger>
          </TabsList>
          <TabsContent value="link" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="room-url">Room URL</Label>
              <div className="flex gap-2">
                <Input
                  id="room-url"
                  value={roomUrl}
                  readOnly
                  className="font-mono text-sm"
                  aria-label="Room URL for sharing"
                />
                <Button
                  onClick={handleCopy}
                  size="icon"
                  variant="secondary"
                  aria-label={copied ? "Link copied to clipboard" : "Copy room link to clipboard"}
                >
                  {copied ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="qr" className="flex flex-col items-center gap-4">
            <div className="p-4 bg-background border-2 border-border rounded-lg">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(roomUrl)}`}
                alt={`QR code for room ${roomId}. Scan to join the planning poker session.`}
                className="w-48 h-48"
              />
            </div>
            <p className="text-sm text-muted-foreground text-center">Scan this QR code to join the room</p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
