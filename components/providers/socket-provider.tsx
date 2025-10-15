"use client"

import * as React from "react"
import type { SocketEvent, RoomState } from "@/lib/socket-events"

type SocketProviderState = {
  roomState: RoomState | null
  sendEvent: (roomId: string, event: SocketEvent) => Promise<void>
  joinRoom: (roomId: string) => Promise<void>
  leaveRoom: () => void
}

const SocketProviderContext = React.createContext<SocketProviderState | undefined>(undefined)

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [roomState, setRoomState] = React.useState<RoomState | null>(null)
  const [currentRoomId, setCurrentRoomId] = React.useState<string | null>(null)
  const pollingIntervalRef = React.useRef<NodeJS.Timeout | null>(null)

  const pollRoomState = React.useCallback(async (roomId: string) => {
    try {
      const response = await fetch(`/api/socket?roomId=${roomId}`)
      const data = await response.json()
      setRoomState(data)
    } catch (error) {
      console.error("[v0] Failed to poll room state:", error)
    }
  }, [])

  const joinRoom = React.useCallback(
    async (roomId: string) => {
      try {
        const response = await fetch(`/api/socket?roomId=${roomId}`)
        const data = await response.json()
        setRoomState(data)
        setCurrentRoomId(roomId)

        // Start polling for updates
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current)
        }
        pollingIntervalRef.current = setInterval(() => {
          pollRoomState(roomId)
        }, 1000) // Poll every 1 second
      } catch (error) {
        console.error("[v0] Failed to join room:", error)
      }
    },
    [pollRoomState],
  )

  const leaveRoom = React.useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
    setCurrentRoomId(null)
    setRoomState(null)
  }, [])

  React.useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [])

  const sendEvent = async (roomId: string, event: SocketEvent) => {
    try {
      const response = await fetch("/api/socket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, event }),
      })
      const data = await response.json()
      if (data.room) {
        setRoomState(data.room)
      }
      await pollRoomState(roomId)
    } catch (error) {
      console.error("[v0] Failed to send event:", error)
    }
  }

  return (
    <SocketProviderContext.Provider value={{ roomState, sendEvent, joinRoom, leaveRoom }}>
      {children}
    </SocketProviderContext.Provider>
  )
}

export const useSocket = () => {
  const context = React.useContext(SocketProviderContext)
  if (context === undefined) throw new Error("useSocket must be used within a SocketProvider")
  return context
}
