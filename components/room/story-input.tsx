"use client"

import { useState } from "react"
import { Pencil, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

interface StoryInputProps {
  currentStory?: string
  onStoryUpdate: (story: string) => void
  canEdit: boolean
}

export function StoryInput({ currentStory = "", onStoryUpdate, canEdit }: StoryInputProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [storyValue, setStoryValue] = useState(currentStory)

  const handleSave = () => {
    onStoryUpdate(storyValue)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setStoryValue(currentStory)
    setIsEditing(false)
  }

  if (!canEdit && !currentStory) {
    return null
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-2">
          <label htmlFor="story-input" className="text-sm font-medium text-muted-foreground">
            Current Story/Task (Optional)
          </label>
          {isEditing ? (
            <div className="flex gap-2">
              <Input
                id="story-input"
                type="text"
                value={storyValue}
                onChange={(e) => setStoryValue(e.target.value)}
                placeholder="e.g., User Authentication Feature"
                className="flex-1"
                autoFocus
                aria-label="Enter story or task name"
              />
              <Button size="sm" onClick={handleSave} aria-label="Save story">
                <Check className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel} aria-label="Cancel editing">
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex-1 min-h-[40px] px-3 py-2 rounded-md border bg-muted/50 flex items-center">
                {currentStory ? (
                  <p className="text-sm font-medium">{currentStory}</p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No story set</p>
                )}
              </div>
              {canEdit && (
                <Button size="sm" variant="outline" onClick={() => setIsEditing(true)} aria-label="Edit story name">
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
