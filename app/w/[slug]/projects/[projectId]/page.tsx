import BoardPage from '@/components/ws/projects/BoardPage';

export default function Page({ params }: { params: { slug: string; projectId: string } }) {
  return <BoardPage slug={params.slug} projectId={params.projectId} />;
}
