import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { applicationService, interviewService } from '../../api/services';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Textarea } from '../../components/ui/Textarea';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import {
  ArrowLeft,
  Calendar,
  FileText,
  Sparkles,
  User,
  Mail,
  MapPin,
  Clock,
  History,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export const ApplicationDetailsPage = () => {
  const { id } = useParams();

  const { data: appData, isLoading: appLoading, refetch } = useQuery({
    queryKey: ['recruiterApplicationDetail', id],
    queryFn: () => applicationService.getApplicationById(id),
  });

  const { data: timelineData } = useQuery({
    queryKey: ['recruiterApplicationTimeline', id],
    queryFn: () => applicationService.getTimeline(id),
  });

  const app = appData?.data;
  const timeline = timelineData?.data || [];

  const [notes, setNotes] = useState('');
  const [notesInitialized, setNotesInitialized] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesFeedback, setNotesFeedback] = useState('');

  // Interview modal state
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [interviewTitle, setInterviewTitle] = useState('Technical Architecture & Live Coding');
  const [interviewType, setInterviewType] = useState('TECHNICAL');
  const [scheduledStart, setScheduledStart] = useState('');
  const [scheduledEnd, setScheduledEnd] = useState('');
  const [meetingLink, setMeetingLink] = useState('https://meet.hireflow.io/interview');
  const [interviewNotes, setInterviewNotes] = useState('');
  const [scheduling, setScheduling] = useState(false);
  const [scheduleSuccess, setScheduleSuccess] = useState(false);

  if (app && !notesInitialized) {
    setNotes(app.internalNotes || '');
    setNotesInitialized(true);
  }

  const handleStatusChange = async (newStatus) => {
    try {
      await applicationService.updateStatus(id, newStatus);
      refetch();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    setNotesFeedback('');
    try {
      await applicationService.updateNotes(id, notes);
      setNotesFeedback('Notes saved successfully');
      refetch();
    } catch (err) {
      alert('Failed to save internal notes');
    } finally {
      setSavingNotes(false);
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    setScheduling(true);
    try {
      await interviewService.scheduleInterview({
        applicationId: id,
        title: interviewTitle,
        interviewType,
        scheduledStart: new Date(scheduledStart).toISOString(),
        scheduledEnd: new Date(scheduledEnd).toISOString(),
        meetingLink,
        notes: interviewNotes,
      });
      setScheduleSuccess(true);
      refetch();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to schedule interview');
    } finally {
      setScheduling(false);
    }
  };

  if (appLoading) {
    return <LoadingSkeleton count={3} />;
  }

  if (!app) {
    return (
      <div className="text-center py-12 space-y-3">
        <h2 className="text-lg font-bold text-text-primary">Application Not Found</h2>
        <Link to="/recruiter/pipeline">
          <Button variant="secondary" size="sm">Back to Pipeline</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Link to="/recruiter/pipeline" className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary">
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Candidate Pipeline
      </Link>

      {/* Candidate Profile Header Card */}
      <div className="bg-surface p-6 sm:p-8 rounded-xl border border-border shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-text-primary">{app.candidateName}</h1>
              <StatusBadge status={app.status} size="md" />
            </div>
            <p className="text-xs text-text-secondary">{app.candidateHeadline || 'Candidate'}</p>
            <p className="text-xs text-text-muted">Applied for: <strong className="text-brand-700">{app.jobTitle}</strong></p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              icon={Calendar}
              onClick={() => {
                const now = new Date();
                now.setDate(now.getDate() + 2);
                now.setHours(14, 0, 0, 0);
                const later = new Date(now);
                later.setMinutes(later.getMinutes() + 45);
                setScheduledStart(now.toISOString().slice(0, 16));
                setScheduledEnd(later.toISOString().slice(0, 16));
                setIsScheduleOpen(true);
              }}
            >
              Schedule Interview
            </Button>

            {/* Quick Status Advance */}
            <select
              value={app.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="text-xs font-semibold text-text-primary bg-surface border border-border rounded-md px-3 py-2 shadow-sm focus:ring-1 focus:ring-brand-500"
            >
              {['APPLIED', 'SCREENING', 'SHORTLISTED', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED'].map((st) => (
                <option key={st} value={st}>
                  Stage: {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Contact & Match Metric Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-lg bg-surface-subtle border border-border space-y-1">
            <span className="text-text-muted">Contact Info</span>
            <p className="font-semibold text-text-primary flex items-center gap-1.5 mt-0.5">
              <Mail className="w-3.5 h-3.5 text-text-muted" />
              {app.candidateEmail}
            </p>
            {app.candidateLocation && (
              <p className="text-text-secondary flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-text-muted" />
                {app.candidateLocation}
              </p>
            )}
          </div>

          <div className="p-3.5 rounded-lg bg-indigo-50 border border-indigo-200 space-y-1">
            <span className="text-indigo-800 font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              AI Skill Coverage Score
            </span>
            <p className="text-2xl font-bold text-indigo-900">
              {app.matchScore ? `${Math.round(app.matchScore)}%` : 'Pending'}
            </p>
            <Link
              to={`/recruiter/applications/${id}/match`}
              className="inline-block text-[11px] font-semibold text-indigo-700 underline"
            >
              View Match Breakdown & Evidence →
            </Link>
          </div>

          <div className="p-3.5 rounded-lg bg-surface-subtle border border-border space-y-1">
            <span className="text-text-muted">Resume Document</span>
            <p className="font-semibold text-text-primary truncate">
              {app.resumeFileName || 'Default Profile'}
            </p>
            {app.resumeId && (
              <a
                href={`/api/resumes/${app.resumeId}/download`}
                download={app.resumeFileName}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 hover:underline pt-0.5"
              >
                Download Resume PDF <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        {/* Candidate Cover Letter */}
        {app.coverLetter && (
          <div className="space-y-2 pt-2 border-t border-border">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">Candidate Introduction</h3>
            <p className="text-xs text-text-secondary bg-surface-subtle p-3.5 rounded-lg border border-border whitespace-pre-wrap leading-relaxed">
              {app.coverLetter}
            </p>
          </div>
        )}

        {/* Restricted Internal Recruiter Notes */}
        <div className="space-y-2 pt-2 border-t border-border">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
              Internal Recruiter Notes (Restricted)
            </h3>
            {notesFeedback && <span className="text-xs text-emerald-600 font-medium">{notesFeedback}</span>}
          </div>
          <Textarea
            rows={3}
            placeholder="Record private interview observations, salary expectations, and team notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <div className="flex justify-end">
            <Button size="sm" variant="secondary" onClick={handleSaveNotes} isLoading={savingNotes}>
              Save Notes
            </Button>
          </div>
        </div>

        {/* Timeline Events Feed */}
        <div className="space-y-3 pt-2 border-t border-border">
          <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">Application Timeline History</h3>
          <div className="relative border-l border-border ml-3 pl-5 space-y-4 text-xs">
            {timeline.map((event, idx) => (
              <div key={event.id || idx} className="relative">
                <span className="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-brand-600 ring-4 ring-surface" />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-text-primary">{event.newStatus || event.eventType}</span>
                    <span className="text-[10px] text-text-muted">by {event.actorName}</span>
                    <span className="text-[10px] text-text-muted">• {new Date(event.createdAt).toLocaleString()}</span>
                  </div>
                  {event.notes && <p className="text-text-secondary">{event.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Schedule Interview Modal */}
      <Modal
        isOpen={isScheduleOpen}
        onClose={() => {
          setIsScheduleOpen(false);
          setScheduleSuccess(false);
        }}
        title={`Schedule Interview: ${app.candidateName}`}
        description={`Position: ${app.jobTitle}`}
      >
        {scheduleSuccess ? (
          <div className="text-center py-6 space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-sm text-text-primary">Interview Scheduled!</h4>
            <p className="text-xs text-text-muted">
              The candidate has been notified and moved to the Interview stage.
            </p>
            <Button size="sm" onClick={() => setIsScheduleOpen(false)}>Done</Button>
          </div>
        ) : (
          <form onSubmit={handleScheduleSubmit} className="space-y-4">
            <Input
              label="Interview Title"
              value={interviewTitle}
              onChange={(e) => setInterviewTitle(e.target.value)}
              required
            />
            <Select
              label="Interview Type"
              value={interviewType}
              onChange={(e) => setInterviewType(e.target.value)}
              options={[
                { value: 'TECHNICAL', label: 'Technical Assessment' },
                { value: 'SCREENING', label: 'Preliminary Screening' },
                { value: 'BEHAVIORAL', label: 'Culture & Behavioral' },
                { value: 'EXECUTIVE', label: 'Executive Round' },
                { value: 'FINAL', label: 'Final Decision' },
              ]}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Start Time"
                type="datetime-local"
                value={scheduledStart}
                onChange={(e) => setScheduledStart(e.target.value)}
                required
              />
              <Input
                label="End Time"
                type="datetime-local"
                value={scheduledEnd}
                onChange={(e) => setScheduledEnd(e.target.value)}
                required
              />
            </div>
            <Input
              label="Meeting Video Link"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              placeholder="https://meet.google.com/xyz or Zoom URL"
            />
            <Textarea
              label="Interviewer Instructions & Notes"
              rows={3}
              placeholder="Core focus areas (e.g. system design, Spring Boot transactions, React state)..."
              value={interviewNotes}
              onChange={(e) => setInterviewNotes(e.target.value)}
            />
            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button variant="secondary" size="sm" onClick={() => setIsScheduleOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={scheduling}>
                Confirm Schedule
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
