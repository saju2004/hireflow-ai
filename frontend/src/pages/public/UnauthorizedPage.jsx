import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const UnauthorizedPage = () => {
  return (
    <div className="max-w-md mx-auto my-16 text-center space-y-4 p-8 bg-surface border border-border rounded-xl shadow-card">
      <div className="w-12 h-12 rounded-full bg-rose-100 text-status-danger flex items-center justify-center mx-auto">
        <ShieldAlert className="w-6 h-6" />
      </div>
      <h1 className="text-xl font-bold text-text-primary">Unauthorized Access</h1>
      <p className="text-xs text-text-muted">
        Your current role or organization membership does not have permission to access this resource.
      </p>
      <div className="pt-2">
        <Link to="/">
          <Button variant="secondary" size="sm" icon={ArrowLeft}>
            Return to Safety
          </Button>
        </Link>
      </div>
    </div>
  );
};
