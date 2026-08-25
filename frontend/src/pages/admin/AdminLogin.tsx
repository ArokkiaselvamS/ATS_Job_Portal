import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { useAdminBranding } from '../../hooks/useAdminBranding';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import aescionSymbol from '../../assets/branding/aescion-symbol.png';

export default function AdminLogin() {
  useAdminBranding();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAdminAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate('/admin/dashboard');
    } else {
      setError(result.message || 'Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col items-center justify-center p-4 sm:p-6">
      {/* Brand Header */}
      <div className="flex flex-col items-center justify-center mb-6 text-center">
        <div className="flex items-center justify-center gap-3.5 mb-3 bg-white px-5 py-3 rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white p-1">
            <img
              src={aescionSymbol}
              alt="AESCION Symbol"
              className="h-8 w-auto object-contain"
              style={{ height: '32px', width: 'auto' }}
            />
          </div>
          <span
            className="text-2xl font-black tracking-tight select-none leading-none flex items-center"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            <span className="text-[#F96302]">AE</span>
            <span className="text-[#2B26D9]">SCI</span>
            <span className="text-[#363636]">ON</span>
          </span>
        </div>

        {/* Super Admin Role Badge */}
        <div className="inline-flex items-center rounded-full bg-[#e0e7ff] px-3.5 py-1 text-[11px] font-bold text-[#4338ca] uppercase tracking-wider">
          SUPER ADMIN PORTAL
        </div>
      </div>

      {/* Centered Login Card */}
      <div className="w-full max-w-[420px] bg-white rounded-2xl border border-slate-200/90 shadow-[0_4px_25px_rgba(0,0,0,0.03)] p-8 sm:p-9">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Sign in to Admin Portal</h1>
          <p className="text-sm font-medium text-slate-400 mt-1">Authorized administrators only</p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200/80 text-red-700 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@aescion.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/10 transition-all font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/10 transition-all font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 mt-6 py-3 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 active:bg-indigo-800 shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Sign In <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Security Message Below Card */}
      <p className="text-center text-xs font-medium text-slate-400 mt-6">
        Secure admin access. All actions are logged.
      </p>
    </div>
  );
}

