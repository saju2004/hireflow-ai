-- ========================================================
-- HireFlow AI - Flyway Database Migration V2: Synthetic Demo Data
-- Note: All passwords are set to "password123"
-- BCrypt hash: $2a$10$rXxW1KA97KDhQHxW5bYVwOKN.kSkxJbtFQsy4YmBr0TE25W4mldJG
-- ========================================================

-- 1. Organizations
INSERT INTO organizations (id, name, slug, domain, logo_url, status, created_at, updated_at) VALUES
('11111111-1111-1111-1111-111111111111', 'Acme Technologies', 'acme-tech', 'acme.io', 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=128&q=80', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('22222222-2222-2222-2222-222222222222', 'Apex Global Cloud', 'apex-cloud', 'apexcloud.net', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=128&q=80', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 2. Users
INSERT INTO users (id, email, password_hash, first_name, last_name, role, status, created_at, updated_at) VALUES
-- Platform Admin
('a0000000-0000-0000-0000-000000000001', 'admin@hireflow.io', '$2a$10$rXxW1KA97KDhQHxW5bYVwOKN.kSkxJbtFQsy4YmBr0TE25W4mldJG', 'John', 'Administrator', 'PLATFORM_ADMIN', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Acme Recruiter
('a0000000-0000-0000-0000-000000000002', 'recruiter@acme.io', '$2a$10$rXxW1KA97KDhQHxW5bYVwOKN.kSkxJbtFQsy4YmBr0TE25W4mldJG', 'Sarah', 'Jenkins', 'RECRUITER', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Apex Recruiter (for multi-tenant isolation testing)
('a0000000-0000-0000-0000-000000000003', 'recruiter@apexcloud.net', '$2a$10$rXxW1KA97KDhQHxW5bYVwOKN.kSkxJbtFQsy4YmBr0TE25W4mldJG', 'Michael', 'Chang', 'RECRUITER', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Candidates
('c0000000-0000-0000-0000-000000000001', 'candidate@hireflow.io', '$2a$10$rXxW1KA97KDhQHxW5bYVwOKN.kSkxJbtFQsy4YmBr0TE25W4mldJG', 'Alex', 'Rivera', 'CANDIDATE', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('c0000000-0000-0000-0000-000000000002', 'dev@hireflow.io', '$2a$10$rXxW1KA97KDhQHxW5bYVwOKN.kSkxJbtFQsy4YmBr0TE25W4mldJG', 'Elena', 'Rostova', 'CANDIDATE', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('c0000000-0000-0000-0000-000000000003', 'marcus@hireflow.io', '$2a$10$rXxW1KA97KDhQHxW5bYVwOKN.kSkxJbtFQsy4YmBr0TE25W4mldJG', 'Marcus', 'Vance', 'CANDIDATE', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 3. Organization Memberships
INSERT INTO organization_memberships (id, organization_id, user_id, role_in_org, created_at) VALUES
('d0000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'a0000000-0000-0000-0000-000000000002', 'OWNER', CURRENT_TIMESTAMP),
('d0000000-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'a0000000-0000-0000-0000-000000000003', 'OWNER', CURRENT_TIMESTAMP);

-- 4. Candidate Profiles
INSERT INTO candidate_profiles (id, user_id, headline, summary, phone, location, linkedin_url, github_url, portfolio_url, years_of_experience, skills_text, created_at, updated_at) VALUES
('e0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Senior Full Stack Java & Cloud Engineer', 'Experienced software architect specializing in Spring Boot 3, modern React, microservices, and PostgreSQL cloud scale.', '+1 (555) 234-5678', 'Austin, TX (Remote)', 'https://linkedin.com/in/alex-rivera-dev', 'https://github.com/alexrivera-cloud', 'https://alexrivera.dev', 6.5, 'Java, Spring Boot, React, PostgreSQL, Docker, REST APIs, Kubernetes, Hibernate, JUnit, Git, Tailwind CSS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('e0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', 'Full Stack Developer & Distributed Systems Enthusiast', 'Passionate developer with strong foundation in backend API design, React user interfaces, and automated CI/CD pipelines.', '+1 (555) 876-5432', 'Seattle, WA', 'https://linkedin.com/in/elena-rostova-tech', 'https://github.com/erostova', 'https://erostova.tech', 4.0, 'Java, Spring Boot, React, JavaScript, SQL, Docker, HTML/CSS, Maven, AWS, Redis', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('e0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000003', 'Frontend Lead & Design System Engineer', 'Specialist in high-performance web applications, responsive Tailwind CSS layouts, and modern React state architecture.', '+1 (555) 345-6789', 'New York, NY', 'https://linkedin.com/in/marcusvance', 'https://github.com/mvance', 'https://marcusvance.io', 5.0, 'React, JavaScript, Tailwind CSS, Vite, HTML5, CSS3, REST APIs, Jest, UI/UX Design, Figma', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 5. Jobs
INSERT INTO jobs (id, organization_id, creator_id, title, slug, description, responsibilities, experience_level, employment_type, location, workplace_type, salary_min, salary_max, currency, status, published_at, created_at, updated_at) VALUES
('f0000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'a0000000-0000-0000-0000-000000000002', 'Senior Full Stack Java Engineer', 'senior-full-stack-java-engineer', 'We are looking for a Senior Full Stack Java Engineer to lead development of our core SaaS applications. You will be building resilient microservices using Spring Boot 3, designing high-throughput relational schemas in PostgreSQL, and delivering responsive web experiences in React.', 'Architect scalable REST APIs using Spring Boot and Hibernate
Design clean relational databases with Flyway migrations
Build responsive, accessible user interfaces using React and Tailwind CSS
Write comprehensive unit and integration tests
Collaborate with product and design teams in an agile environment', 'SENIOR', 'FULL_TIME', 'Austin, TX', 'REMOTE', 135000.00, 165000.00, 'USD', 'PUBLISHED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('f0000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'a0000000-0000-0000-0000-000000000002', 'Lead Frontend Architect (React)', 'lead-frontend-architect-react', 'Join Acme Technologies as our Lead Frontend Architect. You will shape our frontend architectural standards, mentor developers, and build high-performance client applications with modern React, Tailwind CSS, and TanStack Query.', 'Define frontend component library and design system tokens
Drive application state management, caching, and performance optimizations
Ensure WCAG 2.1 AA accessibility compliance across all web surfaces
Partner closely with backend engineers on clean RESTful contracts', 'LEAD', 'FULL_TIME', 'San Francisco, CA', 'HYBRID', 150000.00, 185000.00, 'USD', 'PUBLISHED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('f0000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'a0000000-0000-0000-0000-000000000002', 'Staff DevOps & Cloud Platform Engineer', 'staff-devops-cloud-engineer', 'Seeking a Staff DevOps Engineer to elevate our cloud infrastructure, CI/CD automation, Docker container orchestration, and multi-region resilience.', 'Manage Kubernetes clusters and Docker containers
Automate zero-downtime deployment pipelines with GitHub Actions
Implement observability, tracing, and metric alerts
Maintain security compliance and secrets rotation', 'SENIOR', 'FULL_TIME', 'Remote, US', 'REMOTE', 160000.00, 195000.00, 'USD', 'PUBLISHED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('f0000000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'a0000000-0000-0000-0000-000000000002', 'Senior Product Designer (UI/UX)', 'senior-product-designer', 'Drive user-centric design across our enterprise recruitment tools. Create intuitive workflows, prototypes, and reusable design systems.', 'Deliver wireframes, user journeys, and high-fidelity mockups
Conduct user research and usability testing sessions
Maintain design system components in Figma and sync with React engineers', 'MID', 'FULL_TIME', 'Austin, TX', 'ON_SITE', 110000.00, 135000.00, 'USD', 'DRAFT', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Job for Apex Global Cloud (for multi-tenant isolation verification)
('f0000000-0000-0000-0000-000000000005', '22222222-2222-2222-2222-222222222222', 'a0000000-0000-0000-0000-000000000003', 'Cloud Solutions Architect', 'cloud-solutions-architect', 'Lead client cloud migrations, enterprise AWS architectures, and infrastructure modernization for Apex Global clients.', 'Design hybrid cloud architectures
Drive cost optimization and security hardening
Lead technical advisory for Fortune 500 customers', 'LEAD', 'FULL_TIME', 'Chicago, IL', 'HYBRID', 170000.00, 210000.00, 'USD', 'PUBLISHED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 6. Job Skills
INSERT INTO job_skills (id, job_id, skill_name, is_required, weight) VALUES
-- For Senior Full Stack Java Engineer
('f1000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'Java', TRUE, 1.0),
('f1000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000001', 'Spring Boot', TRUE, 1.0),
('f1000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000001', 'PostgreSQL', TRUE, 1.0),
('f1000000-0000-0000-0000-000000000004', 'f0000000-0000-0000-0000-000000000001', 'React', TRUE, 1.0),
('f1000000-0000-0000-0000-000000000005', 'f0000000-0000-0000-0000-000000000001', 'Docker', FALSE, 0.7),
('f1000000-0000-0000-0000-000000000006', 'f0000000-0000-0000-0000-000000000001', 'REST APIs', TRUE, 0.9),

-- For Lead Frontend Architect
('f1000000-0000-0000-0000-000000000007', 'f0000000-0000-0000-0000-000000000002', 'React', TRUE, 1.0),
('f1000000-0000-0000-0000-000000000008', 'f0000000-0000-0000-0000-000000000002', 'JavaScript', TRUE, 1.0),
('f1000000-0000-0000-0000-000000000009', 'f0000000-0000-0000-0000-000000000002', 'Tailwind CSS', TRUE, 0.9),
('f1000000-0000-0000-0000-000000000010', 'f0000000-0000-0000-0000-000000000002', 'Design Systems', FALSE, 0.8),

-- For Staff DevOps
('f1000000-0000-0000-0000-000000000011', 'f0000000-0000-0000-0000-000000000003', 'Docker', TRUE, 1.0),
('f1000000-0000-0000-0000-000000000012', 'f0000000-0000-0000-0000-000000000003', 'Kubernetes', TRUE, 1.0),
('f1000000-0000-0000-0000-000000000013', 'f0000000-0000-0000-0000-000000000003', 'CI/CD', TRUE, 0.9),
('f1000000-0000-0000-0000-000000000014', 'f0000000-0000-0000-0000-000000000003', 'AWS', FALSE, 0.8);

-- 7. Resumes
INSERT INTO resumes (id, candidate_profile_id, file_name, storage_key, content_type, file_size, raw_text, parsing_status, created_at, updated_at) VALUES
('f2000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'Alex_Rivera_Resume_2026.pdf', 'resumes/e0000000-0000-0000-0000-000000000001/alex_rivera_resume.pdf', 'application/pdf', 124800, 'Alex Rivera - Senior Full Stack Java Engineer. Over 6 years building enterprise Spring Boot microservices, high-traffic PostgreSQL persistence, and modern React web applications. Proficient in Docker, REST APIs, Hibernate, Flyway migrations, and automated JUnit test suites.', 'PARSED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('f2000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000002', 'Elena_Rostova_FullStack.pdf', 'resumes/e0000000-0000-0000-0000-000000000002/elena_rostova_resume.pdf', 'application/pdf', 98400, 'Elena Rostova - Full Stack Engineer. 4 years software development experience. Specialized in Java, Spring Boot, React, SQL, and Docker containerization.', 'PARSED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 8. Resume Skills
INSERT INTO resume_skills (id, resume_id, skill_name, normalized_name, years_experience, context_snippet) VALUES
('f3000000-0000-0000-0000-000000000001', 'f2000000-0000-0000-0000-000000000001', 'Java', 'Java', 6.0, '6+ years designing Spring Boot and Java enterprise platforms'),
('f3000000-0000-0000-0000-000000000002', 'f2000000-0000-0000-0000-000000000001', 'Spring Boot', 'Spring Boot', 6.0, 'Architected production microservices in Spring Boot 3.x'),
('f3000000-0000-0000-0000-000000000003', 'f2000000-0000-0000-0000-000000000001', 'PostgreSQL', 'PostgreSQL', 5.0, 'Optimized complex query execution and Flyway database migrations'),
('f3000000-0000-0000-0000-000000000004', 'f2000000-0000-0000-0000-000000000001', 'React', 'React', 4.5, 'Built responsive single-page web applications with modern React'),
('f3000000-0000-0000-0000-000000000005', 'f2000000-0000-0000-0000-000000000001', 'Docker', 'Docker', 4.0, 'Containerized applications and created multi-stage build pipelines'),
('f3000000-0000-0000-0000-000000000006', 'f2000000-0000-0000-0000-000000000001', 'REST APIs', 'REST APIs', 6.0, 'Engineered secure and documented OpenAPI endpoints');

-- 9. Applications
INSERT INTO applications (id, job_id, candidate_profile_id, resume_id, status, cover_letter, internal_notes, applied_at, updated_at) VALUES
('f4000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'f2000000-0000-0000-0000-000000000001', 'INTERVIEW', 'I am excited to apply for the Senior Full Stack Java Engineer role. My background in building high-scale Spring Boot architectures and modern React web applications aligns directly with your technical roadmap.', 'Candidate has top-tier Java backend knowledge and strong React capability. Recommended for round 2 technical interview.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('f4000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000002', 'f2000000-0000-0000-0000-000000000002', 'SHORTLISTED', 'Hello Acme team, I have 4 years of experience delivering robust full-stack software and would love to contribute to your engineering culture.', 'Solid fundamentals. Shortlisted for initial screening call.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('f4000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000003', NULL, 'SCREENING', 'I have built enterprise design systems and large-scale React platforms for top tech companies.', 'Impressive frontend portfolio. Resume pending review.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 10. Application Events
INSERT INTO application_events (id, application_id, actor_id, previous_status, new_status, event_type, notes, created_at) VALUES
('f5000000-0000-0000-0000-000000000001', 'f4000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', NULL, 'APPLIED', 'STATUS_CHANGE', 'Candidate submitted application with resume Alex_Rivera_Resume_2026.pdf', CURRENT_TIMESTAMP),
('f5000000-0000-0000-0000-000000000002', 'f4000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'APPLIED', 'SCREENING', 'STATUS_CHANGE', 'Recruiter moved candidate to Screening', CURRENT_TIMESTAMP),
('f5000000-0000-0000-0000-000000000003', 'f4000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'SCREENING', 'SHORTLISTED', 'STATUS_CHANGE', 'Passed initial resume evaluation with 95% match', CURRENT_TIMESTAMP),
('f5000000-0000-0000-0000-000000000004', 'f4000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'SHORTLISTED', 'INTERVIEW', 'STATUS_CHANGE', 'Invited to Technical Architecture interview', CURRENT_TIMESTAMP),

('f5000000-0000-0000-0000-000000000005', 'f4000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', NULL, 'APPLIED', 'STATUS_CHANGE', 'Candidate submitted application', CURRENT_TIMESTAMP),
('f5000000-0000-0000-0000-000000000006', 'f4000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'APPLIED', 'SHORTLISTED', 'STATUS_CHANGE', 'Candidate shortlisted for preliminary technical discussion', CURRENT_TIMESTAMP);

-- 11. Match Results
INSERT INTO match_results (id, application_id, job_id, resume_id, overall_score, skill_coverage_score, matched_skills, missing_required_skills, evidence_snippets, ai_explanation, algorithm_version, calculated_at) VALUES
('f6000000-0000-0000-0000-000000000001', 'f4000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'f2000000-0000-0000-0000-000000000001', 94.50, 96.00,
'[{"name": "Java", "experience": 6.0, "required": true}, {"name": "Spring Boot", "experience": 6.0, "required": true}, {"name": "PostgreSQL", "experience": 5.0, "required": true}, {"name": "React", "experience": 4.5, "required": true}, {"name": "Docker", "experience": 4.0, "required": false}, {"name": "REST APIs", "experience": 6.0, "required": true}]',
'[]',
'{"Java": "6+ years designing Spring Boot and Java enterprise platforms", "React": "Built responsive single-page web applications with modern React", "PostgreSQL": "Optimized complex query execution and Flyway database migrations"}',
'Alex Rivera meets 100% of the required technical criteria with proven production experience in Java 17+, Spring Boot, relational data modeling with PostgreSQL, and modern React frontend engineering.',
'v1.0.0-deterministic', CURRENT_TIMESTAMP),

('f6000000-0000-0000-0000-000000000002', 'f4000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000001', 'f2000000-0000-0000-0000-000000000002', 81.20, 83.50,
'[{"name": "Java", "experience": 4.0, "required": true}, {"name": "Spring Boot", "experience": 4.0, "required": true}, {"name": "React", "experience": 3.0, "required": true}, {"name": "Docker", "experience": 2.5, "required": false}]',
'["PostgreSQL"]',
'{"Java": "Specialized in Java and Spring Boot backend engineering", "React": "Built interactive frontend components"}',
'Elena Rostova exhibits strong core competencies in Java, Spring Boot, and React. Resume indicates general SQL experience; candidate should be assessed on advanced PostgreSQL indexing during interviews.',
'v1.0.0-deterministic', CURRENT_TIMESTAMP);

-- 12. Interviews
INSERT INTO interviews (id, application_id, organization_id, interviewer_id, title, interview_type, scheduled_start, scheduled_end, timezone, meeting_link, location, status, notes, created_at, updated_at) VALUES
('f7000000-0000-0000-0000-000000000001', 'f4000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'a0000000-0000-0000-0000-000000000002', 'Technical Architecture & Live Coding', 'TECHNICAL', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'America/Chicago', 'https://meet.hireflow.io/interview-tech-alex', 'Virtual / Video Call', 'SCHEDULED', 'Focus on Spring Security JWT configuration, PostgreSQL query optimization, and React state architecture.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 13. Notifications
INSERT INTO notifications (id, user_id, title, message, type, link, is_read, created_at) VALUES
('f8000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Interview Scheduled', 'Acme Technologies has scheduled your Technical Architecture interview.', 'INTERVIEW_SCHEDULED', '/candidate/interviews', FALSE, CURRENT_TIMESTAMP),
('f8000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'New Application Received', 'Elena Rostova applied for Senior Full Stack Java Engineer.', 'APPLICATION_UPDATE', '/recruiter/applications', FALSE, CURRENT_TIMESTAMP);

-- 14. Audit Logs
INSERT INTO audit_logs (id, organization_id, actor_id, actor_email, action, target_entity, target_id, ip_address, details, created_at) VALUES
('f9000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'a0000000-0000-0000-0000-000000000002', 'recruiter@acme.io', 'JOB_PUBLISHED', 'Job', 'f0000000-0000-0000-0000-000000000001', '127.0.0.1', 'Published Senior Full Stack Java Engineer', CURRENT_TIMESTAMP),
('f9000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'a0000000-0000-0000-0000-000000000002', 'recruiter@acme.io', 'STAGE_UPDATED', 'Application', 'f4000000-0000-0000-0000-000000000001', '127.0.0.1', 'Moved candidate Alex Rivera to INTERVIEW', CURRENT_TIMESTAMP);
