"use client"

import * as React from "react"
import { getUserName, setUserName as saveUserName } from "@/lib/storage"

type UserProviderState = {
  userName: string | null
  setUserName: (name: string) => void
}

const UserProviderContext = React.createContext<UserProviderState | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userName, setUserNameState] = React.useState<string | null>(null)

  React.useEffect(() => {
    setUserNameState(getUserName())
  }, [])

  const setUserName = (name: string) => {
    saveUserName(name)
    setUserNameState(name)
  }

  return <UserProviderContext.Provider value={{ userName, setUserName }}>{children}</UserProviderContext.Provider>
}

export const useUser = () => {
  const context = React.useContext(UserProviderContext)
  if (context === undefined) throw new Error("useUser must be used within a UserProvider")
  return context
}
