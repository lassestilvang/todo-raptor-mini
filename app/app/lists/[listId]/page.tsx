import { notFound } from 'next/navigation';
import TaskList from '../../../../components/TaskList';

type Props = { params: { listId: string } };

export default async function ListPage({ params }: Props) {
  // `params` may be a Promise in Next.js 16 dynamic routes, so unwrap it
  const { listId } = await params;

  if (!listId) notFound();

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-2">{listId === 'inbox' ? 'Inbox' : listId}</h1>
      <TaskList listId={listId} />
    </div>
  );
}
