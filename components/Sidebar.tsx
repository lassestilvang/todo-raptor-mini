"use client"

import Link from 'next/link'

const views = [
  { key: 'inbox', label: 'Inbox', href: '/app/lists/inbox' },
  { key: 'today', label: 'Today', href: '/app' },
  { key: 'next7', label: 'Next 7 Days', href: '/app?view=next7' },
  { key: 'upcoming', label: 'Upcoming', href: '/app?view=upcoming' },
  { key: 'all', label: 'All', href: '/app?view=all' },
]

import React, { useEffect, useState } from 'react'
import Lists from './Lists'
import CreateList from './CreateList'
import Labels from './Labels'
import CreateLabel from './CreateLabel'

export default function Sidebar() {
  const [overdue, setOverdue] = useState<number | null>(null)

  async function fetchStats() {
    try {
      const res = await fetch('/api/stats')
      const data = await res.json()
      setOverdue(data.overdueCount)
    } catch (_err) {
      // ignore
      void _err
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return (
    <nav className="flex flex-col gap-3">
      <div className="mb-4">
        <h3 className="text-sm font-medium uppercase tracking-wide">Views</h3>
        <ul className="mt-2">
          {views.map(v => (
            <li key={v.key} className="mt-2">
              <Link href={v.href} className="text-sm hover:underline">{v.label}</Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4">
        <h3 className="text-sm font-medium uppercase tracking-wide">Lists</h3>
        <ul className="mt-2">
          <li className="mt-2"><Link href="/app/lists/inbox" className="text-sm">📥 Inbox {overdue ? <span className="ml-2 text-xs bg-red-600 rounded-full px-2">{overdue}</span> : null}</Link></li>
          {/* dynamic lists */}
          <Lists />
          <li className="mt-2">
            <CreateList />
          </li>
        </ul>
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-medium uppercase tracking-wide">Labels</h3>
        <ul className="mt-2">
          <li className="mt-2"><Labels /></li>
          <li className="mt-2"><CreateLabel /></li>
        </ul>
      </div>
    </nav>
  )
}
