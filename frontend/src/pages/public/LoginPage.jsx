import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Lock, Mail, AlertCircle, Sparkles } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const from = location.state?.from?.pathname || null;

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const user = await login(email, password);
      redirectUser(user);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const redirectUser = (user) => {
    if (from) {
      navigate(from, { replace: true });
      return;
    }
    if (user.role === 'RECRUITER') {
      navigate('/recruiter/dashboard', { replace: true });
    } else if (user.role === 'PLATFORM_ADMIN') {
      navigate('/admin/overview', { replace: true });
    } else {
      navigate('/candidate/dashboard', { replace: true });
    }
  };

  const handleDemoLogin = async (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
    setError('');
    setIsLoading(true);

    try {
      const user = await login(demoEmail, 'password123');
      redirectUser(user);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-10 bg-surface border border-border rounded-xl shadow-card p-6 sm:p-8 space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-xl font-bold text-text-primary tracking-tight">Sign In to HireFlow AI</h1>
        <p className="text-xs text-text-muted">Enter your credentials to access your recruitment portal</p>
      </div>

      {error && (
        <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* One-click demo credentials */}
      <div className="bg-surface-subtle border border-border rounded-lg p-3 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-700">
          <Sparkles className="w-3.5 h-3.5 text-brand-600" />
          <span>Quick Demo Access (Preloaded Data)</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          <button
            type="button"
            onClick={() => handleDemoLogin('recruiter@acme.io')}
            className="text-[11px] font-medium py-1.5 px-2 bg-surface hover:bg-brand-50 border border-border rounded text-text-secondary hover:text-brand-700 transition-colors"
          >
            Recruiter (Acme)
          </button>
          <button
            type="button"
            onClick={() => handleDemoLogin('candidate@hireflow.io')}
            className="text-[11px] font-medium py-1.5 px-2 bg-surface hover:bg-brand-50 border border-border rounded text-text-secondary hover:text-brand-700 transition-colors"
          >
            Candidate (Alex)
          </button>
          <button
            type="button"
            onClick={() => handleDemoLogin('admin@hireflow.io')}
            className="text-[11px] font-medium py-1.5 px-2 bg-surface hover:bg-brand-50 border border-border rounded text-text-secondary hover:text-brand-700 transition-colors"
          >
            Platform Admin
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          placeholder="name@company.com"
          icon={Mail}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Password
            </span>
            <Link to="/forgot-password" className="text-xs text-brand-600 hover:text-brand-700">
              Forgot password?
            </Link>
          </div>
          <Input
            type="password"
            placeholder="••••••••"
            icon={Lock}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <Button type="submit" isLoading={isLoading} className="w-full">
          Sign In
        </Button>
      </form>

      <div className="text-center text-xs text-text-muted">
        Don't have an account?{' '}
        <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">
          Create one now
        </Link>
      </div>
    </div>
  );
};
