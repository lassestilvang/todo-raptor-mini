import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import TaskList from '../../../../components/TaskList';
import { getListById } from '../../../../lib/list-service.server';

type Props = { params: { listId: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { listId } = await params;
  if (!listId) return { title: 'List not found' };

  const list = await getListById(listId);
  if (!list) return { title: 'List not found' };

  return {
    title: `${list.emoji ?? '📋'} ${list.title}`,
    description: `Tasks in ${list.title}`,
  };
}

export default async function ListPage({ params }: Props) {
  // `params` may be a Promise in Next.js 16 dynamic routes, so unwrap it
  const { listId } = await params;

  if (!listId) notFound();

  const list = await getListById(listId);
  if (!list) notFound();

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <span className="text-3xl">{list.emoji ?? '📋'}</span>
        <div>
          <h1 className="text-2xl font-semibold">{list.title}</h1>
        </div>
      </div>
      <TaskList listId={listId} />
    </div>
  );
}
