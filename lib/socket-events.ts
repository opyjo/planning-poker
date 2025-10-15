export type SocketEvent =
  | { type: "user-joined"; payload: { id: string; name: string; isSpectator: boolean } }
  | { type: "user-left"; payload: { id: string } }
  | { type: "vote-cast"; payload: { userId: string; vote: string; confidence?: string } }
  | { type: "votes-revealed"; payload: { revealed: boolean } }
  | { type: "new-round"; payload: Record<string, never> }
  | { type: "timer-started"; payload: { duration: number } }
  | { type: "timer-stopped"; payload: Record<string, never> }
  | { type: "name-changed"; payload: { userId: string; name: string } }
  | { type: "story-updated"; payload: { story: string } }

export interface RoomState {
  participants: Array<{ id: string; name: string; isSpectator: boolean; vote?: string }>
  votesRevealed: boolean
  timerActive: boolean
}
