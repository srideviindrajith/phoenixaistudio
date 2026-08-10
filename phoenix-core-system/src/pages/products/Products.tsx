import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Cpu, Receipt, Database, Users, LineChart, ShieldAlert, ArrowUpRight, Loader2, Sparkles, Key } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useTenantStore } from '../../store/useTenantStore';
import { motion, AnimatePresence } from 'framer-motion';

export const Products: React.FC = () => {
  const { company } = useAuthStore();
  const { licenses } = useTenantStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [launchingProd, setLaunchingProd] = useState<string | null>(null);
  const [launchStep, setLaunchStep] = useState(0);

  const productList = [
    { 
      name: 'Billing Core', 
      desc: 'Master automated ledger invoicing, subscription cycles, tax filings, and recurring client drafts.',
      icon: Receipt,
      version: 'v2.4.1',
      code: 'PHX-BILL',
      status: company?.enabledCores.includes('Billing Core') ? 'Active' : 'Not Licensed',
      port: 5173
    },
    { 
      name: 'Automation Core', 
      desc: 'Visual cross-platform logic builder, API trigger webhook synchronization, and background scripts runner.',
      icon: Database,
      version: 'v3.1.0',
      code: 'PHX-AUTO',
      status: company?.enabledCores.includes('Automation Core') ? 'Active' : 'Not Licensed',
      port: 5174
    },
    { 
      name: 'CRM Core', 
      desc: 'Sales closing matrices pipeline, client chat integrations, and deal scoring predictive insights.',
      icon: Users,
      version: 'v1.8.9',
      code: 'PHX-CRM',
      status: company?.enabledCores.includes('CRM Core') ? 'Active' : 'Not Licensed',
      port: 5175
    },
    { 
      name: 'Client Portal', 
      desc: 'Interactive white-label customer support desks, shared invoice ledgers, and document uploads repository.',
      icon: LineChart,
      version: 'v2.0.0',
      code: 'PHX-PORT',
      status: company?.enabledCores.includes('Client Portal') ? 'Active' : 'Not Licensed',
      port: 5176
    },
    { 
      name: 'Admin Intelligence', 
      desc: 'Anomaly monitoring reports scanner, AI database optimizations analyzer, and security compliance charts.',
      icon: ShieldAlert,
      version: 'v1.0.2',
      code: 'PHX-INT',
      status: company?.enabledCores.includes('Admin Intelligence') ? 'Active' : 'Not Licensed',
      port: 5177
    },
  ];

  // Auto trigger launch from search parameters (e.g. from welcome card)
  useEffect(() => {
    const launchParam = searchParams.get('launch');
    if (launchParam) {
      setSearchParams({});
      handleLaunch(launchParam);
    }
  }, [searchParams, setSearchParams]);

  const handleLaunch = (name: string) => {
    const prod = productList.find(p => p.name === name);
    if (!prod || prod.status !== 'Active') {
      alert('This product core is not enabled for your company subscription. Contact support to upgrade.');
      return;
    }

    setLaunchingProd(name);
    setLaunchStep(0);
  };

  useEffect(() => {
    if (launchingProd === null) return;

    const timer1 = setTimeout(() => setLaunchStep(1), 1200);
    const timer2 = setTimeout(() => setLaunchStep(2), 2400);
    const timer3 = setTimeout(() => {
      // Simulate final redirection callback
      const target = launchingProd;
      setLaunchingProd(null);
      setLaunchStep(0);
      
      const urls: Record<string, string> = {
        'Billing Core': 'https://billing-core.phoenixai.studio',
        'Automation Core': 'https://automation-core.phoenixai.studio',
        'CRM Core': 'https://crm-core.phoenixai.studio',
        'Client Portal': 'https://portal.phoenixai.studio',
        'Admin Intelligence': 'https://admin-intelligence.phoenixai.studio'
      };
      
      window.open(urls[target] || 'https://phoenixai.studio', '_blank');
    }, 3600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [launchingProd]);

  const companyLicense = licenses[0]?.key || 'PHX-CORE-SANDBOX-99X';

  return (
    <div className="space-y-8">
      {/* Launchpad banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-borderBg pb-6">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Accessible Cores</h2>
          <p className="text-xs text-darkGray mt-0.5">Secure SSO portal routing control room for every enabled module.</p>
        </div>
        <div className="px-4 py-2 rounded-xl border border-borderBg bg-cardBg flex items-center gap-2">
          <Key className="w-4 h-4 text-primaryOrange" />
          <span className="text-[10px] font-mono text-white">SSO MASTER SIGNATURE: {companyLicense.slice(0, 16)}...</span>
        </div>
      </div>

      {/* Product list grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {productList.map((prod) => (
          <div 
            key={prod.name}
            className={`glass-card p-6 flex flex-col justify-between h-64 relative overflow-hidden group ${
              prod.status !== 'Active' ? 'opacity-60 border-dashed hover:border-borderBg hover:transform-none' : ''
            }`}
          >
            {/* Subtle glow blur for active cores */}
            {prod.status === 'Active' && (
              <div className="absolute top-0 right-0 w-24 h-24 bg-primaryOrange/5 rounded-full blur-2xl pointer-events-none group-hover:bg-primaryOrange/10 transition-colors" />
            )}

            <div>
              <div className="flex justify-between items-start">
                <div className="w-10 h-10 rounded-xl bg-background border border-borderBg flex items-center justify-center text-primaryOrange">
                  <prod.icon className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono text-mutedGray uppercase">{prod.version}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                    prod.status === 'Active' 
                      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                      : 'bg-mutedGray/10 border border-mutedGray/20 text-darkGray'
                  }`}>
                    {prod.status}
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-base font-bold text-white group-hover:text-primaryOrange transition-colors">{prod.name}</h4>
                <p className="text-xs text-darkGray leading-relaxed mt-2">{prod.desc}</p>
                {prod.status === 'Active' && (
                  <p className="text-[10px] font-mono text-mutedGray mt-2 bg-[#121212] px-2 py-1 rounded border border-borderBg">
                    Lic: {companyLicense.slice(0, 16)}-{prod.code}-ACTIVE
                  </p>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-borderBg flex items-center justify-between mt-6">
              <span className="text-[10px] font-mono text-mutedGray">{prod.code}</span>
              {prod.status === 'Active' ? (
                <button
                  onClick={() => handleLaunch(prod.name)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white orange-gradient-bg hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_4px_15px_rgba(249,115,22,0.2)]"
                >
                  <span>Launch Core</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <span className="text-[10px] font-semibold text-darkGray uppercase tracking-wider bg-background px-2.5 py-1 rounded-lg border border-borderBg">
                  Locked
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Full screen SSO transition overlay modal */}
      <AnimatePresence>
        {launchingProd !== null && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex flex-col items-center justify-center text-center p-4"
          >
            <div className="max-w-md space-y-6 relative">
              {/* Spinning orange glowing elements */}
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-primaryOrange/20" />
                <div className="absolute inset-0 rounded-full border-4 border-t-primaryOrange animate-spin" />
                <div className="absolute inset-0 w-8 h-8 rounded-full bg-primaryOrange/20 m-auto blur-md" />
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primaryOrange/10 border border-primaryOrange/20 text-[10px] font-bold text-primaryOrange uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 animate-pulse" />
                  <span>Secure SSO Vault</span>
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">Routing to {launchingProd}</h3>
                <p className="text-xs text-darkGray max-w-xs mx-auto leading-relaxed">
                  Authenticating user keys with target platform core nodes without re-prompting.
                </p>
              </div>

              {/* Progress feedback states */}
              <div className="p-4 rounded-xl border border-borderBg bg-cardBg w-80 mx-auto font-mono text-[10px] text-left space-y-2.5 shadow-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-darkGray">1. Fetching session assertion:</span>
                  {launchStep >= 0 ? (
                    <span className="text-emerald-400 font-bold uppercase">Success</span>
                  ) : (
                    <Loader2 className="w-3 h-3 text-primaryOrange animate-spin" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-darkGray">2. Signing identity certificate:</span>
                  {launchStep >= 1 ? (
                    <span className="text-emerald-400 font-bold uppercase">Done</span>
                  ) : launchStep === 0 ? (
                    <Loader2 className="w-3 h-3 text-primaryOrange animate-spin" />
                  ) : (
                    <span className="text-mutedGray">Pending</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-darkGray">3. Redirecting callback payload:</span>
                  {launchStep >= 2 ? (
                    <span className="text-emerald-400 font-bold uppercase">Routing</span>
                  ) : launchStep === 1 ? (
                    <Loader2 className="w-3 h-3 text-primaryOrange animate-spin" />
                  ) : (
                    <span className="text-mutedGray">Pending</span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
