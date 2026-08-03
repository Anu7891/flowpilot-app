import SettingsApp from '@/components/ws/SettingsApp';

export default function Page({ params }: { params: { slug: string } }) {
  return <SettingsApp slug={params.slug} />;
}
