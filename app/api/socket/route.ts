import type { NextRequest } from "next/server"
import { DEFAULT_ROOM_SETTINGS, type RoomState } from "@/lib/types"

// In-memory storage for room states (in production, use a database or Redis)
const rooms = new Map<string, RoomState>()

// Clean up rooms inactive for more than 24 hours
const ROOM_TTL = 24 * 60 * 60 * 1000

function cleanupRooms() {
  const now = Date.now()
  for (const [id, room] of rooms) {
    if (now - room.lastActivity > ROOM_TTL) {
      rooms.delete(id)
    }
  }
}

function getOrCreateRoom(roomId: string): RoomState {
  let room = rooms.get(roomId)
  if (!room) {
    room = {
      participants: [],
      votesRevealed: false,
      timerActive: false,
      settings: { ...DEFAULT_ROOM_SETTINGS },
      deckType: "fibonacci",
      roomName: "Planning Poker Session",
      lastActivity: Date.now(),
    }
    rooms.set(roomId, room)
  }
  return room
}

export async function GET(request: NextRequest) {
  const roomId = request.nextUrl.searchParams.get("roomId")

  if (!roomId) {
    return Response.json({ error: "Room ID required" }, { status: 400 })
  }

  // Run cleanup periodically on reads
  cleanupRooms()

  const room = getOrCreateRoom(roomId)
  return Response.json(room)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { roomId, event } = body

  if (!roomId || !event || !event.type) {
    return Response.json({ error: "Room ID and event required" }, { status: 400 })
  }

  const room = getOrCreateRoom(roomId)
  room.lastActivity = Date.now()

  switch (event.type) {
    case "user-joined": {
      if (!event.payload?.id || !event.payload?.name) {
        return Response.json({ error: "Invalid user-joined payload" }, { status: 400 })
      }
      const existingParticipant = room.participants.find((p) => p.id === event.payload.id)
      if (!existingParticipant) {
        room.participants.push({
          id: event.payload.id,
          name: event.payload.name,
          isSpectator: !!event.payload.isSpectator,
        })
      }
      // Assign moderator if none exists or current moderator is no longer in the room
      if (!room.moderatorId || !room.participants.find((p) => p.id === room.moderatorId)) {
        room.moderatorId = room.participants[0]?.id
      }
      break
    }
    case "user-left": {
      if (!event.payload?.id) {
        return Response.json({ error: "Invalid user-left payload" }, { status: 400 })
      }
      const leavingId = event.payload.id
      room.participants = room.participants.filter((p) => p.id !== leavingId)
      // Reassign moderator if the moderator left
      if (room.moderatorId === leavingId) {
        room.moderatorId = room.participants[0]?.id
      }
      break
    }
    case "vote-cast": {
      if (!event.payload?.userId || event.payload?.vote === undefined) {
        return Response.json({ error: "Invalid vote-cast payload" }, { status: 400 })
      }
      room.participants = room.participants.map((p) =>
        p.id === event.payload.userId
          ? { ...p, vote: event.payload.vote, confidence: event.payload.confidence }
          : p,
      )
      break
    }
    case "votes-revealed":
      room.votesRevealed = !!event.payload?.revealed
      room.timerActive = false
      room.timerStartedAt = undefined
      break
    case "new-round":
      room.participants = room.participants.map((p) => ({
        ...p,
        vote: undefined,
        confidence: undefined,
      }))
      room.votesRevealed = false
      break
    case "timer-started":
      if (event.payload?.duration && typeof event.payload.duration === "number") {
        room.timerActive = true
        room.timerDuration = event.payload.duration
        room.timerStartedAt = Date.now()
      }
      break
    case "timer-stopped":
      room.timerActive = false
      room.timerStartedAt = undefined
      break
    case "name-changed":
      if (event.payload?.userId && event.payload?.name) {
        room.participants = room.participants.map((p) =>
          p.id === event.payload.userId ? { ...p, name: event.payload.name } : p,
        )
      }
      break
    case "story-updated":
      room.currentStory = event.payload?.story
      break
    case "settings-updated":
      if (event.payload?.settings) {
        room.settings = event.payload.settings
      }
      if (event.payload?.deckType) {
        room.deckType = event.payload.deckType
      }
      if (event.payload?.roomName) {
        room.roomName = event.payload.roomName
      }
      if (event.payload?.timerDuration !== undefined) {
        room.timerDuration = event.payload.timerDuration || undefined
      }
      break
    default:
      console.warn(`Unknown event type: ${event.type}`)
  }

  rooms.set(roomId, room)

  return Response.json({ success: true, room })
}
