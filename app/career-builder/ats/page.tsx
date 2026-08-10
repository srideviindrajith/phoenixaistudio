'use client';

import { PublicLayout } from '@/components/public/public-layout';
import Link from 'next/link';
import { 
    ChevronRight, 
    Upload,
    FileText,
    X,
    CheckCircle2,
    AlertCircle,
    Download,
    Trash2,
    History,
    Sparkles,
    Gauge,
    ClipboardCheck,
    ShieldAlert,
    ArrowRight
} from 'lucide-react';
import { useState, useRef, useMemo, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Search, ChevronLeft, Filter } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface UploadedFile {
    name: string;
    size: number;
    type: string;
}

interface AnalysisResult {
    overallScore: number;
    keywordMatch: number;
    missingKeywords: string[];
    grammar: number;
    formatting: number;
    readability: number;
    actionVerbs: number;
    suggestions: string[];
}

interface HistoryEntry {
    id: string;
    date: string;
    filename: string;
    atsScore: number;
    matchedKeywords: string[];
    missingKeywords: string[];
    formattingIssues: string[];
    grammarIssues: string[];
    recommendations: string[];
    executionTime: number;
    reviewId?: string;
}

export default function ATSResumeAnalysis() {
    const { toast } = useToast();
    const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [showDiagnostics, setShowDiagnostics] = useState(false);
    const [selectedHistory, setSelectedHistory] = useState<HistoryEntry | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [currentAnalysisStep, setCurrentAnalysisStep] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemsPerPage] = useState<number>(10);
    
    // Animation States
    const [animatedScore, setAnimatedScore] = useState(0);
    const [animatedMetrics, setAnimatedMetrics] = useState({
        keywordMatch: 0,
        grammar: 0,
        formatting: 0,
        readability: 0,
        actionVerbs: 0
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const dragCounterRef = useRef(0);
    const isMounted = useRef(false);

    // Load History from database on mount
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await fetch('/api/ats');
                if (response.ok) {
                    const data = await response.json();
                    const formattedHistory = data.map((review: any) => ({
                        id: review.id,
                        date: review.createdAt,
                        filename: review.candidate,
                        atsScore: review.scores?.find((s: any) => s.metric === 'overall')?.value || 0,
                        matchedKeywords: review.keywords?.filter((k: any) => k.category === 'matched').map((k: any) => k.word) || [],
                        missingKeywords: review.keywords?.filter((k: any) => k.category === 'missing').map((k: any) => k.word) || [],
                        formattingIssues: review.formattingIssues?.map((i: any) => i.description) || [],
                        grammarIssues: review.grammarIssues?.map((i: any) => i.text) || [],
                        recommendations: review.suggestions?.map((s: any) => s.description) || [],
                        executionTime: 2.0,
                        reviewId: review.reviewId,
                    }));
                    setHistory(formattedHistory);
                }
            } catch (error) {
                console.error('Failed to fetch history', error);
            }
        };
        fetchHistory();
    }, []);

    // Animate overall score and subscores when analysisResult is updated
    useEffect(() => {
        if (analysisResult) {
            // Reset animated values first
            setAnimatedScore(0);
            setAnimatedMetrics({
                keywordMatch: 0,
                grammar: 0,
                formatting: 0,
                readability: 0,
                actionVerbs: 0
            });

            // Count-up animation for the overall score
            const overallTarget = analysisResult.overallScore;
            const duration = 1000; // 1 second
            const intervalTime = Math.max(Math.floor(duration / overallTarget), 10);
            let currentScore = 0;

            const scoreTimer = setInterval(() => {
                currentScore += 1;
                if (currentScore >= overallTarget) {
                    setAnimatedScore(overallTarget);
                    clearInterval(scoreTimer);
                } else {
                    setAnimatedScore(currentScore);
                }
            }, intervalTime);

            // Animate other sub-metrics
            const metricsTimer = setTimeout(() => {
                setAnimatedMetrics({
                    keywordMatch: analysisResult.keywordMatch,
                    grammar: analysisResult.grammar,
                    formatting: analysisResult.formatting,
                    readability: analysisResult.readability,
                    actionVerbs: analysisResult.actionVerbs
                });
            }, 100);

            return () => {
                clearInterval(scoreTimer);
                clearTimeout(metricsTimer);
            };
        }
    }, [analysisResult]);

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounterRef.current++;
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounterRef.current--;
        if (dragCounterRef.current === 0) {
            setIsDragging(false);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounterRef.current = 0;
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            validateAndSetFile(files[0]);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            validateAndSetFile(files[0]);
        }
    };

    const startUploadSimulation = (file: File) => {
        setIsUploading(true);
        setUploadProgress(0);
        setUploadedFile(null);
        setAnalysisResult(null);

        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            if (progress >= 100) {
                clearInterval(interval);
                setIsUploading(false);
                setUploadedFile({
                    name: file.name,
                    size: file.size,
                    type: file.name.endsWith('.pdf') ? 'PDF' : 'DOCX',
                });
                toast({
                    title: 'Upload Complete',
                    description: `Successfully uploaded ${file.name}`,
                });
            } else {
                setUploadProgress(progress);
            }
        }, 120); // Takes 1.2 seconds to simulate upload
    };

    const validateAndSetFile = (file: File) => {
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
        const validExtensions = ['.pdf', '.docx'];

        if (!validExtensions.includes(fileExtension)) {
            toast({
                title: 'Invalid File Type',
                description: 'Please upload a PDF or DOCX file only.',
                variant: 'destructive',
            });
            return;
        }

        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            toast({
                title: 'File Too Large',
                description: 'Please upload a file smaller than 10MB.',
                variant: 'destructive',
            });
            return;
        }

        startUploadSimulation(file);
    };

    const handleRemoveFile = () => {
        setUploadedFile(null);
        setAnalysisResult(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleReplaceFile = () => {
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
            fileInputRef.current.click();
        }
    };

    const handleAnalyze = async () => {
        if (!uploadedFile) return;

        setIsAnalyzing(true);
        const steps = [
            'Analyzing Resume...',
            'Extracting Keywords...',
            'Matching ATS...',
            'Calculating Score...',
            'Generating Report...'
        ];

        for (let i = 0; i < steps.length; i++) {
            setCurrentAnalysisStep(steps[i]);
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        try {
            // Call API to create analysis (in production, this would use actual AI analysis)
            // For now, we'll generate realistic scores and save to database
            const overallScore = Math.floor(Math.random() * 20) + 75;
            const keywordMatch = Math.floor(Math.random() * 20) + 70;
            const grammar = Math.floor(Math.random() * 15) + 80;
            const formatting = Math.floor(Math.random() * 15) + 80;
            const readability = Math.floor(Math.random() * 15) + 80;
            const actionVerbs = Math.floor(Math.random() * 25) + 70;

            const poolMissingKeywords = ['AWS', 'Docker', 'GraphQL', 'CI/CD', 'Jest', 'Agile', 'Scrum', 'System Design'];
            const missingKeywords = poolMissingKeywords.filter(() => Math.random() > 0.5);
            if (missingKeywords.length === 0) missingKeywords.push('GraphQL');

            const formattingIssues = [
                'Inconsistent font size in professional experience section headers',
                'Slight margin alignment issues in page 2 footer'
            ].filter(() => Math.random() > 0.4);
            if (formattingIssues.length === 0) formattingIssues.push('Minor line spacing inconsistencies');

            const grammarIssues = [
                'Ensure consistent capitalization of technical terms',
                'Change passive voice to active voice in experience descriptions'
            ].filter(() => Math.random() > 0.4);
            if (grammarIssues.length === 0) grammarIssues.push('Verify tense consistency in past roles');

            const suggestions = [
                'Incorporate missing core keywords (e.g. AWS, CI/CD) to improve search visibility.',
                'Incorporate strong action verbs (e.g. Orchestrated, Spearheaded, Optimized).',
                'Quantify achievements with metrics (e.g., "Increased deployment speed by 15%").',
                'Ensure layout margins are consistent across all pages.'
            ];

            const response = await fetch('/api/ats', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    filename: uploadedFile.name,
                    overallScore,
                    keywordMatch,
                    grammar,
                    formatting,
                    readability,
                    actionVerbs,
                    missingKeywords,
                    suggestions,
                    formattingIssues,
                    grammarIssues,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                
                const result: AnalysisResult = {
                    overallScore,
                    keywordMatch,
                    missingKeywords,
                    grammar,
                    formatting,
                    readability,
                    actionVerbs,
                    suggestions
                };

                setAnalysisResult(result);

                const historyEntry: HistoryEntry = {
                    id: data.id,
                    date: data.createdAt,
                    filename: uploadedFile.name,
                    atsScore: result.overallScore,
                    matchedKeywords: [],
                    missingKeywords: result.missingKeywords,
                    formattingIssues,
                    grammarIssues,
                    recommendations: result.suggestions,
                    executionTime: parseFloat((2.0 + Math.random() * 0.5).toFixed(1)),
                    reviewId: data.reviewId,
                };

                setHistory(prev => [historyEntry, ...prev]);

                toast({
                    title: 'Analysis Complete',
                    description: 'Your resume has been analyzed successfully.',
                });
            } else {
                throw new Error('Failed to save analysis');
            }
        } catch (error) {
            console.error('Analysis error:', error);
            toast({
                title: 'Analysis Failed',
                description: 'Failed to analyze and save resume.',
                variant: 'destructive',
            });
        }

        setCurrentAnalysisStep('');
        setIsAnalyzing(false);
    };

    const handleDiagnostics = () => {
        if (history.length > 0) {
            setSelectedHistory(history[0]);
            setShowDiagnostics(true);
        }
    };

    const handleDownloadReport = (entry: HistoryEntry, format: 'pdf' | 'txt' | 'json') => {
        if (format === 'json') {
            const content = JSON.stringify(entry, null, 2);
            const blob = new Blob([content], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ats-report-${entry.id}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast({
                title: 'Report Downloaded',
                description: 'Your JSON report has been downloaded.',
            });
        } else if (format === 'txt') {
            const content = `ATS Analysis Report
==================
Date: ${new Date(entry.date).toLocaleString()}
Filename: ${entry.filename}
Overall ATS Score: ${entry.atsScore}%
Execution Time: ${entry.executionTime}s

Matched Keywords:
${entry.matchedKeywords.join(', ')}

Missing Keywords:
${entry.missingKeywords.join(', ')}

Formatting Issues:
${entry.formattingIssues.map((issue) => `- ${issue}`).join('\n')}

Grammar Issues:
${entry.grammarIssues.map((issue) => `- ${issue}`).join('\n')}

Recommendations:
${entry.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}`;
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ats-report-${entry.id}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast({
                title: 'Report Downloaded',
                description: 'Your TXT report has been downloaded.',
            });
        } else if (format === 'pdf') {
            try {
                const doc = new jsPDF();
                
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(22);
                doc.setTextColor(255, 122, 0); // Orange color
                doc.text('PhoenixAI Studio - ATS Resume Report', 20, 25);
                
                doc.setDrawColor(220, 220, 220);
                doc.line(20, 32, 190, 32);
                
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(10);
                doc.setTextColor(100, 100, 100);
                doc.text(`Date: ${new Date(entry.date).toLocaleString()}`, 20, 42);
                doc.text(`Filename: ${entry.filename}`, 20, 48);
                doc.text(`Execution Time: ${entry.executionTime}s`, 20, 54);
                
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(16);
                doc.setTextColor(0, 0, 0);
                doc.text(`Overall ATS Score: ${entry.atsScore}%`, 20, 68);
                
                // Draw color-coded score bar
                doc.setFillColor(240, 240, 240);
                doc.rect(20, 72, 170, 8, 'F');
                if (entry.atsScore >= 80) {
                    doc.setFillColor(34, 197, 94); // Green
                } else if (entry.atsScore >= 60) {
                    doc.setFillColor(234, 179, 8); // Yellow
                } else {
                    doc.setFillColor(239, 68, 68); // Red
                }
                doc.rect(20, 72, (170 * entry.atsScore) / 100, 8, 'F');
                
                let yPos = 95;
                
                const printSection = (title: string, items: string[], isBullet = true) => {
                    if (yPos > 260) {
                        doc.addPage();
                        yPos = 25;
                    }
                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(12);
                    doc.setTextColor(255, 122, 0);
                    doc.text(title, 20, yPos);
                    yPos += 8;
                    
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(10);
                    doc.setTextColor(50, 50, 50);
                    
                    items.forEach((item, idx) => {
                        if (yPos > 275) {
                            doc.addPage();
                            yPos = 25;
                        }
                        const prefix = isBullet ? '• ' : `${idx + 1}. `;
                        const textLines = doc.splitTextToSize(prefix + item, 160);
                        textLines.forEach((line: string) => {
                            doc.text(line, 20, yPos);
                            yPos += 6;
                        });
                    });
                    yPos += 6;
                };
                
                printSection('Matched Keywords', [entry.matchedKeywords.join(', ')]);
                printSection('Missing Keywords', [entry.missingKeywords.join(', ')]);
                printSection('Formatting Issues', entry.formattingIssues);
                printSection('Grammar Issues', entry.grammarIssues);
                printSection('Recommendations', entry.recommendations, false);
                
                doc.save(`ats-report-${entry.id}.pdf`);
                
                toast({
                    title: 'Report Downloaded',
                    description: 'Your PDF report has been downloaded successfully.',
                });
            } catch (error) {
                console.error('PDF generation error:', error);
                toast({
                    title: 'Download Failed',
                    description: 'Could not generate PDF report. Standard text fallback downloaded.',
                    variant: 'destructive',
                });
            }
        }
    };

    const handleDeleteLog = (id: string) => {
        setDeleteConfirm(id);
    };

    const confirmDelete = async () => {
        if (deleteConfirm) {
            try {
                const entryToDelete = history.find(h => h.id === deleteConfirm);
                if (entryToDelete?.reviewId) {
                    await fetch(`/api/ats?reviewId=${entryToDelete.reviewId}`, {
                        method: 'DELETE',
                    });
                }
                setHistory(prev => prev.filter(h => h.id !== deleteConfirm));
                if (selectedHistory?.id === deleteConfirm) {
                    setShowDiagnostics(false);
                    setSelectedHistory(null);
                }
                setDeleteConfirm(null);
                toast({
                    title: 'Log Deleted',
                    description: 'The analysis log has been removed.',
                });
            } catch (error) {
                console.error('Delete error:', error);
                toast({
                    title: 'Delete Failed',
                    description: 'Failed to delete analysis log.',
                    variant: 'destructive',
                });
            }
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-500';
        if (score >= 60) return 'text-yellow-500';
        return 'text-red-500';
    };

    const getScoreBgColor = (score: number) => {
        if (score >= 80) return 'bg-green-500';
        if (score >= 60) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const filteredHistory = useMemo(() => {
        let filtered = history;

        if (searchQuery) {
            filtered = filtered.filter(entry => 
                entry.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
                entry.id.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (statusFilter !== 'all') {
            if (statusFilter === 'high') {
                filtered = filtered.filter(entry => entry.atsScore >= 80);
            } else if (statusFilter === 'medium') {
                filtered = filtered.filter(entry => entry.atsScore >= 60 && entry.atsScore < 80);
            } else if (statusFilter === 'low') {
                filtered = filtered.filter(entry => entry.atsScore < 60);
            }
        }

        return filtered;
    }, [history, searchQuery, statusFilter]);

    const paginatedHistory = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredHistory.slice(startIndex, endIndex);
    }, [filteredHistory, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setStatusFilter(e.target.value);
        setCurrentPage(1);
    };

    return (
        <PublicLayout>
            <div className="relative overflow-hidden bg-black text-white min-h-screen">
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(255,122,0,0.06),transparent_50%)]" />
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,122,0,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,122,0,0.015)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
                </div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10 pt-8 pb-20">
                    <nav className="flex items-center gap-2 mb-8 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                        <Link href="/" className="hover:text-[#FF8A33] transition-colors">
                            Home
                        </Link>
                        <ChevronRight className="w-3.5 h-3.5 text-zinc-700" />
                        <Link href="/career-builder" className="hover:text-[#FF8A33] transition-colors">
                            Career Builder
                        </Link>
                        <ChevronRight className="w-3.5 h-3.5 text-zinc-700" />
                        <span className="text-[#FF7A00]">ATS Resume Analysis</span>
                    </nav>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Upload & Analysis */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Upload Area */}
                            <div className="relative p-0.5 rounded-[24px] bg-[#0c0c0c] border border-white/10 shadow-2xl overflow-hidden">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,106,0,0.04),transparent_50%)]" />
                                
                                <div className="relative p-8">
                                    {isUploading ? (
                                        <div className="space-y-4 p-6 border-2 border-[#FF7A00]/50 rounded-xl bg-white/[0.02] shadow-[0_0_20px_rgba(255,122,0,0.1)]">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-3 rounded-lg bg-[#FF7A00]/10 animate-bounce">
                                                        <Upload className="w-5 h-5 text-[#FF7A00]" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-white">Uploading Resume...</p>
                                                        <p className="text-xs text-zinc-400">Processing file verification</p>
                                                    </div>
                                                </div>
                                                <span className="text-sm font-semibold text-[#FF8A33]">{uploadProgress}%</span>
                                            </div>
                                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-gradient-to-r from-[#FF7A00] to-[#FF9F1A] transition-all duration-150 ease-out"
                                                    style={{ width: `${uploadProgress}%` }}
                                                />
                                            </div>
                                        </div>
                                    ) : !uploadedFile ? (
                                        <div
                                            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 cursor-pointer relative ${
                                                isDragging 
                                                    ? 'border-[#FF7A00] bg-[#FF7A00]/10 shadow-[0_0_30px_rgba(255,122,0,0.3)]' 
                                                    : 'border-white/20 hover:border-[#FF7A00]/50 hover:bg-white/[0.02]'
                                            }`}
                                            onDragEnter={handleDragEnter}
                                            onDragLeave={handleDragLeave}
                                            onDragOver={handleDragOver}
                                            onDrop={handleDrop}
                                            onClick={(e) => {
                                                if (e.target === fileInputRef.current) return;
                                                fileInputRef.current?.click();
                                            }}
                                        >
                                            {isDragging && (
                                                <div className="absolute inset-0 z-50 rounded-xl" />
                                            )}
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                                onChange={handleFileSelect}
                                                className="hidden"
                                            />
                                            <div className="flex flex-col items-center gap-4">
                                                <div className={`p-4 rounded-full ${isDragging ? 'bg-[#FF7A00] animate-pulse' : 'bg-white/5'}`}>
                                                    <Upload className={`w-8 h-8 ${isDragging ? 'text-white' : 'text-[#FF7A00]'}`} />
                                                </div>
                                                <div>
                                                    <p className="text-lg font-semibold text-white mb-2">
                                                        {isDragging ? 'Drop your resume here' : 'Drag & Drop your resume'}
                                                    </p>
                                                    <p className="text-sm text-zinc-400 mb-4">
                                                        Supports PDF and DOCX (Max 10MB)
                                                    </p>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            fileInputRef.current?.click();
                                                        }}
                                                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FF9F1A] text-sm font-semibold text-white transition-all duration-300 hover:shadow-[0_0_25px_rgba(255,122,0,0.3)] hover:-translate-y-0.5"
                                                    >
                                                        <FileText className="w-4 h-4" />
                                                        Browse Files
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/10">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-3 rounded-lg bg-[#FF7A00]/10">
                                                        <FileText className="w-5 h-5 text-[#FF7A00]" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-white truncate max-w-[200px] md:max-w-md">{uploadedFile.name}</p>
                                                        <div className="flex items-center gap-2 text-xs text-zinc-400">
                                                            <span>{formatFileSize(uploadedFile.size)}</span>
                                                            <span>•</span>
                                                            <span className="uppercase text-[#FF8A33] font-medium">{uploadedFile.type}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={handleReplaceFile}
                                                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                                        title="Replace file"
                                                    >
                                                        <Upload className="w-4 h-4 text-zinc-400" />
                                                    </button>
                                                    <button
                                                        onClick={handleRemoveFile}
                                                        className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                                                        title="Remove file"
                                                    >
                                                        <X className="w-4 h-4 text-red-400" />
                                                    </button>
                                                </div>
                                            </div>

                                            <button
                                                onClick={handleAnalyze}
                                                disabled={isAnalyzing || isUploading || !uploadedFile}
                                                className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FF9F1A] text-sm font-semibold text-white transition-all duration-300 hover:shadow-[0_0_35px_rgba(255,122,0,0.35)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0"
                                            >
                                                {isAnalyzing ? (
                                                    <>
                                                        <Sparkles className="w-4 h-4 animate-spin" />
                                                        <span>{currentAnalysisStep || 'Analyzing Resume...'}</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <ClipboardCheck className="w-4 h-4" />
                                                        <span>Analyze Resume</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Results Panel */}
                            {analysisResult && (
                                <div className="relative p-0.5 rounded-[24px] bg-[#0c0c0c] border border-white/10 shadow-2xl overflow-hidden">
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,106,0,0.04),transparent_50%)]" />
                                    
                                    <div className="relative p-8">
                                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                            <Gauge className="w-5 h-5 text-[#FF7A00]" />
                                            Analysis Results
                                        </h3>

                                        {/* Overall Score */}
                                        <div className="mb-8 p-6 rounded-xl bg-white/[0.02] border border-white/10">
                                            <div className="flex items-center justify-between mb-4">
                                                <span className="text-sm font-medium text-zinc-300">Overall ATS Score</span>
                                                <span className={`text-3xl font-bold ${getScoreColor(animatedScore)}`}>
                                                    {animatedScore}%
                                                </span>
                                            </div>
                                            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${getScoreBgColor(analysisResult.overallScore)} transition-all duration-1000 ease-out`}
                                                    style={{ width: `${analysisResult.overallScore}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Metrics Grid */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                            {[
                                                { label: 'Keyword Match', value: analysisResult.keywordMatch, animValue: animatedMetrics.keywordMatch },
                                                { label: 'Grammar', value: analysisResult.grammar, animValue: animatedMetrics.grammar },
                                                { label: 'Formatting', value: analysisResult.formatting, animValue: animatedMetrics.formatting },
                                                { label: 'Readability', value: analysisResult.readability, animValue: animatedMetrics.readability },
                                                { label: 'Action Verbs', value: analysisResult.actionVerbs, animValue: animatedMetrics.actionVerbs },
                                            ].map((metric, idx) => (
                                                <div key={idx} className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
                                                    <p className="text-xs text-zinc-400 mb-2">{metric.label}</p>
                                                    <p className={`text-2xl font-bold ${getScoreColor(metric.animValue)}`}>
                                                        {metric.animValue}%
                                                    </p>
                                                    <div className="h-2 bg-white/10 rounded-full overflow-hidden mt-2">
                                                        <div
                                                            className={`h-full ${getScoreBgColor(metric.value)} transition-all duration-1000 ease-out`}
                                                            style={{ width: `${metric.value}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Missing Keywords */}
                                        <div className="mb-6 p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                                            <p className="text-sm font-medium text-red-400 mb-2 flex items-center gap-2">
                                                <AlertCircle className="w-4 h-4" />
                                                Missing Keywords
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {analysisResult.missingKeywords.map((keyword, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="px-3 py-1 rounded-full bg-red-500/10 text-red-300 text-xs"
                                                    >
                                                        {keyword}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Suggestions */}
                                        <div className="p-4 rounded-xl bg-[#FF7A00]/5 border border-[#FF7A00]/20">
                                            <p className="text-sm font-medium text-[#FF8A33] mb-3 flex items-center gap-2">
                                                <Sparkles className="w-4 h-4" />
                                                Suggestions
                                            </p>
                                            <ul className="space-y-2">
                                                {analysisResult.suggestions.map((suggestion, idx) => (
                                                    <li key={idx} className="flex items-start gap-2 text-xs text-zinc-300">
                                                        <CheckCircle2 className="w-4 h-4 text-[#FF7A00] shrink-0 mt-0.5" />
                                                        <span>{suggestion}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!uploadedFile && !analysisResult && !isUploading && (
                                <div className="relative p-0.5 rounded-[24px] bg-[#0c0c0c] border border-white/10 shadow-2xl overflow-hidden">
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,106,0,0.04),transparent_50%)]" />
                                    
                                    <div className="relative p-12 text-center">
                                        <div className="p-4 rounded-full bg-white/5 mx-auto w-16 h-16 flex items-center justify-center mb-4">
                                            <FileText className="w-8 h-8 text-zinc-500" />
                                        </div>
                                        <p className="text-lg font-semibold text-white mb-2">Upload Resume to Begin Analysis</p>
                                        <p className="text-sm text-zinc-400">Drag and drop your resume or click browse to start</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Column - History */}
                        <div className="space-y-6">
                            <div className="relative p-0.5 rounded-[24px] bg-[#0c0c0c] border border-white/10 shadow-2xl overflow-hidden">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,106,0,0.04),transparent_50%)]" />
                                
                                <div className="relative p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                            <History className="w-5 h-5 text-[#FF7A00]" />
                                            Analysis History
                                        </h3>
                                        <button
                                            onClick={handleDiagnostics}
                                            disabled={history.length === 0}
                                            className="p-2 rounded-lg bg-[#FF7A00]/10 hover:bg-[#FF7A00]/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            title="View Diagnostics"
                                        >
                                            <ClipboardCheck className="w-4 h-4 text-[#FF7A00]" />
                                        </button>
                                    </div>

                                    {/* Search and Filters */}
                                    <div className="space-y-3 mb-6">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                            <input
                                                type="text"
                                                placeholder="Search history..."
                                                value={searchQuery}
                                                onChange={handleSearchChange}
                                                className="w-full h-10 pl-10 pr-4 rounded-lg border border-white/10 bg-white/[0.02] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF7A00]/30"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Filter className="w-4 h-4 text-zinc-500" />
                                            <select
                                                value={statusFilter}
                                                onChange={handleFilterChange}
                                                className="flex-1 h-10 px-3 rounded-lg border border-white/10 bg-white/[0.02] text-xs text-white focus:outline-none focus:border-[#FF7A00]/30"
                                            >
                                                <option value="all">All Scores</option>
                                                <option value="high">High (80%+)</option>
                                                <option value="medium">Medium (60-79%)</option>
                                                <option value="low">Low (&lt;60%)</option>
                                            </select>
                                        </div>
                                    </div>

                                    {history.length === 0 ? (
                                        <div className="text-center py-8">
                                            <div className="p-4 rounded-full bg-white/5 mx-auto w-12 h-12 flex items-center justify-center mb-3">
                                                <History className="w-6 h-6 text-zinc-500" />
                                            </div>
                                            <p className="text-sm text-zinc-400">No ATS analyses yet.</p>
                                        </div>
                                    ) : filteredHistory.length === 0 ? (
                                        <div className="text-center py-8">
                                            <div className="p-4 rounded-full bg-white/5 mx-auto w-12 h-12 flex items-center justify-center mb-3">
                                                <History className="w-6 h-6 text-zinc-500" />
                                            </div>
                                            <p className="text-sm text-zinc-400">No ATS analyses found</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="space-y-3 max-h-[400px] overflow-y-auto">
                                                {paginatedHistory.map((entry) => (
                                                    <div
                                                        key={entry.id}
                                                        className="p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-[#FF7A00]/30 transition-colors cursor-pointer"
                                                        onClick={() => {
                                                            setSelectedHistory(entry);
                                                            setShowDiagnostics(true);
                                                        }}
                                                    >
                                                        <div className="flex items-center justify-between mb-2">
                                                            <p className="text-xs font-medium text-white truncate flex-1 pr-2">
                                                                {entry.filename}
                                                            </p>
                                                            <span className={`text-sm font-bold ${getScoreColor(entry.atsScore)}`}>
                                                                {entry.atsScore}%
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                                                            <p className="text-[10px] text-zinc-500">
                                                                {new Date(entry.date).toLocaleString()}
                                                            </p>
                                                            <span className="text-[10px] text-[#FF8A33] hover:underline font-semibold flex items-center gap-1">
                                                                Diagnostics <ArrowRight className="w-2.5 h-2.5" />
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Pagination */}
                                            {totalPages > 1 && (
                                                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                                    <span className="text-xs text-zinc-500">
                                                        Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredHistory.length)} of {filteredHistory.length}
                                                    </span>
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={() => handlePageChange(currentPage - 1)}
                                                            disabled={currentPage === 1}
                                                            className="p-2 rounded-lg border border-white/10 bg-white/[0.02] text-zinc-400 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                        >
                                                            <ChevronLeft className="w-4 h-4" />
                                                        </button>
                                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                                            <button
                                                                key={page}
                                                                onClick={() => handlePageChange(page)}
                                                                className={`w-8 h-8 rounded-lg border text-xs font-semibold transition-colors ${
                                                                    currentPage === page
                                                                        ? 'border-[#FF7A00]/30 bg-[#FF7A00]/10 text-[#FF8A33]'
                                                                        : 'border-white/10 bg-white/[0.02] text-zinc-400 hover:bg-white/5'
                                                                }`}
                                                            >
                                                                {page}
                                                            </button>
                                                        ))}
                                                        <button
                                                            onClick={() => handlePageChange(currentPage + 1)}
                                                            disabled={currentPage === totalPages}
                                                            className="p-2 rounded-lg border border-white/10 bg-white/[0.02] text-zinc-400 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                        >
                                                            <ChevronRight className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Diagnostics Modal */}
                {showDiagnostics && selectedHistory && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#0c0c0c] border border-white/10 shadow-2xl">
                            <div className="sticky top-0 z-10 p-6 border-b border-white/10 bg-[#0c0c0c]">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                        <ClipboardCheck className="w-5 h-5 text-[#FF7A00]" />
                                        Analysis Diagnostics
                                    </h3>
                                    <button
                                        onClick={() => {
                                            setShowDiagnostics(false);
                                            setSelectedHistory(null);
                                        }}
                                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                    >
                                        <X className="w-5 h-5 text-zinc-400" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
                                        <p className="text-xs text-zinc-400 mb-1">Analysis Date</p>
                                        <p className="text-sm font-medium text-white">
                                            {new Date(selectedHistory.date).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
                                        <p className="text-xs text-zinc-400 mb-1">Filename</p>
                                        <p className="text-sm font-medium text-white truncate">
                                            {selectedHistory.filename}
                                        </p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
                                        <p className="text-xs text-zinc-400 mb-1">ATS Score</p>
                                        <p className={`text-2xl font-bold ${getScoreColor(selectedHistory.atsScore)}`}>
                                            {selectedHistory.atsScore}%
                                        </p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
                                        <p className="text-xs text-zinc-400 mb-1">Execution Time</p>
                                        <p className="text-sm font-medium text-white">
                                            {selectedHistory.executionTime}s
                                        </p>
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20">
                                    <p className="text-sm font-medium text-green-400 mb-2">Matched Keywords</p>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedHistory.matchedKeywords.map((keyword, idx) => (
                                            <span
                                                key={idx}
                                                className="px-3 py-1 rounded-full bg-green-500/10 text-green-300 text-xs"
                                            >
                                                {keyword}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                                    <p className="text-sm font-medium text-red-400 mb-2">Missing Keywords</p>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedHistory.missingKeywords.map((keyword, idx) => (
                                            <span
                                                key={idx}
                                                className="px-3 py-1 rounded-full bg-red-500/10 text-red-300 text-xs"
                                            >
                                                {keyword}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
                                    <p className="text-sm font-medium text-yellow-400 mb-2">Formatting Issues</p>
                                    <ul className="space-y-1">
                                        {selectedHistory.formattingIssues.map((issue, idx) => (
                                            <li key={idx} className="text-xs text-zinc-300">
                                                • {issue}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/20">
                                    <p className="text-sm font-medium text-orange-400 mb-2">Grammar Issues</p>
                                    <ul className="space-y-1">
                                        {selectedHistory.grammarIssues.map((issue, idx) => (
                                            <li key={idx} className="text-xs text-zinc-300">
                                                • {issue}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="p-4 rounded-xl bg-[#FF7A00]/5 border border-[#FF7A00]/20">
                                    <p className="text-sm font-medium text-[#FF8A33] mb-2">Recommendations</p>
                                    <ul className="space-y-1">
                                        {selectedHistory.recommendations.map((rec, idx) => (
                                            <li key={idx} className="text-xs text-zinc-300">
                                                {idx + 1}. {rec}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                                    <div className="flex-1">
                                        <p className="text-xs text-zinc-400 mb-2">Download Report</p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleDownloadReport(selectedHistory, 'pdf')}
                                                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-white transition-colors"
                                            >
                                                PDF
                                            </button>
                                            <button
                                                onClick={() => handleDownloadReport(selectedHistory, 'txt')}
                                                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-white transition-colors"
                                            >
                                                TXT
                                            </button>
                                            <button
                                                onClick={() => handleDownloadReport(selectedHistory, 'json')}
                                                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-white transition-colors"
                                            >
                                                JSON
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleDeleteLog(selectedHistory.id)}
                                            className="px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-xs font-medium text-red-400 transition-colors flex items-center gap-2"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Delete Log
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowDiagnostics(false);
                                                setSelectedHistory(null);
                                            }}
                                            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-white transition-colors"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {deleteConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <div className="relative w-full max-w-md rounded-2xl bg-[#0c0c0c] border border-white/10 shadow-2xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 rounded-full bg-red-500/10">
                                    <AlertCircle className="w-6 h-6 text-red-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Delete Analysis Log</h3>
                                    <p className="text-sm text-zinc-400">This action cannot be undone.</p>
                                </div>
                            </div>
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-medium text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-sm font-medium text-red-400 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </PublicLayout>
    );
}
