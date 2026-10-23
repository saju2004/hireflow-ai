import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { interviewService } from '../../api/services';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  Calendar,
  Video,
  Clock,
  User,
  Star,
  CheckCircle2,
  FileCheck2,
  ExternalLink,
} from 'lucide-react';

export const RecruiterInterviewsPage = () => {
  const [selectedForFeedback, setSelectedForFeedback] = useState(null);
  const [overallRating, setOverallRating] = useState('4');
  const [technicalRating, setTechnicalRating] = useState('4');
  const [communicationRating, setCommunicationRating] = useState('4');
  const [cultureFitRating, setCultureFitRating] = useState('4');
  const [strengths, setStrengths] = useState('');
  const [weaknesses, setWeaknesses] = useState('');
  const [recommendation, setRecommendation] = useState('HIRE');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['recruiterInterviewsList'],
    queryFn: () => interviewService.getRecruiterInterviews(),
  });

  const interviews = data?.data || [];

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!selectedForFeedback) return;
    setSubmittingFeedback(true);

    try {
      await interviewService.submitFeedback(selectedForFeedback.id, {
        overallRating: Number(overallRating),
        technicalRating: Number(technicalRating),
        communicationRating: Number(communicationRating),
        cultureFitRating: Number(cultureFitRating),
        strengths,
        weaknesses,
        recommendation,
      });
      setSelectedForFeedback(null);
      refetch();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit interview feedback');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await interviewService.updateStatus(id, status);
      refetch();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  if (isLoading) {
    return <LoadingSkeleton count={3} />;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">Interview Management</h1>
        <p className="text-xs text-text-muted">Coordinate candidate discussions and submit structured score evaluations</p>
      </div>

      {interviews.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No interviews scheduled"
          description="Schedule interviews directly from any candidate's application profile in your pipeline."
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
                    <p className="text-xs text-brand-700 font-semibold mt-0.5">
                      Candidate: {interview.candidateName} • {interview.jobTitle}
                    </p>
                  </div>
                  <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                    {interview.interviewType}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-surface-subtle border border-border text-xs space-y-1.5">
                  <div className="flex items-center gap-2 text-text-primary font-medium">
                    <Clock className="w-4 h-4 text-text-muted" />
                    <span>
                      {new Date(interview.scheduledStart).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}{' '}
                      ({new Date(interview.scheduledStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                      {new Date(interview.scheduledEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                    </span>
                  </div>
                  <p className="text-text-muted pl-6">
                    Interviewer: {interview.interviewerName}
                  </p>
                </div>

                {/* Feedback badge if completed */}
                {interview.feedback && (
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-900 flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        Rating: {interview.feedback.overallRating}/5
                      </span>
                      <span className="font-bold uppercase text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {interview.feedback.recommendation?.replace('_', ' ')}
                      </span>
                    </div>
                    {interview.feedback.strengths && (
                      <p className="text-emerald-800 text-[11px]">Strengths: {interview.feedback.strengths}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between">
                <StatusBadge status={interview.status} />

                <div className="flex items-center gap-2">
                  {interview.status === 'SCHEDULED' && (
                    <>
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={FileCheck2}
                        onClick={() => {
                          setSelectedForFeedback(interview);
                          if (interview.feedback) {
                            setOverallRating(String(interview.feedback.overallRating));
                            setRecommendation(interview.feedback.recommendation);
                            setStrengths(interview.feedback.strengths || '');
                            setWeaknesses(interview.feedback.weaknesses || '');
                          }
                        }}
                      >
                        Submit Feedback
                      </Button>
                      {interview.meetingLink && (
                        <a
                          href={interview.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded bg-brand-600 text-white hover:bg-brand-700 shadow-xs"
                        >
                          <Video className="w-3.5 h-3.5" />
                          Join
                        </a>
                      )}
                    </>
                  )}
                  {interview.status === 'COMPLETED' && !interview.feedback && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setSelectedForFeedback(interview)}
                    >
                      Add Feedback
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Feedback Modal */}
      <Modal
        isOpen={!!selectedForFeedback}
        onClose={() => setSelectedForFeedback(null)}
        title={`Evaluation & Feedback: ${selectedForFeedback?.candidateName}`}
        description={`Role: ${selectedForFeedback?.jobTitle} • ${selectedForFeedback?.interviewType}`}
      >
        <form onSubmit={handleFeedbackSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Overall Assessment Rating (1-5)"
              value={overallRating}
              onChange={(e) => setOverallRating(e.target.value)}
              options={[
                { value: '5', label: '5 - Outstanding' },
                { value: '4', label: '4 - Strong' },
                { value: '3', label: '3 - Competent' },
                { value: '2', label: '2 - Needs Development' },
                { value: '1', label: '1 - Unsatisfactory' },
              ]}
            />
            <Select
              label="Hiring Recommendation"
              value={recommendation}
              onChange={(e) => setRecommendation(e.target.value)}
              options={[
                { value: 'STRONG_HIRE', label: 'Strong Hire' },
                { value: 'HIRE', label: 'Hire' },
                { value: 'NO_HIRE', label: 'No Hire' },
                { value: 'STRONG_NO_HIRE', label: 'Strong No Hire' },
              ]}
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Select
              label="Technical"
              value={technicalRating}
              onChange={(e) => setTechnicalRating(e.target.value)}
              options={['5', '4', '3', '2', '1'].map((v) => ({ value: v, label: `${v} / 5` }))}
            />
            <Select
              label="Communication"
              value={communicationRating}
              onChange={(e) => setCommunicationRating(e.target.value)}
              options={['5', '4', '3', '2', '1'].map((v) => ({ value: v, label: `${v} / 5` }))}
            />
            <Select
              label="Culture Fit"
              value={cultureFitRating}
              onChange={(e) => setCultureFitRating(e.target.value)}
              options={['5', '4', '3', '2', '1'].map((v) => ({ value: v, label: `${v} / 5` }))}
            />
          </div>

          <Textarea
            label="Candidate Strengths"
            placeholder="Key technical capabilities, system design depth, articulate communication..."
            rows={3}
            value={strengths}
            onChange={(e) => setStrengths(e.target.value)}
          />

          <Textarea
            label="Areas for Growth / Weaknesses"
            placeholder="Gaps noted during live coding or architectural discussion..."
            rows={2}
            value={weaknesses}
            onChange={(e) => setWeaknesses(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="secondary" size="sm" onClick={() => setSelectedForFeedback(null)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={submittingFeedback}>
              Submit Evaluation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
