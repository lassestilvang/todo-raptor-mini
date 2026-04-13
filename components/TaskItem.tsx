'use client';

import React from 'react';

export default function TaskItem({ task }: { task: any }) {
  // Guard framer-motion import to avoid server-side bundler issues
  const MotionWrapper = React.useMemo(() => {
    try {
      // dynamically require on client only

      const fm = require('framer-motion');
      return fm.motion?.div || ((props: any) => <div {...props} />);
    } catch (_err) {
      void _err;
      return (props: any) => <div {...props} />;
    }
  }, []);

  const MotionDiv: any = MotionWrapper;

  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const now = new Date();
  const isOverdue = dueDate ? dueDate < now : false;
  const completed = Boolean(task.completedAt);

  const dueLabel = dueDate
    ? dueDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) +
      ' ' +
      dueDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="group rounded-2xl border border-border bg-card p-4 shadow-sm transition hover:bg-card/80"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-card/80 text-sm font-semibold text-foreground/90">
            {completed ? '✅' : '📝'}
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground">{task.title}</div>
            {task.notes ? (
              <div className="mt-1 text-xs text-foreground/60 max-h-10 overflow-hidden">{task.notes}</div>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium">
          {dueLabel ? (
            <span
              className={`rounded-full px-3 py-1 ${
                isOverdue ? 'bg-red-500/20 text-red-200' : 'bg-card/80 text-foreground/70'
              }`}
            >
              {dueLabel}
            </span>
          ) : null}
          {completed ? (
            <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-emerald-100">
              Completed
            </span>
          ) : null}
        </div>
      </div>
    </MotionDiv>
  );
}
