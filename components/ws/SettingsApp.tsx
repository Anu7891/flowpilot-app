'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { type Role, type WorkspaceSummary } from './api';
import { qk, useWorkspace } from './hooks';
import { Icon } from './ui';
import GeneralTab from './settings/GeneralTab';
import MembersTab from './settings/MembersTab';
import InvitationsTab from './settings/InvitationsTab';
import PreferencesTab from './settings/PreferencesTab';
import DangerTab from './settings/DangerTab';

type WS = WorkspaceSummary & { role: Role };
const TABS = ['General', 'Members', 'Invitations', 'Preferences', 'Danger Zone'] as const;
type Tab = (typeof TABS)[number];

export default function SettingsApp({ slug }: { slug: string }) {
  const router = useRouter();
  const qc = useQueryClient();
  const wsQuery = useWorkspace(slug);
  const ws = wsQuery.data ?? null;
  const error = wsQuery.isError
    ? wsQuery.error instanceof Error ? wsQuery.error.message : 'Could not load workspace.'
    : null;
  const setWs = (w: WS) => qc.setQueryData(qk.workspace(slug), w);
  const [tab, setTab] = useState<Tab>('General');

  if (error) {
    return (
      <div className="page"><div className="center-state">
        <Icon name="i-warn" className="ic" /><h2>Can’t open settings</h2><p>{error}</p>
        <button className="btn btn-secondary" onClick={() => router.push('/dashboard')}>Back to dashboard</button>
      </div></div>
    );
  }
  if (!ws) return <div className="page"><div className="loading"><span className="spinner" /> Loading settings…</div></div>;

  const isOwner = ws.role === 'OWNER';
  const canManage = isOwner || ws.role === 'ADMIN';
  const visible = TABS.filter((t) => (t === 'Members' || t === 'Invitations' || t === 'Danger Zone' ? canManage : true));

  return (
    <div className="page">
      <div className="page-head">
        <h1>Workspace settings</h1>
        <p>{ws.name} · flowpilot.app/{ws.slug}</p>
      </div>

      <div className="tabs" role="tablist">
        {visible.map((t) => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)} role="tab" aria-selected={tab === t}>{t}</button>
        ))}
      </div>

      {tab === 'General' && <GeneralTab ws={ws} canEdit={canManage} onSaved={setWs} />}
      {tab === 'Members' && canManage && <MembersTab slug={slug} myRole={ws.role} />}
      {tab === 'Invitations' && canManage && <InvitationsTab slug={slug} />}
      {tab === 'Preferences' && <PreferencesTab slug={slug} canEdit={canManage} />}
      {tab === 'Danger Zone' && canManage && <DangerTab ws={ws} isOwner={isOwner} onArchived={setWs} />}
    </div>
  );
}
