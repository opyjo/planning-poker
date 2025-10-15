"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Timer, Users, BarChart3, Share2, Zap, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { FeatureCard } from "@/components/feature-card"
import { RecentRooms } from "@/components/recent-rooms"
import { CreateRoomDialog } from "@/components/create-room-dialog"
import { addRecentRoom } from "@/lib/storage"
import type { Room } from "@/lib/types"

export default function HomePage() {
  const router = useRouter()
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const handleCreateRoom = (roomId: string, deckType: string) => {
    const room: Room = {
      id: roomId,
      name: "Planning Poker Session",
      deckType: deckType,
      createdAt: new Date().toISOString(),
    }

    addRecentRoom(room)
    router.push(`/room/${roomId}`)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
      >
        Skip to main content
      </a>
      <Header />

      <main id="main-content" role="main" className="flex-1">
        {/* Hero Section */}
        <section aria-labelledby="hero-heading" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <h1 id="hero-heading" className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-balance">
              Free Online Planning Poker for Agile Teams
            </h1>
            <p className="text-xl text-muted-foreground mb-8 text-pretty leading-relaxed">
              Estimate user stories instantly with our free scrum poker tool. Real-time collaboration, Fibonacci
              estimation, and confidence levels for remote agile teams.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => setShowCreateDialog(true)}
                size="lg"
                className="text-base"
                aria-label="Create a new planning poker room"
              >
                Start Free Planning Poker
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              No signup required • Instant room creation • 100% free forever
            </p>
          </div>
        </section>

        {/* Recent Rooms */}
        <section aria-labelledby="recent-rooms-heading" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">
          <div className="mx-auto max-w-2xl">
            <RecentRooms />
          </div>
        </section>

        {/* How it Works Section */}
        <section
          aria-labelledby="how-it-works-heading"
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 border-t border-border/40"
        >
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-16">
              <h2 id="how-it-works-heading" className="text-3xl md:text-4xl font-bold mb-4">
                How Planning Poker Works
              </h2>
              <p className="text-lg text-muted-foreground text-pretty">
                Start estimating user stories in three simple steps
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xl mb-4"
                  aria-label="Step 1"
                >
                  1
                </div>
                <h3 className="text-xl font-semibold mb-2">Create an Instant Room</h3>
                <p className="text-muted-foreground">
                  Click the button and your planning poker room is ready. No sign-up, no setup forms, just instant
                  access to start estimating.
                </p>
              </div>
              <div className="text-center">
                <div
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xl mb-4"
                  aria-label="Step 2"
                >
                  2
                </div>
                <h3 className="text-xl font-semibold mb-2">Invite Your Agile Team</h3>
                <p className="text-muted-foreground">
                  Share your room link or QR code with team members. They can join your scrum poker session with a
                  single click.
                </p>
              </div>
              <div className="text-center">
                <div
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xl mb-4"
                  aria-label="Step 3"
                >
                  3
                </div>
                <h3 className="text-xl font-semibold mb-2">Estimate Story Points</h3>
                <p className="text-muted-foreground">
                  Once your team enters the room, start estimating user stories. Everyone votes with confidence levels,
                  then reveal the results together.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section
          id="features"
          aria-labelledby="features-heading"
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 border-t border-border/40"
        >
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-16">
              <h2 id="features-heading" className="text-3xl md:text-4xl font-bold mb-4">
                Everything You Need for Agile Estimation
              </h2>
              <p className="text-lg text-muted-foreground text-pretty">
                Powerful features designed to make your planning poker sessions smooth and efficient
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard
                icon={Zap}
                title="Multiple Deck Types"
                description="Choose from Fibonacci, T-shirt sizes, or Powers of 2 to match your team's estimation style"
              />
              <FeatureCard
                icon={Timer}
                title="Configurable Timer"
                description="Set optional voting timers to keep your estimation sessions focused and on track"
              />
              <FeatureCard
                icon={Users}
                title="Real-time Collaboration"
                description="See participants join and vote in real-time with instant synchronization across all devices"
              />
              <FeatureCard
                icon={BarChart3}
                title="Instant Results"
                description="View voting results immediately with clear visualization of team estimates and consensus indicators"
              />
              <FeatureCard
                icon={Share2}
                title="Easy Sharing"
                description="Share rooms via link or QR code for quick and easy access by team members"
              />
              <FeatureCard
                icon={Shield}
                title="Fully Responsive"
                description="Works seamlessly on desktop, tablet, and mobile devices with full functionality"
              />
            </div>
          </div>
        </section>

        {/* Educational Content Section */}
        <section
          aria-labelledby="guide-heading"
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 border-t border-border/40 bg-muted/30"
        >
          <div className="mx-auto max-w-4xl">
            <h2 id="guide-heading" className="text-3xl md:text-4xl font-bold mb-12 text-center">
              Complete Guide to Planning Poker and Story Point Estimation
            </h2>

            <div className="prose prose-lg max-w-none space-y-12">
              {/* What is Planning Poker */}
              <div>
                <h3 className="text-2xl font-bold mb-4">What is Planning Poker?</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Planning Poker, also known as Scrum Poker, is a consensus-based agile estimation technique used by
                  development teams to estimate the effort or relative size of user stories in software development. The
                  technique was first defined and named by James Grenning in 2002 and later popularized by Mike Cohn in
                  his book "Agile Estimating and Planning."
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  In Planning Poker, team members make estimates by playing numbered cards face-down on the table,
                  instead of speaking them aloud. The cards are revealed simultaneously, and the estimates are then
                  discussed. This approach prevents the cognitive bias of anchoring, where the first number spoken aloud
                  sets a precedent for subsequent estimates.
                </p>
              </div>

              {/* How to Make Story Estimations Successful */}
              <div>
                <h3 className="text-2xl font-bold mb-4">How to Make Story Estimations Successful</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Successful story estimation requires preparation, participation, and practice. Here are key strategies
                  to ensure your planning poker sessions are productive:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>
                    <strong>Prepare user stories in advance:</strong> Ensure all stories are well-defined with clear
                    acceptance criteria before the estimation session.
                  </li>
                  <li>
                    <strong>Include the whole team:</strong> Developers, testers, designers, and product owners should
                    all participate to get diverse perspectives.
                  </li>
                  <li>
                    <strong>Use relative estimation:</strong> Compare stories to each other rather than trying to
                    estimate absolute time or effort.
                  </li>
                  <li>
                    <strong>Discuss outliers:</strong> When estimates vary significantly, have the highest and lowest
                    estimators explain their reasoning.
                  </li>
                  <li>
                    <strong>Time-box discussions:</strong> Set a timer to keep conversations focused and prevent
                    analysis paralysis.
                  </li>
                  <li>
                    <strong>Re-estimate if needed:</strong> After discussion, team members can change their estimates
                    based on new information.
                  </li>
                </ul>
              </div>

              {/* Understanding Story Points */}
              <div>
                <h3 className="text-2xl font-bold mb-4">Understanding Story Points</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Story points are a unit of measure for expressing the overall effort required to fully implement a
                  user story. Unlike hours or days, story points represent a combination of complexity, effort, and
                  uncertainty. This makes them more reliable for long-term planning because they're less affected by
                  individual developer speed or interruptions.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  The Fibonacci sequence (1, 2, 3, 5, 8, 13, 21, etc.) is commonly used for story points because it
                  reflects the inherent uncertainty in estimating larger items. The gaps between numbers grow larger as
                  the numbers increase, acknowledging that our estimates become less precise for bigger stories.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  A story worth 1 point might be a simple text change, while a 13-point story could involve multiple
                  components, database changes, and complex business logic. Teams develop their own baseline over time,
                  making story points a relative measure specific to each team.
                </p>
              </div>

              {/* The Fibonacci Sequence in Agile */}
              <div>
                <h3 className="text-2xl font-bold mb-4">Why Use the Fibonacci Sequence for Estimation?</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  The Fibonacci sequence (0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89) is the most popular scale for planning
                  poker because it naturally reflects the uncertainty and complexity of software development:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                  <li>
                    <strong>Increasing gaps:</strong> The larger the story, the more uncertainty exists, and the
                    Fibonacci gaps reflect this reality.
                  </li>
                  <li>
                    <strong>Prevents false precision:</strong> You can't estimate a story as 7 points, forcing you to
                    choose between 5 or 8, which is more realistic.
                  </li>
                  <li>
                    <strong>Encourages breaking down large stories:</strong> When a story is estimated at 21 or higher,
                    it signals that it should be split into smaller, more manageable pieces.
                  </li>
                  <li>
                    <strong>Natural human perception:</strong> Research shows humans are better at estimating relative
                    differences when numbers are spaced further apart.
                  </li>
                </ul>
              </div>

              {/* Best Practices */}
              <div>
                <h3 className="text-2xl font-bold mb-4">Planning Poker Best Practices</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Follow these best practices to get the most value from your planning poker sessions:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>
                    <strong>Establish a baseline:</strong> Start by estimating a few well-understood stories to
                    establish reference points for the team.
                  </li>
                  <li>
                    <strong>Focus on relative sizing:</strong> Don't worry about absolute accuracy; focus on whether
                    Story A is bigger or smaller than Story B.
                  </li>
                  <li>
                    <strong>Avoid averaging:</strong> If estimates vary widely, discuss and re-vote rather than simply
                    averaging the numbers.
                  </li>
                  <li>
                    <strong>Use confidence levels:</strong> Allow team members to indicate their confidence in their
                    estimates to surface uncertainty.
                  </li>
                  <li>
                    <strong>Keep sessions short:</strong> Limit planning poker sessions to 1-2 hours to maintain focus
                    and energy.
                  </li>
                  <li>
                    <strong>Review and refine:</strong> After sprints, review your estimates versus actual effort to
                    improve future estimation accuracy.
                  </li>
                </ul>
              </div>

              {/* Remote Teams */}
              <div>
                <h3 className="text-2xl font-bold mb-4">Planning Poker for Remote and Distributed Teams</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Online planning poker tools like PokerPlan are essential for remote agile teams. They provide the same
                  benefits as physical cards while adding features that enhance remote collaboration:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>
                    <strong>Simultaneous voting:</strong> Everyone votes at the same time, preventing anchoring bias
                    even across time zones.
                  </li>
                  <li>
                    <strong>Real-time synchronization:</strong> All participants see updates instantly, creating a
                    shared experience.
                  </li>
                  <li>
                    <strong>Easy sharing:</strong> Simply share a link to invite team members, no software installation
                    required.
                  </li>
                  <li>
                    <strong>Automatic result calculation:</strong> The tool instantly shows consensus, average, and
                    median estimates.
                  </li>
                  <li>
                    <strong>Session history:</strong> Track multiple estimation rounds in a single session for better
                    sprint planning.
                  </li>
                </ul>
              </div>

              {/* Common Mistakes */}
              <div>
                <h3 className="text-2xl font-bold mb-4">Common Planning Poker Mistakes to Avoid</h3>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>
                    <strong>Estimating in hours instead of points:</strong> Story points are about relative complexity,
                    not time. Avoid converting points to hours.
                  </li>
                  <li>
                    <strong>Letting senior developers dominate:</strong> Every team member's perspective is valuable.
                    Encourage junior developers to share their estimates.
                  </li>
                  <li>
                    <strong>Skipping the discussion:</strong> The conversation about why estimates differ is often more
                    valuable than the final number.
                  </li>
                  <li>
                    <strong>Estimating too many stories at once:</strong> Quality over quantity. It's better to
                    thoroughly estimate fewer stories.
                  </li>
                  <li>
                    <strong>Not breaking down large stories:</strong> Stories estimated at 21+ points should be split
                    into smaller, more manageable pieces.
                  </li>
                  <li>
                    <strong>Comparing velocity across teams:</strong> Story points are team-specific. Never compare
                    velocity between different teams.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section
          aria-labelledby="cta-heading"
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 border-t border-border/40"
        >
          <div className="mx-auto max-w-3xl text-center">
            <h2 id="cta-heading" className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Start Estimating?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 text-pretty">
              Create your first planning poker room and invite your team to start estimating user stories together
            </p>
            <Button
              onClick={() => setShowCreateDialog(true)}
              size="lg"
              className="text-base"
              aria-label="Create your first planning poker room"
            >
              Create Your First Room
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer role="contentinfo" className="border-t border-border/40 py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
            <p>Built with Next.js for agile teams worldwide • Free Planning Poker Tool</p>
          </div>
        </footer>

        {/* Create Room Dialog */}
        <CreateRoomDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} onCreateRoom={handleCreateRoom} />
      </main>
    </div>
  )
}
