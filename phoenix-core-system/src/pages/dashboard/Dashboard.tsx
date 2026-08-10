import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileCheck, 
  Key, 
  Users, 
  HardDrive,
  Cpu, 
  ArrowUpRight,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useTenantStore } from '../../store/useTenantStore';
import { motion } from 'framer-motion';

export const Dashboard: React.FC = () => {
  const { user, company } = useAuthStore();
  const { companyUsers, subscriptions, licenses } = useTenantStore();
  const navigate = useNavigate();

  const activeSubscription = subscriptions[0] || { plan: 'Trial', status: 'ACTIVE' };
  const activeLicense = licenses[0] || { key: 'PHX-TRIAL-KEY-SANDBOX-00', status: 'ACTIVE' };

  // Premium stat metrics (no paths to deleted routes)
  const stats = [
    { name: 'Subscription Plan', value: activeSubscription.plan + ' Plan', icon: FileCheck, desc: 'Billing status: ' + activeSubscription.status },
    { name: 'SaaS License', value: activeLicense.key.slice(0, 16) + '...', icon: Key, desc: 'Security key active' },
    { name: 'Storage Partition', value: '15.4 GB / 100 GB', icon: HardDrive, desc: '15.4% quota utilized' },
    { name: 'Active Team Members', value: `${companyUsers.length || 1} Members`, icon: Users, desc: 'Registered user profiles' },
  ];

  // Quick Launch core cards containing all 5 cores
  const coreProducts = [
    { name: 'Billing Core', desc: 'Master automated ledger invoicing, subscription cycles, tax filings, and recurring client drafts.', code: 'PHX-BILL', status: company?.enabledCores.includes('Billing Core') ? 'Active' : 'Inactive', version: 'v2.4.1' },
    { name: 'Automation Core', desc: 'Visual cross-platform logic builder, API trigger webhook synchronization, and background scripts runner.', code: 'PHX-AUTO', status: company?.enabledCores.includes('Automation Core') ? 'Active' : 'Inactive', version: 'v3.1.0' },
    { name: 'CRM Core', desc: 'Sales closing matrices pipeline, client chat integrations, and deal scoring predictive insights.', code: 'PHX-CRM', status: company?.enabledCores.includes('CRM Core') ? 'Active' : 'Inactive', version: 'v1.8.9' },
    { name: 'Client Portal', desc: 'Interactive white-label customer support desks, shared invoice ledgers, and document uploads repository.', code: 'PHX-PORT', status: company?.enabledCores.includes('Client Portal') ? 'Active' : 'Inactive', version: 'v2.0.0' },
    { name: 'Admin Intelligence', desc: 'Anomaly monitoring reports scanner, AI database optimizations analyzer, and security compliance charts.', code: 'PHX-INT', status: company?.enabledCores.includes('Admin Intelligence') ? 'Active' : 'Inactive', version: 'v1.0.2' },
  ];

  const handleLaunchProduct = (prodName: string, status: string) => {
    if (status !== 'Active') {
      alert('This product core is not enabled for your company subscription. Contact support to upgrade.');
      return;
    }
    navigate(`/products?launch=${encodeURIComponent(prodName)}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Welcome Card banner */}
      {user && company && (
        <div className="relative rounded-3xl border border-borderBg bg-gradient-to-br from-[#121212] via-[#161616] to-background p-6 md:p-8 overflow-hidden shadow-2xl">
          {/* Top orange gradient light blur */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-primaryOrange/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primaryOrange/10 border border-primaryOrange/20 text-xs font-semibold text-primaryOrange">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Enterprise Platform - Active Tenant</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight font-heading">
                Welcome back, <span className="gradient-text">{user.name}</span>
              </h2>
              <p className="text-xs md:text-sm text-darkGray max-w-xl">
                Authorized administrator for <span className="text-white font-medium">{company.name}</span>. Your portal is active with multi-tenant data isolation.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => navigate('/products')}
                className="py-2.5 px-4 rounded-xl text-xs font-semibold text-white orange-gradient-bg hover:opacity-90 active:scale-[0.98] transition-all flex items-center gap-2 shadow-[0_4px_15px_rgba(249,115,22,0.3)] cursor-pointer"
              >
                <span>Launch Products</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat) => (
          <div 
            key={stat.name}
            className="glass-card p-5 flex flex-col justify-between group"
          >
            <div className="flex justify-between items-start">
              <div className="w-9 h-9 rounded-lg bg-background border border-borderBg flex items-center justify-center text-primaryOrange">
                <stat.icon className="w-4.5 h-4.5" />
              </div>
            </div>
            <div className="mt-4 space-y-1">
              <span className="text-[10px] uppercase font-bold text-mutedGray tracking-wider block">{stat.name}</span>
              <span className="text-sm md:text-base font-extrabold text-white block truncate">{stat.value}</span>
              <span className="text-[10px] text-darkGray font-medium block truncate">{stat.desc}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main launch pads Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Active Platform Cores</h3>
            <p className="text-xs text-darkGray mt-0.5">Quick launch enabled SaaS products without secondary logins.</p>
          </div>
          <button 
            onClick={() => navigate('/products')}
            className="text-xs font-semibold text-primaryOrange hover:text-accentOrange transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>View All Products</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coreProducts.map((prod) => (
            <div 
              key={prod.name}
              className="glass-card p-6 flex flex-col justify-between h-56 group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primaryOrange/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex justify-between items-start">
                <div className="w-10 h-10 rounded-xl bg-background border border-borderBg flex items-center justify-center text-primaryOrange">
                  <Cpu className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono text-mutedGray uppercase">{prod.version}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    prod.status === 'Active' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'
                  }`}>
                    {prod.status}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex-1">
                <h4 className="text-sm font-bold text-white group-hover:text-primaryOrange transition-colors">{prod.name}</h4>
                <p className="text-[11px] text-darkGray leading-relaxed mt-1.5">{prod.desc}</p>
              </div>

              <div className="pt-4 border-t border-borderBg flex items-center justify-between mt-auto">
                <span className="text-[9px] font-mono text-mutedGray">{prod.code}</span>
                <button
                  onClick={() => handleLaunchProduct(prod.name, prod.status)}
                  className="px-3 py-1.5 rounded-lg text-[10px] font-semibold text-white orange-gradient-bg hover:opacity-90 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>SSO Launch</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
