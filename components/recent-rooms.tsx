"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Clock, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getRecentRooms } from "@/lib/storage"
import type { Room } from "@/lib/types"
import { DECK_OPTIONS } from "@/lib/types"

export function RecentRooms() {
  const [rooms, setRooms] = useState<Room[]>([])

  useEffect(() => {
    setRooms(getRecentRooms())
  }, [])

  if (rooms.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Rooms</CardTitle>
        <CardDescription>Quick access to your recently visited rooms</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {rooms.map((room) => (
            <Link key={room.id} href={`/room/${room.id}`}>
              <div className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                <div className="flex-1">
                  <h3 className="font-medium">{room.name}</h3>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {DECK_OPTIONS[room.deckType].label}
                    </span>
                    {room.timerDuration && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {room.timerDuration}s
                      </span>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  Join
                </Button>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
