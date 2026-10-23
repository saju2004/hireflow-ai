import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../../api/services';
import { MetricCard } from '../../components/ui/MetricCard';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
} from 'recharts';
import { BarChart3, Users, Briefcase, Calendar, TrendingUp } from 'lucide-react';

const STAGE_COLORS = {
  APPLIED: '#64748b',
  SCREENING: '#3b82f6',
  SHORTLISTED: '#6366f1',
  INTERVIEW: '#f59e0b',
  OFFER: '#a855f7',
  HIRED: '#10b981',
  REJECTED: '#ef4444',
  WITHDRAWN: '#94a3b8',
};

export const RecruitmentAnalyticsPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['recruiterFullAnalytics'],
    queryFn: () => analyticsService.getRecruiterAnalytics(),
  });

  const stats = data?.data;

  if (isLoading) {
    return <LoadingSkeleton count={4} />;
  }

  const stageData = stats?.stageDistribution || [];
  const funnelData = stats?.conversionFunnel || [];

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">Recruitment Analytics</h1>
        <p className="text-xs text-text-muted">Database-backed metrics on applicant throughput, conversion rates, and volume</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Published Requisitions"
          value={stats?.publishedJobs || 0}
          subtitle={`Total jobs: ${stats?.totalJobs || 0}`}
          icon={Briefcase}
        />
        <MetricCard
          title="Total Candidate Pool"
          value={stats?.totalApplications || 0}
          subtitle="Processed through pipeline"
          icon={Users}
        />
        <MetricCard
          title="Interviews Conducted"
          value={stats?.scheduledInterviews || 0}
          subtitle="Evaluations completed"
          icon={Calendar}
        />
        <MetricCard
          title="Overall Hire Rate"
          value={`${stats?.overallHireRate || 0}%`}
          subtitle="Candidate to offer conversion"
          icon={TrendingUp}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applications by Stage Chart */}
        <div className="bg-surface p-6 rounded-xl border border-border shadow-card space-y-4">
          <div>
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">
              Applications by Stage
            </h2>
            <p className="text-xs text-text-muted">Volume of candidates in each active pipeline stage</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="stage"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  angle={-25}
                  textAnchor="end"
                />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {stageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STAGE_COLORS[entry.stage] || '#6366f1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hiring Conversion Funnel Chart */}
        <div className="bg-surface p-6 rounded-xl border border-border shadow-card space-y-4">
          <div>
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">
              Hiring Funnel Progression
            </h2>
            <p className="text-xs text-text-muted">Candidate advancement and retention percentage across stages</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={funnelData} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="step"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} unit="%" domain={[0, 100]} />
                <Tooltip
                  formatter={(value, name) => [`${value}%`, 'Retention Rate']}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', fontSize: '12px' }}
                />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="#4f46e5"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#4f46e5' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Funnel Step Table */}
      <div className="bg-surface rounded-xl border border-border shadow-card overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
            Detailed Funnel Metrics
          </h3>
        </div>
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border bg-surface-subtle text-text-muted font-semibold">
              <th className="py-2.5 px-4">Funnel Milestone</th>
              <th className="py-2.5 px-4 text-center">Candidate Count</th>
              <th className="py-2.5 px-4 text-right">Funnel Conversion Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {funnelData.map((f, i) => (
              <tr key={i} className="hover:bg-surface-subtle">
                <td className="py-3 px-4 font-semibold text-text-primary">{f.step}</td>
                <td className="py-3 px-4 text-center">{f.count} candidates</td>
                <td className="py-3 px-4 text-right font-bold text-brand-700">{f.rate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
