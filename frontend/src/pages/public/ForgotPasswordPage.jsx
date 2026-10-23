import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-md mx-auto my-10 bg-surface border border-border rounded-xl shadow-card p-6 sm:p-8 space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-xl font-bold text-text-primary tracking-tight">Reset Password</h1>
        <p className="text-xs text-text-muted">Enter your account email to receive a password recovery link</p>
      </div>

      {submitted ? (
        <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <p className="text-xs text-emerald-800">
            If an account exists for <strong>{email}</strong>, a password reset link has been dispatched.
          </p>
          <Link to="/login" className="inline-block text-xs font-semibold text-emerald-700 hover:underline">
            Return to Sign In
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="name@example.com"
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Button type="submit" className="w-full">
            Send Recovery Link
          </Button>

          <div className="text-center pt-2">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Sign In
            </Link>
          </div>
        </form>
      )}
    </div>
  );
};
