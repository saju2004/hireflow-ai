import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const NotFoundPage = () => {
  return (
    <div className="max-w-md mx-auto my-16 text-center space-y-4 p-8 bg-surface border border-border rounded-xl shadow-card">
      <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
        <FileQuestion className="w-6 h-6" />
      </div>
      <h1 className="text-xl font-bold text-text-primary">Page Not Found (404)</h1>
      <p className="text-xs text-text-muted">
        The requested page does not exist or has been relocated.
      </p>
      <div className="pt-2">
        <Link to="/">
          <Button variant="secondary" size="sm" icon={ArrowLeft}>
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};
