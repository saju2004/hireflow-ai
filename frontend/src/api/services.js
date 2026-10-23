import api from './client';

export const authService = {
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },
  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },
  getCurrentUser: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
  logout: async (refreshToken) => {
    try {
      await api.post('/auth/logout', { refreshToken });
    } finally {
      localStorage.removeItem('hireflow_token');
      localStorage.removeItem('hireflow_refresh_token');
      localStorage.removeItem('hireflow_user');
    }
  },
};

export const jobService = {
  getPublicJobs: async (params = {}) => {
    const res = await api.get('/public/jobs', { params });
    return res.data;
  },
  getPublicJobBySlug: async (slug) => {
    const res = await api.get(`/public/jobs/${slug}`);
    return res.data;
  },
  getRecruiterJobs: async (params = {}) => {
    const res = await api.get('/jobs', { params });
    return res.data;
  },
  getJobById: async (id) => {
    const res = await api.get(`/jobs/${id}`);
    return res.data;
  },
  createJob: async (jobData) => {
    const res = await api.post('/jobs', jobData);
    return res.data;
  },
  updateJob: async (id, jobData) => {
    const res = await api.put(`/jobs/${id}`, jobData);
    return res.data;
  },
  updateJobStatus: async (id, status) => {
    const res = await api.patch(`/jobs/${id}/status?status=${status}`);
    return res.data;
  },
  deleteJob: async (id) => {
    const res = await api.delete(`/jobs/${id}`);
    return res.data;
  },
};

export const resumeService = {
  uploadResume: async (formData) => {
    const res = await api.post('/resumes/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  getMyResumes: async () => {
    const res = await api.get('/resumes/my');
    return res.data;
  },
  getResumeById: async (id) => {
    const res = await api.get(`/resumes/${id}`);
    return res.data;
  },
  deleteResume: async (id) => {
    const res = await api.delete(`/resumes/${id}`);
    return res.data;
  },
};

export const applicationService = {
  apply: async (data) => {
    const res = await api.post('/applications', data);
    return res.data;
  },
  getMyApplications: async () => {
    const res = await api.get('/applications/my');
    return res.data;
  },
  getRecruiterApplications: async (params = {}) => {
    const res = await api.get('/applications', { params });
    return res.data;
  },
  getApplicationById: async (id) => {
    const res = await api.get(`/applications/${id}`);
    return res.data;
  },
  getTimeline: async (id) => {
    const res = await api.get(`/applications/${id}/timeline`);
    return res.data;
  },
  updateStatus: async (id, status, notes = '', rejectionReason = '') => {
    const res = await api.patch(`/applications/${id}/status`, { status, notes, rejectionReason });
    return res.data;
  },
  updateNotes: async (id, notes) => {
    const res = await api.patch(`/applications/${id}/notes`, { notes });
    return res.data;
  },
  withdrawApplication: async (id) => {
    const res = await api.post(`/applications/${id}/withdraw`);
    return res.data;
  },
};

export const matchingService = {
  getMatch: async (applicationId) => {
    const res = await api.get(`/matches/application/${applicationId}`);
    return res.data;
  },
  recalculateMatch: async (applicationId) => {
    const res = await api.post(`/matches/application/${applicationId}/recalculate`);
    return res.data;
  },
};

export const interviewService = {
  scheduleInterview: async (interviewData) => {
    const res = await api.post('/interviews', interviewData);
    return res.data;
  },
  updateStatus: async (id, status) => {
    const res = await api.patch(`/interviews/${id}/status?status=${status}`);
    return res.data;
  },
  submitFeedback: async (id, feedbackData) => {
    const res = await api.post(`/interviews/${id}/feedback`, feedbackData);
    return res.data;
  },
  getRecruiterInterviews: async () => {
    const res = await api.get('/interviews');
    return res.data;
  },
  getCandidateInterviews: async () => {
    const res = await api.get('/interviews/my');
    return res.data;
  },
  getInterviewById: async (id) => {
    const res = await api.get(`/interviews/${id}`);
    return res.data;
  },
};

export const candidateService = {
  getProfile: async () => {
    const res = await api.get('/candidate/profile');
    return res.data;
  },
  updateProfile: async (data) => {
    const res = await api.put('/candidate/profile', data);
    return res.data;
  },
  getProfileById: async (id) => {
    const res = await api.get(`/candidate/profiles/${id}`);
    return res.data;
  },
};

export const notificationService = {
  getNotifications: async () => {
    const res = await api.get('/notifications');
    return res.data;
  },
  markAsRead: async (id) => {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data;
  },
  markAllAsRead: async () => {
    const res = await api.post('/notifications/read-all');
    return res.data;
  },
};

export const analyticsService = {
  getRecruiterAnalytics: async () => {
    const res = await api.get('/analytics/recruiter');
    return res.data;
  },
};

export const organizationService = {
  getCurrentOrganization: async () => {
    const res = await api.get('/organizations/current');
    return res.data;
  },
  updateCurrentOrganization: async (data) => {
    const res = await api.put('/organizations/current', data);
    return res.data;
  },
  getAllOrganizations: async () => {
    const res = await api.get('/organizations');
    return res.data;
  },
  updateStatus: async (id, status) => {
    const res = await api.patch(`/organizations/${id}/status?status=${status}`);
    return res.data;
  },
};

export const userService = {
  getAllUsers: async () => {
    const res = await api.get('/users');
    return res.data;
  },
  updateUserStatus: async (id, status) => {
    const res = await api.patch(`/users/${id}/status?status=${status}`);
    return res.data;
  },
  updateProfile: async (firstName, lastName) => {
    const res = await api.put('/users/profile', { firstName, lastName });
    return res.data;
  },
};

export const auditService = {
  getAdminAuditLogs: async (params = {}) => {
    const res = await api.get('/audit', { params });
    return res.data;
  },
  getOrgAuditLogs: async (params = {}) => {
    const res = await api.get('/audit/organization', { params });
    return res.data;
  },
};
