import { notFound } from 'next/navigation'
import TaskList from '../../../../components/TaskList'

type Props = { params: { listId: string } }

export default function ListPage({ params }: Props) {
  const { listId } = params

  if (!listId) notFound()

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-2">{listId === 'inbox' ? 'Inbox' : listId}</h1>
      <TaskList listId={listId} />
    </div>
  )
}
