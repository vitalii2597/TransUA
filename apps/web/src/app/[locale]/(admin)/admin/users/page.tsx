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
import { Input } from '@/components/ui/Input';

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
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');

  // Debounce typing so each keystroke doesn't fire a request. Only a changed search resets
  // to page 1 — otherwise the mount timer (or typing then deleting) would undo a page click.
  useEffect(() => {
    const id = setTimeout(() => {
      const next = query.trim();
      if (next !== search) {
        setSearch(next);
        setPage(1);
      }
    }, 300);
    return () => clearTimeout(id);
  }, [query]);

  // Server-side pagination: fetching once and slicing only ever showed the API's default page (newest 20).
  useEffect(() => {
    let stale = false; // ignore responses that arrive after a newer page/search was requested
    setPendingRoles({}); // unsaved role picks belong to the rows that were on screen
    api.get('/admin/users', { params: { page, limit: PAGE_SIZE, q: search || undefined } })
      .then((res) => {
        if (stale) return;
        setUsers(res.data.data);
        setTotal(res.data.meta.total);
      })
      .catch(() => {
        if (!stale) toast('Failed to load users', 'error');
      });
    return () => {
      stale = true;
    };
  }, [page, search]);

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

  return (
    <Container className="max-w-5xl py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-3xl font-semibold text-ink">
          {t('users')} <span className="font-mono text-lg tabular text-slate-500">{total}</span>
        </h1>
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('searchUsers')}
          aria-label={t('searchUsers')}
          className="w-full sm:w-72"
        />
      </div>
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
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    {tc('noData')}
                  </td>
                </tr>
              ) : (
                users.map((u) => (
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
        <Pagination total={total} page={page} pageSize={PAGE_SIZE} onChange={setPage} />
      </Card>
    </Container>
  );
}
