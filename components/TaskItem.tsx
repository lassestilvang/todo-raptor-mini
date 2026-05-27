'use client';

import React from 'react';

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

let MotionDiv: any;
function getMotionDiv() {
  if (MotionDiv) return MotionDiv;
  try {
    const fm = require('framer-motion');
    MotionDiv = fm.motion?.div || ((props: any) => <div {...props} />);
  } catch (_err) {
    void _err;
    MotionDiv = (props: any) => <div {...props} />;
  }
  return MotionDiv;
}

function TaskItem({ task }: { task: any }) {
  const MotionComponent = getMotionDiv();
  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const now = new Date();
  const isOverdue = dueDate ? dueDate < now : false;
  const completed = Boolean(task.completedAt);

  const dueLabel = dueDate ? dateFormatter.format(dueDate) : null;

  return (
    <MotionComponent
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
    </MotionComponent>
  );
}

export default React.memo(TaskItem);
