"use client"

import { useState } from "react"
import { LogOut, Edit } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface UserMenuProps {
  userName: string
  onNameChange: (newName: string) => void
  onLeaveRoom: () => void
}

export function UserMenu({ userName, onNameChange, onLeaveRoom }: UserMenuProps) {
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [newName, setNewName] = useState(userName)

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const handleSaveName = () => {
    if (newName.trim()) {
      onNameChange(newName.trim())
      setShowEditDialog(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full" aria-label={`User menu for ${userName}`}>
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold" aria-label={userName}>
                {getInitials(userName)}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{userName}</p>
              <p className="text-xs leading-none text-muted-foreground">Participant</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
            <Edit className="mr-2 h-4 w-4" aria-hidden="true" />
            <span>Change Name</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onLeaveRoom} className="text-destructive focus:text-destructive">
            <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
            <span>Leave Room</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Your Name</DialogTitle>
            <DialogDescription>Update your display name for this session.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Enter your name"
                aria-label="Enter your new display name"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSaveName()
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveName} disabled={!newName.trim()}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
