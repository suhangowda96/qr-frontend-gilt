import { useState, useEffect } from 'react';
import { useAuth } from '../components/contexts/AuthContext';
import { RefreshCw, Shield, LogIn, UserPlus, FilePlus, Edit3, Trash2 } from 'lucide-react';

interface AuditLogEntry {
  id: number;
  user: string | null;
  action: string;
  content_type?: number | null;
  object_id?: string | null;
  object_repr: string;
  ip_address: string;
  timestamp: string;
  extra_data?: any;
}

// Map action to icon and color
const actionMeta: Record<string, { icon: React.ElementType; color: string }> = {
  CREATE: { icon: FilePlus, color: 'text-green-600' },
  UPDATE: { icon: Edit3, color: 'text-blue-600' },
  DELETE: { icon: Trash2, color: 'text-red-600' },
  LOGIN:  { icon: LogIn,  color: 'text-indigo-600' },
  SIGNUP: { icon: UserPlus, color: 'text-purple-600' },
};

export default function AuditLogsPage() {
  const { token, logout } = useAuth();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('https://eastern-katheryn-suhangowda96-40cc7389.koyeb.app/api/audit-logs/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        logout();
        return;
      }
      if (!res.ok) throw new Error('Failed to fetch audit logs');
      const data = await res.json();
      // data could be array or { results: [...] }
      setLogs(Array.isArray(data) ? data : data.results ?? []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [token]);

  const formatTimestamp = (ts: string) => {
    return new Date(ts).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading logs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
        <p>{error}</p>
        <button onClick={fetchLogs} className="mt-2 underline">Retry</button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Audit Logs</h1>
        <button
          onClick={fetchLogs}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admin</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-500">
                    No audit logs found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const action = log.action ?? 'UNKNOWN';
                  const meta = actionMeta[action] || { icon: Shield, color: 'text-gray-400' };
                  const Icon = meta.icon;
                  return (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                        {formatTimestamp(log.timestamp)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {log.user ?? 'System'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-sm font-medium ${meta.color}`}>
                          <Icon className="w-4 h-4" />
                          {action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {log.object_repr || log.object_id ? (
                          <span>
                            {log.object_repr || log.object_id}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-500 whitespace-nowrap">
                        {log.ip_address}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}