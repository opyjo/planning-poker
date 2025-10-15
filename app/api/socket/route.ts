import type { NextRequest } from "next/server"

// In-memory storage for room states (in production, use a database or Redis)
const rooms = new Map<string, any>()

export async function GET(request: NextRequest) {
  const roomId = request.nextUrl.searchParams.get("roomId")

  if (!roomId) {
    return Response.json({ error: "Room ID required" }, { status: 400 })
  }

  const room = rooms.get(roomId) || {
    participants: [],
    votesRevealed: false,
    timerActive: false,
  }

  return Response.json(room)
}

export async function POST(request: NextRequest) {
  const { roomId, event } = await request.json()

  if (!roomId || !event) {
    return Response.json({ error: "Room ID and event required" }, { status: 400 })
  }

  const room = rooms.get(roomId) || {
    participants: [],
    votesRevealed: false,
    timerActive: false,
  }

  // Handle different event types
  switch (event.type) {
    case "user-joined":
      const existingParticipant = room.participants.find((p: any) => p.id === event.payload.id)
      if (!existingParticipant) {
        room.participants.push(event.payload)
      }
      break
    case "user-left":
      room.participants = room.participants.filter((p: any) => p.id !== event.payload.id)
      break
    case "vote-cast":
      room.participants = room.participants.map((p: any) =>
        p.id === event.payload.userId ? { ...p, vote: event.payload.vote, confidence: event.payload.confidence } : p,
      )
      break
    case "votes-revealed":
      room.votesRevealed = event.payload.revealed
      room.timerActive = false
      break
    case "new-round":
      room.participants = room.participants.map((p: any) => ({ ...p, vote: undefined, confidence: undefined }))
      room.votesRevealed = false
      break
    case "timer-started":
      room.timerActive = true
      break
    case "timer-stopped":
      room.timerActive = false
      break
    case "name-changed":
      room.participants = room.participants.map((p: any) =>
        p.id === event.payload.userId ? { ...p, name: event.payload.name } : p,
      )
      break
    case "story-updated":
      room.currentStory = event.payload.story
      break
    default:
      console.warn(`[v0] Unknown event type: ${event.type}`)
  }

  rooms.set(roomId, room)

  return Response.json({ success: true, room })
}
