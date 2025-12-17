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

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="p-3 border-b border-slate-800 hover:bg-slate-800 rounded"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">{task.title}</div>
          {task.notes ? <div className="text-sm text-muted-foreground">{task.notes}</div> : null}
        </div>
        <div className="text-sm text-muted-foreground">
          {task.dueDate ? new Date(task.dueDate).toLocaleString() : ''}
        </div>
      </div>
    </MotionDiv>
  );
}
