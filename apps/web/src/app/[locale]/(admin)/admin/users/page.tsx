'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import api from '@/lib/api';
import { useToast } from '@/components/Toast';
import { Spinner } from '@/components/Spinner';
import { Pagination } from '@/components/Pagination';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

type UserRole = 'PASSENGER' | 'DRIVER' | 'ADMIN';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  createdAt: string;
}

const ROLES: UserRole[] = ['PASSENGER', 'DRIVER', 'ADMIN'];
const PAGE_SIZE = 20;

const ROLE_TONE: Record<UserRole, 'brand' | 'warning' | 'danger'> = {
  PASSENGER: 'brand',
  DRIVER: 'warning',
  ADMIN: 'danger',
};

const ROLE_ICONS: Record<UserRole, string> = {
  PASSENGER: '○',
  DRIVER: '◑',
  ADMIN: '●',
};

const selectCls =
  'rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-ink ' +
  'transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30';

export default function AdminUsersPage() {
  const t = useTranslations('admin');
  const tc = useTranslations('common');
  const toast = useToast();
  const [users, setUsers] = useState<User[] | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [pendingRoles, setPendingRoles] = useState<Record<string, UserRole>>({});
  const [page, setPage] = useState(1);

  useEffect(() => {
    api.get('/admin/users')
      .then((res) => setUsers(res.data.data))
      .catch(() => toast('Failed to load users', 'error'));
  }, []);

  async function saveRole(userId: string) {
    const role = pendingRoles[userId];
    if (!role) return;
    if (!confirm(t('confirmRoleChange'))) return;
    setSaving(userId);
    try {
      await api.patch(`/admin/users/${userId}/role`, { role });
      setUsers((prev) => prev ? prev.map((u) => (u.id === userId ? { ...u, role } : u)) : prev);
      setPendingRoles((prev) => { const n = { ...prev }; delete n[userId]; return n; });
      toast('Role updated', 'success');
    } catch {
      toast('Failed to update role', 'error');
    } finally {
      setSaving(null);
    }
  }

  if (users === null)
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );

  const paginated = users.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <Container className="max-w-5xl py-10">
      <h1 className="mb-6 font-display text-3xl font-semibold text-ink">{t('users')}</h1>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {[t('name'), t('email'), t('phone'), t('role'), t('actions')].map((h) => (
                  <th key={h} className="whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-600">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    {tc('noData')}
                  </td>
                </tr>
              ) : (
                paginated.map((u) => (
                  <tr key={u.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-medium text-ink">
                      {u.firstName} {u.lastName}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{u.email}</td>
                    <td className="px-4 py-3 font-mono tabular text-slate-600">{u.phone}</td>
                    <td className="px-4 py-3">
                      <Badge tone={ROLE_TONE[u.role]} className="mb-1">
                        {ROLE_ICONS[u.role]} {u.role}
                      </Badge>
                      <br />
                      <select
                        value={pendingRoles[u.id] ?? u.role}
                        onChange={(e) => setPendingRoles((prev) => ({ ...prev, [u.id]: e.target.value as UserRole }))}
                        className={`mt-1 ${selectCls}`}
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      {pendingRoles[u.id] && pendingRoles[u.id] !== u.role && (
                        <Button size="sm" onClick={() => saveRole(u.id)} disabled={saving === u.id}>
                          {saving === u.id ? '...' : t('save')}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination total={users.length} page={page} pageSize={PAGE_SIZE} onChange={setPage} />
      </Card>
    </Container>
  );
}
