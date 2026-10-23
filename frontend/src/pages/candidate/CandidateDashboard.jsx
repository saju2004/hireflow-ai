import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { applicationService, interviewService, resumeService } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import { MetricCard } from '../../components/ui/MetricCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import {
  FileText,
  Calendar,
  UploadCloud,
  Search,
  ExternalLink,
  Building2,
  Clock,
  Sparkles,
} from 'lucide-react';

export const CandidateDashboard = () => {
  const { user } = useAuth();

  const { data: appsData, isLoading: appsLoading } = useQuery({
    queryKey: ['myApplications'],
    queryFn: () => applicationService.getMyApplications(),
  });

  const { data: interviewsData, isLoading: interviewsLoading } = useQuery({
    queryKey: ['myInterviews'],
    queryFn: () => interviewService.getCandidateInterviews(),
  });

  const { data: resumesData, isLoading: resumesLoading } = useQuery({
    queryKey: ['myResumes'],
    queryFn: () => resumeService.getMyResumes(),
  });

  const applications = appsData?.data || [];
  const interviews = interviewsData?.data || [];
  const resumes = resumesData?.data || [];

  if (appsLoading || interviewsLoading || resumesLoading) {
    return <LoadingSkeleton count={3} />;
  }

  const activeInterviews = interviews.filter((i) => i.status === 'SCHEDULED');

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            Track your job applications, interview schedules, and parsed resume profile
          </p>
        </div>
        <Link to="/candidate/jobs">
          <Button icon={Search} size="sm">
            Search Jobs
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Active Applications"
          value={applications.length}
          subtitle="Positions submitted"
          icon={FileText}
        />
        <MetricCard
          title="Scheduled Interviews"
          value={activeInterviews.length}
          subtitle="Upcoming discussions"
          icon={Calendar}
        />
        <MetricCard
          title="Parsed Resumes"
          value={resumes.length}
          subtitle={resumes.length > 0 ? 'Skills extracted and active' : 'No resume uploaded'}
          icon={UploadCloud}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Applications Table */}
        <div className="lg:col-span-2 bg-surface p-5 rounded-lg border border-border shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">
              Recent Application Progress
            </h2>
            <Link to="/candidate/applications" className="text-xs text-brand-600 hover:text-brand-700 font-medium">
              View All ({applications.length})
            </Link>
          </div>

          {applications.length === 0 ? (
            <div className="text-center py-8 text-xs text-text-muted space-y-3">
              <p>You haven't submitted any job applications yet.</p>
              <Link to="/candidate/jobs">
                <Button size="sm" variant="secondary">Browse Open Positions</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-text-muted">
                    <th className="pb-2 font-semibold">Position</th>
                    <th className="pb-2 font-semibold">Company</th>
                    <th className="pb-2 font-semibold">Status</th>
                    <th className="pb-2 font-semibold">Match</th>
                    <th className="pb-2 font-semibold text-right">Applied</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {applications.slice(0, 5).map((app) => (
                    <tr key={app.id} className="hover:bg-surface-subtle transition-colors">
                      <td className="py-3 font-semibold text-text-primary">
                        {app.jobTitle}
                      </td>
                      <td className="py-3 text-text-secondary">
                        {app.organizationName}
                      </td>
                      <td className="py-3">
                        <StatusBadge status={app.status} />
                      </td>
                      <td className="py-3">
                        {app.matchScore ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-[11px] border border-indigo-200">
                            <Sparkles className="w-3 h-3 text-indigo-600" />
                            {Math.round(app.matchScore)}%
                          </span>
                        ) : (
                          <span className="text-text-muted">—</span>
                        )}
                      </td>
                      <td className="py-3 text-right text-text-muted">
                        {new Date(app.appliedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Upcoming Interviews Widget */}
        <div className="bg-surface p-5 rounded-lg border border-border shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">
              Upcoming Interviews
            </h2>
            <Link to="/candidate/interviews" className="text-xs text-brand-600 hover:text-brand-700 font-medium">
              Schedule
            </Link>
          </div>

          {activeInterviews.length === 0 ? (
            <div className="text-center py-8 text-xs text-text-muted">
              No upcoming interviews scheduled
            </div>
          ) : (
            <div className="space-y-3">
              {activeInterviews.slice(0, 3).map((interview) => (
                <div key={interview.id} className="p-3 rounded-lg border border-border bg-surface-subtle space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-text-primary">{interview.title}</span>
                    <span className="text-[10px] uppercase font-semibold text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded border border-brand-200">
                      {interview.interviewType}
                    </span>
                  </div>
                  <p className="text-[11px] text-text-secondary flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-text-muted" />
                    {interview.organizationName}
                  </p>
                  <div className="flex items-center justify-between pt-1 border-t border-border text-[11px] text-text-muted">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(interview.scheduledStart).toLocaleDateString()} {new Date(interview.scheduledStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {interview.meetingLink && (
                      <a
                        href={interview.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-brand-600 hover:underline flex items-center gap-0.5 font-medium"
                      >
                        Join <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
