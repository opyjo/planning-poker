"use client"

import type { Room } from "./types"

const RECENT_ROOMS_KEY = "planning-poker-recent-rooms"
const USER_NAME_KEY = "planning-poker-user-name"

export function getRecentRooms(): Room[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(RECENT_ROOMS_KEY)
  return stored ? JSON.parse(stored) : []
}

export function addRecentRoom(room: Room) {
  const rooms = getRecentRooms()
  const filtered = rooms.filter((r) => r.id !== room.id)
  const updated = [room, ...filtered].slice(0, 5)
  localStorage.setItem(RECENT_ROOMS_KEY, JSON.stringify(updated))
}

export function updateRecentRoom(roomId: string, updates: Partial<Room>) {
  const rooms = getRecentRooms()
  const updated = rooms.map((r) => (r.id === roomId ? { ...r, ...updates } : r))
  localStorage.setItem(RECENT_ROOMS_KEY, JSON.stringify(updated))
}

export function getUserName(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(USER_NAME_KEY)
}

export function setUserName(name: string) {
  localStorage.setItem(USER_NAME_KEY, name)
}
