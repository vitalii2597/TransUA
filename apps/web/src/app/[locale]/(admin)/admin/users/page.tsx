'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import api from '@/lib/api';
import { useToast } from '@/components/Toast';
import { Spinner } from '@/components/Spinner';
import { Pagination } from '@/components/Pagination';

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

const ROLE_COLORS: Record<UserRole, string> = {
  PASSENGER: 'bg-blue-100 text-blue-700',
  DRIVER: 'bg-yellow-100 text-yellow-700',
  ADMIN: 'bg-red-100 text-red-700',
};

const ROLE_ICONS: Record<UserRole, string> = {
  PASSENGER: '○',
  DRIVER: '◑',
  ADMIN: '●',
};

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

  if (users === null) return <Spinner />;

  const paginated = users.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t('users')}</h1>
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 8px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
        <table className="w-full text-sm">
          <thead style={{ background: '#f8fafc' }}>
            <tr>
              {[t('name'), t('email'), t('phone'), t('role'), t('actions')].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">{tc('noData')}</td>
              </tr>
            ) : (
              paginated.map((u) => (
                <tr key={u.id} className="border-t border-gray-100">
                  <td className="px-4 py-3 font-medium text-gray-800">{u.firstName} {u.lastName}</td>
                  <td className="px-4 py-3 text-gray-600">{u.email}</td>
                  <td className="px-4 py-3 text-gray-600">{u.phone}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-1 ${ROLE_COLORS[u.role]}`}>
                      {ROLE_ICONS[u.role]} {u.role}
                    </span>
                    <br />
                    <select
                      value={pendingRoles[u.id] ?? u.role}
                      onChange={(e) => setPendingRoles((prev) => ({ ...prev, [u.id]: e.target.value as UserRole }))}
                      className="border border-gray-300 rounded px-2 py-1 text-sm mt-1"
                    >
                      {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    {pendingRoles[u.id] && pendingRoles[u.id] !== u.role && (
                      <button
                        onClick={() => saveRole(u.id)}
                        disabled={saving === u.id}
                        style={{ background: '#1a3a5c', color: '#fff', padding: '4px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12 }}
                        className="disabled:opacity-60"
                      >
                        {saving === u.id ? '...' : t('save')}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <Pagination total={users.length} page={page} pageSize={PAGE_SIZE} onChange={setPage} />
      </div>
    </div>
  );
}
