'use client';

import { 
    FileText, 
    Globe, 
    ShoppingBag, 
    Users, 
    Download, 
    DollarSign, 
    Briefcase,
    Activity, 
    Wrench,
    Grid,
    Layout,
    ArrowUpRight,
    CheckCircle,
    Settings,
    FileSpreadsheet,
    LineChart
} from 'lucide-react';
import { StatsCard } from '@/components/admin/stats-card';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { ModuleToggle } from '@/components/admin/module-toggle';

export default function CareerBuilderAdminDashboard() {
    const [stats, setStats] = useState([
        { title: 'Active Resume Services', value: 0, icon: FileText },
        { title: 'Active Portfolio Services', value: 0, icon: Globe },
        { title: 'Total Orders', value: 0, icon: ShoppingBag },
        { title: 'Customers', value: 0, icon: Users },
        { title: 'Asset Exports', value: 0, icon: Download },
        { title: 'Total Revenue', value: '$0.00', icon: DollarSign }
    ]);
    const [loading, setLoading] = useState(true);

    const fetchStats = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch real stats from database
            const [ordersRes, packagesRes] = await Promise.all([
                fetch('/api/career-orders').then(r => r.json()).catch(() => ({ orders: [] })),
                fetch('/api/packages').then(r => r.json()).catch(() => ({ packages: [] }))
            ]);

            const orders = ordersRes.orders || [];
            const packages = packagesRes.packages || [];
            
            const resumeServices = packages.filter((p: any) => p.category === 'Career Builder' && p.name.toLowerCase().includes('resume')).length;
            const portfolioServices = packages.filter((p: any) => p.category === 'Career Builder' && p.name.toLowerCase().includes('portfolio')).length;
            const totalOrders = orders.length;
            const uniqueCustomers = new Set(orders.map((o: any) => o.customerId || o.email)).size;
            const totalRevenue = orders.reduce((sum: number, o: any) => sum + (o.amount || 0), 0);
            
            setStats([
                { title: 'Active Resume Services', value: resumeServices, icon: FileText },
                { title: 'Active Portfolio Services', value: portfolioServices, icon: Globe },
                { title: 'Total Orders', value: totalOrders, icon: ShoppingBag },
                { title: 'Customers', value: uniqueCustomers, icon: Users },
                { title: 'Asset Exports', value: totalOrders, icon: Download },
                { title: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}.00`, icon: DollarSign }
            ]);
        } catch (error) {
            console.error('Error fetching career builder stats:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const actions = [
        { title: 'Resume Templates', desc: 'Configure and publish resume layout files.', href: '/admin/career-builder/resume-templates' },
        { title: 'Portfolio Templates', desc: 'Configure and publish responsive portfolio layouts.', href: '/admin/career-builder/portfolio-templates' },
        { title: 'Resume Services', desc: 'Configure managed resume writing services and starting price configurations.', href: '/admin/career-builder/resume-services' },
        { title: 'Portfolio Services', desc: 'Configure managed portfolio development options and pricing plans.', href: '/admin/career-builder/portfolio-services' },
        { title: 'Orders Center', desc: 'Monitor customer transactions, order status tables, and requirements.', href: '/admin/career-builder/orders' }
    ];

    const systemStatuses = [
        { title: 'Resume Services', status: 'Active' },
        { title: 'Portfolio Services', status: 'Active' },
        { title: 'Templates Catalog', status: 'Active' },
        { title: 'Orders System', status: 'Active' },
        { title: 'ATS Engine', status: 'Active' }
    ];

    const upcomingFeatures = [
        { title: 'AI Copywriting Assistant', desc: 'Generative phrase replacements and resume scoring assistance.', state: 'Planned' },
        { title: 'Automatic Domain Linker', desc: 'One-click deployment of personal portfolios to live user domains.', state: 'Roadmap' },
        { title: 'Interactive ATS Simulator', desc: 'Recruiter scanner simulation showing direct keyword matching scores.', state: 'Planned' },
        { title: 'Cover Letter Automator', desc: 'AI-assisted writing based on targeted vacancy listings and schemas.', state: 'Roadmap' },
        { title: 'LinkedIn Sync API', desc: 'Integrate and align credentials structure with live profile exports.', state: 'Planned' },
        { title: 'Candidate Response Logs', desc: 'Display candidate application trace counts and response reports.', state: 'Planned' }
    ];

    const recentActivities = [
        { activity: 'Fresher Resume service details updated', module: 'Resume Services', date: 'Just Now', status: 'Complete' },
        { activity: 'Developer Portfolio service details updated', module: 'Portfolio Services', date: '2 hours ago', status: 'Complete' },
        { activity: 'Aurora Creative template published', module: 'Resume Templates', date: 'Yesterday', status: 'Complete' }
    ];

    return (
        <div className="max-w-7xl space-y-6 lg:space-y-8 select-none">
            {/* Header */}
            <div>
                <h1 className="font-heading text-2xl font-bold text-white md:text-3xl">Career Services Control Panel</h1>
                <p className="text-gray-400 text-sm mt-1">Manage Resume & Portfolio Services, Templates, and Ingestion Orders</p>
            </div>

            {/* Module Toggle */}
            <div className="mb-6">
                <ModuleToggle moduleKey="career-builder" moduleName="Career Builder" />
            </div>

            {/* 1. Overview Cards Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-2 border-[#FF6A00]/30 border-t-[#FF6A00] rounded-full animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {stats.map((stat, idx) => (
                        <StatsCard
                            key={idx}
                            title={stat.title}
                            value={stat.value}
                            icon={stat.icon}
                        />
                    ))}
                </div>
            )}

            {/* 2. Quick Actions */}
            <div className="space-y-4">
                <h2 className="text-lg font-bold text-white font-heading">Quick Actions</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {actions.map((act, idx) => (
                        <div key={idx} className="phoenix-card p-5 flex flex-col justify-between items-start space-y-4 border border-white/[0.04] relative group">
                            <div className="space-y-2">
                                <h3 className="text-md font-bold text-white tracking-wide group-hover:text-[#FF8A33] transition-colors">
                                    {act.title}
                                </h3>
                                <p className="text-xs text-zinc-400 leading-relaxed">
                                    {act.desc}
                                </p>
                            </div>
                            <Link
                                href={act.href}
                                className="px-3.5 py-1.5 rounded-lg bg-[#FF7A00]/10 border border-[#FF7A00]/20 hover:bg-[#FF7A00]/20 text-[10px] font-bold uppercase tracking-wider text-white transition-all cursor-pointer flex items-center gap-1"
                            >
                                <span>Manage</span>
                                <ArrowUpRight className="w-3 h-3" />
                            </Link>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* 3. Recent Activity Table */}
                <div className="phoenix-table-wrap lg:col-span-2">
                    <div className="flex items-center gap-3 p-5 border-b border-white/5">
                        <div className="w-10 h-10 rounded-xl bg-[#FF6A00]/10 flex items-center justify-center">
                            <Activity className="w-5 h-5 text-[#FF6A00]" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-white">Recent Activity</h2>
                            <p className="text-xs text-gray-500">Latest actions performed in the module</p>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                                    <th className="p-4 pl-6">Activity</th>
                                    <th className="p-4">Module</th>
                                    <th className="p-4">Date</th>
                                    <th className="p-4 pr-6">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-xs text-gray-300">
                                {recentActivities.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-white/[0.01] transition-colors">
                                        <td className="p-4 pl-6 font-semibold text-white">{row.activity}</td>
                                        <td className="p-4 text-gray-400">{row.module}</td>
                                        <td className="p-4 text-gray-400">{row.date}</td>
                                        <td className="p-4 pr-6">
                                            <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-green-500/10 text-green-400 border border-green-500/20">
                                                {row.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 4. System Status */}
                <div className="phoenix-table-wrap">
                    <div className="flex items-center gap-3 p-5 border-b border-white/5">
                        <div className="w-10 h-10 rounded-xl bg-[#FF6A00]/10 flex items-center justify-center">
                            <Wrench className="w-5 h-5 text-[#FF6A00]" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-white">System Status</h2>
                            <p className="text-xs text-gray-500">Module operational state</p>
                        </div>
                    </div>
                    <div className="p-5 space-y-4">
                        {systemStatuses.map((sys, idx) => (
                            <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                                <span className="text-xs font-semibold text-white">{sys.title}</span>
                                <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-green-500/15 border border-green-500/30 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.15)]">
                                    {sys.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 5. Roadmap Features */}
            <div className="space-y-4">
                <h2 className="text-lg font-bold text-white font-heading">Roadmap Features</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {upcomingFeatures.map((feat, idx) => (
                        <div key={idx} className="phoenix-card p-5 flex flex-col justify-between items-start space-y-4 border border-white/[0.04]">
                            <div className="space-y-2 w-full">
                                <div className="flex items-center justify-between w-full">
                                    <h3 className="text-sm font-semibold text-white tracking-wide">
                                        {feat.title}
                                    </h3>
                                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${
                                        feat.state === 'Roadmap'
                                            ? 'bg-[#FF7A00]/10 border-[#FF7A00]/25 text-[#FF8A33]'
                                            : 'bg-blue-500/10 border-blue-500/25 text-blue-400'
                                    }`}>
                                        {feat.state}
                                    </span>
                                </div>
                                <p className="text-xs text-zinc-400 leading-relaxed">
                                    {feat.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
