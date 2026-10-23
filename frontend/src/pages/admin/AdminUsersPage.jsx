import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../../api/services';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import EmptyState from '../../components/ui/EmptyState';
import { Users, Search, Shield, UserX, UserCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [actionSuccess, setActionSuccess] = useState(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-users'],
    queryFn: userService.getAllUsers,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => userService.updateUserStatus(id, status),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries(['admin-users']);
      setActionSuccess(`User status successfully changed to ${variables.status}`);
      setTimeout(() => setActionSuccess(null), 4000);
    },
  });

  const users = data?.data || [];

  const filteredUsers = users.filter((u) => {
    const fullName = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
    const email = (u.email || '').toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || u.role === roleFilter;
    const matchesStatus = !statusFilter || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === 'ACTIVE').length;
  const suspendedUsers = users.filter((u) => u.status === 'SUSPENDED').length;
  const recruiterCount = users.filter((u) => u.role === 'RECRUITER').length;
  const candidateCount = users.filter((u) => u.role === 'CANDIDATE').length;

  const handleToggleStatus = (user) => {
    const nextStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    statusMutation.mutate({ id: user.id, status: nextStatus });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Platform Users</h1>
          <p className="text-sm text-slate-500 mt-1">
            Global user directory, identity status, and account suspension controls.
          </p>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-3 text-sm text-emerald-800">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {statusMutation.isError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-3 text-sm text-rose-800">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>Failed to update user status: {statusMutation.error?.response?.data?.message || 'Server error'}</span>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Users</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{totalUsers}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Active Accounts</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{activeUsers}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-rose-600 uppercase tracking-wider">Suspended</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{suspendedUsers}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Recruiters</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{recruiterCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-cyan-600 uppercase tracking-wider">Candidates</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{candidateCount}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by user name or email address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="flex gap-3">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border border-slate-200 rounded-lg text-sm px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Roles</option>
            <option value="PLATFORM_ADMIN">Platform Admin</option>
            <option value="RECRUITER">Recruiter</option>
            <option value="CANDIDATE">Candidate</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-200 rounded-lg text-sm px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-6">
            <LoadingSkeleton count={5} />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={Users}
              title="No Users Found"
              description="No user accounts matched your search terms or filter selection."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Organization</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-xs font-bold text-indigo-700 shrink-0">
                          {(u.firstName?.[0] || 'U') + (u.lastName?.[0] || '')}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">
                            {u.firstName} {u.lastName}
                          </p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        u.role === 'PLATFORM_ADMIN'
                          ? 'bg-purple-100 text-purple-700 border border-purple-200'
                          : u.role === 'RECRUITER'
                          ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {u.role === 'PLATFORM_ADMIN' && <Shield className="w-3 h-3" />}
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {u.organizationName || (
                        <span className="text-slate-400 italic">None (Candidate / Platform)</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={u.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      {u.role === 'PLATFORM_ADMIN' ? (
                        <span className="text-xs text-slate-400 italic">Protected</span>
                      ) : (
                        <Button
                          variant={u.status === 'ACTIVE' ? 'outline' : 'primary'}
                          size="sm"
                          disabled={statusMutation.isPending}
                          onClick={() => handleToggleStatus(u)}
                          className={`text-xs ${
                            u.status === 'ACTIVE'
                              ? 'text-rose-600 hover:bg-rose-50 border-rose-200'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          }`}
                        >
                          {u.status === 'ACTIVE' ? (
                            <>
                              <UserX className="w-3.5 h-3.5 mr-1" /> Suspend
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-3.5 h-3.5 mr-1" /> Reactivate
                            </>
                          )}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
