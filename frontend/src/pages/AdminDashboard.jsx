import { useState, useEffect } from 'react';
import api from '../utils/api';
import {
  Users, Shield, FileText, AlertTriangle, TrendingUp,
  CloudRain, Thermometer, Wind, Zap, MapPin, RefreshCw,
  CheckCircle, XCircle
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const TRIGGER_COLORS = { rainfall: '#3b82f6', temperature: '#ef4444', aqi: '#eab308', manual_simulation: '#f97316' };
const PIE_COLORS = ['#f97316', '#3b82f6', '#ef4444', '#eab308', '#8b5cf6'];

export default function AdminDashboard() {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(null);

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/stats');
      setStats(data.stats);
    } finally { setLoading(false); }
  };

  const resolveFraud = async (id) => {
    setResolving(id);
    try {
      await api.post(`/admin/resolve-fraud/${id}`);
      await loadStats();
    } finally { setResolving(null); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const { totalUsers, activePolicies, totalClaims, fraudAlerts,
          totalPayouts, highRiskZones, claimsByTrigger, claimTrend,
          recentClaims, fraudLogs } = stats || {};

  const triggerPieData = (claimsByTrigger || []).map(t => ({
    name: t._id?.replace('_', ' ') || 'unknown',
    value: t.count
  }));

  const trendData = (claimTrend || []).map(t => ({
    date: t._id?.slice(5) || '',
    claims: t.count
  }));

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400 mt-1">SurakshaPay operations overview</p>
        </div>
        <button onClick={loadStats} className="btn-secondary flex items-center gap-2 text-sm py-2 px-4">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { icon: Users,         label: 'Total Users',      value: totalUsers || 0,          color: 'text-blue-400',    iconBg: 'bg-blue-500/15 border-blue-500/20 text-blue-400' },
          { icon: Shield,        label: 'Active Policies',  value: activePolicies || 0,      color: 'text-emerald-400', iconBg: 'bg-emerald-500/15 border-emerald-500/20 text-emerald-400' },
          { icon: FileText,      label: 'Total Claims',     value: totalClaims || 0,         color: 'text-brand-400',   iconBg: 'bg-brand-500/15 border-brand-500/20 text-brand-400' },
          { icon: AlertTriangle, label: 'Fraud Alerts',     value: fraudAlerts || 0,         color: 'text-red-400',     iconBg: 'bg-red-500/15 border-red-500/20 text-red-400' },
          { icon: TrendingUp,    label: 'Total Payouts',    value: `₹${Math.round(totalPayouts || 0).toLocaleString('en-IN')}`, color: 'text-purple-400', iconBg: 'bg-purple-500/15 border-purple-500/20 text-purple-400' },
        ].map(({ icon: Icon, label, value, color, iconBg }) => (
          <div key={label} className="stat-card">
            <div className={`w-9 h-9 ${iconBg} border rounded-lg flex items-center justify-center`}>
              <Icon size={16} />
            </div>
            <p className={`font-display text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Claim trend */}
        <div className="card lg:col-span-2">
          <h3 className="font-display font-semibold text-white mb-4">Claims Trend — Last 7 Days</h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="claimGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1a1a26', border: '1px solid #2e2e4a', borderRadius: 10, color: '#fff' }} />
              <Area type="monotone" dataKey="claims" stroke="#f97316" strokeWidth={2} fill="url(#claimGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Triggers breakdown */}
        <div className="card">
          <h3 className="font-display font-semibold text-white mb-4">Claims by Trigger</h3>
          {triggerPieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={130}>
                <PieChart>
                  <Pie data={triggerPieData} cx="50%" cy="50%" innerRadius={35} outerRadius={58} paddingAngle={3} dataKey="value">
                    {triggerPieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1a1a26', border: '1px solid #2e2e4a', borderRadius: 10, color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {triggerPieData.map(({ name, value }, i) => (
                  <div key={name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-xs text-gray-400 capitalize">{name}</span>
                    </div>
                    <span className="text-xs font-mono text-white">{value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : <p className="text-gray-500 text-sm text-center py-8">No claims yet</p>}
        </div>
      </div>

      {/* High risk zones + fraud */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* High risk zones */}
        <div className="card">
          <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
            <MapPin size={16} className="text-brand-400" /> High-Risk Zones
          </h3>
          {(highRiskZones || []).length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-6">No data yet</p>
          ) : (
            <div className="space-y-3">
              {(highRiskZones || []).map((zone, i) => (
                <div key={zone._id} className="flex items-center justify-between p-3 bg-dark-700 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-gray-500 w-5">#{i + 1}</span>
                    <div>
                      <p className="text-sm font-medium text-white">{zone._id}</p>
                      <p className="text-xs text-gray-500">{zone.claimCount} claims</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono text-brand-400 font-semibold">
                      ₹{Math.round(zone.totalPayout).toLocaleString('en-IN')}
                    </p>
                    <p className="text-xs text-gray-500">total payout</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Fraud alerts */}
        <div className="card">
          <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-400" /> Fraud Alerts
            {(fraudLogs || []).length > 0 && (
              <span className="ml-auto badge-red">{(fraudLogs || []).length} unresolved</span>
            )}
          </h3>
          {(fraudLogs || []).length === 0 ? (
            <div className="text-center py-6">
              <CheckCircle size={28} className="mx-auto mb-2 text-emerald-400 opacity-50" />
              <p className="text-gray-500 text-sm">No unresolved fraud alerts</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(fraudLogs || []).map(log => (
                <div key={log._id} className="p-3 bg-red-500/5 border border-red-500/15 rounded-xl">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`badge ${log.severity === 'high' ? 'badge-red' : log.severity === 'medium' ? 'badge-orange' : 'badge-yellow'}`}>
                          {log.severity}
                        </span>
                        <span className="text-xs text-white font-medium capitalize">
                          {log.fraudType.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 truncate">{log.description}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        User: {log.userId?.name || 'Unknown'} · {log.userId?.city}
                      </p>
                    </div>
                    <button
                      onClick={() => resolveFraud(log._id)}
                      disabled={resolving === log._id}
                      className="flex-shrink-0 px-2.5 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs text-emerald-400 hover:bg-emerald-500/20 transition-all"
                    >
                      {resolving === log._id ? '...' : 'Resolve'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent claims */}
      <div className="card">
        <h3 className="font-display font-semibold text-white mb-5">Recent Claims — All Users</h3>
        {(recentClaims || []).length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-6">No claims yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-dark-600">
                  <th className="text-left pb-3 pr-4">User</th>
                  <th className="text-left pb-3 pr-4">Trigger</th>
                  <th className="text-left pb-3 pr-4">City</th>
                  <th className="text-right pb-3 pr-4">Payout</th>
                  <th className="text-left pb-3 pr-4">Status</th>
                  <th className="text-left pb-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-600">
                {(recentClaims || []).map(claim => (
                  <tr key={claim._id} className="hover:bg-dark-700/50 transition-colors">
                    <td className="py-3 pr-4">
                      <p className="font-medium text-white">{claim.userId?.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">{claim.userId?.platform}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="capitalize text-gray-300 text-xs">
                        {claim.triggerType?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-gray-400 text-xs">{claim.city}</td>
                    <td className="py-3 pr-4 text-right font-mono font-semibold text-emerald-400">
                      ₹{claim.payoutAmount?.toFixed(0)}
                    </td>
                    <td className="py-3 pr-4">
                      <span className={
                        claim.status === 'approved' ? 'badge-green' :
                        claim.status === 'flagged'  ? 'badge-yellow' : 'badge-red'
                      }>{claim.status}</span>
                    </td>
                    <td className="py-3 text-xs text-gray-500">
                      {new Date(claim.claimedAt).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
