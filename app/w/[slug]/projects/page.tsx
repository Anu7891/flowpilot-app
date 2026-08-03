import ProjectsPage from '@/components/ws/projects/ProjectsPage';

export default function Page({ params }: { params: { slug: string } }) {
  return <ProjectsPage slug={params.slug} />;
}
