import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../api/services';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { User, Mail, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const CandidateSettingsPage = () => {
  const { user, updateUser } = useAuth();

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg('');

    try {
      const res = await userService.updateProfile(firstName, lastName);
      if (res?.success && res.data) {
        updateUser({ firstName, lastName, fullName: `${firstName} ${lastName}` });
        setSuccessMsg('Account preferences updated successfully');
      }
    } catch (err) {
      alert('Failed to update account preferences');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">Account Settings</h1>
        <p className="text-xs text-text-muted">Manage your personal identification details and account security</p>
      </div>

      {successMsg && (
        <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-surface p-6 rounded-xl border border-border shadow-card space-y-4">
        <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider border-b border-border pb-2">
          Personal Information
        </h2>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="First Name"
            icon={User}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <Input
            label="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>

        <Input
          label="Registered Email (Read-Only)"
          type="email"
          icon={Mail}
          value={user?.email || ''}
          disabled
          helperText="Email is permanently bound to your candidate identity."
        />

        <div className="pt-2 border-t border-border flex justify-end">
          <Button type="submit" isLoading={isSaving} size="sm">
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};
