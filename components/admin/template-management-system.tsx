'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import DOMPurify from 'dompurify';
import { 
    Search, 
    Plus, 
    Eye, 
    Edit, 
    Trash2, 
    Copy, 
    Archive, 
    ArchiveRestore,
    History,
    Grid3X3,
    List,
    MoreVertical,
    CheckCircle,
    FileText,
    Globe,
    X,
    Sparkles,
    Clock,
    Download,
    Filter,
    ArrowUpDown
} from 'lucide-react';
import { StatsCard } from '@/components/admin/stats-card';

export interface Template {
    id: string;
    name: string;
    category: 'resume' | 'portfolio' | 'cover-letter';
    theme?: string;
    htmlContent?: string;
    cssContent?: string;
    thumbnail?: string | null;
    samplePdf?: string | null;
    status: 'published' | 'draft' | 'archived';
    version?: string;
    createdAt: Date | string;
    updatedAt: Date | string;
    prompt?: string;
    tags?: string[];
    metadata?: Record<string, any>;
}

interface TemplateManagementSystemProps {
    category: 'resume' | 'portfolio' | 'cover-letter';
    title: string;
    description: string;
    onOpenTemplate?: (template: Template) => void;
}

export function TemplateManagementSystem({ 
    category, 
    title, 
    description,
    onOpenTemplate 
}: TemplateManagementSystemProps) {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all');
    const [themeFilter, setThemeFilter] = useState('all');
    const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name-asc' | 'name-desc' | 'updated'>('newest');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    
    // Modal states
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);
    const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
    const [versionHistoryTemplate, setVersionHistoryTemplate] = useState<Template | null>(null);
    const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
    const [renameTemplate, setRenameTemplate] = useState<Template | null>(null);
    const [newName, setNewName] = useState('');

    const fetchTemplates = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/career-builder/templates?category=${category}`);
            const data = await res.json();
            setTemplates(data.templates || []);
        } catch (error) {
            console.error('Error fetching templates:', error);
        } finally {
            setLoading(false);
        }
    }, [category]);

    useEffect(() => {
        fetchTemplates();
    }, [fetchTemplates]);

    // Statistics
    const stats = [
        { title: 'Total Templates', value: templates.length, icon: FileText },
        { title: 'Published', value: templates.filter(t => t.status === 'published').length, icon: CheckCircle },
        { title: 'Drafts', value: templates.filter(t => t.status === 'draft').length, icon: Sparkles },
        { title: 'Archived', value: templates.filter(t => t.status === 'archived').length, icon: Archive },
        { 
            title: 'Last Published', 
            value: templates.filter(t => t.status === 'published').length > 0 
                ? new Date(Math.max(...templates.filter(t => t.status === 'published').map(t => new Date(t.updatedAt).getTime()))).toLocaleDateString()
                : 'N/A', 
            icon: Clock 
        }
    ];

    // Filter and sort templates
    const filteredTemplates = useMemo(() => 
        templates
            .filter(t => {
                const matchesCategory = t.category === category;
                const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
                const matchesTheme = themeFilter === 'all' || (t.theme === themeFilter);
                const matchesSearch = searchQuery === '' || 
                    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (t.theme && t.theme.toLowerCase().includes(searchQuery.toLowerCase())) ||
                    (t.prompt && t.prompt.toLowerCase().includes(searchQuery.toLowerCase())) ||
                    (t.tags && t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
                return matchesCategory && matchesStatus && matchesTheme && matchesSearch;
            })
            .sort((a, b) => {
                switch (sortBy) {
                    case 'newest':
                        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                    case 'oldest':
                        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                    case 'name-asc':
                        return a.name.localeCompare(b.name);
                    case 'name-desc':
                        return b.name.localeCompare(a.name);
                    case 'updated':
                        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
                    default:
                        return 0;
                }
            }),
        [templates, category, statusFilter, themeFilter, searchQuery, sortBy]
    );

    // Get unique themes for filter
    const themes = useMemo(() => 
        Array.from(new Set(templates.map(t => t.theme).filter(Boolean))) as string[],
        [templates]
    );

    // Actions
    const handleSelectAll = useCallback(() => {
        if (selectedIds.length === filteredTemplates.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredTemplates.map(t => t.id));
        }
    }, [selectedIds, filteredTemplates]);

    const handleSelectTemplate = useCallback((id: string) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    }, []);

    const handleArchive = useCallback(async (id: string) => {
        try {
            await fetch(`/api/career-builder/templates/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ category, status: 'archived' })
            });
            fetchTemplates();
        } catch (error) {
            console.error('Error archiving template:', error);
        }
    }, [category, fetchTemplates]);

    const handleRestore = useCallback(async (id: string) => {
        try {
            await fetch(`/api/career-builder/templates/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ category, status: 'draft' })
            });
            fetchTemplates();
        } catch (error) {
            console.error('Error restoring template:', error);
        }
    }, [category, fetchTemplates]);

    const handleDelete = useCallback(async (id: string) => {
        if (!confirm('Are you sure you want to delete this template? This is a soft delete and can be restored.')) return;
        
        try {
            await fetch(`/api/career-builder/templates/${id}?category=${category}`, {
                method: 'DELETE'
            });
            fetchTemplates();
        } catch (error) {
            console.error('Error deleting template:', error);
        }
    }, [category, fetchTemplates]);

    const handleDuplicate = useCallback(async (template: Template) => {
        try {
            // Increment version
            const currentVersion = template.version || '1.0';
            const versionParts = currentVersion.split('.').map(Number);
            const newVersion = `${versionParts[0]}.${(versionParts[1] || 0) + 1}`;

            const response = await fetch('/api/career-builder/templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: `${template.name} (Copy)`,
                    category: template.category,
                    htmlContent: template.htmlContent,
                    cssContent: template.cssContent,
                    thumbnail: template.thumbnail,
                    status: 'draft',
                    theme: template.theme,
                    prompt: template.prompt,
                    tags: template.tags,
                    metadata: template.metadata,
                    version: newVersion
                })
            });
            if (response.ok) {
                fetchTemplates();
            }
        } catch (error) {
            console.error('Error duplicating template:', error);
        }
    }, [fetchTemplates]);

    const handleRename = useCallback(async () => {
        if (!renameTemplate || !newName.trim()) return;
        
        try {
            await fetch(`/api/career-builder/templates/${renameTemplate.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ category, name: newName })
            });
            fetchTemplates();
            setIsRenameModalOpen(false);
            setRenameTemplate(null);
            setNewName('');
        } catch (error) {
            console.error('Error renaming template:', error);
        }
    }, [renameTemplate, newName, category, fetchTemplates]);

    const handleBulkArchive = useCallback(async () => {
        if (selectedIds.length === 0) return;
        
        try {
            await Promise.all(selectedIds.map(id => 
                fetch(`/api/career-builder/templates/${id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ category, status: 'archived' })
                })
            ));
            setSelectedIds([]);
            fetchTemplates();
        } catch (error) {
            console.error('Error bulk archiving templates:', error);
        }
    }, [selectedIds, category, fetchTemplates]);

    const handleBulkDelete = useCallback(async () => {
        if (selectedIds.length === 0) return;
        if (!confirm(`Are you sure you want to delete ${selectedIds.length} templates?`)) return;
        
        try {
            await Promise.all(selectedIds.map(id => 
                fetch(`/api/career-builder/templates/${id}?category=${category}`, {
                    method: 'DELETE'
                })
            ));
            setSelectedIds([]);
            fetchTemplates();
        } catch (error) {
            console.error('Error bulk deleting templates:', error);
        }
    }, [selectedIds, category, fetchTemplates]);

    const handleBulkPublish = useCallback(async () => {
        if (selectedIds.length === 0) return;
        
        try {
            await Promise.all(selectedIds.map(id => 
                fetch(`/api/career-builder/templates/${id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ category, status: 'published' })
                })
            ));
            setSelectedIds([]);
            fetchTemplates();
        } catch (error) {
            console.error('Error bulk publishing templates:', error);
        }
    }, [selectedIds, category, fetchTemplates]);

    const openPreview = useCallback((template: Template) => {
        setPreviewTemplate(template);
        setIsPreviewOpen(true);
    }, []);

    const openVersionHistory = useCallback((template: Template) => {
        setVersionHistoryTemplate(template);
        setIsVersionHistoryOpen(true);
    }, []);

    const openRenameModal = useCallback((template: Template) => {
        setRenameTemplate(template);
        setNewName(template.name);
        setIsRenameModalOpen(true);
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'published':
                return 'bg-green-500/10 border-green-500/20 text-green-400';
            case 'draft':
                return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400';
            case 'archived':
                return 'bg-zinc-500/10 border-zinc-500/20 text-zinc-400';
            default:
                return 'bg-zinc-500/10 border-zinc-500/20 text-zinc-400';
        }
    };

    return (
        <div className="max-w-[1800px] mx-auto space-y-6 text-white animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="font-heading text-2xl font-bold text-white md:text-3xl">{title}</h1>
                    <p className="text-gray-400 text-sm md:text-base mt-1">{description}</p>
                </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
                {stats.map((stat, idx) => (
                    <StatsCard
                        key={idx}
                        title={stat.title}
                        value={stat.value}
                        icon={stat.icon}
                        className="col-span-1"
                    />
                ))}
            </div>

            {/* Search, Filter, Sort, View Toggle */}
            <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
                <div className="flex flex-1 flex-col sm:flex-row gap-3 items-stretch sm:items-center max-w-4xl">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                            type="text"
                            placeholder="Search by name, prompt, tags..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-11 pl-10 pr-4 rounded-xl border border-white/[0.08] bg-white/[0.02] text-xs text-zinc-400 placeholder-zinc-600 focus:outline-none focus:border-[#FF6A00]/50"
                        />
                    </div>
                    
                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="h-11 px-4 rounded-xl border border-white/[0.08] bg-[#0c0c0c] text-xs text-zinc-400 focus:outline-none focus:border-[#FF6A00]/50 appearance-none cursor-pointer min-w-[140px]"
                    >
                        <option value="all">All Status</option>
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                        <option value="archived">Archived</option>
                    </select>

                    {themes.length > 0 && (
                        <select 
                            value={themeFilter}
                            onChange={(e) => setThemeFilter(e.target.value)}
                            className="h-11 px-4 rounded-xl border border-white/[0.08] bg-[#0c0c0c] text-xs text-zinc-400 focus:outline-none focus:border-[#FF6A00]/50 appearance-none cursor-pointer min-w-[140px]"
                        >
                            <option value="all">All Themes</option>
                            {themes.map(theme => (
                                <option key={theme} value={theme}>{theme}</option>
                            ))}
                        </select>
                    )}

                    <select 
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="h-11 px-4 rounded-xl border border-white/[0.08] bg-[#0c0c0c] text-xs text-zinc-400 focus:outline-none focus:border-[#FF6A00]/50 appearance-none cursor-pointer min-w-[140px]"
                    >
                        <option value="newest">Newest</option>
                        <option value="oldest">Oldest</option>
                        <option value="name-asc">Name A-Z</option>
                        <option value="name-desc">Name Z-A</option>
                        <option value="updated">Recently Updated</option>
                    </select>
                </div>

                <div className="flex gap-3 items-center">
                    {/* View Toggle */}
                    <div className="flex border border-white/[0.08] rounded-xl overflow-hidden">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-3 ${viewMode === 'grid' ? 'bg-[#FF6A00]/20 text-[#FF6A00]' : 'text-zinc-400 hover:text-white'} transition-colors`}
                        >
                            <Grid3X3 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-3 ${viewMode === 'list' ? 'bg-[#FF6A00]/20 text-[#FF6A00]' : 'text-zinc-400 hover:text-white'} transition-colors`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Bulk Actions */}
                    {selectedIds.length > 0 && (
                        <div className="flex gap-2">
                            <button
                                onClick={handleBulkPublish}
                                className="h-11 px-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold hover:bg-green-500/20 transition-colors"
                            >
                                Publish ({selectedIds.length})
                            </button>
                            <button
                                onClick={handleBulkArchive}
                                className="h-11 px-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-semibold hover:bg-yellow-500/20 transition-colors"
                            >
                                Archive ({selectedIds.length})
                            </button>
                            <button
                                onClick={handleBulkDelete}
                                className="h-11 px-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold hover:bg-red-500/20 transition-colors"
                            >
                                Delete ({selectedIds.length})
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Templates Grid/List */}
            {loading ? (
                <div className="phoenix-card p-12 text-center text-zinc-500 text-xs">
                    Loading templates...
                </div>
            ) : filteredTemplates.length === 0 ? (
                <div className="phoenix-card p-12 text-center text-zinc-500 text-xs">
                    No templates match your filters.
                </div>
            ) : (
                <div className={viewMode === 'grid' 
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' 
                    : 'flex flex-col gap-3'
                }>
                    {filteredTemplates.map((template) => (
                        <div
                            key={template.id}
                            className={`phoenix-card p-4 border transition-all duration-300 ${
                                selectedIds.includes(template.id) 
                                    ? 'border-[#FF6A00] bg-[#FF6A00]/5 shadow-[0_0_15px_rgba(255,106,0,0.1)]' 
                                    : 'border-white/[0.04] hover:border-white/[0.08]'
                            } ${viewMode === 'list' ? 'flex items-center gap-4' : 'flex flex-col'}`}
                        >
                            {/* Selection Checkbox */}
                            <div className={viewMode === 'list' ? 'flex-shrink-0' : 'absolute top-3 right-3'}>
                                <input
                                    type="checkbox"
                                    checked={selectedIds.includes(template.id)}
                                    onChange={() => handleSelectTemplate(template.id)}
                                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-[#FF6A00] focus:ring-[#FF6A00]/50"
                                />
                            </div>

                            {/* Thumbnail */}
                            {template.thumbnail && (
                                <div className={`relative ${viewMode === 'list' ? 'w-16 h-20 flex-shrink-0' : 'w-full aspect-[3/4] mb-4'} rounded-lg overflow-hidden bg-white/[0.02]`}>
                                    <img 
                                        src={template.thumbnail} 
                                        alt={template.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}

                            {/* Content */}
                            <div className={`flex-1 ${viewMode === 'list' ? 'min-w-0' : 'space-y-3'}`}>
                                <div className="space-y-1">
                                    <div className="flex items-start justify-between gap-2">
                                        <h3 className={`font-semibold text-white truncate ${viewMode === 'list' ? 'text-sm' : 'text-base'}`}>
                                            {template.name}
                                        </h3>
                                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider flex-shrink-0 ${getStatusColor(template.status)}`}>
                                            {template.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                                        <span className="capitalize">{template.category}</span>
                                        {template.theme && <span>• {template.theme}</span>}
                                        {template.version && <span>• v{template.version}</span>}
                                    </div>
                                </div>

                                {viewMode === 'grid' && (
                                    <div className="text-[10px] text-zinc-500">
                                        <p>Created: {new Date(template.createdAt).toLocaleDateString()}</p>
                                        <p>Updated: {new Date(template.updatedAt).toLocaleDateString()}</p>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className={`flex gap-2 ${viewMode === 'list' ? 'ml-auto' : 'border-t border-white/[0.06] pt-3'}`}>
                                    <button
                                        onClick={() => openPreview(template)}
                                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-zinc-300 hover:text-white transition-colors"
                                        title="Preview"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    {onOpenTemplate && (
                                        <button
                                            onClick={() => onOpenTemplate(template)}
                                            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-zinc-300 hover:text-white transition-colors"
                                            title="Open"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDuplicate(template)}
                                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-zinc-300 hover:text-white transition-colors"
                                        title="Duplicate"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => openRenameModal(template)}
                                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-zinc-300 hover:text-white transition-colors"
                                        title="Rename"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => openVersionHistory(template)}
                                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-zinc-300 hover:text-white transition-colors"
                                        title="Version History"
                                    >
                                        <History className="w-4 h-4" />
                                    </button>
                                    {template.status === 'archived' ? (
                                        <button
                                            onClick={() => handleRestore(template.id)}
                                            className="p-2 bg-green-500/10 hover:bg-green-500/20 rounded-lg text-green-400 hover:text-green-300 transition-colors"
                                            title="Restore"
                                        >
                                            <ArchiveRestore className="w-4 h-4" />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleArchive(template.id)}
                                            className="p-2 bg-yellow-500/10 hover:bg-yellow-500/20 rounded-lg text-yellow-400 hover:text-yellow-300 transition-colors"
                                            title="Archive"
                                        >
                                            <Archive className="w-4 h-4" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(template.id)}
                                        className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400 hover:text-red-300 transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Preview Modal */}
            {isPreviewOpen && previewTemplate && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="phoenix-card p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">Template Preview</h2>
                            <button
                                onClick={() => setIsPreviewOpen(false)}
                                className="p-2 text-zinc-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Live HTML Preview */}
                        <div className="mb-6 bg-white rounded-lg overflow-hidden">
                            <style>{previewTemplate.cssContent || ''}</style>
                            <div 
                                className="p-8"
                                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(previewTemplate.htmlContent || '') }}
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-xs text-zinc-500 block mb-1">Name</span>
                                    <span className="text-sm font-semibold text-white">{previewTemplate.name}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-zinc-500 block mb-1">Category</span>
                                    <span className="text-sm font-semibold text-white capitalize">{previewTemplate.category}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-zinc-500 block mb-1">Theme</span>
                                    <span className="text-sm font-semibold text-white">{previewTemplate.theme || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-zinc-500 block mb-1">Version</span>
                                    <span className="text-sm font-semibold text-white">{previewTemplate.version || '1.0'}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-zinc-500 block mb-1">Status</span>
                                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${getStatusColor(previewTemplate.status)}`}>
                                        {previewTemplate.status}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-xs text-zinc-500 block mb-1">Created</span>
                                    <span className="text-sm font-semibold text-white">{new Date(previewTemplate.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>

                            {previewTemplate.prompt && (
                                <div>
                                    <span className="text-xs text-zinc-500 block mb-1">Prompt</span>
                                    <p className="text-sm text-zinc-300">{previewTemplate.prompt}</p>
                                </div>
                            )}

                            {previewTemplate.tags && previewTemplate.tags.length > 0 && (
                                <div>
                                    <span className="text-xs text-zinc-500 block mb-1">Tags</span>
                                    <div className="flex flex-wrap gap-2">
                                        {previewTemplate.tags.map((tag, idx) => (
                                            <span key={idx} className="px-2 py-1 bg-white/[0.05] rounded text-xs text-zinc-300">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Version History Modal */}
            {isVersionHistoryOpen && versionHistoryTemplate && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="phoenix-card p-6 max-w-md w-full">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">Version History</h2>
                            <button
                                onClick={() => setIsVersionHistoryOpen(false)}
                                className="p-2 text-zinc-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-semibold text-white">Version {versionHistoryTemplate.version || '1.0'}</span>
                                    <span className="text-xs text-zinc-500">{new Date(versionHistoryTemplate.updatedAt).toLocaleDateString()}</span>
                                </div>
                                <p className="text-xs text-zinc-400">Current version</p>
                            </div>
                            <p className="text-xs text-zinc-500 text-center">Version history feature coming soon</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Rename Modal */}
            {isRenameModalOpen && renameTemplate && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="phoenix-card p-6 max-w-md w-full">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">Rename Template</h2>
                            <button
                                onClick={() => setIsRenameModalOpen(false)}
                                className="p-2 text-zinc-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs text-zinc-500 mb-2">New Name</label>
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    className="w-full h-11 px-4 rounded-xl border border-white/[0.08] bg-white/[0.02] text-white focus:outline-none focus:border-[#FF6A00]/50"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsRenameModalOpen(false)}
                                    className="flex-1 h-11 px-4 rounded-xl bg-white/[0.05] text-zinc-400 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleRename}
                                    className="flex-1 h-11 px-4 rounded-xl bg-[#FF6A00] text-white font-semibold hover:bg-[#FF6A00]/80 transition-colors"
                                >
                                    Rename
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
