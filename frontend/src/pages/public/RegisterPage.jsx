import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Mail, Lock, User, Building2, AlertCircle } from 'lucide-react';

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('CANDIDATE');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (role === 'RECRUITER' && !organizationName.trim()) {
      setError('Organization name is required for recruiter registration');
      return;
    }

    setIsLoading(true);

    try {
      const user = await register({
        firstName,
        lastName,
        email,
        password,
        role,
        organizationName: role === 'RECRUITER' ? organizationName : undefined,
      });

      if (user.role === 'RECRUITER') {
        navigate('/recruiter/dashboard');
      } else {
        navigate('/candidate/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-10 bg-surface border border-border rounded-xl shadow-card p-6 sm:p-8 space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-xl font-bold text-text-primary tracking-tight">Create your Account</h1>
        <p className="text-xs text-text-muted">Start streamlining your hiring or career journey with HireFlow AI</p>
      </div>

      {error && (
        <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Role Selection Switch */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-surface-subtle border border-border rounded-lg">
        <button
          type="button"
          onClick={() => setRole('CANDIDATE')}
          className={`py-2 text-xs font-semibold rounded-md transition-colors ${
            role === 'CANDIDATE'
              ? 'bg-surface text-brand-700 shadow-xs'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          I'm a Candidate
        </button>
        <button
          type="button"
          onClick={() => setRole('RECRUITER')}
          className={`py-2 text-xs font-semibold rounded-md transition-colors ${
            role === 'RECRUITER'
              ? 'bg-surface text-brand-700 shadow-xs'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          I'm a Recruiter
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="First Name"
            placeholder="Jane"
            icon={User}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <Input
            label="Last Name"
            placeholder="Doe"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>

        <Input
          label="Work or Personal Email"
          type="email"
          placeholder="name@example.com"
          icon={Mail}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {role === 'RECRUITER' && (
          <Input
            label="Organization / Company Name"
            placeholder="Acme Technologies"
            icon={Building2}
            value={organizationName}
            onChange={(e) => setOrganizationName(e.target.value)}
            required
          />
        )}

        <Input
          label="Password (min 8 chars)"
          type="password"
          placeholder="••••••••"
          icon={Lock}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Button type="submit" isLoading={isLoading} className="w-full">
          Create Account
        </Button>
      </form>

      <div className="text-center text-xs text-text-muted">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
          Sign In
        </Link>
      </div>
    </div>
  );
};
