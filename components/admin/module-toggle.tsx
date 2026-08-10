'use client';

import { useState, useEffect } from 'react';
import { Power, Globe, Shield, Loader2, Check, X } from 'lucide-react';

interface ModuleToggleProps {
  moduleKey: string;
  moduleName: string;
}

interface ModuleState {
  adminEnabled: boolean;
  publicEnabled: boolean;
}

export function ModuleToggle({ moduleKey, moduleName }: ModuleToggleProps) {
  const [state, setState] = useState<ModuleState>({
    adminEnabled: true,
    publicEnabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchModuleState();
  }, [moduleKey]);

  const fetchModuleState = async () => {
    try {
      const response = await fetch('/api/modules');
      if (!response.ok) throw new Error('Failed to fetch module state');
      const data = await response.json();
      const moduleState = data.modules[moduleKey];
      if (moduleState) {
        setState({
          adminEnabled: moduleState.adminEnabled ?? true,
          publicEnabled: moduleState.publicEnabled ?? true,
        });
      }
    } catch (err) {
      console.error('Error fetching module state:', err);
      setError('Failed to load module state');
    } finally {
      setLoading(false);
    }
  };

  const updateModuleState = async (field: 'adminEnabled' | 'publicEnabled', value: boolean) => {
    setSaving(field);
    setError(null);
    setSuccess(null);

    const newAdminEnabled = field === 'adminEnabled' ? value : state.adminEnabled;
    const newPublicEnabled = field === 'publicEnabled' ? value : state.publicEnabled;
    const newStatus = newAdminEnabled ? 'enabled' : 'disabled';

    try {
      const response = await fetch('/api/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleKey,
          updates: { 
            adminEnabled: newAdminEnabled,
            publicEnabled: newPublicEnabled,
            status: newStatus
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update module state');
      }

      const data = await response.json();
      setState({
        adminEnabled: newAdminEnabled,
        publicEnabled: newPublicEnabled
      });
      setSuccess(`${field === 'adminEnabled' ? 'Admin' : 'Public'} access updated successfully`);
      
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      console.error('Error updating module state:', err);
      setError(err instanceof Error ? err.message : 'Failed to update module state');
      // Revert on error
      fetchModuleState();
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-white/[0.02] border border-white/10 rounded-xl">
        <Loader2 className="w-4 h-4 text-[#FF6A00] animate-spin" />
        <span className="text-xs text-gray-400">Loading module state...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 px-4 py-3 bg-white/[0.02] border border-white/10 rounded-xl">
      <div className="flex items-center gap-2">
        <Power className="w-4 h-4 text-[#FF6A00]" />
        <span className="text-xs font-semibold text-white">Module Status</span>
      </div>

      {/* Admin Toggle */}
      <div className="flex items-center gap-2">
        <Shield className="w-4 h-4 text-gray-400" />
        <span className="text-xs text-gray-400">Admin</span>
        <button
          onClick={() => updateModuleState('adminEnabled', !state.adminEnabled)}
          disabled={saving === 'adminEnabled'}
          className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed ${
            state.adminEnabled ? 'bg-[#FF6A00]' : 'bg-zinc-700'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              state.adminEnabled ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Public Toggle */}
      <div className="flex items-center gap-2">
        <Globe className="w-4 h-4 text-gray-400" />
        <span className="text-xs text-gray-400">Public</span>
        <button
          onClick={() => updateModuleState('publicEnabled', !state.publicEnabled)}
          disabled={saving === 'publicEnabled'}
          className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed ${
            state.publicEnabled ? 'bg-[#FF6A00]' : 'bg-zinc-700'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              state.publicEnabled ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Feedback */}
      {saving && (
        <Loader2 className="w-4 h-4 text-[#FF6A00] animate-spin" />
      )}
      {success && (
        <div className="flex items-center gap-1 text-green-400">
          <Check className="w-4 h-4" />
          <span className="text-xs">{success}</span>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-1 text-red-400">
          <X className="w-4 h-4" />
          <span className="text-xs">{error}</span>
        </div>
      )}
    </div>
  );
}
