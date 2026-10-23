import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { organizationService } from '../../api/services';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { Building2, Globe, ShieldAlert, CheckCircle } from 'lucide-react';

export const AdminOrganizationsPage = () => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['adminOrgsList'],
    queryFn: () => organizationService.getAllOrganizations(),
  });

  const orgs = data?.data || [];

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    const confirmText = `Are you sure you want to change status to ${newStatus}?`;
    if (window.confirm(confirmText)) {
      try {
        await organizationService.updateStatus(id, newStatus);
        refetch();
      } catch (err) {
        alert('Failed to update organization status');
      }
    }
  };

  if (isLoading) {
    return <LoadingSkeleton count={3} />;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">Organization Tenants</h1>
        <p className="text-xs text-text-muted">Oversee multi-tenant organizations, domains, and suspension controls</p>
      </div>

      <div className="bg-surface rounded-xl border border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-surface-subtle text-text-muted font-semibold">
                <th className="py-3 px-4">Organization Name</th>
                <th className="py-3 px-4">Tenant Slug</th>
                <th className="py-3 px-4">Domain</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Registered Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orgs.map((org) => (
                <tr key={org.id} className="hover:bg-surface-subtle transition-colors">
                  <td className="py-3 px-4 font-semibold text-text-primary flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-brand-600" />
                    {org.name}
                  </td>
                  <td className="py-3 px-4 font-mono text-text-muted">{org.slug}</td>
                  <td className="py-3 px-4 text-text-secondary">{org.domain || '—'}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={org.status} />
                  </td>
                  <td className="py-3 px-4 text-text-muted">
                    {new Date(org.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button
                      variant={org.status === 'ACTIVE' ? 'ghost' : 'secondary'}
                      size="sm"
                      className={org.status === 'ACTIVE' ? 'text-status-danger hover:bg-rose-50' : 'text-emerald-700'}
                      onClick={() => handleToggleStatus(org.id, org.status)}
                    >
                      {org.status === 'ACTIVE' ? 'Suspend Tenant' : 'Reactivate Tenant'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
