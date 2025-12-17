import React from 'react'
import Sidebar from '../../components/Sidebar'

import ThemeToggle from '../../components/ThemeToggle'
import { motion } from 'framer-motion'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-slate-900 text-white">
      <aside className="w-72 border-r border-slate-800 p-4 hidden md:block">
        <Sidebar />
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="p-4 border-b border-slate-800 flex justify-end">
          <ThemeToggle />
        </header>
        <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6">{children}</motion.main>
      </div>
    </div>
  )
}
