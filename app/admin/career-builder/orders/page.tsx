'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { 
    Search, 
    Download, 
    Eye, 
    UserPlus, 
    FileText, 
    Archive, 
    ChevronLeft, 
    ChevronRight,
    ShoppingBag,
    Clock,
    AlertCircle,
    CheckCircle,
    XCircle,
    DollarSign,
    User,
    CreditCard,
    Plus,
    Activity,
    Users,
    Calendar,
    Settings,
    ArrowUpRight,
    Loader2,
    X,
    Trash2,
    RefreshCw,
    Bell,
    CheckSquare,
    Filter,
    ChevronsUpDown,
    Check,
    Briefcase
} from 'lucide-react';
import { exportFile, generateFilename } from '@/lib/export-utils';
import { ModuleToggle } from '@/components/admin/module-toggle';

interface TimelineStep {
    title: string;
    time: string;
    done: boolean;
}

interface OrderItem {
    id: string;
    customer: string;
    email: string;
    phone: string;
    service: string;
    packageType: string;
    selectedTemplate: string;
    assignedStaff: string;
    assignedTeam: string;
    status: 'Pending' | 'Assigned' | 'In Progress' | 'Client Review' | 'Revision' | 'Completed' | 'Cancelled' | 'Overdue';
    payment: 'Paid' | 'Pending' | 'Failed' | 'Refunded';
    amount: string;
    orderDate: string;
    deliveryDate: string;
    expectedDelivery: string;
    notes: string;
    paymentMethod: string;
    priority: 'Low' | 'Medium' | 'High' | 'Urgent';
    timeline: TimelineStep[];
}

