import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Calendar,
  BarChart3,
  Building2,
  User,
  Search,
  FileText,
  UploadCloud,
  Bell,
  Settings,
  ShieldCheck,
  ScrollText,
  Sliders,
  PlusCircle,
} from 'lucide-react';

export const Sidebar = () => {
  const { user } = useAuth();
  const role = user?.role;

  const recruiterLinks = [
    { to: '/recruiter/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/recruiter/jobs', label: 'Job Postings', icon: Briefcase },
    { to: '/recruiter/pipeline', label: 'Candidate Pipeline', icon: Users },
    { to: '/recruiter/interviews', label: 'Interviews', icon: Calendar },
    { to: '/recruiter/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/recruiter/settings', label: 'Organization', icon: Building2 },
    { to: '/recruiter/profile', label: 'Profile', icon: User },
  ];

  const candidateLinks = [
    { to: '/candidate/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/candidate/jobs', label: 'Find Jobs', icon: Search },
    { to: '/candidate/applications', label: 'My Applications', icon: FileText },
    { to: '/candidate/resumes', label: 'Resume Center', icon: UploadCloud },
    { to: '/candidate/interviews', label: 'Interviews', icon: Calendar },
    { to: '/candidate/profile', label: 'Profile & Skills', icon: User },
    { to: '/candidate/notifications', label: 'Notifications', icon: Bell },
    { to: '/candidate/settings', label: 'Settings', icon: Settings },
  ];

  const adminLinks = [
    { to: '/admin/overview', label: 'System Overview', icon: ShieldCheck },
    { to: '/admin/organizations', label: 'Organizations', icon: Building2 },
    { to: '/admin/users', label: 'User Directory', icon: Users },
    { to: '/admin/audit-logs', label: 'Audit Trail', icon: ScrollText },
    { to: '/admin/config', label: 'Platform Config', icon: Sliders },
  ];

  const links = role === 'RECRUITER' ? recruiterLinks : role === 'PLATFORM_ADMIN' ? adminLinks : candidateLinks;

  return (
    <aside className="w-56 bg-surface border-r border-border shrink-0 min-h-[calc(100vh-3.5rem)] p-3 flex flex-col justify-between">
      <div>
        {/* Quick action for recruiters */}
        {role === 'RECRUITER' && (
          <div className="mb-4">
            <NavLink
              to="/recruiter/jobs/create"
              className="flex items-center justify-center gap-2 w-full py-2 px-3 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-md shadow-xs transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Post New Job
            </NavLink>
          </div>
        )}

        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">
            {role === 'RECRUITER' ? 'Recruitment Hub' : role === 'PLATFORM_ADMIN' ? 'Platform Control' : 'Career Portal'}
          </p>
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 font-semibold'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-subtle'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Tenant / Workspace footer */}
      {role === 'RECRUITER' && user?.organizationName && (
        <div className="p-2.5 rounded-md bg-surface-subtle border border-border text-[11px]">
          <p className="font-semibold text-text-primary truncate">{user.organizationName}</p>
          <p className="text-text-muted text-[10px]">Active Workspace</p>
        </div>
      )}
    </aside>
  );
};
