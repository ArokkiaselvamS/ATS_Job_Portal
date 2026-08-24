import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { useAdminBranding } from '../../hooks/useAdminBranding';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import aescionSymbol from '../../assets/branding/aescion-symbol.png';
import aescionWordmark from '../../assets/branding/aescion-wordmark.png';

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
    if (!email || !password) { setError('Email and password are required'); return; }

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
    <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center px-4">
      <div className="w-full max-w-[420px]">
        <div className="flex flex-col items-center justify-center mb-8 text-center">
          <div className="flex items-center justify-center gap-3.5 mb-3">
            <img src={aescionSymbol} alt="AESCION Brand Mark" className="h-12 w-auto object-contain drop-shadow-sm" />
            <img src={aescionWordmark} alt="AESCION" className="h-7 w-auto object-contain" />
          </div>
          <span className="inline-block px-3 py-0.5 rounded-full bg-[#2B26D9]/10 text-[#2B26D9] text-xs font-bold tracking-widest uppercase">
            Super Admin Portal
          </span>
        </div>

        <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm p-8">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-[#0f172a]">Sign in to Admin Portal</h2>
            <p className="text-sm text-[#64748b] mt-1">Authorized administrators only</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#334155] mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="admin@aescion.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#e2e8f0] text-sm text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:border-[#5b4fe8] focus:ring-2 focus:ring-[#5b4fe8]/10 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#334155] mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
                <input
                  type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-[#e2e8f0] text-sm text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:border-[#5b4fe8] focus:ring-2 focus:ring-[#5b4fe8]/10 transition-colors"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#64748b]">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gradient-to-r from-[#2B26D9] to-[#5b4fe8] text-white text-sm font-semibold hover:shadow-lg hover:shadow-[#5b4fe8]/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#94a3b8] mt-6">
          Secure admin access. All actions are logged.
        </p>
      </div>
    </div>
  );
}
