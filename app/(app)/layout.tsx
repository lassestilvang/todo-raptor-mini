import React from 'react'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  // Minimal layout used during build isolation
  return (
    <div className="min-h-screen flex bg-slate-900 text-white">
      <div className="flex-1 flex flex-col">
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
