'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import Lists from './Lists';
import CreateList from './CreateList';
import Labels from './Labels';
import CreateLabel from './CreateLabel';

const views = [
  { key: 'inbox', label: 'Inbox', href: '/app/lists/inbox' },
  { key: 'today', label: 'Today', href: '/app' },
  { key: 'next7', label: 'Next 7 Days', href: '/app?view=next7' },
  { key: 'upcoming', label: 'Upcoming', href: '/app?view=upcoming' },
  { key: 'all', label: 'All', href: '/app?view=all' },
];

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname?.startsWith(href + '?');

  return (
    <Link
      href={href}
      className={`block text-sm rounded-lg px-3 py-2 transition-colors hover:bg-card/80 ${
        isActive ? 'bg-card/80 font-medium text-foreground' : 'text-foreground/70'
      }`}
    >
      {children}
    </Link>
  );
}

export default function Sidebar() {
  const [overdue, setOverdue] = useState<number | null>(null);

  async function fetchStats() {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      setOverdue(data.overdueCount);
    } catch (_err) {
      // ignore
      void _err;
    }
  }

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <nav className="flex flex-col gap-6">
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground/50">Views</h3>
        <div className="mt-2 flex flex-col gap-1">
          {views.map((v) => (
            <NavLink key={v.key} href={v.href}>
              {v.label}
            </NavLink>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground/50">Lists</h3>
        <div className="mt-2 flex flex-col gap-1">
          <NavLink href="/app/lists/inbox">
            <span className="flex items-center justify-between">
              <span>📥 Inbox</span>
              {overdue ? (
                <span className="text-[10px] font-semibold uppercase tracking-widest bg-red-500/80 text-white rounded-full px-2 py-0.5">
                  {overdue}
                </span>
              ) : null}
            </span>
          </NavLink>
          <Lists />
          <div className="mt-1">
            <CreateList />
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground/50">Labels</h3>
        <div className="mt-2 flex flex-col gap-1">
          <Labels />
          <div className="mt-1">
            <CreateLabel />
          </div>
        </div>
      </section>
    </nav>
  );
}
