import './globals.css'
import { PropsWithChildren } from 'react'

export const metadata = {
  title: 'Todo Raptor',
  description: 'Daily task planner'
}

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
        {children}
      </body>
    </html>
  )
}
