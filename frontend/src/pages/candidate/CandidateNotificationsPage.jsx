import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { notificationService } from '../../api/services';
import { Button } from '../../components/ui/Button';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Bell, CheckCheck } from 'lucide-react';

export const CandidateNotificationsPage = () => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['candidateNotificationsAll'],
    queryFn: () => notificationService.getNotifications(),
  });

  const notifications = data?.data?.notifications || [];

  const handleMarkRead = async (id) => {
    await notificationService.markAsRead(id);
    refetch();
  };

  const handleMarkAll = async () => {
    await notificationService.markAllAsRead();
    refetch();
  };

  if (isLoading) {
    return <LoadingSkeleton count={3} />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Notification Center</h1>
          <p className="text-xs text-text-muted mt-0.5">Stay updated on your interview invitations and stage changes</p>
        </div>
        {notifications.some((n) => !n.isRead) && (
          <Button variant="secondary" size="sm" icon={CheckCheck} onClick={handleMarkAll}>
            Mark All Read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications yet" description="You are all caught up!" />
      ) : (
        <div className="bg-surface rounded-xl border border-border shadow-card divide-y divide-border overflow-hidden">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 flex items-start justify-between gap-4 transition-colors ${
                n.isRead ? 'opacity-70 bg-surface' : 'bg-brand-50/40'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-text-primary">{n.title}</h3>
                  <span className="text-[10px] uppercase font-semibold text-text-muted">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">{n.message}</p>
              </div>

              {!n.isRead && (
                <button
                  onClick={() => handleMarkRead(n.id)}
                  className="text-xs text-brand-600 hover:text-brand-700 font-medium shrink-0"
                >
                  Mark read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
