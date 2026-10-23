import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notificationService } from '../../api/services';
import { Bell, LogOut, User as UserIcon, Building2, Briefcase, ChevronDown } from 'lucide-react';

export const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
    }
  }, [isAuthenticated]);

  const loadNotifications = async () => {
    try {
      const res = await notificationService.getNotifications();
      if (res?.success && res.data) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      // Non-blocking
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-surface border-b border-border shadow-xs">
      <div className="flex items-center justify-between px-4 sm:px-6 h-14">
        {/* Left: Brand */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-base shadow-xs group-hover:bg-brand-700 transition-colors">
              H
            </div>
            <span className="font-bold text-lg text-text-primary tracking-tight">
              HireFlow<span className="text-brand-600 ml-0.5">AI</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-4 text-sm font-medium text-text-secondary">
            <Link to="/jobs" className="hover:text-text-primary transition-colors">
              Explore Jobs
            </Link>
          </nav>
        </div>

        {/* Right: User Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-1.5 text-text-secondary hover:text-text-primary rounded-md hover:bg-surface-subtle relative transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-brand-600 ring-2 ring-surface" />
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-surface rounded-lg shadow-dropdown border border-border py-2 z-50">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-border">
                      <span className="text-xs font-semibold text-text-primary uppercase tracking-wider">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-xs text-brand-600 hover:text-brand-700 font-medium"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto divide-y divide-border">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-6 text-center text-xs text-text-muted">
                          No notifications
                        </div>
                      ) : (
                        notifications.slice(0, 5).map((n) => (
                          <div
                            key={n.id}
                            className={`px-4 py-2.5 text-xs ${n.isRead ? 'opacity-70' : 'bg-brand-50/40'}`}
                          >
                            <p className="font-semibold text-text-primary">{n.title}</p>
                            <p className="text-text-secondary mt-0.5">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1 rounded-md hover:bg-surface-subtle transition-colors text-left"
                >
                  <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-semibold text-xs border border-brand-200">
                    {user?.firstName?.[0] || 'U'}
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-xs font-semibold text-text-primary leading-none">{user?.fullName}</p>
                    <p className="text-[10px] text-text-muted mt-0.5 capitalize">
                      {user?.organizationName ? `${user.organizationName} (${user.role.toLowerCase()})` : user?.role?.toLowerCase()}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-surface rounded-lg shadow-dropdown border border-border py-1 z-50 text-xs">
                    <div className="px-3 py-2 border-b border-border">
                      <p className="font-semibold text-text-primary">{user?.fullName}</p>
                      <p className="text-text-muted truncate">{user?.email}</p>
                    </div>

                    <Link
                      to={
                        user?.role === 'RECRUITER'
                          ? '/recruiter/dashboard'
                          : user?.role === 'PLATFORM_ADMIN'
                          ? '/admin/overview'
                          : '/candidate/dashboard'
                      }
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 px-3 py-2 text-text-secondary hover:text-text-primary hover:bg-surface-subtle"
                    >
                      <Briefcase className="w-3.5 h-3.5" />
                      Dashboard
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-status-danger hover:bg-rose-50 text-left border-t border-border mt-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-xs font-medium text-text-secondary hover:text-text-primary px-3 py-1.5 rounded-md hover:bg-surface-subtle transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-xs font-medium text-white bg-brand-600 hover:bg-brand-700 px-3 py-1.5 rounded-md transition-colors shadow-xs"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
