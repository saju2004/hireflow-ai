import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { analyticsService, jobService } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import { MetricCard } from '../../components/ui/MetricCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import {
  Briefcase,
  Users,
  Calendar,
  TrendingUp,
  PlusCircle,
  ExternalLink,
  Sparkles,
  Building2,
} from 'lucide-react';

export const RecruiterDashboard = () => {
  const { user } = useAuth();

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['recruiterAnalyticsKPI'],
    queryFn: () => analyticsService.getRecruiterAnalytics(),
  });

  const stats = analyticsData?.data;

  if (isLoading) {
    return <LoadingSkeleton count={4} />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Recruiter Dashboard
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            Active workspace: <strong className="text-text-primary">{user?.organizationName || 'Acme Technologies'}</strong>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/recruiter/pipeline">
            <Button variant="secondary" size="sm" icon={Users}>
              Open Pipeline
            </Button>
          </Link>
          <Link to="/recruiter/jobs/create">
            <Button size="sm" icon={PlusCircle}>
              Post Job
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Published Jobs"
          value={stats?.publishedJobs || 0}
          subtitle={`Total created: ${stats?.totalJobs || 0}`}
          icon={Briefcase}
        />
        <MetricCard
          title="Total Applications"
          value={stats?.totalApplications || 0}
          subtitle="Across active roles"
          icon={Users}
        />
        <MetricCard
          title="Interviews Conducted"
          value={stats?.scheduledInterviews || 0}
          subtitle="Scheduled & completed"
          icon={Calendar}
        />
        <MetricCard
          title="Hiring Rate"
          value={`${stats?.overallHireRate || 0}%`}
          subtitle="Application-to-hire ratio"
          icon={TrendingUp}
        />
      </div>

      {/* Pipeline Distribution Bar Overview */}
      <div className="bg-surface p-5 rounded-xl border border-border shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">
              Application Pipeline Distribution
            </h2>
            <p className="text-xs text-text-muted">Real-time candidate count by active stage</p>
          </div>
          <Link to="/recruiter/pipeline" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
            View Interactive Kanban →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {stats?.stageDistribution?.map((item) => (
            <div
              key={item.stage}
              className="p-3 rounded-lg border border-border bg-surface-subtle text-center space-y-1"
            >
              <span className="block text-xl font-bold text-text-primary">{item.count}</span>
              <span className="block text-[10px] font-semibold text-text-muted uppercase tracking-wider truncate">
                {item.stage}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Applications Feed */}
      <div className="bg-surface p-5 rounded-xl border border-border shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">
            Recent Candidate Activity
          </h2>
          <Link to="/recruiter/pipeline" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
            Full Pipeline
          </Link>
        </div>

        {stats?.recentApplications?.length === 0 ? (
          <div className="text-center py-8 text-xs text-text-muted">
            No recent applications received yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-text-muted font-semibold">
                  <th className="pb-2.5">Candidate Name</th>
                  <th className="pb-2.5">Applied Position</th>
                  <th className="pb-2.5">Stage</th>
                  <th className="pb-2.5 text-right">Applied Date</th>
                  <th className="pb-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {stats?.recentApplications?.map((app) => (
                  <tr key={app.id} className="hover:bg-surface-subtle transition-colors">
                    <td className="py-3 font-semibold text-text-primary">
                      {app.candidateName}
                    </td>
                    <td className="py-3 text-text-secondary">{app.jobTitle}</td>
                    <td className="py-3">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="py-3 text-right text-text-muted">
                      {new Date(app.appliedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        to={`/recruiter/applications/${app.id}`}
                        className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                      >
                        Review
                      </Link>
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
};
