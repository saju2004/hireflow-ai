import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { jobService } from '../../api/services';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { ArrowLeft, Plus, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';

export const EditJobPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['recruiterJobDetails', id],
    queryFn: () => jobService.getJobById(id),
  });

  const job = data?.data;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [responsibilities, setResponsibilities] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('MID');
  const [employmentType, setEmploymentType] = useState('FULL_TIME');
  const [location, setLocation] = useState('');
  const [workplaceType, setWorkplaceType] = useState('REMOTE');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [skills, setSkills] = useState([]);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillRequired, setNewSkillRequired] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (job) {
      setTitle(job.title || '');
      setDescription(job.description || '');
      setResponsibilities(job.responsibilities || '');
      setExperienceLevel(job.experienceLevel || 'MID');
      setEmploymentType(job.employmentType || 'FULL_TIME');
      setLocation(job.location || '');
      setWorkplaceType(job.workplaceType || 'REMOTE');
      setSalaryMin(job.salaryMin ? String(job.salaryMin) : '');
      setSalaryMax(job.salaryMax ? String(job.salaryMax) : '');
      setCurrency(job.currency || 'USD');
      setSkills(job.skills || []);
    }
  }, [job]);

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkillName.trim()) {
      setSkills([
        ...skills,
        { skillName: newSkillName.trim(), isRequired: newSkillRequired, weight: newSkillRequired ? 1.0 : 0.7 },
      ]);
      setNewSkillName('');
      setNewSkillRequired(true);
    }
  };

  const handleRemoveSkill = (index) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      await jobService.updateJob(id, {
        title,
        description,
        responsibilities,
        experienceLevel,
        employmentType,
        location,
        workplaceType,
        salaryMin: salaryMin ? Number(salaryMin) : undefined,
        salaryMax: salaryMax ? Number(salaryMax) : undefined,
        currency,
        skills,
      });
      setSuccess('Job updated successfully');
      setTimeout(() => navigate('/recruiter/jobs'), 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update job posting');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingSkeleton count={3} />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link to="/recruiter/jobs" className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary">
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Job Postings
      </Link>

      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">Edit Job Posting</h1>
        <p className="text-xs text-text-muted">Modify job parameters, target competencies, and requirements</p>
      </div>

      {error && (
        <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-surface p-6 sm:p-8 rounded-xl border border-border shadow-card space-y-6">
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider border-b border-border pb-2">
            Basic Information
          </h2>

          <Input
            label="Job Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
            <Select
              label="Workplace Classification"
              value={workplaceType}
              onChange={(e) => setWorkplaceType(e.target.value)}
              options={[
                { value: 'REMOTE', label: 'Remote' },
                { value: 'HYBRID', label: 'Hybrid' },
                { value: 'ON_SITE', label: 'On-site' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Experience Level"
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              options={[
                { value: 'ENTRY', label: 'Entry Level' },
                { value: 'MID', label: 'Mid Level' },
                { value: 'SENIOR', label: 'Senior Level' },
                { value: 'LEAD', label: 'Lead / Principal' },
                { value: 'EXECUTIVE', label: 'Executive' },
              ]}
            />
            <Select
              label="Employment Type"
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value)}
              options={[
                { value: 'FULL_TIME', label: 'Full Time' },
                { value: 'PART_TIME', label: 'Part Time' },
                { value: 'CONTRACT', label: 'Contract' },
                { value: 'INTERNSHIP', label: 'Internship' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Minimum Salary"
              type="number"
              value={salaryMin}
              onChange={(e) => setSalaryMin(e.target.value)}
            />
            <Input
              label="Maximum Salary"
              type="number"
              value={salaryMax}
              onChange={(e) => setSalaryMax(e.target.value)}
            />
            <Select
              label="Currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              options={[
                { value: 'USD', label: 'USD ($)' },
                { value: 'EUR', label: 'EUR (€)' },
                { value: 'GBP', label: 'GBP (£)' },
              ]}
            />
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider border-b border-border pb-2">
            Description & Responsibilities
          </h2>

          <Textarea
            label="Job Description & Overview"
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <Textarea
            label="Key Responsibilities"
            rows={4}
            value={responsibilities}
            onChange={(e) => setResponsibilities(e.target.value)}
          />
        </div>

        {/* Skill Requirements Tagger */}
        <div className="space-y-4 pt-2">
          <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider border-b border-border pb-2">
            Required & Preferred Skills
          </h2>

          <div className="flex flex-col sm:flex-row items-end gap-3 bg-surface-subtle p-4 rounded-lg border border-border">
            <div className="flex-1 w-full">
              <Input
                label="Skill Name"
                placeholder="e.g. React, Java, Docker, REST APIs"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newSkillRequired}
                  onChange={(e) => setNewSkillRequired(e.target.checked)}
                  className="rounded border-border text-brand-600 focus:ring-brand-500"
                />
                Mandatory Required
              </label>
            </div>
            <Button size="sm" onClick={handleAddSkill} icon={Plus} className="mb-0.5">
              Add Skill
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {skills.map((skill, index) => (
              <span
                key={index}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium border ${
                  skill.isRequired
                    ? 'bg-brand-50 text-brand-700 border-brand-200'
                    : 'bg-surface-subtle text-text-secondary border-border'
                }`}
              >
                {skill.skillName}
                <span className="text-[10px] opacity-75">
                  ({skill.isRequired ? 'Required' : 'Preferred'})
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(index)}
                  className="text-text-muted hover:text-status-danger ml-1"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Link to="/recruiter/jobs">
            <Button variant="secondary" size="md">
              Cancel
            </Button>
          </Link>
          <Button type="submit" size="md" isLoading={isSubmitting}>
            Update Posting
          </Button>
        </div>
      </form>
    </div>
  );
};
