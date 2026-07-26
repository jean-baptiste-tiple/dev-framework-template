import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "Mon App",
    template: "%s | Mon App",
  },
  description: "Description du projet",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Skip link : premier élément focusable, visible seulement au focus clavier
              (accessibility-patterns.md § Navigation clavier). */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:ring-1 focus:ring-ring"
          >
            Aller au contenu principal
          </a>
          <div id="main-content">{children}</div>
          {/* Sans ce Toaster monté à la racine, tout toast.success() est silencieux. */}
          <Toaster position="bottom-right" richColors visibleToasts={3} duration={5000} />
        </ThemeProvider>
      </body>
    </html>
  )
}
