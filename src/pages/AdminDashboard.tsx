import { useEffect, useState } from 'react';
import { useAuth } from '../components/contexts/AuthContext';
import {
  Building2,
  CheckCircle,
  XCircle,
  QrCode,
  Activity,
  Clock,
} from 'lucide-react';

interface SummaryData {
  total_societies: number;
  active_societies: number;
  revoked_societies: number;
  qr_codes_generated: number;
  recent_logs: {
    id: number;
    user: string;
    action: string;
    object_repr: string;
    ip_address: string;
    timestamp: string;
  }[];
}

const statsCards = [
  {
    label: 'Total Societies',
    key: 'total_societies',
    icon: Building2,
    color: 'bg-blue-50 text-blue-600',
  },
  {
    label: 'Active',
    key: 'active_societies',
    icon: CheckCircle,
    color: 'bg-green-50 text-green-600',
  },
  {
    label: 'Revoked',
    key: 'revoked_societies',
    icon: XCircle,
    color: 'bg-red-50 text-red-600',
  },
  {
    label: 'QR Codes Generated',
    key: 'qr_codes_generated',
    icon: QrCode,
    color: 'bg-purple-50 text-purple-600',
  },
];

export default function AdminDashboard() {
  const { token, logout } = useAuth();
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSummary = async () => {
    try {
      const res = await fetch('https://eastern-katheryn-suhangowda96-40cc7389.koyeb.app/api/dashboard-summary/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) { logout(); return; }
      if (!res.ok) throw new Error('Failed to load dashboard');
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [token]);

  const formatTime = (ts: string) =>
    new Date(ts).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
        {error}
        <button onClick={fetchSummary} className="ml-2 underline">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card) => {
          const Icon = card.icon;
          const value = data?.[card.key as keyof SummaryData] ?? 0;
          return (
            <div
              key={card.key}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center gap-4"
            >
              <div className={`p-3 rounded-lg ${card.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{String(value)}</p>
                <p className="text-sm text-gray-500">{card.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
        </div>
        {data?.recent_logs?.length ? (
          <div className="space-y-3">
            {data.recent_logs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between text-sm border-b border-gray-100 pb-3 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium text-gray-900">{log.user}</span>
                  <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
                    {log.action}
                  </span>
                  <span className="text-gray-600">{log.object_repr}</span>
                </div>
                <div className="flex items-center gap-4 text-gray-400">
                  <span className="font-mono text-xs">{log.ip_address}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTime(log.timestamp)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">No recent activity.</p>
        )}
      </div>
    </div>
  );
}