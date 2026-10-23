-- ========================================================
-- HireFlow AI - Flyway Database Migration V1: Initial Schema
-- ========================================================

-- 1. Organizations
CREATE TABLE organizations (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    domain VARCHAR(255),
    logo_url VARCHAR(500),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_org_slug ON organizations(slug);
CREATE INDEX idx_org_status ON organizations(status);

-- 2. Users
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- 3. Organization Memberships (Multi-tenancy & access control)
CREATE TABLE organization_memberships (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_in_org VARCHAR(50) NOT NULL DEFAULT 'RECRUITER',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_org_user UNIQUE (organization_id, user_id)
);

CREATE INDEX idx_org_members_user ON organization_memberships(user_id);
CREATE INDEX idx_org_members_org ON organization_memberships(organization_id);

-- 4. Candidate Profiles
CREATE TABLE candidate_profiles (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    headline VARCHAR(255),
    summary TEXT,
    phone VARCHAR(50),
    location VARCHAR(255),
    linkedin_url VARCHAR(500),
    github_url VARCHAR(500),
    portfolio_url VARCHAR(500),
    years_of_experience NUMERIC(4, 1) DEFAULT 0,
    skills_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_candidate_user ON candidate_profiles(user_id);

-- 5. Jobs
CREATE TABLE jobs (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    responsibilities TEXT,
    experience_level VARCHAR(50) NOT NULL,
    employment_type VARCHAR(50) NOT NULL,
    location VARCHAR(255) NOT NULL,
    workplace_type VARCHAR(50) NOT NULL,
    salary_min NUMERIC(12, 2),
    salary_max NUMERIC(12, 2),
    currency VARCHAR(10) DEFAULT 'USD',
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_jobs_org ON jobs(organization_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_published ON jobs(published_at);
CREATE INDEX idx_jobs_search ON jobs(title, location, experience_level);

-- 6. Job Skills
CREATE TABLE job_skills (
    id UUID PRIMARY KEY,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    skill_name VARCHAR(100) NOT NULL,
    is_required BOOLEAN NOT NULL DEFAULT TRUE,
    weight NUMERIC(3, 2) DEFAULT 1.0
);

CREATE INDEX idx_job_skills_job ON job_skills(job_id);
CREATE INDEX idx_job_skills_name ON job_skills(skill_name);

-- 7. Resumes
CREATE TABLE resumes (
    id UUID PRIMARY KEY,
    candidate_profile_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    storage_key VARCHAR(255) NOT NULL UNIQUE,
    content_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    raw_text TEXT,
    parsing_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_resumes_candidate ON resumes(candidate_profile_id);
CREATE INDEX idx_resumes_status ON resumes(parsing_status);

-- 8. Resume Skills
CREATE TABLE resume_skills (
    id UUID PRIMARY KEY,
    resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    skill_name VARCHAR(100) NOT NULL,
    normalized_name VARCHAR(100) NOT NULL,
    years_experience NUMERIC(3, 1),
    context_snippet TEXT
);

CREATE INDEX idx_resume_skills_resume ON resume_skills(resume_id);
CREATE INDEX idx_resume_skills_norm ON resume_skills(normalized_name);

-- 9. Applications (Prevent duplicate submissions per job per candidate)
CREATE TABLE applications (
    id UUID PRIMARY KEY,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    candidate_profile_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    resume_id UUID REFERENCES resumes(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'APPLIED',
    cover_letter TEXT,
    rejection_reason TEXT,
    internal_notes TEXT,
    applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_job_candidate UNIQUE (job_id, candidate_profile_id)
);

CREATE INDEX idx_app_job ON applications(job_id);
CREATE INDEX idx_app_candidate ON applications(candidate_profile_id);
CREATE INDEX idx_app_status ON applications(status);
CREATE INDEX idx_app_applied_at ON applications(applied_at);

-- 10. Application Events (Timeline & Audit Trail)
CREATE TABLE application_events (
    id UUID PRIMARY KEY,
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES users(id),
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    event_type VARCHAR(50) NOT NULL DEFAULT 'STATUS_CHANGE',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_app_events_app ON application_events(application_id);
CREATE INDEX idx_app_events_date ON application_events(created_at);

-- 11. Match Results (AI & Skill Scoring)
CREATE TABLE match_results (
    id UUID PRIMARY KEY,
    application_id UUID NOT NULL UNIQUE REFERENCES applications(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    resume_id UUID REFERENCES resumes(id) ON DELETE SET NULL,
    overall_score NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
    skill_coverage_score NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
    matched_skills TEXT,
    missing_required_skills TEXT,
    evidence_snippets TEXT,
    ai_explanation TEXT,
    algorithm_version VARCHAR(50) NOT NULL DEFAULT 'v1.0.0-deterministic',
    calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_match_app ON match_results(application_id);
CREATE INDEX idx_match_job ON match_results(job_id);
CREATE INDEX idx_match_score ON match_results(overall_score);

-- 12. Interviews
CREATE TABLE interviews (
    id UUID PRIMARY KEY,
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    interviewer_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    interview_type VARCHAR(50) NOT NULL,
    scheduled_start TIMESTAMP WITH TIME ZONE NOT NULL,
    scheduled_end TIMESTAMP WITH TIME ZONE NOT NULL,
    timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
    meeting_link VARCHAR(500),
    location VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_interviews_app ON interviews(application_id);
CREATE INDEX idx_interviews_org ON interviews(organization_id);
CREATE INDEX idx_interviews_interviewer ON interviews(interviewer_id);
CREATE INDEX idx_interviews_start ON interviews(scheduled_start);
CREATE INDEX idx_interviews_status ON interviews(status);

-- 13. Interview Feedback
CREATE TABLE interview_feedback (
    id UUID PRIMARY KEY,
    interview_id UUID NOT NULL UNIQUE REFERENCES interviews(id) ON DELETE CASCADE,
    interviewer_id UUID NOT NULL REFERENCES users(id),
    overall_rating INTEGER NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
    technical_rating INTEGER CHECK (technical_rating BETWEEN 1 AND 5),
    communication_rating INTEGER CHECK (communication_rating BETWEEN 1 AND 5),
    culture_fit_rating INTEGER CHECK (culture_fit_rating BETWEEN 1 AND 5),
    strengths TEXT,
    weaknesses TEXT,
    recommendation VARCHAR(50) NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_feedback_interview ON interview_feedback(interview_id);

-- 14. Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    link VARCHAR(500),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read);

-- 15. Refresh Tokens (Hashed storage for security)
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_refresh_tokens_hash ON refresh_tokens(token_hash);
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);

-- 16. Audit Logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY,
    organization_id UUID,
    actor_id UUID,
    actor_email VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    target_entity VARCHAR(100) NOT NULL,
    target_id VARCHAR(255),
    ip_address VARCHAR(50),
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_org ON audit_logs(organization_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);
CREATE INDEX idx_audit_action ON audit_logs(action);
