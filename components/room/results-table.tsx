import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2 } from "lucide-react"
import type { VoteResult } from "@/lib/types"
import { checkConsensus } from "@/lib/types"

interface ResultsTableProps {
  results: VoteResult[]
  showAverage?: boolean
  showMedian?: boolean
}

export function ResultsTable({ results, showAverage = true, showMedian = false }: ResultsTableProps) {
  if (results.length === 0) {
    return null
  }

  const votes = results.map((r) => r.vote).filter((v) => v !== "?")
  const numericVotes = votes.map((v) => Number.parseFloat(v)).filter((v) => !Number.isNaN(v))

  const average = numericVotes.length > 0 ? numericVotes.reduce((sum, v) => sum + v, 0) / numericVotes.length : 0

  const median =
    numericVotes.length > 0
      ? (() => {
          const sorted = [...numericVotes].sort((a, b) => a - b)
          const mid = Math.floor(sorted.length / 2)
          return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
        })()
      : 0

  const hasConsensus = checkConsensus(results.map((r) => r.vote))

  const voteCounts = results.reduce(
    (acc, r) => {
      acc[r.vote] = (acc[r.vote] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const confidenceCounts = results.reduce(
    (acc, r) => {
      if (r.confidence) {
        acc[r.confidence] = (acc[r.confidence] || 0) + 1
      }
      return acc
    },
    {} as Record<string, number>,
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Voting Results</CardTitle>
            <CardDescription>Summary of all votes cast in this round</CardDescription>
          </div>
          {hasConsensus && (
            <Badge variant="default" className="bg-green-600 hover:bg-green-700">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Consensus Reached
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {(showAverage || showMedian) && numericVotes.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {showAverage && (
              <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10 border border-primary/20">
                <span className="font-medium text-sm">Average</span>
                <span className="text-2xl font-bold text-primary">{average.toFixed(1)}</span>
              </div>
            )}
            {showMedian && (
              <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10 border border-primary/20">
                <span className="font-medium text-sm">Median</span>
                <span className="text-2xl font-bold text-primary">{median.toFixed(1)}</span>
              </div>
            )}
          </div>
        )}

        {Object.keys(confidenceCounts).length > 0 && (
          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <h4 className="font-medium text-sm mb-2">Confidence Levels</h4>
            <div className="flex gap-3 text-xs">
              {confidenceCounts.high && (
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span>High: {confidenceCounts.high}</span>
                </div>
              )}
              {confidenceCounts.medium && (
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-yellow-500" />
                  <span>Medium: {confidenceCounts.medium}</span>
                </div>
              )}
              {confidenceCounts.low && (
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  <span>Low: {confidenceCounts.low}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <h4 className="font-medium text-sm text-muted-foreground">Vote Distribution</h4>
          {Object.entries(voteCounts)
            .sort(([a], [b]) => {
              if (a === "?") return 1
              if (b === "?") return -1
              return (Number.parseFloat(a) || 0) - (Number.parseFloat(b) || 0)
            })
            .map(([vote, count]) => (
              <div key={vote} className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 text-primary font-bold text-sm">
                    {vote}
                  </div>
                  <span className="font-medium">{count} vote(s)</span>
                </div>
                <div className="h-2 flex-1 max-w-[200px] mx-4 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${(count / results.length) * 100}%` }}
                  />
                </div>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  )
}
