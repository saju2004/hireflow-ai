import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationService, jobService } from '../../api/services';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  Users,
  LayoutGrid,
  List,
  Sparkles,
  ChevronRight,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Calendar,
} from 'lucide-react';

const PIPELINE_STAGES = [
  'APPLIED',
  'SCREENING',
  'SHORTLISTED',
  'INTERVIEW',
  'OFFER',
  'HIRED',
  'REJECTED',
];

export const CandidatePipelinePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const selectedJobId = searchParams.get('jobId') || '';
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'table'
  const [optimisticError, setOptimisticError] = useState('');

  // Fetch organization jobs for filter dropdown
  const { data: jobsData } = useQuery({
    queryKey: ['recruiterJobsForFilter'],
    queryFn: () => jobService.getRecruiterJobs({ size: 100 }),
  });

  const jobs = jobsData?.data?.content || [];

  // Fetch applications
  const { data: appsData, isLoading } = useQuery({
    queryKey: ['recruiterPipelineApplications', selectedJobId],
    queryFn: () => applicationService.getRecruiterApplications({ jobId: selectedJobId || undefined, size: 100 }),
  });

  const applications = appsData?.data?.content || [];

  // Stage transition mutation with optimistic update
  const stageMutation = useMutation({
    mutationFn: ({ appId, newStatus }) => applicationService.updateStatus(appId, newStatus),
    onMutate: async ({ appId, newStatus }) => {
      setOptimisticError('');
      await queryClient.cancelQueries(['recruiterPipelineApplications', selectedJobId]);
      const previousApps = queryClient.getQueryData(['recruiterPipelineApplications', selectedJobId]);

      // Optimistically update cache
      queryClient.setQueryData(['recruiterPipelineApplications', selectedJobId], (old) => {
        if (!old?.data?.content) return old;
        return {
          ...old,
          data: {
            ...old.data,
            content: old.data.content.map((app) =>
              app.id === appId ? { ...app, status: newStatus } : app
            ),
          },
        };
      });

      return { previousApps };
    },
    onError: (err, variables, context) => {
      // Rollback on failure
      if (context?.previousApps) {
        queryClient.setQueryData(['recruiterPipelineApplications', selectedJobId], context.previousApps);
      }
      setOptimisticError(err.response?.data?.message || 'Stage transition failed');
    },
    onSettled: () => {
      queryClient.invalidateQueries(['recruiterPipelineApplications']);
      queryClient.invalidateQueries(['recruiterAnalyticsKPI']);
    },
  });

  const handleStageChange = (appId, newStatus) => {
    stageMutation.mutate({ appId, newStatus });
  };

  if (isLoading) {
    return <LoadingSkeleton count={4} />;
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Candidate Pipeline</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Advance candidates through stages with validated state transitions and timeline auditing
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="inline-flex rounded-md border border-border p-0.5 bg-surface-subtle">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded text-xs font-medium flex items-center gap-1 ${
                viewMode === 'kanban' ? 'bg-surface text-brand-700 shadow-xs' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Kanban
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded text-xs font-medium flex items-center gap-1 ${
                viewMode === 'table' ? 'bg-surface text-brand-700 shadow-xs' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              Table
            </button>
          </div>

          {/* Job Filter Dropdown */}
          <div className="w-56">
            <Select
              value={selectedJobId}
              onChange={(e) => {
                if (e.target.value) {
                  setSearchParams({ jobId: e.target.value });
                } else {
                  setSearchParams({});
                }
              }}
              options={[
                { value: '', label: 'All Job Requisitions' },
                ...jobs.map((j) => ({ value: j.id, label: j.title })),
              ]}
            />
          </div>
        </div>
      </div>

      {optimisticError && (
        <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center justify-between">
          <span>{optimisticError}</span>
          <button onClick={() => setOptimisticError('')} className="font-semibold text-rose-800">
            Dismiss
          </button>
        </div>
      )}

      {/* KANBAN BOARD VIEW */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-3 overflow-x-auto pb-4 items-start min-h-[550px]">
          {PIPELINE_STAGES.map((stage) => {
            const stageApps = applications.filter((app) => app.status === stage);

            return (
              <div
                key={stage}
                className="bg-surface-subtle border border-border rounded-xl p-3 flex flex-col space-y-3 min-w-[210px] min-h-[480px]"
              >
                {/* Stage Header */}
                <div className="flex items-center justify-between border-b border-border pb-2 px-1">
                  <span className="text-xs font-bold text-text-primary tracking-wider">{stage}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-surface border border-border text-text-secondary">
                    {stageApps.length}
                  </span>
                </div>

                {/* Candidate Cards */}
                <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[680px]">
                  {stageApps.length === 0 ? (
                    <div className="py-8 text-center text-[11px] text-text-muted italic">
                      No candidates in {stage.toLowerCase()}
                    </div>
                  ) : (
                    stageApps.map((app) => (
                      <div
                        key={app.id}
                        className="bg-surface p-3.5 rounded-lg border border-border shadow-card hover:border-brand-400 transition-all space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <Link
                            to={`/recruiter/applications/${app.id}`}
                            className="font-bold text-xs text-text-primary hover:text-brand-600 transition-colors leading-snug"
                          >
                            {app.candidateName}
                          </Link>
                          {app.matchScore && (
                            <span
                              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200"
                              title="Calculated AI Skill Match"
                            >
                              <Sparkles className="w-2.5 h-2.5 text-indigo-600" />
                              {Math.round(app.matchScore)}%
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-text-secondary font-medium truncate" title={app.jobTitle}>
                          {app.jobTitle}
                        </p>

                        {app.candidateHeadline && (
                          <p className="text-[10px] text-text-muted line-clamp-1 italic">
                            {app.candidateHeadline}
                          </p>
                        )}

                        <div className="pt-2 border-t border-border flex items-center justify-between">
                          <span className="text-[10px] text-text-muted">
                            {new Date(app.appliedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>

                          {/* Quick Stage Advance Selector */}
                          <select
                            value={app.status}
                            onChange={(e) => handleStageChange(app.id, e.target.value)}
                            className="text-[11px] font-semibold text-brand-700 bg-brand-50 border border-brand-200 rounded px-1.5 py-0.5 focus:outline-none hover:bg-brand-100 transition-colors cursor-pointer"
                          >
                            {PIPELINE_STAGES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ACCESSIBLE TABLE VIEW */
        <div className="bg-surface rounded-xl border border-border shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border bg-surface-subtle text-text-muted font-semibold">
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Target Role</th>
                  <th className="py-3 px-4">Current Stage</th>
                  <th className="py-3 px-4">Match Score</th>
                  <th className="py-3 px-4">Applied</th>
                  <th className="py-3 px-4 text-right">Advance Stage</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-surface-subtle transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-semibold text-text-primary">{app.candidateName}</p>
                        <p className="text-text-muted text-[11px]">{app.candidateEmail}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-text-secondary font-medium">{app.jobTitle}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="py-3 px-4">
                      {app.matchScore ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-[11px] border border-indigo-200">
                          <Sparkles className="w-3 h-3 text-indigo-600" />
                          {Math.round(app.matchScore)}%
                        </span>
                      ) : (
                        <span className="text-text-muted">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-text-muted">
                      {new Date(app.appliedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <select
                        value={app.status}
                        onChange={(e) => handleStageChange(app.id, e.target.value)}
                        className="text-xs font-semibold text-brand-700 bg-brand-50 border border-brand-200 rounded px-2 py-1"
                      >
                        {PIPELINE_STAGES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link to={`/recruiter/applications/${app.id}`}>
                        <Button variant="ghost" size="sm">
                          Review
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
