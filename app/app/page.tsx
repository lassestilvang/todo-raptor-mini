import TaskList from '../../components/TaskList';

type Props = {
  searchParams: Promise<{ view?: string }>;
};

const viewMeta: Record<string, { title: string; description: string }> = {
  today: { title: 'Today', description: 'Tasks scheduled for today.' },
  next7: { title: 'Next 7 Days', description: 'Tasks coming up in the next week.' },
  upcoming: { title: 'Upcoming', description: 'All future tasks.' },
  all: { title: 'All Tasks', description: 'Every task across all lists.' },
};

export default async function Dashboard({ searchParams }: Props) {
  const { view = 'today' } = await searchParams;
  const meta = viewMeta[view] ?? viewMeta.today;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">{meta.title}</h2>
      <p className="text-muted-foreground">{meta.description}</p>
      <div className="mt-6">
        <TaskList view={view} />
      </div>
    </div>
  );
}
