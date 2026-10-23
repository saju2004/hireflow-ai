import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { applicationService } from '../../api/services';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  FileText,
  Building2,
  Calendar,
  Sparkles,
  History,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

export const MyApplicationsPage = () => {
  const [selectedAppForTimeline, setSelectedAppForTimeline] = useState(null);
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [loadingTimeline, setLoadingTimeline] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['myCandidateApplications'],
    queryFn: () => applicationService.getMyApplications(),
  });

  const applications = data?.data || [];

  const handleOpenTimeline = async (app) => {
    setSelectedAppForTimeline(app);
    setLoadingTimeline(true);
    try {
      const res = await applicationService.getTimeline(app.id);
      setTimelineEvents(res?.data || []);
    } catch (err) {
      console.error(err);
      setTimelineEvents([]);
    } finally {
      setLoadingTimeline(false);
    }
  };

  const handleWithdraw = async (appId) => {
    if (window.confirm('Are you sure you want to withdraw this application? This action cannot be reversed.')) {
      try {
        await applicationService.withdrawApplication(appId);
        refetch();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to withdraw application');
      }
    }
  };

  if (isLoading) {
    return <LoadingSkeleton count={4} />;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">My Applications</h1>
        <p className="text-xs text-text-muted">Track real-time hiring stage transitions and status updates</p>
      </div>

      {applications.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No applications submitted"
          description="Find positions that match your skills and apply in minutes."
          actionLabel="Explore Open Roles"
          onAction={() => (window.location.href = '/candidate/jobs')}
        />
      ) : (
        <div className="bg-surface rounded-xl border border-border shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border bg-surface-subtle text-text-muted font-semibold">
                  <th className="py-3 px-4">Role & Organization</th>
                  <th className="py-3 px-4">Current Stage</th>
                  <th className="py-3 px-4">Skill Match</th>
                  <th className="py-3 px-4">Resume Submitted</th>
                  <th className="py-3 px-4">Applied Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-surface-subtle transition-colors">
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-semibold text-sm text-text-primary">{app.jobTitle}</p>
                        <p className="text-xs text-brand-700 font-medium flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3 text-text-muted" />
                          {app.organizationName} • {app.jobLocation}
                        </p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="py-3.5 px-4">
                      {app.matchScore ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-xs border border-indigo-200">
                          <Sparkles className="w-3 h-3 text-indigo-600" />
                          {Math.round(app.matchScore)}%
                        </span>
                      ) : (
                        <span className="text-text-muted">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-text-muted">
                      {app.resumeFileName || 'Default Profile'}
                    </td>
                    <td className="py-3.5 px-4 text-text-muted">
                      {new Date(app.appliedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={History}
                          onClick={() => handleOpenTimeline(app)}
                        >
                          Timeline
                        </Button>
                        {app.status !== 'WITHDRAWN' && app.status !== 'HIRED' && app.status !== 'REJECTED' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-status-danger hover:bg-rose-50"
                            onClick={() => handleWithdraw(app.id)}
                          >
                            Withdraw
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Application Timeline Modal */}
      <Modal
        isOpen={!!selectedAppForTimeline}
        onClose={() => setSelectedAppForTimeline(null)}
        title={`Application Timeline: ${selectedAppForTimeline?.jobTitle}`}
        description={`Organization: ${selectedAppForTimeline?.organizationName}`}
      >
        <div className="space-y-4">
          {loadingTimeline ? (
            <div className="py-8 text-center text-xs text-text-muted">Loading timeline events...</div>
          ) : timelineEvents.length === 0 ? (
            <div className="py-6 text-center text-xs text-text-muted">No timeline events recorded yet.</div>
          ) : (
            <div className="relative border-l border-border ml-3 pl-5 space-y-5 my-2">
              {timelineEvents.map((event, idx) => (
                <div key={event.id || idx} className="relative">
                  {/* Dot */}
                  <span className="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-brand-600 ring-4 ring-surface" />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-text-primary">
                        {event.newStatus || event.eventType}
                      </span>
                      <span className="text-[10px] text-text-muted">
                        {new Date(event.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {event.notes && (
                      <p className="text-xs text-text-secondary bg-surface-subtle p-2 rounded border border-border">
                        {event.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-3 border-t border-border">
            <Button size="sm" variant="secondary" onClick={() => setSelectedAppForTimeline(null)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
