import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { candidateService } from '../../api/services';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { User, MapPin, Phone, Globe, Link, Code, CheckCircle2, AlertCircle } from 'lucide-react';

export const CandidateProfilePage = () => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['candidateProfile'],
    queryFn: () => candidateService.getProfile(),
  });

  const profile = data?.data;

  const [headline, setHeadline] = useState('');
  const [summary, setSummary] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState(0);
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [skillsText, setSkillsText] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    if (profile) {
      setHeadline(profile.headline || '');
      setSummary(profile.summary || '');
      setPhone(profile.phone || '');
      setLocation(profile.location || '');
      setYearsOfExperience(profile.yearsOfExperience || 0);
      setLinkedinUrl(profile.linkedinUrl || '');
      setGithubUrl(profile.githubUrl || '');
      setPortfolioUrl(profile.portfolioUrl || '');
      setSkillsText(profile.skillsText || '');
    }
  }, [profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);

    try {
      await candidateService.updateProfile({
        headline,
        summary,
        phone,
        location,
        yearsOfExperience: Number(yearsOfExperience),
        linkedinUrl,
        githubUrl,
        portfolioUrl,
        skillsText,
      });
      setStatusMessage({ type: 'success', text: 'Candidate profile saved successfully!' });
      refetch();
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save profile' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingSkeleton count={3} />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">Candidate Profile</h1>
        <p className="text-xs text-text-muted">Manage your professional bio, contact channels, and verified skill keywords</p>
      </div>

      {statusMessage && (
        <div
          className={`p-3 rounded-md text-xs flex items-center gap-2 border ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-surface p-6 rounded-xl border border-border shadow-card space-y-5">
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider border-b border-border pb-2">
            Professional Overview
          </h2>

          <Input
            label="Professional Headline"
            placeholder="e.g. Senior Full Stack Java & Cloud Engineer"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
          />

          <Textarea
            label="Professional Summary"
            placeholder="Brief narrative highlighting your engineering accomplishments, tech stack, and background..."
            rows={4}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Location"
              placeholder="Austin, TX (or Remote)"
              icon={MapPin}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <Input
              label="Phone Number"
              placeholder="+1 (555) 000-0000"
              icon={Phone}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <Input
            label="Total Years of Experience"
            type="number"
            step="0.5"
            min="0"
            max="40"
            value={yearsOfExperience}
            onChange={(e) => setYearsOfExperience(e.target.value)}
          />
        </div>

        <div className="space-y-4 pt-4">
          <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider border-b border-border pb-2">
            Skill Keywords (Used in AI Matching)
          </h2>

          <Textarea
            label="Skills & Tools (Comma-separated)"
            placeholder="Java, Spring Boot, React, PostgreSQL, Docker, Kubernetes, REST APIs, Tailwind CSS..."
            rows={3}
            value={skillsText}
            onChange={(e) => setSkillsText(e.target.value)}
            helperText="Parsed resumes will automatically append extracted skill keywords to this list."
          />
        </div>

        <div className="space-y-4 pt-4">
          <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider border-b border-border pb-2">
            Online Presence & Portfolio
          </h2>

          <div className="space-y-3">
            <Input
              label="LinkedIn Profile"
              placeholder="https://linkedin.com/in/username"
              icon={Link}
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
            />
            <Input
              label="GitHub Profile"
              placeholder="https://github.com/username"
              icon={Code}
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
            />
            <Input
              label="Personal Website / Portfolio"
              placeholder="https://yourname.dev"
              icon={Globe}
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-border">
          <Button type="submit" isLoading={isSaving}>
            Save Profile Changes
          </Button>
        </div>
      </form>
    </div>
  );
};
