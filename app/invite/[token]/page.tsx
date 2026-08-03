import InviteAccept from '@/components/ws/InviteAccept';

export default function Page({ params }: { params: { token: string } }) {
  return <InviteAccept token={params.token} />;
}
