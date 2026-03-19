import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import {
  Shield, CloudRain, Thermometer, Wind,
  TrendingUp, Clock, CheckCircle, AlertTriangle,
  Zap, ArrowRight, RefreshCw
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';

const TRIGGER_ICONS = { rainfall: CloudRain, temperature: Thermometer, aqi: Wind, manual_simulation: Zap };
const TRIGGER_COLORS = { rainfall: 'text-blue-400', temperature: 'text-red-400', aqi: 'text-yellow-400', manual_simulation: 'text-brand-400' };

export default function Dashboard() {
  const { user, refreshUser } = useAuth();
  const [policy, setPolicy]     = useState(null);
  const [claims, setClaims]     = useState([]);
  const [weather, setWeather]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [simLoading, setSimLoading] = useState(false);
  const [simResult, setSimResult]   = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [policyRes, claimsRes, weatherRes] = await Promise.allSettled([
        api.get('/policies/active'),
        api.get('/claims/my'),
        api.get(`/weather/${user.city}`)
      ]);
      if (policyRes.status === 'fulfilled') setPolicy(policyRes.value.data.policy);
      if (claimsRes.status === 'fulfilled') setClaims(claimsRes.value.data.claims);
      if (weatherRes.status === 'fulfilled') setWeather(weatherRes.value.data.data);
    } catch (e) { /* fail silently */ }
    finally { setLoading(false); }
  };

  const handleSimulateRain = async () => {
    setSimLoading(true); setSimResult(null);
    try {
      const { data } = await api.post('/claims/simulate', { triggerType: 'rainfall' });
      setSimResult(data);
      await loadData();
      refreshUser();
    } catch (err) {
      setSimResult({ success: false, message: err.response?.data?.message || 'Simulation failed' });
    } finally {
      setSimLoading(false);
    }
  };

  // Build earnings chart data from claims
  const chartData = (() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i));
      return { day: d.toLocaleDateString('en-IN', { weekday: 'short' }), payout: 0, date: d.toDateString() };
    });
    claims.filter(c => c.status === 'approved').forEach(c => {
      const cd = new Date(c.claimedAt).toDateString();
      const slot = days.find(d => d.date === cd);
      if (slot) slot.payout += c.payoutAmount;
    });
    return days;
  })();

  const totalPayout = claims.filter(c => c.status === 'approved').reduce((s, c) => s + c.payoutAmount, 0);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">
            Welcome, {user.name.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-400 mt-1">Your income is protected this week</p>
        </div>
        <button onClick={loadData} className="btn-secondary flex items-center gap-2 text-sm py-2 px-4">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Simulate Rain Banner */}
      <div className="card-glow border-brand-500/30 bg-gradient-to-r from-dark-800 to-dark-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-500/5 to-transparent pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-500/20 border border-brand-500/30 rounded-xl flex items-center justify-center">
              <CloudRain size={20} className="text-brand-400" />
            </div>
            <div>
              <p className="font-display font-semibold text-white">🌧 Simulate Rain Event</p>
              <p className="text-sm text-gray-400">Trigger an instant parametric payout demo</p>
            </div>
          </div>
          <button
            onClick={handleSimulateRain}
            disabled={simLoading || !policy}
            className="btn-primary flex items-center gap-2 whitespace-nowrap"
          >
            {simLoading ? <><RefreshCw size={16} className="animate-spin" /> Processing...</> : <><Zap size={16} /> Simulate Rain</>}
          </button>
        </div>

        {simResult && (
          <div className={`mt-4 p-4 rounded-xl border text-sm font-medium flex items-center gap-2 ${
            simResult.isFraud
              ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
              : simResult.success
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
            {simResult.isFraud ? <AlertTriangle size={16} /> : simResult.success ? <CheckCircle size={16} /> : null}
            {simResult.paymentMessage || simResult.message}
          </div>
        )}

        {!policy && (
          <div className="mt-3 text-sm text-yellow-400 flex items-center gap-2">
            <AlertTriangle size={14} />
            No active policy — <Link to="/policy" className="underline">buy one first</Link>
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: Shield, label: 'Policy Status',
            value: policy ? 'Active' : 'None',
            sub: policy ? `₹${policy.weeklyPremium}/week` : 'Buy a policy',
            color: policy ? 'text-emerald-400' : 'text-gray-400',
            iconBg: 'bg-emerald-500/15 border-emerald-500/20 text-emerald-400'
          },
          {
            icon: TrendingUp, label: 'Earnings Protected',
            value: `₹${totalPayout.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
            sub: 'This policy period',
            color: 'text-brand-400',
            iconBg: 'bg-brand-500/15 border-brand-500/20 text-brand-400'
          },
          {
            icon: CheckCircle, label: 'Claims Approved',
            value: claims.filter(c => c.status === 'approved').length,
            sub: `${claims.length} total claims`,
            color: 'text-blue-400',
            iconBg: 'bg-blue-500/15 border-blue-500/20 text-blue-400'
          },
          {
            icon: Clock, label: 'Avg Payout Time',
            value: '< 5 min',
            sub: 'Fully automated',
            color: 'text-purple-400',
            iconBg: 'bg-purple-500/15 border-purple-500/20 text-purple-400'
          }
        ].map(({ icon: Icon, label, value, sub, color, iconBg }) => (
          <div key={label} className="stat-card">
            <div className={`w-9 h-9 ${iconBg} border rounded-lg flex items-center justify-center`}>
              <Icon size={16} />
            </div>
            <p className={`font-display text-xl font-bold ${color}`}>{value}</p>
            <div>
              <p className="text-xs font-medium text-white">{label}</p>
              <p className="text-xs text-gray-500">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts + Weather row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Earnings chart */}
        <div className="card lg:col-span-2">
          <h3 className="font-display font-semibold text-white mb-4">Payout History — Last 7 Days</h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="payoutGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
              <Tooltip
                contentStyle={{ background: '#1a1a26', border: '1px solid #2e2e4a', borderRadius: 10, color: '#fff' }}
                formatter={v => [`₹${v}`, 'Payout']}
              />
              <Area type="monotone" dataKey="payout" stroke="#f97316" strokeWidth={2} fill="url(#payoutGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Weather widget */}
        <div className="card">
          <h3 className="font-display font-semibold text-white mb-4">Live Weather — {user.city}</h3>
          {weather ? (
            <div className="space-y-3">
              {[
                { icon: Thermometer, label: 'Temperature', value: `${weather.temperature}°C`,
                  status: weather.temperature > 40 ? 'danger' : weather.temperature > 35 ? 'warn' : 'ok' },
                { icon: CloudRain, label: 'Rainfall', value: `${weather.rainfall} mm/hr`,
                  status: weather.rainfall > 10 ? 'danger' : weather.rainfall > 5 ? 'warn' : 'ok' },
                { icon: Wind, label: 'AQI', value: weather.aqi,
                  status: weather.aqi > 200 ? 'danger' : weather.aqi > 150 ? 'warn' : 'ok' },
              ].map(({ icon: Icon, label, value, status }) => (
                <div key={label} className="flex items-center justify-between p-3 bg-dark-700 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Icon size={14} className="text-gray-400" />
                    <span className="text-sm text-gray-400">{label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-medium text-white">{value}</span>
                    <div className={`w-2 h-2 rounded-full ${
                      status === 'danger' ? 'bg-red-400' : status === 'warn' ? 'bg-yellow-400' : 'bg-emerald-400'
                    }`} />
                  </div>
                </div>
              ))}
              {weather.safeHours?.length > 0 && (
                <div className="mt-2 p-3 bg-emerald-500/8 border border-emerald-500/15 rounded-xl">
                  <p className="text-xs text-emerald-400 font-medium mb-1">🕐 Safe Hours Today</p>
                  <p className="text-xs text-gray-400">{weather.safeHours.slice(0, 3).join(', ')}</p>
                </div>
              )}
              <p className="text-xs text-gray-600 mt-1">Source: {weather.source}</p>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Loading weather data...</p>
          )}
        </div>
      </div>

      {/* Recent claims */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-semibold text-white">Recent Claims</h3>
          <Link to="/claims" className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        {claims.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CloudRain size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No claims yet — your coverage is active</p>
          </div>
        ) : (
          <div className="space-y-3">
            {claims.slice(0, 5).map(claim => {
              const Icon = TRIGGER_ICONS[claim.triggerType] || Zap;
              const color = TRIGGER_COLORS[claim.triggerType] || 'text-brand-400';
              return (
                <div key={claim._id} className="flex items-center justify-between p-4 bg-dark-700 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-dark-600 rounded-lg flex items-center justify-center">
                      <Icon size={16} className={color} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white capitalize">
                        {claim.triggerType.replace('_', ' ')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(claim.claimedAt).toLocaleDateString('en-IN')} · {claim.hoursLost}h lost
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono font-semibold text-emerald-400">
                      +₹{claim.payoutAmount.toFixed(0)}
                    </p>
                    <span className={claim.status === 'approved' ? 'badge-green' : claim.status === 'flagged' ? 'badge-yellow' : 'badge-red'}>
                      {claim.status}
                    </span>
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
