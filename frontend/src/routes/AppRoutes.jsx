import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';

// Public pages
import { LandingPage } from '../pages/public/LandingPage';
import { LoginPage } from '../pages/public/LoginPage';
import { RegisterPage } from '../pages/public/RegisterPage';
import { ForgotPasswordPage } from '../pages/public/ForgotPasswordPage';
import { PublicJobsPage } from '../pages/public/PublicJobsPage';
import { PublicJobDetailsPage } from '../pages/public/PublicJobDetailsPage';
import { UnauthorizedPage } from '../pages/public/UnauthorizedPage';
import { NotFoundPage } from '../pages/public/NotFoundPage';

// Candidate pages
import { CandidateDashboard } from '../pages/candidate/CandidateDashboard';
import { CandidateProfilePage } from '../pages/candidate/CandidateProfilePage';
import { ResumeManagementPage } from '../pages/candidate/ResumeManagementPage';
import { MyApplicationsPage } from '../pages/candidate/MyApplicationsPage';
import { CandidateInterviewsPage } from '../pages/candidate/CandidateInterviewsPage';
import { CandidateSettingsPage } from '../pages/candidate/CandidateSettingsPage';
import { CandidateNotificationsPage } from '../pages/candidate/CandidateNotificationsPage';

// Recruiter pages
import { RecruiterDashboard } from '../pages/recruiter/RecruiterDashboard';
import { JobManagementPage } from '../pages/recruiter/JobManagementPage';
import { CreateJobPage } from '../pages/recruiter/CreateJobPage';
import { EditJobPage } from '../pages/recruiter/EditJobPage';
import { CandidatePipelinePage } from '../pages/recruiter/CandidatePipelinePage';
import { ApplicationDetailsPage } from '../pages/recruiter/ApplicationDetailsPage';
import { CandidateMatchPage } from '../pages/recruiter/CandidateMatchPage';
import { RecruiterInterviewsPage } from '../pages/recruiter/RecruiterInterviewsPage';
import { RecruitmentAnalyticsPage } from '../pages/recruiter/RecruitmentAnalyticsPage';
import { OrganizationSettingsPage } from '../pages/recruiter/OrganizationSettingsPage';
import { RecruiterProfilePage } from '../pages/recruiter/RecruiterProfilePage';

// Admin pages
import { AdminOverviewPage } from '../pages/admin/AdminOverviewPage';
import { AdminOrganizationsPage } from '../pages/admin/AdminOrganizationsPage';
import AdminUsersPage from '../pages/admin/AdminUsersPage';
import AdminAuditLogsPage from '../pages/admin/AdminAuditLogsPage';
import AdminConfigPage from '../pages/admin/AdminConfigPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<AppLayout requireSidebar={false} />}>
        <Route index element={<LandingPage />} />
        <Route path="jobs" element={<PublicJobsPage />} />
        <Route path="jobs/:id" element={<PublicJobDetailsPage />} />
      </Route>

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Candidate Portal */}
      <Route
        path="/candidate"
        element={
          <ProtectedRoute allowedRoles={['CANDIDATE']}>
            <AppLayout requireSidebar={true} />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/candidate/dashboard" replace />} />
        <Route path="dashboard" element={<CandidateDashboard />} />
        <Route path="jobs" element={<PublicJobsPage />} />
        <Route path="jobs/:id" element={<PublicJobDetailsPage />} />
        <Route path="profile" element={<CandidateProfilePage />} />
        <Route path="resumes" element={<ResumeManagementPage />} />
        <Route path="applications" element={<MyApplicationsPage />} />
        <Route path="applications/:id" element={<MyApplicationsPage />} />
        <Route path="interviews" element={<CandidateInterviewsPage />} />
        <Route path="notifications" element={<CandidateNotificationsPage />} />
        <Route path="settings" element={<CandidateSettingsPage />} />
      </Route>

      {/* Recruiter Workspace */}
      <Route
        path="/recruiter"
        element={
          <ProtectedRoute allowedRoles={['RECRUITER']}>
            <AppLayout requireSidebar={true} />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/recruiter/dashboard" replace />} />
        <Route path="dashboard" element={<RecruiterDashboard />} />
        <Route path="jobs" element={<JobManagementPage />} />
        <Route path="jobs/create" element={<CreateJobPage />} />
        <Route path="jobs/new" element={<CreateJobPage />} />
        <Route path="jobs/:id/edit" element={<EditJobPage />} />
        <Route path="pipeline" element={<CandidatePipelinePage />} />
        <Route path="applications/:id" element={<ApplicationDetailsPage />} />
        <Route path="applications/:id/match" element={<CandidateMatchPage />} />
        <Route path="interviews" element={<RecruiterInterviewsPage />} />
        <Route path="analytics" element={<RecruitmentAnalyticsPage />} />
        <Route path="organization" element={<OrganizationSettingsPage />} />
        <Route path="settings" element={<OrganizationSettingsPage />} />
        <Route path="profile" element={<RecruiterProfilePage />} />
      </Route>

      {/* Platform Admin Console */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['PLATFORM_ADMIN']}>
            <AppLayout requireSidebar={true} />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/overview" replace />} />
        <Route path="overview" element={<AdminOverviewPage />} />
        <Route path="dashboard" element={<AdminOverviewPage />} />
        <Route path="organizations" element={<AdminOrganizationsPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="audit-logs" element={<AdminAuditLogsPage />} />
        <Route path="config" element={<AdminConfigPage />} />
      </Route>

      {/* 404 Catch All */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
