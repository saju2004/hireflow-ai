import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditService } from '../../api/services';
import Button from '../../components/ui/Button';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import { ShieldCheck, Search, Filter, RefreshCw, FileText, Globe, Clock, User } from 'lucide-react';

export default function AdminAuditLogsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [page, setPage] = useState(0);
  const [selectedLog, setSelectedLog] = useState(null);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['admin-audit-logs', page],
    queryFn: () => auditService.getAdminAuditLogs({ page, size: 20 }),
  });

  const pagedResponse = data?.data;
  const logs = pagedResponse?.content || [];

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      (log.actorEmail || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.action || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.entityType || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = !actionFilter || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const getActionBadgeColor = (action) => {
    if (action.includes('LOGIN') || action.includes('AUTH')) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (action.includes('CREATE') || action.includes('REGISTER')) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (action.includes('UPDATE') || action.includes('STATUS')) return 'bg-amber-100 text-amber-700 border-amber-200';
    if (action.includes('DELETE') || action.includes('SUSPEND') || action.includes('REJECT')) return 'bg-rose-100 text-rose-700 border-rose-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Audit & Security Logs</h1>
          <p className="text-sm text-slate-500 mt-1">
            Immutable system audit trail tracking tenant isolation, authentication, and state modifications.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => refetch()}
          disabled={isFetching}
          className="self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh Stream
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by actor email, action name, or entity type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="flex gap-3">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="border border-slate-200 rounded-lg text-sm px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Actions</option>
            <option value="USER_LOGIN">USER_LOGIN</option>
            <option value="USER_REGISTER">USER_REGISTER</option>
            <option value="JOB_CREATED">JOB_CREATED</option>
            <option value="JOB_STATUS_CHANGED">JOB_STATUS_CHANGED</option>
            <option value="APPLICATION_SUBMITTED">APPLICATION_SUBMITTED</option>
            <option value="APPLICATION_STATUS_UPDATED">APPLICATION_STATUS_UPDATED</option>
            <option value="RESUME_UPLOADED">RESUME_UPLOADED</option>
            <option value="INTERVIEW_SCHEDULED">INTERVIEW_SCHEDULED</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-6">
            <LoadingSkeleton count={6} />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={ShieldCheck}
              title="No Audit Logs Recorded"
              description="No audit events matched your filters or no platform events have occurred yet."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-3">Timestamp (UTC)</th>
                  <th className="px-6 py-3">Actor</th>
                  <th className="px-6 py-3">Action</th>
                  <th className="px-6 py-3">Target Entity</th>
                  <th className="px-6 py-3">IP Address</th>
                  <th className="px-6 py-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 text-xs font-mono text-slate-600 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium text-slate-900">{log.actorEmail || 'System / Anonymous'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border ${getActionBadgeColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <span className="text-xs font-semibold text-slate-700">{log.entityType}</span>
                      {log.entityId && (
                        <p className="text-[11px] font-mono text-slate-400 truncate max-w-[140px]">
                          {log.entityId}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-500">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagedResponse && pagedResponse.totalPages > 1 && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Showing Page {page + 1} of {pagedResponse.totalPages} ({pagedResponse.totalElements} total records)
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagedResponse.first}
                onClick={() => setPage((prev) => Math.max(0, prev - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagedResponse.last}
                onClick={() => setPage((prev) => prev + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedLog(null)}
          title="Audit Event Details"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <span className="font-semibold text-slate-500">Event ID:</span>
                <p className="font-mono text-slate-800 truncate">{selectedLog.id}</p>
              </div>
              <div>
                <span className="font-semibold text-slate-500">Timestamp:</span>
                <p className="text-slate-800">{new Date(selectedLog.createdAt).toUTCString()}</p>
              </div>
              <div>
                <span className="font-semibold text-slate-500">Actor Email:</span>
                <p className="text-slate-800">{selectedLog.actorEmail}</p>
              </div>
              <div>
                <span className="font-semibold text-slate-500">Actor ID:</span>
                <p className="font-mono text-slate-800 truncate">{selectedLog.actorId || 'N/A'}</p>
              </div>
              <div>
                <span className="font-semibold text-slate-500">Action:</span>
                <p className="font-mono font-medium text-indigo-700">{selectedLog.action}</p>
              </div>
              <div>
                <span className="font-semibold text-slate-500">IP Address:</span>
                <p className="font-mono text-slate-800">{selectedLog.ipAddress || '127.0.0.1'}</p>
              </div>
              <div className="col-span-2">
                <span className="font-semibold text-slate-500">Organization ID:</span>
                <p className="font-mono text-slate-800">{selectedLog.organizationId || 'Global / Platform'}</p>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Details & Payload Payload:</label>
              <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg text-xs font-mono overflow-x-auto whitespace-pre-wrap max-h-60">
                {selectedLog.details ? (
                  typeof selectedLog.details === 'object'
                    ? JSON.stringify(selectedLog.details, null, 2)
                    : selectedLog.details
                ) : (
                  'No additional payload provided.'
                )}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedLog(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
