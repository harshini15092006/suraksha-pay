import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, AlertCircle, ChevronRight } from 'lucide-react';

const CITIES = ['Mumbai','Delhi','Bangalore','Hyderabad','Chennai','Kolkata','Pune','Ahmedabad','Vijayawada','Jaipur','Surat','Lucknow'];
const PLATFORMS = ['Zomato','Swiggy','Blinkit','Zepto','Other'];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
    city: '', platform: '', avgDailyIncome: '', avgDailyHours: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const next = (e) => { e.preventDefault(); setError(''); setStep(2); };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-dark-900">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl" />
      </div>
      <div className="relative w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.4)]">
              <Shield size={20} className="text-white" />
            </div>
            <span className="font-display font-bold text-white text-2xl">SurakshaPay</span>
          </Link>
          <h1 className="font-display text-2xl font-bold text-white mb-2">Create your account</h1>
          <p className="text-gray-400 text-sm">Get income protection in under 2 minutes</p>
          {/* Steps indicator */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {[1, 2].map(s => (
              <div key={s} className={`h-1.5 rounded-full transition-all duration-300 ${
                s <= step ? 'bg-brand-500 w-8' : 'bg-dark-500 w-5'
              }`} />
            ))}
          </div>
        </div>

        <div className="card">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl mb-5 text-red-400 text-sm">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={next} className="space-y-4">
              <p className="text-xs text-gray-500 font-mono uppercase tracking-wider mb-1">Step 1 — Personal Info</p>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="label">Full Name</label>
                  <input name="name" value={form.name} onChange={handle}
                    className="input-field" placeholder="Raju Kumar" required />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input name="email" type="email" value={form.email} onChange={handle}
                    className="input-field" placeholder="raju@example.com" required />
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input name="phone" type="tel" value={form.phone} onChange={handle}
                    className="input-field" placeholder="9876543210" required />
                </div>
                <div>
                  <label className="label">Password</label>
                  <input name="password" type="password" value={form.password} onChange={handle}
                    className="input-field" placeholder="Min 6 characters" minLength={6} required />
                </div>
              </div>
              <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
                Next <ChevronRight size={16} />
              </button>
            </form>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <p className="text-xs text-gray-500 font-mono uppercase tracking-wider mb-1">Step 2 — Work Details</p>
              <div>
                <label className="label">City</label>
                <select name="city" value={form.city} onChange={handle} className="input-field" required>
                  <option value="">Select your city</option>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Delivery Platform</label>
                <select name="platform" value={form.platform} onChange={handle} className="input-field" required>
                  <option value="">Select platform</option>
                  {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Avg Daily Income (₹)</label>
                  <input name="avgDailyIncome" type="number" value={form.avgDailyIncome} onChange={handle}
                    className="input-field" placeholder="600" min="100" max="5000" required />
                </div>
                <div>
                  <label className="label">Avg Daily Hours</label>
                  <input name="avgDailyHours" type="number" value={form.avgDailyHours} onChange={handle}
                    className="input-field" placeholder="8" min="1" max="16" required />
                </div>
              </div>
              <div className="p-3 bg-brand-500/8 border border-brand-500/15 rounded-xl text-xs text-brand-300">
                💡 Your premium will be calculated based on city weather risk and your income profile
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1">
                  Back
                </button>
                <button type="submit" disabled={loading} className="btn-primary flex-1">
                  {loading ? 'Creating...' : 'Get Protected'}
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
