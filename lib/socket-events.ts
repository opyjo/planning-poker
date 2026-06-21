import type { ConfidenceLevel, RoomSettings, DeckType } from "./types"

export type { RoomState } from "./types"

export type SocketEvent =
  | {
      type: "user-joined"
      payload: { id: string; name: string; isSpectator: boolean }
    }
  | { type: "user-left"; payload: { id: string } }
  | {
      type: "vote-cast"
      payload: { userId: string; vote: string; confidence?: ConfidenceLevel }
    }
  | { type: "votes-revealed"; payload: { revealed: boolean } }
  | { type: "new-round"; payload: Record<string, never> }
  | { type: "timer-started"; payload: { duration: number } }
  | { type: "timer-stopped"; payload: Record<string, never> }
  | { type: "name-changed"; payload: { userId: string; name: string } }
  | { type: "story-updated"; payload: { story: string } }
  | {
      type: "settings-updated"
      payload: {
        settings: RoomSettings
        deckType: DeckType
        roomName: string
        timerDuration?: number
      }
    }
