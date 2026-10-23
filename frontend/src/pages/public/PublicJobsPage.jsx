import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { jobService } from '../../api/services';
import { Search, MapPin, Briefcase, DollarSign, Calendar, Filter, Building2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';

export const PublicJobsPage = () => {
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [workplaceType, setWorkplaceType] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [employmentType, setEmploymentType] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['publicJobs', search, location, workplaceType, experienceLevel, employmentType],
    queryFn: () =>
      jobService.getPublicJobs({
        search: search || undefined,
        location: location || undefined,
        workplaceType: workplaceType || undefined,
        experienceLevel: experienceLevel || undefined,
        employmentType: employmentType || undefined,
      }),
  });

  const jobs = data?.data?.content || [];

  return (
    <div className="space-y-6 py-4">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">Explore Job Openings</h1>
        <p className="text-xs text-text-muted">Discover verified career opportunities with AI skill matching</p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-surface p-4 rounded-lg border border-border shadow-card grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <Input
          placeholder="Search by title or skill..."
          icon={Search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Input
          placeholder="Location (e.g. Austin, Remote)..."
          icon={MapPin}
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <Select
          value={workplaceType}
          onChange={(e) => setWorkplaceType(e.target.value)}
          options={[
            { value: '', label: 'All Workplace Types' },
            { value: 'REMOTE', label: 'Remote' },
            { value: 'HYBRID', label: 'Hybrid' },
            { value: 'ON_SITE', label: 'On-site' },
          ]}
        />
        <Select
          value={experienceLevel}
          onChange={(e) => setExperienceLevel(e.target.value)}
          options={[
            { value: '', label: 'All Experience Levels' },
            { value: 'ENTRY', label: 'Entry Level' },
            { value: 'MID', label: 'Mid Level' },
            { value: 'SENIOR', label: 'Senior Level' },
            { value: 'LEAD', label: 'Lead / Principal' },
          ]}
        />
        <Select
          value={employmentType}
          onChange={(e) => setEmploymentType(e.target.value)}
          options={[
            { value: '', label: 'All Job Types' },
            { value: 'FULL_TIME', label: 'Full Time' },
            { value: 'PART_TIME', label: 'Part Time' },
            { value: 'CONTRACT', label: 'Contract' },
          ]}
        />
      </div>

      {/* Job Cards List */}
      {isLoading ? (
        <LoadingSkeleton count={6} />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No open positions found"
          description="Try modifying your search keywords or filter criteria to discover other roles."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-surface p-5 rounded-lg border border-border shadow-card hover:border-brand-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="text-base font-semibold text-text-primary hover:text-brand-600 transition-colors">
                      <Link to={`/jobs/${job.slug}`}>{job.title}</Link>
                    </h2>
                    <p className="text-xs font-medium text-brand-700 flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3.5 h-3.5" />
                      {job.organizationName}
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {job.workplaceType}
                  </span>
                </div>

                <div className="flex flex-wrap gap-y-1 gap-x-3 text-xs text-text-muted">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {job.location}
                  </span>
                  {job.salaryMin && job.salaryMax && (
                    <span className="flex items-center gap-1 font-medium text-text-primary">
                      <DollarSign className="w-3.5 h-3.5" />
                      ${Number(job.salaryMin).toLocaleString()} - ${Number(job.salaryMax).toLocaleString()}
                    </span>
                  )}
                </div>

                <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                  {job.description}
                </p>

                {job.skills && job.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {job.skills.slice(0, 4).map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded bg-surface-subtle text-text-secondary border border-border"
                      >
                        {skill.skillName}
                      </span>
                    ))}
                    {job.skills.length > 4 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded text-text-muted">
                        +{job.skills.length - 4} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-border flex items-center justify-between">
                <span className="text-[10px] text-text-muted">
                  Posted {new Date(job.publishedAt || job.createdAt).toLocaleDateString()}
                </span>
                <Link to={`/jobs/${job.slug}`}>
                  <Button variant="secondary" size="sm">
                    View & Apply
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
