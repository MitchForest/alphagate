import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "AlphaGate Console",
  description: "Configure endpoints, keys, and policies for AlphaGate.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
