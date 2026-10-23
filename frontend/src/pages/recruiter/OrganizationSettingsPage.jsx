import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { organizationService } from '../../api/services';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { Building2, Globe, Image, CheckCircle2, AlertCircle } from 'lucide-react';

export const OrganizationSettingsPage = () => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['currentOrgSettings'],
    queryFn: () => organizationService.getCurrentOrganization(),
  });

  const org = data?.data;

  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (org) {
      setName(org.name || '');
      setDomain(org.domain || '');
      setLogoUrl(org.logoUrl || '');
    }
  }, [org]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      await organizationService.updateCurrentOrganization({ name, domain, logoUrl });
      setMessage({ type: 'success', text: 'Organization settings updated successfully' });
      refetch();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update organization' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingSkeleton count={3} />;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">Organization Profile</h1>
        <p className="text-xs text-text-muted">Manage your company branding, tenant domain, and public identity</p>
      </div>

      {message && (
        <div
          className={`p-3 rounded-md text-xs flex items-center gap-2 border ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-surface p-6 sm:p-8 rounded-xl border border-border shadow-card space-y-5">
        <h2 className="text-xs font-bold text-text-primary uppercase tracking-wider border-b border-border pb-2">
          Company Identity
        </h2>

        <Input
          label="Company Name"
          icon={Building2}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Input
          label="Tenant Identifier / Slug (Read-Only)"
          value={org?.slug || ''}
          disabled
          helperText="Unique multi-tenant slug used for isolation and public job routing."
        />

        <Input
          label="Corporate Domain"
          placeholder="e.g. acme.io"
          icon={Globe}
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
        />

        <Input
          label="Logo Image URL"
          placeholder="https://company.com/logo.png"
          icon={Image}
          value={logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)}
        />

        <div className="pt-2 border-t border-border flex justify-end">
          <Button type="submit" isLoading={isSaving} size="sm">
            Save Company Settings
          </Button>
        </div>
      </form>
    </div>
  );
};
