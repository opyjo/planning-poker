import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { UserProvider } from "@/components/providers/user-provider"
import { SocketProvider } from "@/components/providers/socket-provider"
import { ErrorBoundary } from "@/components/error-boundary"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"
import { Suspense } from "react"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://pokerplan.online"),
  title: {
    default: "Free Planning Poker Online - Agile Estimation Tool for Scrum Teams | Poker Plan",
    template: "%s | Poker Plan",
  },
  description:
    "Free online Planning Poker and Scrum Poker tool for agile teams. Real-time story point estimation with Fibonacci sequence, T-shirt sizing, confidence levels, and instant collaboration. Perfect for remote scrum teams and sprint planning sessions. No signup required.",
  keywords:
    "planning poker, scrum poker, agile estimation, story points, fibonacci estimation, agile tools, scrum tools, remote estimation, sprint planning, user story estimation, agile planning, scrum planning, estimation tool, free planning poker, online planning poker, scrum poker online, poker planning, agile poker, story point estimation, fibonacci sequence, t-shirt sizing, remote agile teams, distributed teams, sprint estimation",
  authors: [{ name: "Poker Plan" }],
  creator: "Poker Plan",
  publisher: "Poker Plan",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Free Planning Poker Online - Agile Estimation for Remote Scrum Teams",
    description:
      "Real-time Planning Poker and Scrum Poker for agile teams. Estimate user stories with Fibonacci, T-shirt sizes, and confidence levels for remote agile teams.",
    type: "website",
    locale: "en_US",
    url: "https://pokerplan.online",
    siteName: "Poker Plan",
    images: [
      {
        url: "https://pokerplan.online/og-image.png",
        width: 1200,
        height: 630,
        alt: "Poker Plan - Free Planning Poker Tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Poker Plan - Free Planning Poker for Agile Teams",
    description:
      "Free online Planning Poker and Scrum Poker. Real-time estimation with Fibonacci, T-shirt sizing, and confidence levels for remote agile teams.",
    images: ["https://pokerplan.online/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://pokerplan.online",
  },
  category: "productivity",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Poker Plan - Planning Poker Tool",
      url: "https://pokerplan.online",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web Browser",
      browserRequirements: "Requires JavaScript. Requires HTML5.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      description:
        "Free online Planning Poker and Scrum Poker tool for agile teams. Real-time story point estimation with Fibonacci sequence, T-shirt sizing, confidence levels, and instant collaboration for remote scrum teams.",
      featureList: [
        "Real-time collaboration for distributed teams",
        "Multiple estimation scales: Fibonacci, T-shirt sizes, Powers of 2",
        "Confidence level voting system",
        "Configurable timer for time-boxed estimation",
        "Instant room creation with no signup",
        "QR code and link sharing",
        "Mobile responsive design",
        "Consensus indicators",
        "Auto-reveal functionality",
        "Story/task naming",
      ],
      screenshot: "https://pokerplan.online/screenshot.png",
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.8",
        ratingCount: "127",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is Planning Poker?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Planning Poker (also called Scrum Poker) is an agile estimation technique where team members use cards to estimate the effort or complexity of user stories. It promotes discussion and helps teams reach consensus on story points. The technique prevents cognitive bias by having all team members reveal their estimates simultaneously.",
          },
        },
        {
          "@type": "Question",
          name: "Is this Planning Poker tool really free?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes! Poker Plan is 100% free with no hidden costs, no signup required, and unlimited rooms. Perfect for agile teams of any size, from small startups to large enterprises.",
          },
        },
        {
          "@type": "Question",
          name: "What estimation scales are supported?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "We support three popular estimation scales: Fibonacci sequence (0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89), T-shirt sizes (XS, S, M, L, XL, XXL), and Powers of 2 (1, 2, 4, 8, 16, 32, 64) for flexible story point estimation.",
          },
        },
        {
          "@type": "Question",
          name: "Can remote teams use this tool?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Poker Plan is specifically designed for remote and distributed agile teams. Share the room link and everyone can participate from anywhere with real-time synchronization. Perfect for remote sprint planning and distributed scrum teams.",
          },
        },
        {
          "@type": "Question",
          name: "Do I need to create an account?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No account needed! Simply create a room and start estimating. Your name is saved locally for convenience, but no personal data is collected or stored on our servers.",
          },
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "How to Use Planning Poker for Agile Estimation",
      description: "Step-by-step guide to using Planning Poker for estimating user stories in agile development",
      step: [
        {
          "@type": "HowToStep",
          name: "Create a Planning Poker Room",
          text: "Click 'Start Free Planning Poker' and select your preferred estimation scale (Fibonacci, T-shirt sizes, or Powers of 2). Your room is created instantly with no signup required.",
          url: "https://pokerplan.online",
        },
        {
          "@type": "HowToStep",
          name: "Invite Your Agile Team",
          text: "Share the room link or QR code with your team members. They can join the scrum poker session with a single click from any device.",
          url: "https://pokerplan.online",
        },
        {
          "@type": "HowToStep",
          name: "Estimate User Stories",
          text: "Present a user story to the team. Each member selects their estimate and confidence level. Once everyone has voted, reveal the results to see the team's estimates and discuss any significant differences.",
          url: "https://pokerplan.online",
        },
      ],
    },
  ]

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ErrorBoundary>
          <Suspense fallback={<div>Loading...</div>}>
            <ThemeProvider defaultTheme="dark" storageKey="planning-poker-theme">
              <UserProvider>
                <SocketProvider>{children}</SocketProvider>
              </UserProvider>
            </ThemeProvider>
          </Suspense>
          <Toaster />
        </ErrorBoundary>
      </body>
    </html>
  )
}
