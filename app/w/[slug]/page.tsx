import WorkspaceHome from '@/components/ws/WorkspaceHome';

export default function Page({ params }: { params: { slug: string } }) {
  return <WorkspaceHome slug={params.slug} />;
}
