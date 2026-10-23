import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { jobService } from '../../api/services';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  Briefcase,
  PlusCircle,
  Edit2,
  Trash2,
  Users,
  Eye,
  CheckCircle,
  PauseCircle,
  XCircle,
} from 'lucide-react';

export const JobManagementPage = () => {
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['recruiterJobsList'],
    queryFn: () => jobService.getRecruiterJobs(),
  });

  const jobs = data?.data?.content || [];

  const handleStatusChange = async (id, newStatus) => {
    try {
      await jobService.updateJobStatus(id, newStatus);
      refetch();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update job status');
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to permanently delete "${title}"?`)) {
      try {
        await jobService.deleteJob(id);
        refetch();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete job');
      }
    }
  };

  const filteredJobs = statusFilter ? jobs.filter((j) => j.status === statusFilter) : jobs;

  if (isLoading) {
    return <LoadingSkeleton count={4} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Job Postings</h1>
          <p className="text-xs text-text-muted mt-0.5">Manage your organization's active, draft, and closed positions</p>
        </div>
        <Link to="/recruiter/jobs/create">
          <Button size="sm" icon={PlusCircle}>
            Create Job Posting
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 border-b border-border pb-2 text-xs">
        {['', 'PUBLISHED', 'DRAFT', 'PAUSED', 'CLOSED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              statusFilter === st
                ? 'bg-brand-50 text-brand-700 font-semibold'
                : 'text-text-muted hover:text-text-primary hover:bg-surface-subtle'
            }`}
          >
            {st ? st.charAt(0) + st.slice(1).toLowerCase() : 'All Jobs'}
          </button>
        ))}
      </div>

      {/* Jobs Table */}
      {filteredJobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No job postings found"
          description="Create your first role opening to begin receiving applicant profiles."
          actionLabel="Create First Job"
          onAction={() => (window.location.href = '/recruiter/jobs/create')}
        />
      ) : (
        <div className="bg-surface rounded-xl border border-border shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border bg-surface-subtle text-text-muted font-semibold">
                  <th className="py-3 px-4">Job Title</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Workplace</th>
                  <th className="py-3 px-4">Experience</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-surface-subtle transition-colors">
                    <td className="py-3.5 px-4">
                      <div>
                        <Link
                          to={`/recruiter/jobs/${job.id}/edit`}
                          className="font-semibold text-sm text-text-primary hover:text-brand-600 transition-colors"
                        >
                          {job.title}
                        </Link>
                        <p className="text-xs text-text-muted mt-0.5">{job.location}</p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={job.status} />
                    </td>
                    <td className="py-3.5 px-4 text-text-secondary">{job.workplaceType}</td>
                    <td className="py-3.5 px-4 text-text-secondary">{job.experienceLevel}</td>
                    <td className="py-3.5 px-4 text-text-muted">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <Link to={`/recruiter/pipeline?jobId=${job.id}`} title="View Candidates">
                          <Button variant="ghost" size="sm" icon={Users}>
                            Pipeline
                          </Button>
                        </Link>

                        {/* Status Toggle Menu */}
                        {job.status === 'DRAFT' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleStatusChange(job.id, 'PUBLISHED')}
                          >
                            Publish
                          </Button>
                        )}
                        {job.status === 'PUBLISHED' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleStatusChange(job.id, 'PAUSED')}
                          >
                            Pause
                          </Button>
                        )}
                        {job.status === 'PAUSED' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleStatusChange(job.id, 'PUBLISHED')}
                          >
                            Resume
                          </Button>
                        )}

                        <Link to={`/recruiter/jobs/${job.id}/edit`} className="p-1.5 text-text-muted hover:text-text-primary rounded hover:bg-surface-subtle">
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(job.id, job.title)}
                          className="p-1.5 text-text-muted hover:text-status-danger rounded hover:bg-rose-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
