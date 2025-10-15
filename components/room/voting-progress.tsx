import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface VotingProgressProps {
  votedCount: number
  totalVoters: number
}

export function VotingProgress({ votedCount, totalVoters }: VotingProgressProps) {
  const percentage = totalVoters > 0 ? (votedCount / totalVoters) * 100 : 0

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Voting Progress</span>
            <span className="text-muted-foreground">
              {votedCount} of {totalVoters} voted
            </span>
          </div>
          <Progress value={percentage} className="h-2" />
        </div>
      </CardContent>
    </Card>
  )
}
