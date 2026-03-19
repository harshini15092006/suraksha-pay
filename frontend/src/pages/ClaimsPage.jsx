import { useState, useEffect } from 'react';
import api from '../utils/api';
import { CloudRain, Thermometer, Wind, Zap, CheckCircle, AlertTriangle, XCircle, Filter } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const TRIGGER_META = {
  rainfall:          { icon: CloudRain,    label: 'Heavy Rain',      color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/20' },
  temperature:       { icon: Thermometer,  label: 'Extreme Heat',    color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/20' },
  aqi:               { icon: Wind,         label: 'Poor Air Quality', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
  manual_simulation: { icon: Zap,          label: 'Simulated',       color: 'text-brand-400',  bg: 'bg-brand-500/10 border-brand-500/20' },
};

const STATUS_META = {
  approved: { icon: CheckCircle,   label: 'Approved', badge: 'badge-green'  },
  flagged:  { icon: AlertTriangle, label: 'Flagged',  badge: 'badge-yellow' },
  rejected: { icon: XCircle,       label: 'Rejected', badge: 'badge-red'    },
};

const PIE_COLORS = ['#3b82f6', '#ef4444', '#eab308', '#f97316'];

export default function ClaimsPage() {
  const [claims, setClaims]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('all');

  useEffect(() => {
    api.get('/claims/my')
      .then(r => setClaims(r.data.claims))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? claims : claims.filter(c => c.status === filter);

  const totalPayout = claims.filter(c => c.status === 'approved').reduce((s, c) => s + c.payoutAmount, 0);

  // Pie data by trigger type
  const triggerCounts = claims.reduce((acc, c) => {
    acc[c.triggerType] = (acc[c.triggerType] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.entries(triggerCounts).map(([name, value]) => ({
    name: TRIGGER_META[name]?.label || name,
    value
  }));

  // Bar data: payouts by date
  const payoutByDay = claims
    .filter(c => c.status === 'approved')
    .reduce((acc, c) => {
      const day = new Date(c.claimedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      acc[day] = (acc[day] || 0) + c.payoutAmount;
      return acc;
    }, {});
  const barData = Object.entries(payoutByDay).map(([day, payout]) => ({ day, payout: parseFloat(payout.toFixed(0)) })).slice(-7);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">Claims History</h1>
        <p className="text-gray-400 mt-1">All your auto-triggered and simulated claims</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Claims',    value: claims.length,                                               color: 'text-white' },
          { label: 'Approved',        value: claims.filter(c => c.status === 'approved').length,          color: 'text-emerald-400' },
          { label: 'Flagged',         value: claims.filter(c => c.status === 'flagged').length,           color: 'text-yellow-400' },
          { label: 'Total Payout',    value: `₹${totalPayout.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, color: 'text-brand-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="stat-card text-center">
            <p className={`font-display text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      {claims.length > 0 && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="font-display font-semibold text-white mb-4">Payouts Over Time</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={barData}>
                <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
                <Tooltip
                  contentStyle={{ background: '#1a1a26', border: '1px solid #2e2e4a', borderRadius: 10, color: '#fff' }}
                  formatter={v => [`₹${v}`, 'Payout']}
                />
                <Bar dataKey="payout" fill="#f97316" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h3 className="font-display font-semibold text-white mb-4">Claims by Trigger Type</h3>
            {pieData.length > 0 ? (
              <div className="flex items-center gap-6">
                <ResponsiveContainer width="50%" height={160}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                      {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#1a1a26', border: '1px solid #2e2e4a', borderRadius: 10, color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 flex-1">
                  {pieData.map(({ name, value }, i) => (
                    <div key={name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span className="text-xs text-gray-400">{name}</span>
                      </div>
                      <span className="text-xs font-mono text-white font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center py-8">No claims data</p>
            )}
          </div>
        </div>
      )}

      {/* Filter + Claims list */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-semibold text-white">All Claims</h3>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-gray-400" />
            {['all', 'approved', 'flagged', 'rejected'].map(f => (
              <button key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  filter === f
                    ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                    : 'text-gray-500 hover:text-gray-300'
                }`}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <CloudRain size={32} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm">No {filter === 'all' ? '' : filter} claims found</p>
            <p className="text-xs text-gray-600 mt-1">Use "Simulate Rain" on the dashboard to trigger a claim</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(claim => {
              const meta   = TRIGGER_META[claim.triggerType] || TRIGGER_META.manual_simulation;
              const status = STATUS_META[claim.status]       || STATUS_META.approved;
              const Icon   = meta.icon;
              const StatusIcon = status.icon;
              return (
                <div key={claim._id}
                  className={`p-4 rounded-xl border transition-all ${meta.bg} ${claim.isFraud ? 'opacity-70' : ''}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 ${meta.bg} rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <Icon size={16} className={meta.color} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-white">{meta.label}</span>
                          <span className={status.badge}>{status.label}</span>
                          {claim.autoTriggered && (
                            <span className="badge bg-dark-600 text-gray-400 border border-dark-500">Auto-triggered</span>
                          )}
                          {claim.isFraud && (
                            <span className="badge-red">Fraud Flagged</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          Trigger: {claim.triggerValue} (threshold: {claim.triggerThreshold}) ·{' '}
                          {new Date(claim.claimedAt).toLocaleString('en-IN')}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {claim.hoursLost}h lost × ₹{claim.hourlyIncome.toFixed(0)}/hr
                        </p>
                        {claim.fraudReasons?.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {claim.fraudReasons.map((r, i) => (
                              <p key={i} className="text-xs text-yellow-400 flex items-center gap-1">
                                <AlertTriangle size={10} /> {r}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`font-mono font-bold text-lg ${claim.status === 'approved' ? 'text-emerald-400' : 'text-gray-400'}`}>
                        {claim.status === 'approved' ? '+' : ''}₹{claim.payoutAmount.toFixed(0)}
                      </p>
                      <p className="text-xs text-gray-500">{claim.city}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