export default function CareerOrdersPage() {
    // Selection and UI state
    const [ordersList, setOrdersList] = useState<OrderItem[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Advanced Filters State
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [paymentFilter, setPaymentFilter] = useState('all');
    const [serviceFilter, setServiceFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [packageFilter, setPackageFilter] = useState('all');
    const [sortOption, setSortOption] = useState('newest');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Modals State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

    // Form inputs state
    const [newOrderForm, setNewOrderForm] = useState({
        customer: '',
        email: '',
        phone: '',
        service: 'ATS Professional Resume',
        packageType: 'Professional',
        selectedTemplate: 'Modern Minimalist',
        assignedStaff: 'Marcus Devore',
        amount: '$149.00',
        priority: 'Medium' as OrderItem['priority'],
        notes: ''
    });
    const [bulkStatus, setBulkStatus] = useState<OrderItem['status']>('In Progress');
    const [assignStaffName, setAssignStaffName] = useState('Marcus Devore');

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Fetch orders from API
    const fetchOrders = useCallback(async (selectId?: string) => {
        setLoadingOrders(true);
        try {
            const res = await fetch('/api/career-orders');
            if (!res.ok) throw new Error('Failed to fetch orders');
            const data = await res.json();
            const fetchedOrders = data.orders || [];
            setOrdersList(fetchedOrders);
            
            if (fetchedOrders.length > 0) {
                if (selectId) {
                    setSelectedId(selectId);
                } else if (!selectedId) {
                    setSelectedId(fetchedOrders[0].id);
                }
            } else {
                setSelectedId(null);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            showToast('Failed to fetch orders from server', 'error');
        } finally {
            setLoadingOrders(false);
        }
    }, [selectedId]);

    useEffect(() => {
        fetchOrders();
    }, []);

    // Create a new order
    const handleCreateOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        setActionLoading('create');
        
        try {
            const amountVal = parseFloat(newOrderForm.amount.replace(/[^0-9.]/g, '')) || 0;
            const formattedAmount = `$${amountVal.toFixed(2)}`;
            const assignedTeam = newOrderForm.service.includes('Portfolio') ? 'Web Development' : 'Resume Writing';

            const payload = {
                ...newOrderForm,
                amount: formattedAmount,
                assignedTeam,
                status: 'Pending',
                payment: 'Paid',
                deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                expectedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            };

            const res = await fetch('/api/career-orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error('Failed to create order');
            const data = await res.json();
            
            showToast('Order created successfully!', 'success');
            setShowCreateModal(false);
            setNewOrderForm({
                customer: '',
                email: '',
                phone: '',
                service: 'ATS Professional Resume',
                packageType: 'Professional',
                selectedTemplate: 'Modern Minimalist',
                assignedStaff: 'Marcus Devore',
                amount: '$149.00',
                priority: 'Medium',
                notes: ''
            });
            await fetchOrders(data.order.id);
        } catch (error) {
            console.error(error);
            showToast('Error creating order', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    // Update order status/assigned staff/notes dynamically
    const handleUpdateOrder = async (id: string, updates: Partial<OrderItem>) => {
        try {
            const res = await fetch('/api/career-orders', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, ...updates })
            });

            if (!res.ok) throw new Error('Failed to update order');
            const data = await res.json();
            
            // Update local state
            setOrdersList(prev => prev.map(o => o.id === id ? data.order : o));
            showToast('Order updated successfully', 'success');
        } catch (error) {
            console.error(error);
            showToast('Error updating order', 'error');
        }
    };

    // Handle Assign Designer
    const handleAssignStaff = async () => {
        if (!selectedId) return;
        setActionLoading('assign');
        const assignedTeam = ordersList.find(o => o.id === selectedId)?.service.includes('Portfolio') ? 'Web Development' : 'Resume Writing';
        
        await handleUpdateOrder(selectedId, { 
            assignedStaff: assignStaffName,
            assignedTeam
        });
        
        setShowAssignModal(false);
        setActionLoading(null);
    };

    // Toggle single step on order timeline
    const handleToggleTimelineStep = async (stepIndex: number) => {
        if (!selectedId) return;
        const order = ordersList.find(o => o.id === selectedId);
        if (!order) return;

        const updatedTimeline = [...order.timeline];
        updatedTimeline[stepIndex] = {
            ...updatedTimeline[stepIndex],
            done: !updatedTimeline[stepIndex].done,
            time: !updatedTimeline[stepIndex].done ? new Date().toLocaleString() : 'Pending'
        };

        // Automatically advance order status if milestones are checked
        let updatedStatus = order.status;
        const lastDoneIndex = updatedTimeline.map(t => t.done).lastIndexOf(true);
        
        if (lastDoneIndex !== -1) {
            const stepTitle = updatedTimeline[lastDoneIndex].title.toLowerCase();
            if (stepTitle.includes('completed')) {
                updatedStatus = 'Completed';
            } else if (stepTitle.includes('revision')) {
                updatedStatus = 'Revision';
            } else if (stepTitle.includes('client review')) {
                updatedStatus = 'Client Review';
            } else if (stepTitle.includes('started')) {
                updatedStatus = 'In Progress';
            } else if (stepTitle.includes('assigned')) {
                updatedStatus = 'Assigned';
            }
        } else {
            updatedStatus = 'Pending';
        }

        await handleUpdateOrder(selectedId, { 
            timeline: updatedTimeline,
            status: updatedStatus
        });
    };

    // Bulk status update
    const handleBulkUpdate = async () => {
        if (selectedOrders.length === 0) return;
        setActionLoading('bulk');
        
        try {
            for (const id of selectedOrders) {
                await fetch('/api/career-orders', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id, status: bulkStatus })
                });
            }
            showToast(`Bulk updated ${selectedOrders.length} orders to ${bulkStatus}`, 'success');
            setSelectedOrders([]);
            setShowBulkModal(false);
            await fetchOrders();
        } catch (e) {
            showToast('Bulk update failed', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    // Delete/Archive order
    const handleDeleteOrder = async (id: string) => {
        if (!confirm('Are you sure you want to delete this order?')) return;
        setActionLoading('delete');
        try {
            const res = await fetch(`/api/career-orders?id=${id}`, {
                method: 'DELETE'
            });

            if (!res.ok) throw new Error('Delete failed');
            showToast('Order deleted successfully', 'success');
            
            // Reselect active order
            const remaining = ordersList.filter(o => o.id !== id);
            setOrdersList(remaining);
            if (remaining.length > 0) {
                setSelectedId(remaining[0].id);
            } else {
                setSelectedId(null);
            }
            setIsDrawerOpen(false);
        } catch (error) {
            showToast('Failed to delete order', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    // Reset Filters
    const handleResetFilters = () => {
        setSearchQuery('');
        setStatusFilter('all');
        setPaymentFilter('all');
        setServiceFilter('all');
        setPriorityFilter('all');
        setPackageFilter('all');
        setSortOption('newest');
        setCurrentPage(1);
        showToast('Filters cleared', 'success');
    };

    // Exports
    const handleExport = (format: 'pdf' | 'csv' | 'json') => {
        setActionLoading(`export-${format}`);
        showToast(`Preparing ${format.toUpperCase()} export...`, 'success');
        
        setTimeout(() => {
            try {
                if (format === 'json') {
                    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(ordersList, null, 2));
                    const downloadAnchor = document.createElement('a');
                    downloadAnchor.setAttribute("href", dataStr);
                    downloadAnchor.setAttribute("download", generateFilename('orders', 'json'));
                    document.body.appendChild(downloadAnchor);
                    downloadAnchor.click();
                    downloadAnchor.remove();
                } else if (format === 'csv') {
                    const headers = ['Order ID', 'Customer', 'Email', 'Phone', 'Service', 'Package', 'Staff', 'Priority', 'Status', 'Payment', 'Amount', 'Order Date'];
                    const rows = ordersList.map(o => [
                        o.id, o.customer, o.email, o.phone, o.service, o.packageType, o.assignedStaff, o.priority, o.status, o.payment, o.amount, o.orderDate
                    ]);
                    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
                    const downloadAnchor = document.createElement('a');
                    downloadAnchor.setAttribute("href", encodeURI(csvContent));
                    downloadAnchor.setAttribute("download", generateFilename('orders', 'csv'));
                    document.body.appendChild(downloadAnchor);
                    downloadAnchor.click();
                    downloadAnchor.remove();
                } else {
                    // PDF
                    const content = `ORDERS REPORT\nGenerated on: ${new Date().toLocaleDateString()}\nTotal Orders: ${ordersList.length}\n\n` + 
                        ordersList.map(o => `[${o.id}] - ${o.customer} (${o.email})\nService: ${o.service} | Package: ${o.packageType}\nStatus: ${o.status} | Payment: ${o.payment} | Amount: ${o.amount}\nAssigned to: ${o.assignedStaff}\n---`).join('\n\n');
                    exportFile({
                        format: 'pdf',
                        content,
                        filename: generateFilename('orders', 'pdf'),
                        title: 'Orders Overview Report',
                        metadata: { date: new Date().toISOString() }
                    });
                }
                showToast(`Exported ${format.toUpperCase()} successfully`, 'success');
            } catch (e) {
                showToast('Export failed', 'error');
            } finally {
                setActionLoading(null);
            }
        }, 800);
    };

    // Helpers
    const getStatusColor = (status: OrderItem['status']) => {
        switch (status) {
            case 'Pending': return 'bg-zinc-500/10 border-zinc-500/20 text-zinc-400';
            case 'Assigned': return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
            case 'In Progress': return 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400';
            case 'Client Review': return 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400';
            case 'Revision': return 'bg-pink-500/10 border-pink-500/20 text-pink-400';
            case 'Completed': return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
            case 'Cancelled': return 'bg-red-500/10 border-red-500/20 text-red-400';
            case 'Overdue': return 'bg-rose-500/10 border-rose-500/30 text-rose-400 animate-pulse';
            default: return 'bg-zinc-500/10 border-zinc-500/20 text-zinc-400';
        }
    };

    const getPriorityColor = (priority: OrderItem['priority']) => {
        switch (priority) {
            case 'Urgent': return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'High': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
            case 'Medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
            case 'Low': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            default: return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
        }
    };

    const getPaymentColor = (payment: OrderItem['payment']) => {
        switch (payment) {
            case 'Paid': return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
            case 'Pending': return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
            case 'Failed': return 'bg-red-500/10 border-red-500/20 text-red-400';
            case 'Refunded': return 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400';
            default: return 'bg-zinc-500/10 border-zinc-500/20 text-zinc-400';
        }
    };

    const getProgressValue = (status: OrderItem['status']) => {
        switch (status) {
            case 'Pending': return 10;
            case 'Assigned': return 25;
            case 'In Progress': return 50;
            case 'Client Review': return 75;
            case 'Revision': return 85;
            case 'Completed': return 100;
            case 'Cancelled': return 0;
            case 'Overdue': return 90;
            default: return 0;
        }
    };

    const staffOptions = ['Marcus Devore', 'Elena Rostova', 'John Smith', 'Sarah Johnson', 'Michael Brown', 'Alex Chen', 'Lisa Park', 'David Wilson'];
    const serviceOptions = ['Developer Portfolio', 'ATS Professional Resume', 'Combined Resume & Site', 'LinkedIn Bio Optimization', 'Executive Resume Layout', 'Cover Letter Writing', 'CV Review'];

    // Compute active review object
    const selectedOrder = useMemo(() => {
        return ordersList.find(o => o.id === selectedId) || null;
    }, [ordersList, selectedId]);

    // Computed Dashboard KPI Stats
    const statsData = useMemo(() => {
        const total = ordersList.length;
        const pending = ordersList.filter(o => o.status === 'Pending').length;
        const processing = ordersList.filter(o => o.status === 'In Progress' || o.status === 'Assigned' || o.status === 'Revision').length;
        const completed = ordersList.filter(o => o.status === 'Completed').length;
        const cancelled = ordersList.filter(o => o.status === 'Cancelled').length;
        
        const rev = ordersList.reduce((acc, curr) => {
            if (curr.payment === 'Refunded') return acc;
            const val = parseFloat(curr.amount.replace(/[^0-9.]/g, '')) || 0;
            return acc + val;
        }, 0);

        // Simulated stats
        const todayCount = ordersList.filter(o => o.orderDate === new Date().toISOString().split('T')[0]).length || 2;
        const avgCompletion = "3.2 days";

        return {
            total,
            pending,
            processing,
            completed,
            cancelled,
            revenue: `$${rev.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            todayCount,
            avgCompletion
        };
    }, [ordersList]);

    // Compile dynamic history logs from status updates
    const recentActivities = useMemo(() => {
        if (ordersList.length === 0) return [];
        const activities: { type: string; text: string; time: string; icon: any; color: string }[] = [];
        
        ordersList.slice(0, 5).forEach(order => {
            activities.push({
                type: 'Order Placed',
                text: `Client ${order.customer} purchased ${order.service}`,
                time: '1h ago',
                icon: Plus,
                color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
            });
            if (order.assignedStaff !== 'Unassigned') {
                activities.push({
                    type: 'Staff Assigned',
                    text: `Assigned ${order.assignedStaff} to ${order.id}`,
                    time: '3h ago',
                    icon: UserPlus,
                    color: 'text-blue-400 bg-blue-500/10 border-blue-500/20'
                });
            }
            if (order.status === 'Completed') {
                activities.push({
                    type: 'Completed',
                    text: `Order ${order.id} delivered successfully`,
                    time: '1d ago',
                    icon: CheckCircle,
                    color: 'text-green-400 bg-green-500/10 border-green-500/20'
                });
            }
        });
        return activities.slice(0, 6);
    }, [ordersList]);

    // Apply advanced filters & search to orders
    const filteredOrders = useMemo(() => {
        let result = [...ordersList];

        // Search Query
        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            result = result.filter(o => 
                o.id.toLowerCase().includes(query) ||
                o.customer.toLowerCase().includes(query) ||
                o.email.toLowerCase().includes(query) ||
                o.service.toLowerCase().includes(query)
            );
        }

        // Status Filter
        if (statusFilter !== 'all') {
            result = result.filter(o => o.status === statusFilter);
        }

        // Payment Filter
        if (paymentFilter !== 'all') {
            result = result.filter(o => o.payment === paymentFilter);
        }

        // Service Filter
        if (serviceFilter !== 'all') {
            result = result.filter(o => o.service === serviceFilter);
        }

        // Priority Filter
        if (priorityFilter !== 'all') {
            result = result.filter(o => o.priority === priorityFilter);
        }

        // Package Filter
        if (packageFilter !== 'all') {
            result = result.filter(o => o.packageType === packageFilter);
        }

        // Sorting
        result.sort((a, b) => {
            const getAmountVal = (amt: string) => parseFloat(amt.replace(/[^0-9.]/g, '')) || 0;
            switch (sortOption) {
                case 'newest':
                    return new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime();
                case 'oldest':
                    return new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime();
                case 'amount-high':
                    return getAmountVal(b.amount) - getAmountVal(a.amount);
                case 'amount-low':
                    return getAmountVal(a.amount) - getAmountVal(b.amount);
                default:
                    return 0;
            }
        });

        return result;
    }, [ordersList, searchQuery, statusFilter, paymentFilter, serviceFilter, priorityFilter, packageFilter, sortOption]);

    // Paginated results
    const paginatedOrders = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredOrders.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredOrders, currentPage]);

    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

    const toggleSelectAll = () => {
        if (selectedOrders.length === paginatedOrders.length) {
            setSelectedOrders([]);
        } else {
            setSelectedOrders(paginatedOrders.map(o => o.id));
        }
    };

    const toggleSelectOrder = (id: string) => {
        setSelectedOrders(prev => 
            prev.includes(id) ? prev.filter(oid => oid !== id) : [...prev, id]
        );
    };

    return (
        <div className="min-h-screen bg-[#050507] text-[#E4E4E7] font-sans select-none selection:bg-[#FF7A00]/30 selection:text-white pb-12">
            
            {/* Toast System Notification */}
            {toast && (
                <div className={`fixed top-6 right-6 z-50 px-5 py-3.5 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${
                    toast.type === 'success' ? 'border-emerald-500/30 bg-emerald-950/90 text-emerald-400 shadow-emerald-500/5' :
                    'border-red-500/30 bg-red-950/90 text-red-400 shadow-red-500/5'
                }`}>
                    <div className="flex items-center gap-2.5">
                        {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        <span className="text-xs font-bold tracking-wide">{toast.message}</span>
                    </div>
                </div>
            )}

            {/* Sticky Enterprise Header */}
            <header className="border-b border-white/5 bg-[#050507]/80 backdrop-blur-md sticky top-0 z-30 px-4 md:px-8 py-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 max-w-[1400px] mx-auto w-full">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl md:text-2xl font-black font-heading text-white tracking-tight">
                                Orders Management Workspace
                            </h1>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#FF7A00]/10 border border-[#FF7A00]/20 text-[#FF8A33]">
                                SaaS Enterprise
                            </span>
                        </div>
                        <p className="text-zinc-500 text-[11px] font-medium mt-1">
                            Monitor, dispatch, and review client career package purchases.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <ModuleToggle moduleKey="career-orders" moduleName="Career Orders" />
                        <button 
                            onClick={() => { fetchOrders(); showToast('Orders feed refreshed', 'success'); }}
                            className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-400 hover:text-white transition-all flex items-center justify-center relative"
                            title="Refresh Database"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                        <div className="relative">
                            <button 
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-400 hover:text-white transition-all flex items-center justify-center"
                                title="Recent Activity feed"
                            >
                                <Bell className="w-4 h-4" />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FF7A00]" />
                            </button>
                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-[#0D1117] border border-white/10 shadow-2xl p-4 space-y-3.5 z-40 animate-fade-in text-xs">
                                    <h4 className="font-bold text-white uppercase tracking-wider text-[10px] border-b border-white/5 pb-1.5">Live Notifications</h4>
                                    <div className="space-y-3 max-h-60 overflow-y-auto">
                                        {recentActivities.map((a, idx) => (
                                            <div key={idx} className="flex gap-2.5 items-start">
                                                <div className={`p-1.5 rounded-lg shrink-0 ${a.color.split(' ')[0]} ${a.color.split(' ')[1]}`}>
                                                    <Activity className="w-3 h-3" />
                                                </div>
                                                <div className="space-y-0.5">
                                                    <p className="font-semibold text-white">{a.type}</p>
                                                    <p className="text-[10px] text-zinc-400">{a.text}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-[1400px] mx-auto px-4 md:px-8 mt-8 space-y-8">
                
                {/* 1. TOP KPI CARDS */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    
                    {/* Card 1: Total Orders */}
                    <div className="relative group p-5 rounded-2xl bg-[#0D1117]/60 border border-white/5 shadow-xl hover:border-white/10 transition-all duration-300">
                        <div className="absolute -inset-px bg-gradient-to-r from-[#FF7A00]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-sm" />
                        <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Total Orders</span>
                                <div className="p-2 rounded-xl bg-[#FF7A00]/10 text-[#FF8A33]">
                                    <ShoppingBag className="w-4 h-4" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-3xl font-black text-white">{statsData.total}</h3>
                                <div className="flex items-center gap-1.5 mt-2">
                                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">+12.5%</span>
                                    <span className="text-[9px] text-zinc-500">vs last month</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Pending Orders */}
                    <div className="relative group p-5 rounded-2xl bg-[#0D1117]/60 border border-white/5 shadow-xl hover:border-white/10 transition-all duration-300">
                        <div className="absolute -inset-px bg-gradient-to-r from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-sm" />
                        <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Pending Processing</span>
                                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                                    <Clock className="w-4 h-4" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-3xl font-black text-white">{statsData.pending}</h3>
                                <div className="flex items-center gap-1.5 mt-2">
                                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">Requires Dispatch</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Revenue */}
                    <div className="relative group p-5 rounded-2xl bg-[#0D1117]/60 border border-white/5 shadow-xl hover:border-white/10 transition-all duration-300">
                        <div className="absolute -inset-px bg-gradient-to-r from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-sm" />
                        <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Active Revenue</span>
                                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                                    <DollarSign className="w-4 h-4" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-3xl font-black text-white">{statsData.revenue}</h3>
                                <div className="flex items-center gap-1.5 mt-2">
                                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">Gross Sales</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 4: Avg Completion */}
                    <div className="relative group p-5 rounded-2xl bg-[#0D1117]/60 border border-white/5 shadow-xl hover:border-white/10 transition-all duration-300">
                        <div className="absolute -inset-px bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-sm" />
                        <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Avg Completion Time</span>
                                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                                    <Activity className="w-4 h-4" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-3xl font-black text-white">{statsData.avgCompletion}</h3>
                                <div className="flex items-center gap-1.5 mt-2">
                                    <span className="text-[9px] text-zinc-500">Average duration per package</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. QUICK ACTIONS BAR */}
                <section className="bg-[#0D1117]/40 border border-white/5 rounded-2xl p-5 flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex items-center gap-2">
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider">Quick Dispatch Actions</h3>
                    </div>
                    
                    <div className="flex items-center gap-2.5 flex-wrap">
                        <button 
                            onClick={() => setShowCreateModal(true)}
                            className="h-10 px-4 rounded-xl bg-emerald-500 text-xs font-bold text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all flex items-center gap-1.5"
                        >
                            <Plus className="w-4 h-4" /> Create Order
                        </button>
                        
                        <button 
                            onClick={() => {
                                if (selectedId) setShowAssignModal(true);
                                else showToast('Select an order to assign staff', 'error');
                            }}
                            className="h-10 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold text-white transition-all flex items-center gap-1.5"
                        >
                            <UserPlus className="w-4 h-4" /> Assign Staff
                        </button>

                        <button 
                            onClick={() => {
                                if (selectedOrders.length > 0) setShowBulkModal(true);
                                else showToast('Please select orders for bulk updates', 'error');
                            }}
                            className="h-10 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold text-zinc-400 hover:text-white transition-all flex items-center gap-1.5"
                        >
                            <CheckSquare className="w-4 h-4" /> Bulk Status
                        </button>

                        <div className="h-6 w-px bg-white/10 mx-1 hidden sm:block" />

                        <div className="flex items-center gap-1.5">
                            <button 
                                onClick={() => handleExport('pdf')}
                                className="h-10 px-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold text-zinc-400 hover:text-white transition-all"
                                title="Export PDF"
                            >
                                PDF
                            </button>
                            <button 
                                onClick={() => handleExport('csv')}
                                className="h-10 px-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold text-zinc-400 hover:text-white transition-all"
                                title="Export CSV"
                            >
                                CSV
                            </button>
                            <button 
                                onClick={() => handleExport('json')}
                                className="h-10 px-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold text-zinc-400 hover:text-white transition-all"
                                title="Export JSON"
                            >
                                JSON
                            </button>
                        </div>
                    </div>
                </section>

                {/* 3. ADVANCED FILTER BAR */}
                <section className="bg-[#0D1117]/60 border border-white/5 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-white/5">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Filter className="w-3.5 h-3.5" /> Workspace Filters
                        </span>
                        <button 
                            onClick={handleResetFilters}
                            className="text-[10px] font-bold text-[#FF8A33] hover:underline"
                        >
                            Reset Workspace
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
                        {/* Search Field */}
                        <div className="relative col-span-1 sm:col-span-2">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                            <input 
                                type="text"
                                placeholder="Search by client name, email or ID..."
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                className="w-full h-10 pl-9 pr-4 rounded-xl border border-white/5 bg-[#050507] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF7A00]/30"
                            />
                        </div>

                        {/* Status Select */}
                        <div>
                            <select 
                                value={statusFilter}
                                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                                className="w-full h-10 px-3.5 rounded-xl border border-white/5 bg-[#050507] text-xs text-zinc-400 focus:outline-none focus:text-white cursor-pointer"
                            >
                                <option value="all">All Statuses</option>
                                <option value="Pending">Pending</option>
                                <option value="Assigned">Assigned</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Client Review">Client Review</option>
                                <option value="Revision">Revision</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                                <option value="Overdue">Overdue</option>
                            </select>
                        </div>

                        {/* Priority Select */}
                        <div>
                            <select 
                                value={priorityFilter}
                                onChange={(e) => { setPriorityFilter(e.target.value); setCurrentPage(1); }}
                                className="w-full h-10 px-3.5 rounded-xl border border-white/5 bg-[#050507] text-xs text-zinc-400 focus:outline-none focus:text-white cursor-pointer"
                            >
                                <option value="all">All Priorities</option>
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                                <option value="Urgent">Urgent</option>
                            </select>
                        </div>

                        {/* Package Select */}
                        <div>
                            <select 
                                value={packageFilter}
                                onChange={(e) => { setPackageFilter(e.target.value); setCurrentPage(1); }}
                                className="w-full h-10 px-3.5 rounded-xl border border-white/5 bg-[#050507] text-xs text-zinc-400 focus:outline-none focus:text-white cursor-pointer"
                            >
                                <option value="all">All Packages</option>
                                <option value="Starter">Starter</option>
                                <option value="Professional">Professional</option>
                                <option value="Executive">Executive</option>
                            </select>
                        </div>

                        {/* Sort Option */}
                        <div>
                            <select 
                                value={sortOption}
                                onChange={(e) => setSortOption(e.target.value)}
                                className="w-full h-10 px-3.5 rounded-xl border border-white/5 bg-[#050507] text-xs text-zinc-400 focus:outline-none focus:text-white cursor-pointer"
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="amount-high">Amount: High-Low</option>
                                <option value="amount-low">Amount: Low-High</option>
                            </select>
                        </div>
                    </div>
                </section>

                {/* 4. ORDERS GRID TABLE */}
                <section className="bg-[#0D1117]/60 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                    
                    {loadingOrders ? (
                        /* Skeleton loaders while loading orders */
                        <div className="p-8 space-y-4">
                            <div className="flex items-center justify-between pb-4 border-b border-white/5">
                                <div className="h-4 w-32 bg-white/5 rounded animate-pulse" />
                                <div className="h-4 w-48 bg-white/5 rounded animate-pulse" />
                            </div>
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="flex gap-4 items-center py-3">
                                    <div className="h-4 w-4 bg-white/5 rounded animate-pulse" />
                                    <div className="h-4 w-20 bg-white/5 rounded animate-pulse" />
                                    <div className="h-4 w-36 bg-white/5 rounded animate-pulse" />
                                    <div className="h-4 w-28 bg-white/5 rounded animate-pulse" />
                                    <div className="h-4 w-24 bg-white/5 rounded animate-pulse" />
                                    <div className="h-4 w-16 bg-white/5 rounded animate-pulse" />
                                </div>
                            ))}
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        /* Empty State Workspace */
                        <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-[#FF7A00]/5 border border-[#FF7A00]/15 flex items-center justify-center text-[#FF8A33]">
                                <ShoppingBag className="w-8 h-8" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-sm font-bold text-white">No Orders Found</h4>
                                <p className="text-zinc-500 text-xs max-w-sm">No packages or resume orders matched your active search query or filter settings.</p>
                            </div>
                            <button 
                                onClick={() => setShowCreateModal(true)}
                                className="h-9 px-4 rounded-lg bg-[#FF7A00]/10 border border-[#FF7A00]/20 hover:bg-[#FF7A00]/20 text-xs font-bold text-[#FF8A33] transition-colors"
                            >
                                Create First Order
                            </button>
                        </div>
                    ) : (
                        /* Premium Grid Table content */
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[1000px]">
                                <thead>
                                    <tr className="border-b border-white/5 text-[9px] font-bold uppercase tracking-widest text-zinc-500 bg-white/[0.01]">
                                        <th className="p-4 pl-6 w-12 text-center">
                                            <input 
                                                type="checkbox" 
                                                checked={selectedOrders.length === paginatedOrders.length && paginatedOrders.length > 0}
                                                onChange={toggleSelectAll}
                                                className="rounded border-zinc-700 bg-zinc-900 text-[#FF7A00] focus:ring-[#FF7A00]"
                                            />
                                        </th>
                                        <th className="p-4">Order ID</th>
                                        <th className="p-4">Client</th>
                                        <th className="p-4">Service</th>
                                        <th className="p-4">Package</th>
                                        <th className="p-4">Assigned Staff</th>
                                        <th className="p-4">Priority</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4">Payment</th>
                                        <th className="p-4">Created Date</th>
                                        <th className="p-4">Progress</th>
                                        <th className="p-4 pr-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 text-xs text-gray-300">
                                    {paginatedOrders.map((row) => (
                                        <tr 
                                            key={row.id}
                                            onClick={() => { setSelectedId(row.id); setIsDrawerOpen(true); }}
                                            className={`hover:bg-white/[0.01] transition-all cursor-pointer ${
                                                selectedId === row.id ? 'bg-[#FF7A00]/5 border-l-2 border-l-[#FF7A00]' : ''
                                            }`}
                                        >
                                            <td className="p-4 pl-6 text-center" onClick={(e) => e.stopPropagation()}>
                                                <input 
                                                    type="checkbox"
                                                    checked={selectedOrders.includes(row.id)}
                                                    onChange={() => toggleSelectOrder(row.id)}
                                                    className="rounded border-zinc-700 bg-zinc-900 text-[#FF7A00] focus:ring-[#FF7A00]"
                                                />
                                            </td>
                                            <td className="p-4 font-bold text-white font-mono">{row.id}</td>
                                            <td className="p-4">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-white">{row.customer}</span>
                                                    <span className="text-[9px] text-zinc-500 font-mono">{row.email}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-zinc-400 font-medium">{row.service}</td>
                                            <td className="p-4 text-zinc-400">{row.packageType}</td>
                                            <td className="p-4 text-zinc-400 font-medium">
                                                {row.assignedStaff === 'Unassigned' ? (
                                                    <span className="text-zinc-600 font-normal">Unassigned</span>
                                                ) : (
                                                    row.assignedStaff
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${getPriorityColor(row.priority)}`}>
                                                    {row.priority}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${getStatusColor(row.status)}`}>
                                                    {row.status}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${getPaymentColor(row.payment)}`}>
                                                    {row.payment}
                                                </span>
                                            </td>
                                            <td className="p-4 text-zinc-500 font-mono">{row.orderDate}</td>
                                            <td className="p-4 w-32">
                                                <div className="space-y-1">
                                                    <div className="flex items-center justify-between text-[9px] text-zinc-500">
                                                        <span>{getProgressValue(row.status)}%</span>
                                                    </div>
                                                    <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                                                        <div 
                                                            className={`h-full ${
                                                                row.status === 'Completed' ? 'bg-emerald-500' :
                                                                row.status === 'Cancelled' ? 'bg-red-500' :
                                                                row.status === 'Overdue' ? 'bg-rose-500' : 'bg-gradient-to-r from-[#FF7A00] to-[#FF8A33]'
                                                            }`} 
                                                            style={{ width: `${getProgressValue(row.status)}%` }} 
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 pr-6 text-right" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex justify-end gap-1.5">
                                                    <button 
                                                        onClick={() => { setSelectedId(row.id); setIsDrawerOpen(true); }}
                                                        className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
                                                        title="Open Sliding Workspace"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteOrder(row.id)}
                                                        className="p-1.5 rounded-lg bg-red-500/5 border border-red-500/10 text-red-400 hover:bg-red-500/15 transition-all"
                                                        title="Archive Order"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination Bottom Bar */}
                    {!loadingOrders && filteredOrders.length > 0 && (
                        <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-white/5 text-xs text-zinc-500 gap-4">
                            <span>Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredOrders.length)} of {filteredOrders.length} entries</span>
                            
                            <div className="flex gap-1.5">
                                <button 
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 h-8 rounded-lg border border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all"
                                >
                                    <ChevronLeft className="w-3.5 h-3.5" />
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`px-3 h-8 rounded-lg font-semibold flex items-center justify-center transition-all ${
                                            currentPage === page
                                                ? 'bg-[#FF7A00]/10 border border-[#FF7A00]/30 text-[#FF8A33]'
                                                : 'border border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:bg-white/5'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button 
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 h-8 rounded-lg border border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all"
                                >
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    )}
                </section>
            </main>

            {/* 5. SLIDING DETAILS DRAWER */}
            {isDrawerOpen && selectedOrder && (
                <>
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in transition-all"
                        onClick={() => setIsDrawerOpen(false)}
                    />
                    
                    {/* Drawer container */}
                    <div className="fixed top-0 right-0 h-full w-full max-w-lg bg-[#080B11] border-l border-white/10 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
                        {/* Drawer Header */}
                        <div className="p-6 border-b border-white/5 bg-[#0A0D14] flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-black text-white uppercase tracking-wider">{selectedOrder.customer}</h3>
                                <p className="text-xs text-zinc-500 font-mono mt-0.5">{selectedOrder.id} • {selectedOrder.email}</p>
                            </div>
                            <button 
                                onClick={() => setIsDrawerOpen(false)}
                                className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-all"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Drawer Scrollable Body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-zinc-300">
                            
                            {/* Fast KPI Strip */}
                            <div className="grid grid-cols-3 gap-3 bg-white/[0.02] border border-white/5 p-4 rounded-xl">
                                <div>
                                    <span className="text-[9px] font-bold text-zinc-500 uppercase block">Amount</span>
                                    <span className="text-sm font-black text-white mt-1 block">{selectedOrder.amount}</span>
                                </div>
                                <div>
                                    <span className="text-[9px] font-bold text-zinc-500 uppercase block">Status</span>
                                    <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] font-bold uppercase border mt-1 ${getStatusColor(selectedOrder.status)}`}>
                                        {selectedOrder.status}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[9px] font-bold text-zinc-500 uppercase block">Payment</span>
                                    <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] font-bold uppercase border mt-1 ${getPaymentColor(selectedOrder.payment)}`}>
                                        {selectedOrder.payment}
                                    </span>
                                </div>
                            </div>

                            {/* Dispatch Configurations */}
                            <div className="space-y-4 bg-white/[0.01] border border-white/5 p-4 rounded-xl">
                                <h4 className="font-bold text-white uppercase tracking-wider text-[10px] border-b border-white/5 pb-1.5">Dispatch Configurations</h4>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Staff Assignment */}
                                    <div className="space-y-1.5">
                                        <label className="text-zinc-500 font-semibold uppercase text-[9px]">Assign Staff</label>
                                        <select 
                                            value={selectedOrder.assignedStaff}
                                            onChange={(e) => handleUpdateOrder(selectedOrder.id, { assignedStaff: e.target.value })}
                                            className="w-full h-9 px-2 rounded-lg border border-white/10 bg-[#050507] text-white focus:outline-none"
                                        >
                                            <option value="Unassigned">Choose staff...</option>
                                            {staffOptions.map(staff => (
                                                <option key={staff} value={staff}>{staff}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Status Change */}
                                    <div className="space-y-1.5">
                                        <label className="text-zinc-500 font-semibold uppercase text-[9px]">Order Status</label>
                                        <select 
                                            value={selectedOrder.status}
                                            onChange={(e) => handleUpdateOrder(selectedOrder.id, { status: e.target.value as any })}
                                            className="w-full h-9 px-2 rounded-lg border border-white/10 bg-[#050507] text-white focus:outline-none"
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="Assigned">Assigned</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Client Review">Client Review</option>
                                            <option value="Revision">Revision</option>
                                            <option value="Completed">Completed</option>
                                            <option value="Cancelled">Cancelled</option>
                                            <option value="Overdue">Overdue</option>
                                        </select>
                                    </div>

                                    {/* Priority Change */}
                                    <div className="space-y-1.5">
                                        <label className="text-zinc-500 font-semibold uppercase text-[9px]">Priority</label>
                                        <select 
                                            value={selectedOrder.priority}
                                            onChange={(e) => handleUpdateOrder(selectedOrder.id, { priority: e.target.value as any })}
                                            className="w-full h-9 px-2 rounded-lg border border-white/10 bg-[#050507] text-white focus:outline-none"
                                        >
                                            <option value="Low">Low</option>
                                            <option value="Medium">Medium</option>
                                            <option value="High">High</option>
                                            <option value="Urgent">Urgent</option>
                                        </select>
                                    </div>

                                    {/* Payment Change */}
                                    <div className="space-y-1.5">
                                        <label className="text-zinc-500 font-semibold uppercase text-[9px]">Payment Status</label>
                                        <select 
                                            value={selectedOrder.payment}
                                            onChange={(e) => handleUpdateOrder(selectedOrder.id, { payment: e.target.value as any })}
                                            className="w-full h-9 px-2 rounded-lg border border-white/10 bg-[#050507] text-white focus:outline-none"
                                        >
                                            <option value="Paid">Paid</option>
                                            <option value="Pending">Pending</option>
                                            <option value="Failed">Failed</option>
                                            <option value="Refunded">Refunded</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Client Details Profile */}
                            <div className="space-y-3 bg-white/[0.01] border border-white/5 p-4 rounded-xl">
                                <h4 className="font-bold text-white uppercase tracking-wider text-[10px] border-b border-white/5 pb-1.5">Client Profile</h4>
                                
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-zinc-500">Service:</span>
                                        <span className="text-white font-semibold">{selectedOrder.service}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-zinc-500">Phone:</span>
                                        <span className="text-white font-mono">{selectedOrder.phone}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-zinc-500">Method:</span>
                                        <span className="text-white font-semibold">{selectedOrder.paymentMethod}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-zinc-500">Ordered:</span>
                                        <span className="text-white font-mono">{selectedOrder.orderDate}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-zinc-500">Expected:</span>
                                        <span className="text-[#FF8A33] font-mono">{selectedOrder.expectedDelivery}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Timeline Tracker (Interactive checkboxes!) */}
                            <div className="space-y-4 bg-white/[0.01] border border-white/5 p-4 rounded-xl">
                                <div>
                                    <h4 className="font-bold text-white uppercase tracking-wider text-[10px] border-b border-white/5 pb-1.5">Interactive Dispatch Timeline</h4>
                                    <p className="text-[10px] text-zinc-500 mt-1">Check stages to automatically update overall progress logs.</p>
                                </div>

                                <div className="space-y-3.5 mt-2">
                                    {selectedOrder.timeline.map((step, idx) => (
                                        <div 
                                            key={idx} 
                                            className="flex items-center justify-between cursor-pointer group"
                                            onClick={() => handleToggleTimelineStep(idx)}
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <div className={`h-4 w-4 rounded border flex items-center justify-center transition-all ${
                                                    step.done ? 'bg-emerald-500 border-emerald-600 text-white' : 'border-white/10 group-hover:border-white/20'
                                                }`}>
                                                    {step.done && <Check className="w-3 h-3 stroke-[3]" />}
                                                </div>
                                                <span className={`font-medium ${step.done ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-400'}`}>
                                                    {step.title}
                                                </span>
                                            </div>
                                            <span className="text-[10px] font-mono text-zinc-500">{step.time}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Requirements Notes */}
                            <div className="space-y-2 bg-white/[0.01] border border-white/5 p-4 rounded-xl">
                                <h4 className="font-bold text-white uppercase tracking-wider text-[10px] border-b border-white/5 pb-1.5">Requirements & Workspace Notes</h4>
                                <textarea 
                                    value={selectedOrder.notes}
                                    onChange={(e) => handleUpdateOrder(selectedOrder.id, { notes: e.target.value })}
                                    className="w-full h-24 p-2.5 rounded-lg border border-white/10 bg-[#050507] text-white focus:outline-none font-mono text-[11px] leading-relaxed resize-none mt-1"
                                    placeholder="Enter internal requirements notes..."
                                />
                            </div>
                        </div>

                        {/* Drawer Footer */}
                        <div className="p-6 border-t border-white/5 bg-[#0A0D14] flex justify-between gap-3">
                            <button 
                                onClick={() => handleDeleteOrder(selectedOrder.id)}
                                className="h-10 px-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-bold transition-all"
                            >
                                Archive Order
                            </button>
                            <button 
                                onClick={() => setIsDrawerOpen(false)}
                                className="h-10 px-5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white hover:bg-white/10 transition-all"
                            >
                                Close Workspace
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Create Order Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="relative w-full max-w-lg rounded-2xl bg-[#0d1117] border border-white/10 shadow-2xl p-6 overflow-hidden">
                        <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4">
                            <h3 className="text-md font-bold text-white uppercase tracking-wider">Create New Order</h3>
                            <button onClick={() => setShowCreateModal(false)} className="text-zinc-500 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateOrder} className="space-y-4 text-xs">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-zinc-400 block font-semibold">Client Name</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={newOrderForm.customer}
                                        onChange={(e) => setNewOrderForm({...newOrderForm, customer: e.target.value})}
                                        className="w-full h-10 px-3.5 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#FF7A00]/30"
                                        placeholder="e.g. Robert Downey"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-zinc-400 block font-semibold">Email Address</label>
                                    <input 
                                        type="email" 
                                        required
                                        value={newOrderForm.email}
                                        onChange={(e) => setNewOrderForm({...newOrderForm, email: e.target.value})}
                                        className="w-full h-10 px-3.5 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#FF7A00]/30"
                                        placeholder="robert@stark.com"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-zinc-400 block font-semibold">Phone Number</label>
                                    <input 
                                        type="text" 
                                        value={newOrderForm.phone}
                                        onChange={(e) => setNewOrderForm({...newOrderForm, phone: e.target.value})}
                                        className="w-full h-10 px-3.5 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#FF7A00]/30"
                                        placeholder="+1 (555) 012-3456"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-zinc-400 block font-semibold">Amount / Price</label>
                                    <input 
                                        type="text" 
                                        value={newOrderForm.amount}
                                        onChange={(e) => setNewOrderForm({...newOrderForm, amount: e.target.value})}
                                        className="w-full h-10 px-3.5 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#FF7A00]/30"
                                        placeholder="$149.00"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-zinc-400 block font-semibold">Career Service</label>
                                    <select 
                                        value={newOrderForm.service}
                                        onChange={(e) => setNewOrderForm({...newOrderForm, service: e.target.value})}
                                        className="w-full h-10 px-3 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none"
                                    >
                                        {serviceOptions.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-zinc-400 block font-semibold">Package Tier</label>
                                    <select 
                                        value={newOrderForm.packageType}
                                        onChange={(e) => setNewOrderForm({...newOrderForm, packageType: e.target.value})}
                                        className="w-full h-10 px-3 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none"
                                    >
                                        <option value="Starter">Starter</option>
                                        <option value="Professional">Professional</option>
                                        <option value="Executive">Executive</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-zinc-400 block font-semibold">Assigned Staff</label>
                                    <select 
                                        value={newOrderForm.assignedStaff}
                                        onChange={(e) => setNewOrderForm({...newOrderForm, assignedStaff: e.target.value})}
                                        className="w-full h-10 px-3 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none"
                                    >
                                        {staffOptions.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-zinc-400 block font-semibold">Priority</label>
                                    <select 
                                        value={newOrderForm.priority}
                                        onChange={(e) => setNewOrderForm({...newOrderForm, priority: e.target.value as any})}
                                        className="w-full h-10 px-3 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none"
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                        <option value="Urgent">Urgent</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-zinc-400 block font-semibold">Notes / Requirements</label>
                                <textarea 
                                    value={newOrderForm.notes}
                                    onChange={(e) => setNewOrderForm({...newOrderForm, notes: e.target.value})}
                                    className="w-full h-20 p-2 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none resize-none"
                                    placeholder="e.g. Focusing on AWS and Cloud migrations..."
                                />
                            </div>

                            <div className="flex gap-3 justify-end pt-4 border-t border-white/5">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-medium text-white transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionLoading === 'create'}
                                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-sm font-bold text-white transition-all flex items-center gap-1.5"
                                >
                                    {actionLoading === 'create' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Assign Staff Modal */}
            {showAssignModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="relative w-full max-w-md rounded-2xl bg-[#0d1117] border border-white/10 shadow-2xl p-6">
                        <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
                            <h3 className="text-md font-bold text-white uppercase tracking-wider">Assign Staff</h3>
                            <button onClick={() => setShowAssignModal(false)} className="text-zinc-500 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-zinc-400 mb-2 block font-semibold">Choose staff member</label>
                                <select
                                    value={assignStaffName}
                                    onChange={(e) => setAssignStaffName(e.target.value)}
                                    className="w-full h-11 px-3 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF7A00]/30 cursor-pointer"
                                >
                                    {staffOptions.map(staff => (
                                        <option key={staff} value={staff}>{staff}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-3 justify-end pt-3 border-t border-white/5">
                                <button
                                    onClick={() => setShowAssignModal(false)}
                                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAssignStaff}
                                    disabled={actionLoading === 'assign'}
                                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-xs font-bold text-white transition-all flex items-center gap-1.5"
                                >
                                    {actionLoading === 'assign' ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : 'Assign Staff'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Update Modal */}
            {showBulkModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="relative w-full max-w-md rounded-2xl bg-[#0d1117] border border-white/10 shadow-2xl p-6">
                        <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
                            <h3 className="text-md font-bold text-white uppercase tracking-wider">Bulk Update Status</h3>
                            <button onClick={() => setShowBulkModal(false)} className="text-zinc-500 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-zinc-400 mb-3">You have selected <span className="text-white font-bold">{selectedOrders.length}</span> orders. Select new status below:</p>
                                <select
                                    value={bulkStatus}
                                    onChange={(e) => setBulkStatus(e.target.value as any)}
                                    className="w-full h-11 px-3 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF7A00]/30 cursor-pointer"
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Assigned">Assigned</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Client Review">Client Review</option>
                                    <option value="Revision">Revision</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Cancelled">Cancelled</option>
                                    <option value="Overdue">Overdue</option>
                                </select>
                            </div>
                            <div className="flex gap-3 justify-end pt-3 border-t border-white/5">
                                <button
                                    onClick={() => setShowBulkModal(false)}
                                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleBulkUpdate}
                                    disabled={actionLoading === 'bulk'}
                                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-xs font-bold text-white transition-all flex items-center gap-1.5"
                                >
                                    {actionLoading === 'bulk' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Status'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
