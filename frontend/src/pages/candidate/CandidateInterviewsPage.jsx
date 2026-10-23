import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { interviewService } from '../../api/services';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Calendar, Video, Clock, Building2, ExternalLink } from 'lucide-react';

export const CandidateInterviewsPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['candidateInterviewsList'],
    queryFn: () => interviewService.getCandidateInterviews(),
  });

  const interviews = data?.data || [];

  if (isLoading) {
    return <LoadingSkeleton count={3} />;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">Interview Schedule</h1>
        <p className="text-xs text-text-muted">Manage your upcoming technical evaluations and recruiter screenings</p>
      </div>

      {interviews.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No interviews scheduled yet"
          description="When a recruiter moves your application to the interview stage, your meeting links and time slots will appear here."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {interviews.map((interview) => (
            <div
              key={interview.id}
              className="bg-surface p-5 rounded-xl border border-border shadow-card flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="text-base font-bold text-text-primary">{interview.title}</h2>
                    <p className="text-xs font-medium text-brand-700 flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3.5 h-3.5" />
                      {interview.organizationName}
                    </p>
                  </div>
                  <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                    {interview.interviewType}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-surface-subtle border border-border space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-text-primary font-medium">
                    <Clock className="w-4 h-4 text-text-muted" />
                    <span>
                      {new Date(interview.scheduledStart).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-text-muted pl-6">
                    {new Date(interview.scheduledStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                    {new Date(interview.scheduledEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({interview.timezone || 'UTC'})
                  </p>
                </div>

                {interview.notes && (
                  <p className="text-xs text-text-secondary italic bg-slate-50 p-2.5 rounded border border-border">
                    "{interview.notes}"
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between">
                <StatusBadge status={interview.status} />
                {interview.meetingLink ? (
                  <a
                    href={interview.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md bg-brand-600 text-white hover:bg-brand-700 shadow-xs transition-colors"
                  >
                    <Video className="w-3.5 h-3.5" />
                    Join Video Call
                  </a>
                ) : (
                  <span className="text-xs text-text-muted">{interview.location || 'Remote'}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
