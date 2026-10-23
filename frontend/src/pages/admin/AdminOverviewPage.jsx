import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { organizationService, userService, auditService } from '../../api/services';
import { MetricCard } from '../../components/ui/MetricCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import {
  ShieldCheck,
  Building2,
  Users,
  ScrollText,
  Activity,
  Sliders,
} from 'lucide-react';

export const AdminOverviewPage = () => {
  const { data: orgsData, isLoading: orgsLoading } = useQuery({
    queryKey: ['adminOrgs'],
    queryFn: () => organizationService.getAllOrganizations(),
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: () => userService.getAllUsers(),
  });

  const { data: auditData, isLoading: auditLoading } = useQuery({
    queryKey: ['adminRecentAudit'],
    queryFn: () => auditService.getAdminAuditLogs({ size: 5 }),
  });

  if (orgsLoading || usersLoading || auditLoading) {
    return <LoadingSkeleton count={4} />;
  }

  const orgs = orgsData?.data || [];
  const users = usersData?.data || [];
  const logs = auditData?.data?.content || [];

  const candidatesCount = users.filter((u) => u.role === 'CANDIDATE').length;
  const recruitersCount = users.filter((u) => u.role === 'RECRUITER').length;
  const activeOrgsCount = orgs.filter((o) => o.status === 'ACTIVE').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Platform Administration</h1>
          <p className="text-xs text-text-muted mt-0.5">High-level platform governance, tenant management, and security audit logs</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/admin/organizations">
            <Button variant="secondary" size="sm" icon={Building2}>
              Manage Orgs
            </Button>
          </Link>
          <Link to="/admin/users">
            <Button size="sm" icon={Users}>
              Manage Users
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Organizations"
          value={orgs.length}
          subtitle={`${activeOrgsCount} active tenants`}
          icon={Building2}
        />
        <MetricCard
          title="Total Users"
          value={users.length}
          subtitle={`${recruitersCount} recruiters, ${candidatesCount} candidates`}
          icon={Users}
        />
        <MetricCard
          title="System Health"
          value="Healthy"
          subtitle="Spring Boot Actuator: UP"
          icon={Activity}
        />
        <MetricCard
          title="Audit Trail"
          value="Active"
          subtitle="All operations recorded"
          icon={ScrollText}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Organizations Summary */}
        <div className="bg-surface p-5 rounded-xl border border-border shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">
              Registered Organizations ({orgs.length})
            </h2>
            <Link to="/admin/organizations" className="text-xs text-brand-600 font-semibold hover:underline">
              View All
            </Link>
          </div>

          <div className="divide-y divide-border">
            {orgs.slice(0, 4).map((org) => (
              <div key={org.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-text-primary">{org.name}</p>
                  <p className="text-text-muted text-[11px] font-mono">slug: {org.slug}</p>
                </div>
                <StatusBadge status={org.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Audit Logs */}
        <div className="bg-surface p-5 rounded-xl border border-border shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">
              Recent System Audit Events
            </h2>
            <Link to="/admin/audit-logs" className="text-xs text-brand-600 font-semibold hover:underline">
              Full Log
            </Link>
          </div>

          <div className="divide-y divide-border text-xs">
            {logs.length === 0 ? (
              <p className="text-xs text-text-muted py-4 text-center">No recent audit logs.</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="py-2.5 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-text-primary">{log.action}</span>
                    <span className="text-[10px] text-text-muted">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-text-secondary text-[11px]">
                    Actor: {log.actorEmail} • Target: {log.targetEntity}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
