import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { jobService, applicationService, resumeService } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import {
  MapPin,
  Building2,
  DollarSign,
  Calendar,
  Briefcase,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  AlertCircle,
  Upload,
} from 'lucide-react';

export const PublicJobDetailsPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [applySuccess, setApplySuccess] = useState(false);

  const { data: jobData, isLoading } = useQuery({
    queryKey: ['publicJob', slug],
    queryFn: () => jobService.getPublicJobBySlug(slug),
  });

  const { data: resumesData } = useQuery({
    queryKey: ['myResumesForApply'],
    queryFn: () => resumeService.getMyResumes(),
    enabled: isAuthenticated && user?.role === 'CANDIDATE' && isApplyOpen,
  });

  const job = jobData?.data;
  const resumes = resumesData?.data || [];

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setApplyError('');
    setIsSubmitting(true);

    try {
      await applicationService.apply({
        jobId: job.id,
        resumeId: selectedResumeId || (resumes[0]?.id || undefined),
        coverLetter,
      });
      setApplySuccess(true);
    } catch (err) {
      setApplyError(err.response?.data?.message || err.message || 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingSkeleton count={3} />;
  }

  if (!job) {
    return (
      <div className="text-center py-12 space-y-3">
        <h2 className="text-lg font-bold text-text-primary">Position Not Found</h2>
        <p className="text-xs text-text-muted">This opening may have been paused, closed, or removed.</p>
        <Link to="/jobs">
          <Button variant="secondary" size="sm" icon={ArrowLeft}>
            Back to Jobs
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      <Link to="/jobs" className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary">
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to all jobs
      </Link>

      {/* Main Job Header */}
      <div className="bg-surface p-6 sm:p-8 rounded-xl border border-border shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
              {job.title}
            </h1>
            <p className="text-sm font-semibold text-brand-700 flex items-center gap-1.5">
              <Building2 className="w-4 h-4" />
              {job.organizationName}
            </p>
          </div>

          <Button
            size="lg"
            onClick={() => {
              if (!isAuthenticated) {
                navigate('/login', { state: { from: { pathname: `/jobs/${slug}` } } });
              } else {
                setIsApplyOpen(true);
              }
            }}
          >
            Apply for this Role
          </Button>
        </div>

        {/* Metadata Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2 text-xs">
          <div>
            <p className="text-text-muted">Location</p>
            <p className="font-semibold text-text-primary mt-0.5">{job.location} ({job.workplaceType})</p>
          </div>
          <div>
            <p className="text-text-muted">Employment Type</p>
            <p className="font-semibold text-text-primary mt-0.5">{job.employmentType?.replace('_', ' ')}</p>
          </div>
          <div>
            <p className="text-text-muted">Experience</p>
            <p className="font-semibold text-text-primary mt-0.5">{job.experienceLevel} Level</p>
          </div>
          <div>
            <p className="text-text-muted">Compensation</p>
            <p className="font-semibold text-text-primary mt-0.5">
              {job.salaryMin && job.salaryMax
                ? `$${Number(job.salaryMin).toLocaleString()} - $${Number(job.salaryMax).toLocaleString()} ${job.currency}`
                : 'Competitive'}
            </p>
          </div>
        </div>

        {/* Description & Responsibilities */}
        <div className="space-y-6 pt-2">
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">About the Role</h3>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed whitespace-pre-line">
              {job.description}
            </p>
          </div>

          {job.responsibilities && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Key Responsibilities</h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                {job.responsibilities}
              </p>
            </div>
          )}

          {/* Required and Preferred Skills */}
          {job.skills && job.skills.length > 0 && (
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Target Competencies & Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((s, idx) => (
                  <span
                    key={idx}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium border ${
                      s.isRequired
                        ? 'bg-brand-50 text-brand-700 border-brand-200'
                        : 'bg-surface-subtle text-text-secondary border-border'
                    }`}
                  >
                    {s.skillName}
                    <span className="text-[10px] opacity-75">
                      ({s.isRequired ? 'Required' : 'Preferred'})
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Application Modal */}
      <Modal
        isOpen={isApplyOpen}
        onClose={() => {
          setIsApplyOpen(false);
          setApplySuccess(false);
          setApplyError('');
        }}
        title={`Apply for ${job.title}`}
        description={`Submit your profile and resume to ${job.organizationName}`}
      >
        {user?.role === 'RECRUITER' ? (
          <div className="text-center py-4 space-y-3">
            <p className="text-xs text-text-secondary">
              You are currently authenticated as a Recruiter. Please switch or sign in as a candidate to apply for positions.
            </p>
            <Button variant="secondary" size="sm" onClick={() => setIsApplyOpen(false)}>
              Close
            </Button>
          </div>
        ) : applySuccess ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-text-primary">Application Submitted!</h4>
              <p className="text-xs text-text-muted mt-1">
                Your application and resume have been delivered to the hiring team. AI skill matching has been evaluated.
              </p>
            </div>
            <div className="pt-2 flex justify-center gap-2">
              <Link to="/candidate/applications">
                <Button size="sm">Track Application Status</Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleApplySubmit} className="space-y-4">
            {applyError && (
              <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{applyError}</span>
              </div>
            )}

            <div className="p-3 rounded-lg bg-surface-subtle border border-border text-xs space-y-1">
              <p className="font-semibold text-text-primary">Applicant: {user?.fullName}</p>
              <p className="text-text-muted">Email: {user?.email}</p>
            </div>

            {resumes.length > 0 ? (
              <Select
                label="Select Resume"
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                options={resumes.map((r) => ({
                  value: r.id,
                  label: `${r.fileName} (Uploaded ${new Date(r.createdAt).toLocaleDateString()})`,
                }))}
              />
            ) : (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-2">
                <p>No resume found in your profile. You can upload one in your Resume Center before applying.</p>
                <Link to="/candidate/resumes" className="inline-block text-xs font-semibold text-amber-900 underline">
                  Go to Resume Center & Upload
                </Link>
              </div>
            )}

            <Textarea
              label="Cover Note / Introduction (Optional)"
              placeholder="Highlight relevant experience, achievements, or why you're interested in this role..."
              rows={4}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setIsApplyOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={isSubmitting}>
                Submit Application
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
