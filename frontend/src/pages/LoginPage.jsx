import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const data = await login(form.email, form.password);
      navigate(data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async (email, password) => {
    setForm({ email, password });
    setLoading(true); setError('');
    try {
      const data = await login(email, password);
      navigate(data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-dark-900">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl" />
      </div>
      <div className="relative w-full max-w-md animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.4)]">
              <Shield size={20} className="text-white" />
            </div>
            <span className="font-display font-bold text-white text-2xl">SurakshaPay</span>
          </Link>
          <h1 className="font-display text-2xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-gray-400 text-sm">Sign in to your insurance dashboard</p>
        </div>

        <div className="card">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl mb-5 text-red-400 text-sm">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <input name="email" type="email" value={form.email} onChange={handle}
                className="input-field" placeholder="you@example.com" required />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input name="password" type={showPass ? 'text' : 'password'}
                  value={form.password} onChange={handle}
                  className="input-field pr-10" placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-dark-600">
            <p className="text-xs text-gray-500 text-center mb-3">Quick demo access</p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => demoLogin('raju@demo.com', 'Demo@123')}
                className="btn-secondary text-xs py-2 px-3">
                👷 Worker Demo
              </button>
              <button onClick={() => demoLogin('admin@surakshapay.in', 'Admin@123')}
                className="btn-secondary text-xs py-2 px-3">
                🛡 Admin Demo
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-5">
          New to SurakshaPay?{' '}
          <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
