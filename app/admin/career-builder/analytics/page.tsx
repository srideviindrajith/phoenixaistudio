'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { 
    BarChart3, 
    TrendingUp, 
    ShoppingBag, 
    CheckCircle, 
    FileText, 
    Users, 
    Percent, 
    DollarSign, 
    Calendar, 
    Download, 
    RefreshCw, 
    Cpu, 
    ArrowUpRight, 
    ShieldCheck, 
    LineChart,
    PieChart,
    Clock,
    Activity,
    Globe,
    Search
} from 'lucide-react';
import { StatsCard } from '@/components/admin/stats-card';
import { ModuleToggle } from '@/components/admin/module-toggle';

interface KPIItem {
    title: string;
    baseValue: number;
    value: string | number;
    icon: any;
    isPercentage?: boolean;
}

interface ProductItem {
    name: string;
    sales: number;
    revenue: string;
    growth?: string;
}

interface ChartDataPoint {
    name: string;
    value: number;
}

interface CustomerInsight {
    label: string;
    value: string;
    icon?: any;
}

export default function CareerAnalyticsDashboard() {
    const [selectedFilter, setSelectedFilter] = useState<string>('30 Days');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    const [isExporting, setIsExporting] = useState<boolean>(false);
    const [analyticsData, setAnalyticsData] = useState<any>(null)
    const [loadingAnalytics, setLoadingAnalytics] = useState(true)

    const filters = ['Today', '7 Days', '30 Days', '90 Days', 'This Year'];

    const fetchAnalytics = useCallback(async () => {
        setLoadingAnalytics(true)
        try {
            const res = await fetch('/api/career-analytics')
            const data = await res.json()
            setAnalyticsData(data)
        } catch (error) {
            console.error('Error fetching analytics:', error)
        } finally {
            setLoadingAnalytics(false)
        }
    }, [])

    useEffect(() => {
        fetchAnalytics()
    }, [fetchAnalytics])

    const handleRefresh = () => {
        setIsRefreshing(true)
        fetchAnalytics().then(() => setIsRefreshing(false))
    }

    const baseKpis = useMemo(() => analyticsData?.kpis || [
        { title: 'Total Revenue', baseValue: 0, icon: DollarSign },
        { title: 'Monthly Revenue', baseValue: 0, icon: TrendingUp },
        { title: 'Orders', baseValue: 0, icon: ShoppingBag },
        { title: 'Completed Orders', baseValue: 0, icon: CheckCircle },
        { title: 'Templates Sold', baseValue: 0, icon: FileText },
        { title: 'Active Customers', baseValue: 0, icon: Users },
        { title: 'Conversion Rate', baseValue: 0, icon: Percent, isPercentage: true },
        { title: 'Average Order Value', baseValue: 0, icon: DollarSign }
    ], [analyticsData?.kpis]);

    const kpis = useMemo(() => {
        const multipliers: Record<string, number> = {
            'Today': 0.05,
            '7 Days': 0.3,
            '30 Days': 1,
            '90 Days': 2.5,
            'This Year': 10
        };
        const multiplier = multipliers[selectedFilter] || 1;

        return baseKpis.map((kpi: KPIItem) => ({
            title: kpi.title,
            value: kpi.isPercentage 
                ? `${(kpi.baseValue * multiplier).toFixed(1)}%`
                : kpi.title.includes('Revenue') || kpi.title.includes('Value')
                    ? `$${(kpi.baseValue * multiplier).toLocaleString()}.00`
                    : Math.floor(kpi.baseValue * multiplier),
            icon: kpi.icon
        }));
    }, [selectedFilter, baseKpis]);

    const chartData = useMemo(() => {
        if (analyticsData?.chartData) return analyticsData.chartData
        
        const multipliers: Record<string, number> = {
            'Today': 0.1,
            '7 Days': 0.4,
            '30 Days': 1,
            '90 Days': 2,
            'This Year': 5
        };
        const multiplier = multipliers[selectedFilter] || 1;

        return {
            monthlyRevenue: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            salesSegment: { resume: 0, portfolio: 0 },
            orderGrowth: [0, 0, 0, 0, 0, 0, 0, 0],
            customerGrowth: [0, 0, 0, 0, 0, 0, 0, 0],
            monthlyTarget: 0
        };
    }, [selectedFilter, analyticsData]);

    const handleFilterChange = (filter: string) => {
        setSelectedFilter(filter);
    };

    const handleExport = () => {
        setIsExporting(true);
        setTimeout(() => {
            const content = `ANALYTICS REPORT
Generated on: ${new Date().toLocaleDateString()}
Filter: ${selectedFilter}

KEY PERFORMANCE INDICATORS
${kpis.map((kpi: any) => `${kpi.title}: ${kpi.value}`).join('\n')}

TOP PRODUCTS
${topProducts.map((p: ProductItem) => `${p.name}: ${p.sales} sold, ${p.revenue}`).join('\n')}

Report generated successfully.`;
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `analytics-report-${Date.now()}.txt`;
            a.click();
            URL.revokeObjectURL(url);
            setIsExporting(false);
        }, 1000);
    };

    const topProducts = useMemo(() => analyticsData?.topProducts || [], [analyticsData?.topProducts])

    const filteredTopProducts = useMemo(() => {
        if (!searchQuery) return topProducts;
        return topProducts.filter((product: ProductItem) => 
            product.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [topProducts, searchQuery]);

    const categories: string[] = useMemo(() => {
        if (!analyticsData?.categories) return ['Resume', 'Portfolio', 'ATS', 'Corporate', 'Creative', 'Student', 'Developer', 'Business'];
        return analyticsData.categories;
    }, [analyticsData?.categories]);

    const customerInsights = analyticsData?.customerInsights || [
        { label: 'New Customers', value: '0', icon: Users },
        { label: 'Returning Customers', value: '0', icon: Users },
        { label: 'Repeat Orders Rate', value: '0%', icon: Percent },
        { label: 'Satisfaction score', value: '0%', icon: CheckCircle }
    ]

    const reportsList = useMemo(() => analyticsData?.reportsList || [
        { name: 'Monthly Report', type: 'PDF • 1.4 MB' },
        { name: 'Weekly Report', type: 'PDF • 420 KB' },
        { name: 'Revenue Report', type: 'XLSX • 2.1 MB' },
        { name: 'Sales Report', type: 'XLSX • 1.8 MB' },
        { name: 'Template Report', type: 'PDF • 950 KB' }
    ], [analyticsData?.reportsList]);

    const systemHealth = useMemo(() => analyticsData?.systemHealth || [
        { name: 'Resume Builder', status: 'Healthy' },
        { name: 'Portfolio Builder', status: 'Healthy' },
        { name: 'Template Library', status: 'Healthy' },
        { name: 'Career Orders', status: 'Healthy' },
        { name: 'Analytics Engine', status: 'Healthy' }
    ], [analyticsData?.systemHealth]);

    const aiInsights = useMemo(() => analyticsData?.aiInsights || [
        { title: 'Best Selling Category', desc: 'Developer templates represent 42% of total checkouts.' },
        { title: 'Fastest Growing Product', desc: 'Developer Portfolio purchases expanded 24% this week.' },
        { title: 'Highest Revenue Package', desc: 'Premium templates account for 85% of total income.' },
        { title: 'Peak Sales Time', desc: 'Wednesdays between 14:00 and 17:00 show highest order volumes.' },
        { title: 'Customer Recommendation', desc: 'Bundling Executive Resume with Portfolio templates increases conversions.' }
    ], [analyticsData?.aiInsights]);

    const timelineActivities = useMemo(() => analyticsData?.timelineActivities || [
        { title: 'Report Generated', time: 'Just Now', desc: 'Monthly sales metrics exported successfully.' },
        { title: 'Sales Updated', time: '10 mins ago', desc: 'Template download metrics recalculated.' },
        { title: 'Revenue Synced', time: '1 hour ago', desc: 'Completed orders synced with gateway balances.' },
        { title: 'Customer Statistics Updated', time: '4 hours ago', desc: 'Returning customer rates recalculated.' }
    ], [analyticsData?.timelineActivities]);

    return (
        <div className="max-w-7xl space-y-6 lg:space-y-8 select-none text-white">
            {/* Header */}
            <div>
                <h1 className="font-heading text-2xl font-bold text-white md:text-3xl">Career Analytics</h1>
                <p className="text-gray-400 text-sm mt-1">Business Intelligence for Resume & Portfolio Services</p>
            </div>

            {/* Module Toggle */}
            <div>
                <ModuleToggle moduleKey="career-analytics" moduleName="Career Analytics" />
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between border-b border-white/5 pb-6">
                <div className="flex flex-wrap gap-2">
                    {filters.map((fil, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleFilterChange(fil)}
                            className={`px-4 h-9 rounded-lg border text-xs font-semibold uppercase tracking-wider transition-colors ${
                                fil === selectedFilter 
                                    ? 'border-[#FF7A00]/30 bg-[#FF7A00]/10 text-[#FF8A33]' 
                                    : 'border-white/[0.06] bg-white/[0.01] text-zinc-400 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                            {fil}
                        </button>
                    ))}
                </div>

                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-48 h-9 pl-10 pr-4 rounded-lg border border-white/[0.06] bg-white/[0.02] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF7A00]/30"
                        />
                    </div>
                    <button 
                        onClick={handleExport}
                        disabled={isExporting}
                        className="h-9 px-4 rounded-lg border border-white/[0.06] bg-white/[0.02] text-xs font-semibold text-white hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 transition-colors"
                    >
                        <Download className="w-4 h-4" /><span>{isExporting ? 'Exporting...' : 'Export Report'}</span>
                    </button>
                    <button 
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="h-9 px-4 rounded-lg border border-white/[0.06] bg-white/[0.02] text-xs font-semibold text-white hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} /><span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
                    </button>
                </div>
            </div>

            {/* 2. KPI Cards Grid */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {kpis.map((kpi: any, idx: number) => (
                    <StatsCard
                        key={idx}
                        title={kpi.title}
                        value={kpi.value}
                        icon={kpi.icon}
                    />
                ))}
            </div>

            {/* 3. Static Mock Charts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Chart 1: Monthly Revenue */}
                <div className="phoenix-table-wrap p-5 space-y-4">
                    <div className="flex justify-between items-center border-b border-white/5 pb-3">
                        <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-zinc-400">Monthly Revenue</h3>
                        <BarChart3 className="w-4 h-4 text-[#FF7A00]" />
                    </div>
                    {/* Mock Bars */}
                    <div className="h-40 flex items-end gap-2.5 px-2 pt-4">
                        {chartData.monthlyRevenue.map((h: any, i: number) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
                                <div 
                                    className="w-full bg-gradient-to-t from-[#FF6A00]/20 to-[#FF7A00] rounded-t-sm group-hover:brightness-110 transition-all"
                                    style={{ height: `${h}%` }}
                                />
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between text-[10px] text-zinc-500 font-semibold px-1.5">
                        <span>Jan</span>
                        <span>Jun</span>
                        <span>Dec</span>
                    </div>
                </div>

                {/* Chart 2: Resume vs Portfolio Sales */}
                <div className="phoenix-table-wrap p-5 space-y-5">
                    <div className="flex justify-between items-center border-b border-white/5 pb-3">
                        <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-zinc-400">Sales Segment</h3>
                        <PieChart className="w-4 h-4 text-[#FF7A00]" />
                    </div>
                    <div className="space-y-4 pt-2">
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-xs font-semibold">
                                <span>Resume Sales ({Math.round(chartData.salesSegment.resume)}%)</span>
                                <span>{Math.round(154 * (chartData.salesSegment.resume / 62))} Sold</span>
                            </div>
                            <div className="w-full h-2 rounded bg-white/[0.04] overflow-hidden">
                                <div className="h-full bg-[#FF7A00] rounded transition-all duration-500" style={{ width: `${chartData.salesSegment.resume}%` }}></div>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-xs font-semibold">
                                <span>Portfolio Sales ({Math.round(chartData.salesSegment.portfolio)}%)</span>
                                <span>{Math.round(94 * (chartData.salesSegment.portfolio / 38))} Sold</span>
                            </div>
                            <div className="w-full h-2 rounded bg-white/[0.04] overflow-hidden">
                                <div className="h-full bg-purple-500 rounded transition-all duration-500" style={{ width: `${chartData.salesSegment.portfolio}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chart 3: Order Growth */}
                <div className="phoenix-table-wrap p-5 space-y-4">
                    <div className="flex justify-between items-center border-b border-white/5 pb-3">
                        <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-zinc-400">Order Growth</h3>
                        <LineChart className="w-4 h-4 text-[#FF7A00]" />
                    </div>
                    {/* Mock Line Nodes representation */}
                    <div className="h-40 flex items-end justify-between relative px-4 pt-4 border-l border-b border-white/[0.06] ml-2">
                        {/* Mock grid lines */}
                        <div className="absolute left-0 right-0 top-1/4 border-t border-white/[0.02]" />
                        <div className="absolute left-0 right-0 top-2/4 border-t border-white/[0.02]" />
                        <div className="absolute left-0 right-0 top-3/4 border-t border-white/[0.02]" />
                        
                        {chartData.orderGrowth.map((h: any, i: number) => (
                            <div key={i} className="relative flex flex-col items-center group z-10" style={{ height: `${h}%` }}>
                                <span className="w-2.5 h-2.5 rounded-full bg-[#FF7A00] border-2 border-black group-hover:scale-125 transition-transform absolute -top-1" />
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between text-[10px] text-zinc-500 font-semibold px-2">
                        <span>W1</span>
                        <span>W4</span>
                        <span>W8</span>
                    </div>
                </div>

                {/* Chart 4: Customer Growth */}
                <div className="phoenix-table-wrap p-5 space-y-4">
                    <div className="flex justify-between items-center border-b border-white/5 pb-3">
                        <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-zinc-400">Customer Growth</h3>
                        <BarChart3 className="w-4 h-4 text-[#FF7A00]" />
                    </div>
                    <div className="h-40 flex items-end gap-3 px-4 pt-4">
                        {chartData.customerGrowth.map((h: any, i: number) => (
                            <div key={i} className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-t-sm relative group hover:border-[#FF7A00]/40 transition-colors" style={{ height: `${h}%` }}>
                                <div className="absolute inset-0 bg-[#FF7A00]/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-sm" />
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between text-[10px] text-zinc-500 font-semibold px-4">
                        <span>Q1</span>
                        <span>Q2</span>
                        <span>Q3</span>
                    </div>
                </div>

                {/* Chart 5: Traffic Sources */}
                <div className="phoenix-table-wrap p-5 space-y-4">
                    <div className="flex justify-between items-center border-b border-white/5 pb-3">
                        <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-zinc-400">Traffic Channels</h3>
                        <Globe className="w-4 h-4 text-[#FF7A00]" />
                    </div>
                    <div className="space-y-3 pt-2 text-xs">
                        {[
                            { source: 'Organic Search', rate: '48%', color: 'bg-[#FF7A00]' },
                            { source: 'Direct Access', rate: '28%', color: 'bg-purple-500' },
                            { source: 'Social Referral', rate: '14%', color: 'bg-blue-500' },
                            { source: 'Other channels', rate: '10%', color: 'bg-zinc-700' }
                        ].map((src, i) => (
                            <div key={i} className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${src.color}`} />
                                    <span className="text-zinc-300 font-medium">{src.source}</span>
                                </div>
                                <span className="font-bold text-white">{src.rate}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chart 6: Order Growth Timeline representation */}
                <div className="phoenix-table-wrap p-5 space-y-4">
                    <div className="flex justify-between items-center border-b border-white/5 pb-3">
                        <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-zinc-400">Monthly Target</h3>
                        <Percent className="w-4 h-4 text-[#FF7A00]" />
                    </div>
                    <div className="h-40 flex items-center justify-center relative">
                        {/* Mock circular progress ring */}
                        <div className="w-28 h-28 rounded-full border-4 border-white/[0.04] flex flex-col items-center justify-center relative">
                            <div className="absolute inset-0 rounded-full border-4 border-t-[#FF7A00] border-r-[#FF7A00] animate-pulse" style={{ transform: `rotate(${chartData.monthlyTarget * 3.6}deg)` }} />
                            <span className="text-2xl font-bold text-white">{Math.round(chartData.monthlyTarget)}%</span>
                            <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-semibold">Quota Reach</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Split Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 4. Top Selling Products */}
                <div className="phoenix-table-wrap lg:col-span-2">
                    <div className="flex items-center gap-3 p-5 border-b border-white/5">
                        <div className="w-10 h-10 rounded-xl bg-[#FF6A00]/10 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-[#FF6A00]" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-white">Top Selling Products</h2>
                            <p className="text-xs text-gray-500">Highest sales and growth ratios</p>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                                    <th className="p-4 pl-6">Product Name</th>
                                    <th className="p-4">Sales Count</th>
                                    <th className="p-4">Revenue</th>
                                    <th className="p-4 pr-6 text-right">Growth %</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-xs text-gray-300">
                                {filteredTopProducts.map((row: any, idx: number) => (
                                    <tr key={idx} className="hover:bg-white/[0.01] transition-colors">
                                        <td className="p-4 pl-6 font-semibold text-white">{row.name}</td>
                                        <td className="p-4 text-gray-400">{row.sales} sold</td>
                                        <td className="p-4 font-semibold text-white">{row.revenue}</td>
                                        <td className="p-4 pr-6 text-right">
                                            <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-green-500/10 text-green-400 border border-green-500/20">
                                                {row.growth}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 5. Popular Categories & Customer Insights */}
                <div className="space-y-6">
                    {/* Categories Grid */}
                    <div className="phoenix-table-wrap p-5 space-y-4">
                        <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-zinc-400 border-b border-white/5 pb-2">Popular Categories</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {categories.map((cat, i) => (
                                <div key={i} className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] text-xs font-semibold text-center hover:border-[#FF7A00]/25 transition-colors">
                                    {cat}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Customer Insights */}
                    <div className="phoenix-table-wrap p-5 space-y-4">
                        <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-zinc-400 border-b border-white/5 pb-2">Customer Insights</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {customerInsights.map((ins: CustomerInsight, i: number) => (
                                <div key={i} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-1 relative group">
                                    <span className="text-[10px] text-zinc-500 font-semibold block uppercase tracking-wider">{ins.label}</span>
                                    <span className="text-xl font-bold text-white block">{ins.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Split Bottom Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 6. Recent Reports Download */}
                <div className="phoenix-table-wrap p-5 space-y-4">
                    <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                        <div className="w-8 h-8 rounded-lg bg-[#FF6A00]/10 flex items-center justify-center">
                            <FileText className="w-4 h-4 text-[#FF6A00]" />
                        </div>
                        <div>
                            <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-zinc-400">Recent Reports</h3>
                        </div>
                    </div>
                    <div className="space-y-3.5">
                        {reportsList.map((rep: any, i: number) => (
                            <div key={i} className="flex justify-between items-center p-2 rounded-lg hover:bg-white/[0.01] border border-transparent hover:border-white/5 transition-all group">
                                <div className="space-y-0.5">
                                    <span className="text-xs font-semibold text-white block">{rep.name}</span>
                                    <span className="text-[10px] text-zinc-500 font-semibold">{rep.type}</span>
                                </div>
                                <button 
                                    onClick={() => {
                                        const content = `REPORT: ${rep.name}\nType: ${rep.type}\nGenerated: ${new Date().toLocaleDateString()}`;
                                        const blob = new Blob([content], { type: 'text/plain' });
                                        const url = URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = `${rep.name.replace(/\s+/g, '-').toLowerCase()}.txt`;
                                        a.click();
                                        URL.revokeObjectURL(url);
                                    }}
                                    className="p-2 rounded-lg border border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:text-white hover:bg-white/5 inline-flex items-center transition-colors"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 7. System Health Status */}
                <div className="phoenix-table-wrap p-5 space-y-4">
                    <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                        <div className="w-8 h-8 rounded-lg bg-[#FF6A00]/10 flex items-center justify-center">
                            <ShieldCheck className="w-4 h-4 text-[#FF6A00]" />
                        </div>
                        <div>
                            <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-zinc-400">System Health</h3>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {systemHealth.map((sys: any, i: number) => (
                            <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                                <span className="text-xs font-semibold text-white">{sys.name}</span>
                                <span className="px-2.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.15)]">
                                    {sys.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 8. AI Insights */}
                <div className="phoenix-table-wrap p-5 space-y-4">
                    <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                        <div className="w-8 h-8 rounded-lg bg-[#FF6A00]/10 flex items-center justify-center">
                            <Cpu className="w-4 h-4 text-[#FF6A00]" />
                        </div>
                        <div>
                            <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-zinc-400">AI Intelligence</h3>
                        </div>
                    </div>
                    <div className="space-y-3.5">
                        {aiInsights.slice(0, 3).map((insight: any, i: number) => (
                            <div key={i} className="p-3.5 rounded-xl bg-gradient-to-r from-[#FF7A00]/4 to-transparent border border-[#FF7A00]/15 space-y-1 relative group">
                                <div className="flex justify-between items-center w-full">
                                    <h4 className="text-[10px] font-bold text-white uppercase tracking-wide">
                                        {insight.title}
                                    </h4>
                                    <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-white/[0.04] border border-white/[0.08] text-zinc-500">
                                        AI Insight
                                    </span>
                                </div>
                                <p className="text-[11px] text-zinc-400 leading-relaxed pt-0.5">
                                    {insight.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 9. Recent Analytics Activity Timeline */}
            <div className="phoenix-table-wrap p-5 space-y-4">
                <h3 className="font-heading text-sm font-bold text-white border-b border-white/5 pb-3">Recent Analytics Activity</h3>
                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-white/[0.06]">
                    {timelineActivities.map((act: any, i: number) => (
                        <div key={i} className="relative space-y-0.5">
                            <span className="absolute -left-[22px] top-1.5 w-2 h-2 rounded-full bg-[#FF7A00] shadow-[0_0_8px_rgba(255,122,0,0.5)]"></span>
                            <div className="flex justify-between items-center text-xs">
                                <h4 className="font-bold text-white">{act.title}</h4>
                                <span className="text-[10px] text-zinc-500 font-semibold flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{act.time}</span>
                                </span>
                            </div>
                            <p className="text-[11px] text-zinc-400 leading-relaxed">{act.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}
