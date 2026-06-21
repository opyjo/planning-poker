"use client"

import * as React from "react"
import type { SocketEvent, RoomState } from "@/lib/socket-events"

type ConnectionStatus = "connected" | "disconnected"

type SocketProviderState = {
  roomState: RoomState | null
  sendEvent: (roomId: string, event: SocketEvent) => Promise<void>
  joinRoom: (roomId: string) => Promise<void>
  leaveRoom: () => void
  connectionStatus: ConnectionStatus
}

const SocketProviderContext = React.createContext<SocketProviderState | undefined>(undefined)

const ACTIVE_INTERVAL = 1000
const IDLE_INTERVAL = 3000
const IDLE_THRESHOLD = 10000 // 10s of no sendEvent calls
const MAX_FAILURES = 3

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [roomState, setRoomState] = React.useState<RoomState | null>(null)
  const [currentRoomId, setCurrentRoomId] = React.useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = React.useState<ConnectionStatus>("connected")

  const pollingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)
  const lastEventTimeRef = React.useRef<number>(Date.now())
  const failureCountRef = React.useRef<number>(0)
  const isPollingRef = React.useRef<boolean>(false)

  const getInterval = React.useCallback(() => {
    const elapsed = Date.now() - lastEventTimeRef.current
    return elapsed > IDLE_THRESHOLD ? IDLE_INTERVAL : ACTIVE_INTERVAL
  }, [])

  const scheduleNextPoll = React.useCallback((roomId: string) => {
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current)
    }
    pollingTimeoutRef.current = setTimeout(() => {
      pollRoomState(roomId)
    }, getInterval())
  }, [getInterval])

  const pollRoomState = React.useCallback(async (roomId: string) => {
    if (isPollingRef.current) {
      scheduleNextPoll(roomId)
      return
    }
    isPollingRef.current = true
    try {
      const response = await fetch(`/api/socket?roomId=${roomId}`)
      const data = await response.json()
      setRoomState(data)
      failureCountRef.current = 0
      setConnectionStatus("connected")
    } catch (error) {
      console.error("Failed to poll room state:", error)
      failureCountRef.current += 1
      if (failureCountRef.current >= MAX_FAILURES) {
        setConnectionStatus("disconnected")
      }
    } finally {
      isPollingRef.current = false
      scheduleNextPoll(roomId)
    }
  }, [scheduleNextPoll])

  const stopPolling = React.useCallback(() => {
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current)
      pollingTimeoutRef.current = null
    }
  }, [])

  const joinRoom = React.useCallback(
    async (roomId: string) => {
      try {
        const response = await fetch(`/api/socket?roomId=${roomId}`)
        const data = await response.json()
        setRoomState(data)
        setCurrentRoomId(roomId)
        failureCountRef.current = 0
        setConnectionStatus("connected")

        // Start adaptive polling
        stopPolling()
        scheduleNextPoll(roomId)
      } catch (error) {
        console.error("Failed to join room:", error)
        failureCountRef.current += 1
        if (failureCountRef.current >= MAX_FAILURES) {
          setConnectionStatus("disconnected")
        }
      }
    },
    [stopPolling, scheduleNextPoll],
  )

  const leaveRoom = React.useCallback(() => {
    stopPolling()
    setCurrentRoomId(null)
    setRoomState(null)
    failureCountRef.current = 0
    setConnectionStatus("connected")
  }, [stopPolling])

  React.useEffect(() => {
    return () => {
      stopPolling()
    }
  }, [stopPolling])

  const sendEvent = React.useCallback(async (roomId: string, event: SocketEvent) => {
    lastEventTimeRef.current = Date.now()
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
      failureCountRef.current = 0
      setConnectionStatus("connected")
    } catch (error) {
      console.error("Failed to send event:", error)
      failureCountRef.current += 1
      if (failureCountRef.current >= MAX_FAILURES) {
        setConnectionStatus("disconnected")
      }
    }
  }, [])

  return (
    <SocketProviderContext.Provider value={{ roomState, sendEvent, joinRoom, leaveRoom, connectionStatus }}>
      {children}
    </SocketProviderContext.Provider>
  )
}

export const useSocket = () => {
  const context = React.useContext(SocketProviderContext)
  if (context === undefined) throw new Error("useSocket must be used within a SocketProvider")
  return context
}
