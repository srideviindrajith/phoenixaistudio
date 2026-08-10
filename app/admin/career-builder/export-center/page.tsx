'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  FileText,
  Image as ImageIcon,
  Code,
  Info,
  Calendar,
  HardDrive,
  CheckCircle,
  Clock,
  X,
  Archive,
  RefreshCw,
  History,
  DownloadCloud,
  BarChart3,
  Square,
  SquareCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ModuleToggle } from '@/components/admin/module-toggle';

type FileType = 'pdf' | 'docx' | 'png' | 'json';

interface ExportHistory {
  id: string;
  type: 'single' | 'bulk' | 'zip';
  assetIds: string[];
  exportedAt: Date;
  status: 'completed' | 'failed';
  fileName?: string;
}

interface DownloadProgress {
  assetId: string;
  progress: number;
  status: 'downloading' | 'completed' | 'failed';
}

interface Asset {
  id: string;
  name: string;
  type: FileType;
  size: number;
  createdAt: Date;
  status: 'ready' | 'processing' | 'failed';
  url: string;
  metadata?: {
    templateId?: string;
    formType?: string;
    generatedBy?: string;
  };
}

export default function ExportCenterPage() {
  const [assets, setAssets] = useState<Asset[]>([
    {
      id: '1',
      name: 'john_doe_resume.pdf',
      type: 'pdf',
      size: 245760,
      createdAt: new Date('2026-07-15'),
      status: 'ready',
      url: '#',
      metadata: {
        templateId: 'template-001',
        formType: 'resume',
        generatedBy: 'AI Generator'
      }
    },
    {
      id: '2',
      name: 'john_doe_portfolio.docx',
      type: 'docx',
      size: 512000,
      createdAt: new Date('2026-07-16'),
      status: 'ready',
      url: '#',
      metadata: {
        templateId: 'template-002',
        formType: 'portfolio',
        generatedBy: 'AI Generator'
      }
    },
    {
      id: '3',
      name: 'resume_thumbnail.png',
      type: 'png',
      size: 128000,
      createdAt: new Date('2026-07-17'),
      status: 'ready',
      url: '#',
      metadata: {
        templateId: 'template-001',
        formType: 'resume',
        generatedBy: 'AI Generator'
      }
    },
    {
      id: '4',
      name: 'cover_letter_data.json',
      type: 'json',
      size: 4096,
      createdAt: new Date('2026-07-18'),
      status: 'ready',
      url: '#',
      metadata: {
        templateId: 'template-003',
        formType: 'cover-letter',
        generatedBy: 'AI Generator'
      }
    },
    {
      id: '5',
      name: 'jane_smith_resume.pdf',
      type: 'pdf',
      size: 262144,
      createdAt: new Date('2026-07-18'),
      status: 'processing',
      url: '#',
      metadata: {
        templateId: 'template-001',
        formType: 'resume',
        generatedBy: 'AI Generator'
      }
    }
  ]);

  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | FileType>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'ready' | 'processing' | 'failed'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());
  const [exportHistory, setExportHistory] = useState<ExportHistory[]>([
    {
      id: '1',
      type: 'single',
      assetIds: ['1'],
      exportedAt: new Date('2026-07-18'),
      status: 'completed',
      fileName: 'john_doe_resume.pdf'
    },
    {
      id: '2',
      type: 'zip',
      assetIds: ['1', '2', '3'],
      exportedAt: new Date('2026-07-17'),
      status: 'completed',
      fileName: 'john_doe_assets.zip'
    }
  ]);
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress[]>([]);
  const [isBulkExporting, setIsBulkExporting] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showStorageViewer, setShowStorageViewer] = useState(false);
  const intervalsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Cleanup intervals and timeouts on unmount
  useEffect(() => {
    return () => {
      intervalsRef.current.forEach(clearInterval);
      timeoutsRef.current.forEach(clearTimeout);
      intervalsRef.current.clear();
      timeoutsRef.current.clear();
    };
  }, []);

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || asset.type === filterType;
    const matchesStatus = filterStatus === 'all' || asset.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleDownload = useCallback((asset: Asset) => {
    // Simulate download with progress
    setDownloadProgress(prev => [...prev, { assetId: asset.id, progress: 0, status: 'downloading' }]);
    
    let progress = 0;
    const intervalId = setInterval(() => {
      progress += 20;
      setDownloadProgress(prev => 
        prev.map(p => p.assetId === asset.id ? { ...p, progress } : p)
      );
      
      if (progress >= 100) {
        clearInterval(intervalId);
        intervalsRef.current.delete(asset.id);
        
        setDownloadProgress(prev => 
          prev.map(p => p.assetId === asset.id ? { ...p, progress: 100, status: 'completed' } : p)
        );
        
        // Add to export history
        const newHistory: ExportHistory = {
          id: Date.now().toString(),
          type: 'single',
          assetIds: [asset.id],
          exportedAt: new Date(),
          status: 'completed',
          fileName: asset.name
        };
        setExportHistory(prev => [newHistory, ...prev]);
        
        const timeoutId = setTimeout(() => {
          setDownloadProgress(prev => prev.filter(p => p.assetId !== asset.id));
          timeoutsRef.current.delete(asset.id);
        }, 2000);
        timeoutsRef.current.set(asset.id, timeoutId);
      }
    }, 200);
    intervalsRef.current.set(asset.id, intervalId);
  }, []);

  const handleSelectAsset = useCallback((assetId: string) => {
    setSelectedAssets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(assetId)) {
        newSet.delete(assetId);
      } else {
        newSet.add(assetId);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    const readyAssetIds = filteredAssets.filter(a => a.status === 'ready').map(a => a.id);
    if (selectedAssets.size === readyAssetIds.length) {
      setSelectedAssets(new Set());
    } else {
      setSelectedAssets(new Set(readyAssetIds));
    }
  }, [filteredAssets, selectedAssets.size]);

  const handleBulkExport = useCallback(async () => {
    if (selectedAssets.size === 0) return;
    setIsBulkExporting(true);
    
    // Simulate bulk export
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const newHistory: ExportHistory = {
      id: Date.now().toString(),
      type: 'bulk',
      assetIds: Array.from(selectedAssets),
      exportedAt: new Date(),
      status: 'completed'
    };
    setExportHistory(prev => [newHistory, ...prev]);
    setSelectedAssets(new Set());
    setIsBulkExporting(false);
  }, [selectedAssets]);

  const handleZipExport = useCallback(async () => {
    if (selectedAssets.size === 0) return;
    setIsZipping(true);
    
    // Simulate ZIP creation
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    const newHistory: ExportHistory = {
      id: Date.now().toString(),
      type: 'zip',
      assetIds: Array.from(selectedAssets),
      exportedAt: new Date(),
      status: 'completed',
      fileName: `export_${Date.now()}.zip`
    };
    setExportHistory(prev => [newHistory, ...prev]);
    setSelectedAssets(new Set());
    setIsZipping(false);
  }, [selectedAssets]);

  const handleDownloadAll = useCallback(async () => {
    const readyAssets = assets.filter(a => a.status === 'ready');
    if (readyAssets.length === 0) return;
    
    // Download all ready assets
    readyAssets.forEach(asset => {
      handleDownload(asset);
    });
  }, [assets, handleDownload]);

  const handleRetryFailed = useCallback(async (assetId: string) => {
    setAssets(prev => prev.map(a => 
      a.id === assetId ? { ...a, status: 'processing' as const } : a
    ));
    
    // Simulate retry
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setAssets(prev => prev.map(a => 
      a.id === assetId ? { ...a, status: 'ready' as const } : a
    ));
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (type: FileType) => {
    switch (type) {
      case 'pdf': return <FileText className="w-5 h-5 text-red-400" />;
      case 'docx': return <FileText className="w-5 h-5 text-blue-400" />;
      case 'png': return <ImageIcon className="w-5 h-5 text-green-400" />;
      case 'json': return <Code className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getStatusBadge = (status: Asset['status']) => {
    switch (status) {
      case 'ready':
        return <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">Ready</span>;
      case 'processing':
        return <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">Processing</span>;
      case 'failed':
        return <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">Failed</span>;
    }
  };

  return (
    <div className="max-w-7xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-white md:text-3xl">Export Center</h1>
        <p className="text-gray-400 text-sm mt-1">Manage generated assets and downloads</p>
      </div>

      {/* Module Toggle */}
      <div>
        <ModuleToggle moduleKey="export-center" moduleName="Export Center" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Asset List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search & Filters */}
          <div className="phoenix-card p-4 border border-white/[0.04]">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search assets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="phoenix-input w-full py-2.5 pl-10 pr-4"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all',
                  showFilters 
                    ? 'bg-[#00D4FF] text-black' 
                    : 'bg-white/[0.05] text-gray-400 hover:bg-white/[0.1] hover:text-white border border-white/[0.04]'
                )}
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
            </div>

            {showFilters && (
              <div className="mt-4 pt-4 border-t border-white/[0.04] grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">File Type</label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className="phoenix-input w-full py-2 px-3 text-sm"
                  >
                    <option value="all">All Types</option>
                    <option value="pdf">PDF</option>
                    <option value="docx">DOCX</option>
                    <option value="png">PNG</option>
                    <option value="json">JSON</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="phoenix-input w-full py-2 px-3 text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="ready">Ready</option>
                    <option value="processing">Processing</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Asset List */}
          <div className="phoenix-card p-6 border border-white/[0.04]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <HardDrive className="w-5 h-5 text-[#00D4FF]" />
                  Assets
                </h2>
                <span className="text-xs text-gray-500">{filteredAssets.length} assets</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSelectAll}
                  className="text-xs text-[#00D4FF] hover:text-[#0099CC] font-semibold"
                >
                  {selectedAssets.size === filteredAssets.filter(a => a.status === 'ready').length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedAssets.size > 0 && (
              <div className="mb-4 p-3 rounded-xl bg-[#00D4FF]/5 border border-[#00D4FF]/30">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white font-semibold">{selectedAssets.size} selected</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleBulkExport}
                      disabled={isBulkExporting}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#00D4FF] text-black text-xs font-semibold hover:bg-[#0099CC] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <DownloadCloud className="w-3 h-3" />
                      {isBulkExporting ? 'Exporting...' : 'Bulk Export'}
                    </button>
                    <button
                      onClick={handleZipExport}
                      disabled={isZipping}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.1] text-white text-xs font-semibold hover:bg-white/[0.2] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Archive className="w-3 h-3" />
                      {isZipping ? 'Zipping...' : 'ZIP Export'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Download All Button */}
            <div className="mb-4">
              <button
                onClick={handleDownloadAll}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-gray-300 hover:text-white text-sm font-semibold transition-all border border-white/[0.04]"
              >
                <Download className="w-4 h-4" />
                Download All Ready Assets
              </button>
            </div>

            <div className="space-y-2">
              {filteredAssets.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <HardDrive className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No assets found</p>
                </div>
              ) : (
                filteredAssets.map((asset) => {
                  const progress = downloadProgress.find(p => p.assetId === asset.id);
                  const isSelected = selectedAssets.has(asset.id);
                  
                  return (
                    <div
                      key={asset.id}
                      className={cn(
                        'group flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer',
                        selectedAsset?.id === asset.id
                          ? 'border-[#00D4FF]/30 bg-[#00D4FF]/5'
                          : 'border-white/[0.04] hover:border-white/[0.1] hover:bg-white/[0.02]'
                      )}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectAsset(asset.id);
                        }}
                        disabled={asset.status !== 'ready'}
                        className="flex-shrink-0"
                      >
                        {isSelected ? (
                          <SquareCheck className="w-5 h-5 text-[#00D4FF]" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-500" />
                        )}
                      </button>
                      <div className="w-10 h-10 rounded-lg bg-white/[0.05] flex items-center justify-center flex-shrink-0">
                        {getFileIcon(asset.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{asset.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-gray-500">{formatFileSize(asset.size)}</p>
                          <span className="text-gray-600">•</span>
                          <p className="text-xs text-gray-500">{asset.createdAt.toLocaleDateString()}</p>
                        </div>
                        {progress && progress.status === 'downloading' && (
                          <div className="mt-2">
                            <div className="w-full bg-white/[0.1] rounded-full h-1.5">
                              <div 
                                className="bg-[#00D4FF] h-1.5 rounded-full transition-all"
                                style={{ width: `${progress.progress}%` }}
                              />
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1">Downloading... {progress.progress}%</p>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {getStatusBadge(asset.status)}
                        {asset.status === 'failed' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRetryFailed(asset.id);
                            }}
                            className="p-2 rounded-lg hover:bg-white/[0.1] text-yellow-400 hover:text-yellow-300 transition-all"
                            title="Retry"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(asset);
                          }}
                          disabled={asset.status !== 'ready' || progress?.status === 'downloading'}
                          className="p-2 rounded-lg hover:bg-white/[0.1] text-gray-400 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Asset Details, History & Storage */}
        <div className="space-y-6">
          {/* Toggle Buttons */}
          <div className="phoenix-card p-3 border border-white/[0.04]">
            <div className="flex gap-2">
              <button
                onClick={() => setShowHistory(false)}
                className={cn(
                  'flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all',
                  !showHistory
                    ? 'bg-[#00D4FF] text-black'
                    : 'bg-white/[0.05] text-gray-400 hover:bg-white/[0.1]'
                )}
              >
                <Info className="w-3 h-3 inline mr-1" />
                Details
              </button>
              <button
                onClick={() => setShowHistory(true)}
                className={cn(
                  'flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all',
                  showHistory
                    ? 'bg-[#00D4FF] text-black'
                    : 'bg-white/[0.05] text-gray-400 hover:bg-white/[0.1]'
                )}
              >
                <History className="w-3 h-3 inline mr-1" />
                History
              </button>
              <button
                onClick={() => setShowStorageViewer(!showStorageViewer)}
                className={cn(
                  'flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all',
                  showStorageViewer
                    ? 'bg-[#00D4FF] text-black'
                    : 'bg-white/[0.05] text-gray-400 hover:bg-white/[0.1]'
                )}
              >
                <BarChart3 className="w-3 h-3 inline mr-1" />
                Storage
              </button>
            </div>
          </div>

          {/* Asset Details */}
          {!showHistory && !showStorageViewer && (
            <>
              {selectedAsset ? (
                <div className="phoenix-card p-6 border border-white/[0.04]">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <Info className="w-5 h-5 text-[#00D4FF]" />
                      Asset Details
                    </h2>
                    <button
                      onClick={() => setSelectedAsset(null)}
                      className="p-1 rounded-lg hover:bg-white/[0.1] text-gray-400 hover:text-white transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* File Preview */}
                    <div className="w-full aspect-video rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 rounded-xl bg-white/[0.05] flex items-center justify-center mx-auto mb-3">
                          {getFileIcon(selectedAsset.type)}
                        </div>
                        <p className="text-sm text-gray-400">{selectedAsset.name}</p>
                      </div>
                    </div>

                    {/* File Info */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Name</span>
                        <span className="text-sm font-semibold text-white text-right">{selectedAsset.name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Type</span>
                        <span className="text-sm font-semibold text-white uppercase">{selectedAsset.type}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Size</span>
                        <span className="text-sm font-semibold text-white">{formatFileSize(selectedAsset.size)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Created</span>
                        <span className="text-sm font-semibold text-white">{selectedAsset.createdAt.toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Status</span>
                        {getStatusBadge(selectedAsset.status)}
                      </div>
                    </div>

                    {/* Metadata */}
                    {selectedAsset.metadata && (
                      <div className="pt-4 border-t border-white/[0.04]">
                        <h3 className="text-sm font-semibold text-white mb-3">Metadata</h3>
                        <div className="space-y-2">
                          {selectedAsset.metadata.templateId && (
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-400">Template ID</span>
                              <span className="text-xs font-semibold text-white">{selectedAsset.metadata.templateId}</span>
                            </div>
                          )}
                          {selectedAsset.metadata.formType && (
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-400">Form Type</span>
                              <span className="text-xs font-semibold text-white capitalize">{selectedAsset.metadata.formType}</span>
                            </div>
                          )}
                          {selectedAsset.metadata.generatedBy && (
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-400">Generated By</span>
                              <span className="text-xs font-semibold text-white">{selectedAsset.metadata.generatedBy}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Download Button */}
                    <button
                      onClick={() => handleDownload(selectedAsset)}
                      disabled={selectedAsset.status !== 'ready'}
                      className={cn(
                        'w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all',
                        selectedAsset.status === 'ready'
                          ? 'bg-[#00D4FF] text-black hover:bg-[#0099CC]'
                          : 'bg-white/[0.05] text-gray-400 cursor-not-allowed'
                      )}
                    >
                      <Download className="w-4 h-4" />
                      {selectedAsset.status === 'ready' ? 'Download Asset' : 'Not Ready'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="phoenix-card p-6 border border-white/[0.04]">
                  <div className="text-center py-12">
                    <Info className="w-12 h-12 mx-auto mb-3 text-gray-500 opacity-50" />
                    <p className="text-sm text-gray-500">Select an asset to view details</p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Export History */}
          {showHistory && (
            <div className="phoenix-card p-6 border border-white/[0.04]">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <History className="w-5 h-5 text-[#00D4FF]" />
                Export History
              </h2>
              
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {exportHistory.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <History className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No export history</p>
                  </div>
                ) : (
                  exportHistory.map((history) => (
                    <div key={history.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-white capitalize">{history.type}</span>
                        <span className={cn(
                          'text-[10px] px-2 py-0.5 rounded-full',
                          history.status === 'completed'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        )}>
                          {history.status}
                        </span>
                      </div>
                      {history.fileName && (
                        <p className="text-xs text-gray-400 mb-1">{history.fileName}</p>
                      )}
                      <p className="text-[10px] text-gray-500 mb-1">{history.exportedAt.toLocaleString()}</p>
                      <p className="text-[10px] text-gray-500">{history.assetIds.length} asset(s)</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Storage Viewer */}
          {showStorageViewer && (
            <div className="phoenix-card p-6 border border-white/[0.04]">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#00D4FF]" />
                Storage Viewer
              </h2>
              
              <div className="space-y-4">
                {/* Storage by Type */}
                <div>
                  <h3 className="text-sm font-semibold text-white mb-3">By File Type</h3>
                  <div className="space-y-2">
                    {(['pdf', 'docx', 'png', 'json'] as FileType[]).map(type => {
                      const typeAssets = assets.filter(a => a.type === type);
                      const typeSize = typeAssets.reduce((acc, a) => acc + a.size, 0);
                      const totalSize = assets.reduce((acc, a) => acc + a.size, 0);
                      const percentage = totalSize > 0 ? (typeSize / totalSize) * 100 : 0;
                      
                      return (
                        <div key={type}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-400 uppercase">{type}</span>
                            <span className="text-xs text-white">{formatFileSize(typeSize)}</span>
                          </div>
                          <div className="w-full bg-white/[0.1] rounded-full h-2">
                            <div 
                              className={cn(
                                'h-2 rounded-full transition-all',
                                type === 'pdf' ? 'bg-red-400' :
                                type === 'docx' ? 'bg-blue-400' :
                                type === 'png' ? 'bg-green-400' :
                                'bg-yellow-400'
                              )}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-gray-500 mt-1">{typeAssets.length} files ({percentage.toFixed(1)}%)</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Storage by Status */}
                <div className="pt-4 border-t border-white/[0.04]">
                  <h3 className="text-sm font-semibold text-white mb-3">By Status</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Ready</span>
                      <span className="text-xs text-green-400">{assets.filter(a => a.status === 'ready').length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Processing</span>
                      <span className="text-xs text-yellow-400">{assets.filter(a => a.status === 'processing').length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Failed</span>
                      <span className="text-xs text-red-400">{assets.filter(a => a.status === 'failed').length}</span>
                    </div>
                  </div>
                </div>

                {/* Total Storage */}
                <div className="pt-4 border-t border-white/[0.04]">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Total Storage</span>
                    <span className="text-sm font-semibold text-white">{formatFileSize(assets.reduce((acc, a) => acc + a.size, 0))}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-gray-400">Total Files</span>
                    <span className="text-sm font-semibold text-white">{assets.length}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Stats */}
          {!showHistory && !showStorageViewer && (
            <div className="phoenix-card p-6 border border-white/[0.04]">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-[#00D4FF]" />
                Quick Stats
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Total Assets</span>
                  <span className="text-sm font-semibold text-white">{assets.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Ready</span>
                  <span className="text-sm font-semibold text-green-400">{assets.filter(a => a.status === 'ready').length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Processing</span>
                  <span className="text-sm font-semibold text-yellow-400">{assets.filter(a => a.status === 'processing').length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Failed</span>
                  <span className="text-sm font-semibold text-red-400">{assets.filter(a => a.status === 'failed').length}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
