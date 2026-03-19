import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Shield, Zap, RefreshCw, CheckCircle, AlertTriangle, CloudRain, Thermometer, Wind, Clock } from 'lucide-react';

export default function PolicyPage() {
  const { user } = useAuth();
  const [policy, setPolicy]           = useState(null);
  const [allPolicies, setAllPolicies] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [generating, setGenerating]   = useState(false);
  const [genResult, setGenResult]     = useState(null);
  const [error, setError]             = useState('');

  useEffect(() => { loadPolicies(); }, []);

  const loadPolicies = async () => {
    setLoading(true);
    try {
      const [activeRes, allRes] = await Promise.allSettled([
        api.get('/policies/active'),
        api.get('/policies/my')
      ]);
      if (activeRes.status === 'fulfilled') setPolicy(activeRes.value.data.policy);
      if (allRes.status === 'fulfilled') setAllPolicies(allRes.value.data.policies);
    } finally { setLoading(false); }
  };

  const generatePolicy = async () => {
    setGenerating(true); setError(''); setGenResult(null);
    try {
      const { data } = await api.post('/policies/generate');
      setGenResult(data);
      await loadPolicies();
    } catch (err) {
      setError(err.response?.data?.message || 'Policy generation failed');
    } finally { setGenerating(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">My Policy</h1>
        <p className="text-gray-400 mt-1">Manage your weekly income protection</p>
      </div>

      {/* Active Policy Card */}
      {policy ? (
        <div className="card-glow border-brand-500/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="relative">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.4)]">
                    <Shield size={18} className="text-white" />
                  </div>
                  <span className="font-display text-xl font-bold text-white">Active Policy</span>
                  <span className="badge-green">LIVE</span>
                </div>
                <p className="text-gray-400 text-sm">{policy.city} · {user.platform}</p>
              </div>
              <div className="text-right">
                <p className="font-display text-3xl font-bold gradient-text">₹{policy.weeklyPremium}</p>
                <p className="text-xs text-gray-500">/ week premium</p>
              </div>
            </div>

            {/* Premium breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                { label: 'Base Premium', value: `₹${policy.basePremium}` },
                { label: 'Rain Risk', value: `+₹${policy.rainRisk}`, color: policy.rainRisk > 0 ? 'text-blue-400' : 'text-gray-500' },
                { label: 'Heat Risk', value: `+₹${policy.heatRisk}`, color: policy.heatRisk > 0 ? 'text-red-400' : 'text-gray-500' },
                { label: 'AQI Risk', value: `+₹${policy.aqiRisk}`, color: policy.aqiRisk > 0 ? 'text-yellow-400' : 'text-gray-500' },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-dark-700 rounded-xl p-3 text-center">
                  <p className={`font-mono font-bold text-lg ${color || 'text-white'}`}>{value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Coverage + Risk */}
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-dark-700 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Weekly Coverage Amount</p>
                <p className="font-display text-2xl font-bold text-emerald-400">
                  ₹{policy.coverageAmount.toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">7 × ₹{(policy.coverageAmount / 7).toFixed(0)}/day</p>
              </div>
              <div className="bg-dark-700 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">AI Risk Score</p>
                <div className="flex items-end gap-2">
                  <p className="font-display text-2xl font-bold text-white">
                    {(policy.riskScore * 100).toFixed(0)}
                    <span className="text-base text-gray-500">/100</span>
                  </p>
                  <span className={`badge mb-1 ${
                    policy.riskScore > 0.7 ? 'badge-red' : policy.riskScore > 0.45 ? 'badge-orange' : 'badge-green'
                  }`}>
                    {policy.riskScore > 0.7 ? 'High' : policy.riskScore > 0.45 ? 'Medium' : 'Low'} Risk
                  </span>
                </div>
                <div className="mt-2 h-2 bg-dark-600 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${policy.riskScore > 0.7 ? 'bg-red-400' : policy.riskScore > 0.45 ? 'bg-brand-400' : 'bg-emerald-400'}`}
                    style={{ width: `${policy.riskScore * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="flex items-center justify-between text-sm p-3 bg-dark-700 rounded-xl mb-5">
              <div className="flex items-center gap-2 text-gray-400">
                <Clock size={14} />
                <span>Valid: {new Date(policy.startDate).toLocaleDateString('en-IN')} — {new Date(policy.endDate).toLocaleDateString('en-IN')}</span>
              </div>
              <span className="badge-green">₹{policy.weeklyPremium} paid (Simulated)</span>
            </div>

            {/* Safe hours */}
            {policy.safeHours?.length > 0 && (
              <div className="p-4 bg-emerald-500/8 border border-emerald-500/15 rounded-xl mb-4">
                <p className="text-sm font-medium text-emerald-400 mb-2 flex items-center gap-2">
                  <Clock size={14} /> AI-Suggested Safe Working Hours
                </p>
                <div className="flex flex-wrap gap-2">
                  {policy.safeHours.map(h => (
                    <span key={h} className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs text-emerald-300 font-mono">{h}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Weather warnings */}
            {policy.weatherWarnings?.length > 0 && (
              <div className="space-y-2">
                {policy.weatherWarnings.map((w, i) => (
                  <div key={i} className="flex items-center gap-2 p-3 bg-yellow-500/8 border border-yellow-500/15 rounded-xl text-sm text-yellow-300">
                    <AlertTriangle size={14} /> {w}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="card border-dashed border-2 border-dark-500 text-center py-12">
          <Shield size={40} className="mx-auto mb-3 text-gray-600" />
          <p className="font-display text-lg font-semibold text-white mb-2">No Active Policy</p>
          <p className="text-gray-400 text-sm mb-6">Generate your AI-priced weekly policy to get income protection</p>
        </div>
      )}

      {/* Generate button */}
      <div className="card">
        <h3 className="font-display font-semibold text-white mb-2">
          {policy ? 'Renew Policy' : 'Generate New Policy'}
        </h3>
        <p className="text-sm text-gray-400 mb-4">
          Our AI analyses live weather data for <strong className="text-white">{user.city}</strong> and calculates your personalised weekly premium instantly.
        </p>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl mb-4 text-red-400 text-sm">
            <AlertTriangle size={14} /> {error}
          </div>
        )}

        {genResult && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mb-4 text-emerald-400 text-sm flex items-center gap-2">
            <CheckCircle size={16} />
            {genResult.paymentSimulated}
          </div>
        )}

        <button onClick={generatePolicy} disabled={generating} className="btn-primary flex items-center gap-2">
          {generating
            ? <><RefreshCw size={16} className="animate-spin" /> Analysing weather & risk...</>
            : <><Zap size={16} /> {policy ? 'Renew Weekly Policy' : 'Generate Policy (AI-Priced)'}</>
          }
        </button>
      </div>

      {/* Triggers info */}
      <div className="card">
        <h3 className="font-display font-semibold text-white mb-4">Parametric Trigger Thresholds</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: CloudRain, label: 'Rainfall', threshold: '> 10 mm/hr', payout: '4 hrs income', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
            { icon: Thermometer, label: 'Temperature', threshold: '> 40°C', payout: '3 hrs income', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
            { icon: Wind, label: 'AQI Index', threshold: '> 200', payout: '2 hrs income', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
          ].map(({ icon: Icon, label, threshold, payout, color, bg }) => (
            <div key={label} className={`p-4 rounded-xl border ${bg}`}>
              <Icon size={20} className={`${color} mb-3`} />
              <p className="font-semibold text-white text-sm">{label}</p>
              <p className={`font-mono text-xs font-bold ${color} mt-1`}>{threshold}</p>
              <p className="text-xs text-gray-400 mt-2">Auto-payout: <span className="text-white">{payout}</span></p>
            </div>
          ))}
        </div>
      </div>

      {/* Policy history */}
      {allPolicies.length > 1 && (
        <div className="card">
          <h3 className="font-display font-semibold text-white mb-4">Policy History</h3>
          <div className="space-y-2">
            {allPolicies.map(p => (
              <div key={p._id} className="flex items-center justify-between p-3 bg-dark-700 rounded-xl text-sm">
                <div>
                  <span className="text-white font-medium">₹{p.weeklyPremium}/week</span>
                  <span className="text-gray-500 ml-2">· Risk: {(p.riskScore * 100).toFixed(0)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-500 text-xs">{new Date(p.startDate).toLocaleDateString('en-IN')}</span>
                  <span className={p.status === 'active' ? 'badge-green' : 'badge-red'}>{p.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
