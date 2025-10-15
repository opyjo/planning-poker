import type { LucideIcon } from "lucide-react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface FeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
}

export function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader>
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
          <Icon className="h-6 w-6" />
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className="text-base leading-relaxed">{description}</CardDescription>
      </CardHeader>
    </Card>
  )
}
