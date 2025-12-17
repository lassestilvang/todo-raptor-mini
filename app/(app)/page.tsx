import Link from 'next/link'
import TaskList from '../../components/TaskList'

export default function Dashboard() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Today</h2>
      <p className="text-muted-foreground">Tasks scheduled for today.</p>
      <div className="mt-6">
        <TaskList />
      </div>
    </div>
  )
}
