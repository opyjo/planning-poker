export type DeckType = "fibonacci" | "tshirt" | "powers-of-2"

export type ConfidenceLevel = "low" | "medium" | "high"

export interface Room {
  id: string
  name: string
  deckType: DeckType
  timerDuration?: number
  createdAt: string
  settings?: RoomSettings
  moderatorId?: string
}

export interface Participant {
  id: string
  name: string
  vote?: string
  confidence?: ConfidenceLevel
  isSpectator: boolean
}

export interface VoteResult {
  participant: string
  vote: string
  confidence?: ConfidenceLevel
}

export interface RoomSettings {
  allowOthersToShowEstimates: boolean
  allowOthersToDeleteEstimates: boolean
  allowOthersToClearUsers: boolean
  showTimer: boolean
  showUserPresence: boolean
  showAverage: boolean
  showMedian: boolean
  autoReveal: boolean
}

export const DEFAULT_ROOM_SETTINGS: RoomSettings = {
  allowOthersToShowEstimates: true,
  allowOthersToDeleteEstimates: true,
  allowOthersToClearUsers: true,
  showTimer: false,
  showUserPresence: false,
  showAverage: false,
  showMedian: false,
  autoReveal: false,
}

export const DECK_OPTIONS: Record<DeckType, { label: string; values: string[] }> = {
  fibonacci: {
    label: "Fibonacci",
    values: ["0", "1", "2", "3", "5", "8", "13", "21", "34", "55", "89", "?"],
  },
  tshirt: {
    label: "T-Shirt Sizes",
    values: ["XS", "S", "M", "L", "XL", "XXL", "?"],
  },
  "powers-of-2": {
    label: "Powers of 2",
    values: ["0", "1", "2", "4", "8", "16", "32", "64", "?"],
  },
}

export interface RoomState {
  participants: Array<{ id: string; name: string; isSpectator: boolean; vote?: string; confidence?: string }>
  votesRevealed: boolean
  timerActive: boolean
  currentStory?: string
}

export function checkConsensus(votes: string[]): boolean {
  if (votes.length === 0) return false

  // Filter out non-numeric votes
  const numericVotes = votes.filter((v) => v !== "?" && !isNaN(Number(v))).map(Number)

  if (numericVotes.length === 0) {
    // For non-numeric votes, check if all are the same
    return votes.every((v) => v === votes[0])
  }

  // Check if all numeric votes are within 2 points of each other
  const min = Math.min(...numericVotes)
  const max = Math.max(...numericVotes)

  return max - min <= 2
}
