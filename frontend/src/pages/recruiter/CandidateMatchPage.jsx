import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { matchingService } from '../../api/services';
import { Button } from '../../components/ui/Button';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import {
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  XCircle,
  Cpu,
  RefreshCw,
  FileSearch,
  AlertTriangle,
} from 'lucide-react';

export const CandidateMatchPage = () => {
  const { id } = useParams();
  const [recalculating, setRecalculating] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['candidateMatchExplanation', id],
    queryFn: () => matchingService.getMatch(id),
  });

  const match = data?.data;

  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      await matchingService.recalculateMatch(id);
      refetch();
    } catch (err) {
      alert('Failed to recalculate match score');
    } finally {
      setRecalculating(false);
    }
  };

  if (isLoading) {
    return <LoadingSkeleton count={3} />;
  }

  if (!match) {
    return (
      <div className="text-center py-12 space-y-3">
        <h2 className="text-lg font-bold text-text-primary">Match Data Pending</h2>
        <p className="text-xs text-text-muted">No resume text or skills available for computation.</p>
        <Link to={`/recruiter/applications/${id}`}>
          <Button variant="secondary" size="sm">Back to Application</Button>
        </Link>
      </div>
    );
  }

  let matchedSkills = [];
  let missingRequired = [];
  let evidence = {};

  try {
    matchedSkills = JSON.parse(match.matchedSkills || '[]');
    missingRequired = JSON.parse(match.missingRequiredSkills || '[]');
    evidence = JSON.parse(match.evidenceSnippets || '{}');
  } catch (e) {
    // Graceful fallback
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link to={`/recruiter/applications/${id}`} className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary">
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Candidate Application
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-600" />
            AI Match & Skill Coverage Analysis
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            Transparent, reproducible skill evaluation for <strong>{match.jobTitle}</strong>
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          icon={RefreshCw}
          onClick={handleRecalculate}
          isLoading={recalculating}
        >
          Recalculate Match
        </Button>
      </div>

      {/* Score Overview Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface p-6 rounded-xl border border-border shadow-card space-y-2">
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Overall Match Score</span>
          <p className="text-4xl font-extrabold text-indigo-600 tracking-tight">
            {Math.round(match.overallScore)}%
          </p>
          <p className="text-xs text-text-muted">Weighted algorithm score</p>
        </div>

        <div className="bg-surface p-6 rounded-xl border border-border shadow-card space-y-2">
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Skill Coverage</span>
          <p className="text-4xl font-extrabold text-emerald-600 tracking-tight">
            {Math.round(match.skillCoverageScore)}%
          </p>
          <p className="text-xs text-text-muted">Mandatory skills verified in resume</p>
        </div>

        <div className="bg-surface p-6 rounded-xl border border-border shadow-card space-y-2">
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Evaluation Engine</span>
          <p className="text-sm font-bold text-text-primary mt-1 font-mono">{match.algorithmVersion}</p>
          <p className="text-[11px] text-text-muted">Calculated on {new Date(match.calculatedAt).toLocaleString()}</p>
        </div>
      </div>

      {/* Narrative Explanation */}
      <div className="bg-surface p-6 rounded-xl border border-border shadow-card space-y-3">
        <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
          <FileSearch className="w-4 h-4 text-brand-600" />
          Evaluation Summary & Assessment
        </h2>
        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed bg-surface-subtle p-4 rounded-lg border border-border">
          {match.aiExplanation}
        </p>
      </div>

      {/* Matched Skills with Evidence Snippets */}
      <div className="bg-surface p-6 rounded-xl border border-border shadow-card space-y-4">
        <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Verified Competencies & Resume Evidence ({matchedSkills.length})
        </h2>

        {matchedSkills.length === 0 ? (
          <p className="text-xs text-text-muted italic">No matching skills detected from document text.</p>
        ) : (
          <div className="space-y-3">
            {matchedSkills.map((skill, idx) => {
              const snippet = evidence[skill.name];
              return (
                <div key={idx} className="p-3.5 rounded-lg border border-border bg-surface-subtle space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-text-primary">{skill.name}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      skill.required
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {skill.required ? 'Required' : 'Preferred'} (Weight: {skill.weight || 1.0})
                    </span>
                  </div>
                  {snippet && (
                    <p className="text-xs text-text-secondary italic font-mono bg-surface p-2 rounded border border-border">
                      "{snippet}"
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Missing Required Skills */}
      {missingRequired.length > 0 && (
        <div className="bg-surface p-6 rounded-xl border border-rose-200 shadow-card space-y-3">
          <h2 className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            Missing or Unverified Mandatory Requirements ({missingRequired.length})
          </h2>
          <p className="text-xs text-text-secondary">
            The candidate's resume does not explicitly mention the following required skills. Consider inquiring about these topics in the live interview:
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {missingRequired.map((skill, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200"
              >
                <XCircle className="w-3.5 h-3.5" />
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
