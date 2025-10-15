"use client"

import { useState } from "react"
import { Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { DECK_OPTIONS, type DeckType, type RoomSettings, DEFAULT_ROOM_SETTINGS } from "@/lib/types"

interface RoomSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentDeckType: DeckType
  currentTimerDuration?: number
  currentRoomName: string
  currentSettings?: RoomSettings
  onSave: (deckType: DeckType, timerDuration: number | undefined, roomName: string, settings: RoomSettings) => void
}

export function RoomSettingsDialog({
  open,
  onOpenChange,
  currentDeckType,
  currentTimerDuration,
  currentRoomName,
  currentSettings = DEFAULT_ROOM_SETTINGS,
  onSave,
}: RoomSettingsDialogProps) {
  const [deckType, setDeckType] = useState<DeckType>(currentDeckType)
  const [enableTimer, setEnableTimer] = useState(!!currentTimerDuration)
  const [timerDuration, setTimerDuration] = useState(currentTimerDuration || 60)
  const [roomName, setRoomName] = useState(currentRoomName)
  const [settings, setSettings] = useState<RoomSettings>(currentSettings)

  const handleSave = () => {
    onSave(deckType, enableTimer ? timerDuration : undefined, roomName, settings)
  }

  const updateSetting = (key: keyof RoomSettings, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Room Settings
          </DialogTitle>
          <DialogDescription>Configure your planning poker room settings</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Room Name */}
          <div className="space-y-2">
            <Label htmlFor="room-name">Room Name</Label>
            <Input
              id="room-name"
              placeholder="Sprint Planning - User Stories"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="text-base"
            />
          </div>

          {/* Deck Type */}
          <div className="space-y-3">
            <Label>Estimation Deck</Label>
            <RadioGroup value={deckType} onValueChange={(value) => setDeckType(value as DeckType)}>
              {Object.entries(DECK_OPTIONS).map(([key, { label, values }]) => (
                <div key={key} className="flex items-start space-x-3 space-y-0">
                  <RadioGroupItem value={key} id={`settings-${key}`} className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor={`settings-${key}`} className="font-medium cursor-pointer">
                      {label}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">{values.join(", ")}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Timer Settings */}
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enable-timer-settings" className="text-base">
                  Enable Voting Timer
                </Label>
                <p className="text-sm text-muted-foreground">Set a time limit for each voting round</p>
              </div>
              <Switch id="enable-timer-settings" checked={enableTimer} onCheckedChange={setEnableTimer} />
            </div>

            {enableTimer && (
              <div className="space-y-2 pl-0 animate-in fade-in slide-in-from-top-2 duration-200">
                <Label htmlFor="timer-duration-settings">Timer Duration (seconds)</Label>
                <Input
                  id="timer-duration-settings"
                  type="number"
                  min="10"
                  max="300"
                  value={timerDuration}
                  onChange={(e) => setTimerDuration(Number.parseInt(e.target.value) || 60)}
                  className="text-base"
                />
                <p className="text-sm text-muted-foreground">Recommended: 30-120 seconds per voting round</p>
              </div>
            )}
          </div>

          <div className="space-y-4 pt-4 border-t border-border">
            <div>
              <h3 className="text-base font-semibold mb-1">Permissions</h3>
              <p className="text-sm text-muted-foreground">Control what other participants can do</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="allow-show-estimates" className="text-sm font-medium">
                    Allow others to show estimates
                  </Label>
                  <p className="text-xs text-muted-foreground">Let any participant reveal votes</p>
                </div>
                <Switch
                  id="allow-show-estimates"
                  checked={settings.allowOthersToShowEstimates}
                  onCheckedChange={(checked) => updateSetting("allowOthersToShowEstimates", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="allow-delete-estimates" className="text-sm font-medium">
                    Allow others to delete estimates
                  </Label>
                  <p className="text-xs text-muted-foreground">Let any participant start a new round</p>
                </div>
                <Switch
                  id="allow-delete-estimates"
                  checked={settings.allowOthersToDeleteEstimates}
                  onCheckedChange={(checked) => updateSetting("allowOthersToDeleteEstimates", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="allow-clear-users" className="text-sm font-medium">
                    Allow others to clear users
                  </Label>
                  <p className="text-xs text-muted-foreground">Let any participant remove inactive users</p>
                </div>
                <Switch
                  id="allow-clear-users"
                  checked={settings.allowOthersToClearUsers}
                  onCheckedChange={(checked) => updateSetting("allowOthersToClearUsers", checked)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-border">
            <div>
              <h3 className="text-base font-semibold mb-1">Display Options</h3>
              <p className="text-sm text-muted-foreground">Choose what information to show</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-reveal" className="text-sm font-medium">
                    Auto-reveal votes
                  </Label>
                  <p className="text-xs text-muted-foreground">Automatically reveal when all participants have voted</p>
                </div>
                <Switch
                  id="auto-reveal"
                  checked={settings.autoReveal}
                  onCheckedChange={(checked) => updateSetting("autoReveal", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-timer" className="text-sm font-medium">
                    Show timer
                  </Label>
                  <p className="text-xs text-muted-foreground">Display countdown timer during voting</p>
                </div>
                <Switch
                  id="show-timer"
                  checked={settings.showTimer}
                  onCheckedChange={(checked) => updateSetting("showTimer", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-user-presence" className="text-sm font-medium">
                    Show user presence
                  </Label>
                  <p className="text-xs text-muted-foreground">Display online/offline status indicators</p>
                </div>
                <Switch
                  id="show-user-presence"
                  checked={settings.showUserPresence}
                  onCheckedChange={(checked) => updateSetting("showUserPresence", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-average" className="text-sm font-medium">
                    Show average
                  </Label>
                  <p className="text-xs text-muted-foreground">Display average estimate in results</p>
                </div>
                <Switch
                  id="show-average"
                  checked={settings.showAverage}
                  onCheckedChange={(checked) => updateSetting("showAverage", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-median" className="text-sm font-medium">
                    Show median
                  </Label>
                  <p className="text-xs text-muted-foreground">Display median estimate in results</p>
                </div>
                <Switch
                  id="show-median"
                  checked={settings.showMedian}
                  onCheckedChange={(checked) => updateSetting("showMedian", checked)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Settings</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
