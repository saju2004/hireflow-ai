import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ShieldCheck, Cpu, Users, BarChart3, Search } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const LandingPage = () => {
  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto space-y-6 pt-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-xs font-semibold text-brand-700">
          <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse" />
          Production-Style AI Recruitment Platform
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-text-primary tracking-tight leading-tight">
          Intelligent Hiring Workflows. <br />
          <span className="text-brand-600">Explainable AI Matching.</span>
        </h1>
        <p className="text-base sm:text-lg text-text-secondary leading-relaxed">
          HireFlow AI unifies job publishing, resume parsing with Apache PDFBox, multi-stage candidate pipelines, and transparent skill-coverage matching built for modern hiring teams.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link to="/jobs">
            <Button size="lg" icon={Search} className="w-full sm:w-auto">
              Explore Open Roles
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="secondary" size="lg" icon={ArrowRight} className="w-full sm:w-auto">
              Sign In to Demo
            </Button>
          </Link>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface p-6 rounded-lg border border-border shadow-card space-y-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <h2 className="text-base font-semibold text-text-primary">Transparent AI Matching</h2>
          <p className="text-xs text-text-muted leading-relaxed">
            Deterministic weighted skill scoring with full evidence extraction. Explains exactly why a candidate matches without biased black-box guesses.
          </p>
        </div>

        <div className="bg-surface p-6 rounded-lg border border-border shadow-card space-y-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <h2 className="text-base font-semibold text-text-primary">Interactive Kanban Pipeline</h2>
          <p className="text-xs text-text-muted leading-relaxed">
            Manage candidates smoothly across Screening, Shortlisted, Interview, and Offer stages with state transition validation and timeline auditing.
          </p>
        </div>

        <div className="bg-surface p-6 rounded-lg border border-border shadow-card space-y-3">
          <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h2 className="text-base font-semibold text-text-primary">Multi-Tenant Isolation</h2>
          <p className="text-xs text-text-muted leading-relaxed">
            Organization-level boundaries enforced strictly by Spring Security at the service layer, keeping candidate data and job postings private.
          </p>
        </div>
      </section>

      {/* Technical Architecture Badge */}
      <section className="bg-surface rounded-xl border border-border p-8 shadow-card flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-text-primary">Enterprise Full-Stack Architecture</h3>
          <p className="text-xs text-text-muted max-w-xl">
            Built with Spring Boot 3, Java 17, PostgreSQL, Flyway, JWT Authentication, React, Tailwind CSS, TanStack Query, and Apache PDFBox.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/register">
            <Button size="md">Start Free Hiring</Button>
          </Link>
        </div>
      </section>
    </div>
  );
};
