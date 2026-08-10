'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
    UploadCloud, 
    CheckCircle, 
    Calendar, 
    XCircle, 
    AlertTriangle, 
    ChevronDown, 
    FileText, 
    Check, 
    Activity,
    Download,
    Loader2,
    TrendingUp,
    TrendingDown,
    Eye,
    Search,
    FileEdit,
    Sparkles,
    Send,
    Save,
    RefreshCw,
    FileDown,
    File,
    Trash2,
    Copy,
    ZoomIn,
    ZoomOut,
    ChevronRight,
    ChevronLeft,
    Target,
    Layout,
    BookOpen,
    MessageSquare,
    Layers,
    Lightbulb,
    GitCompare,
    History,
    Bot,
    Clock,
    Award,
    BarChart3,
    User,
    Building2,
    Briefcase,
    Settings,
    ArrowRight,
    Play,
    Pause,
    Maximize2,
    Minimize2,
    X,
    ThumbsUp,
    ThumbsDown,
    RotateCcw,
    Share2,
    Printer,
    FileJson,
    FileSpreadsheet,
    Upload,
    FolderOpen,
    Scan,
    Flame,
    PieChart,
    Timer,
    EyeOff,
    MoreVertical,
    ChevronUp,
    Filter,
    Tag,
    Star,
    Flag,
    Archive,
    Inbox,
    Paperclip,
    MessageSquarePlus,
    Edit3,
    CheckSquare,
    Square,
    Zap,
    Link,
    Target as TargetIcon
} from 'lucide-react';
import { exportFile, generateFilename } from '@/lib/export-utils';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    BarChart,
    Bar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    PieChart as RechartsPieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';

import { ModuleToggle } from '@/components/admin/module-toggle';

interface AnalysisRecord {
    id: string;
    date: string;
    resume: string;
    score: number;
    status: 'Optimized' | 'Warning' | 'Critical' | 'Pending' | 'In Review' | 'Approved' | 'Rejected' | 'Returned';
    staff: string;
}

interface ReviewHeader {
    reviewId: string;
    candidate: string;
    assignedReviewer: string;
    status: 'Pending' | 'In Review' | 'Approved' | 'Rejected' | 'Returned' | 'Archived';
    priority: 'High' | 'Medium' | 'Low';
    reviewDate: string;
}

interface UploadProgress {
    loaded: number;
    total: number;
    percentage: number;
}

interface DiagnosticIssue {
    id: string;
    type: 'keyword' | 'bullet' | 'grammar' | 'formatting' | 'passive' | 'length' | 'achievement' | 'section';
    severity: 'critical' | 'high' | 'medium' | 'low';
    title: string;
    description: string;
    location?: string;
    suggestion: string;
    expanded: boolean;
}

interface SectionInspector {
    name: string;
    content: string;
    score: number;
    issues: number;
    expanded: boolean;
}

interface KeywordCoverage {
    matched: number;
    missing: number;
    recommended: number;
    total: number;
}

interface RecruiterSimulation {
    scanDuration: number;
    attentionScore: number;
    heatmapData: number[];
    eyeTracking: { x: number; y: number; timestamp: number }[];
}

interface ReviewNote {
    id: string;
    type: 'internal' | 'client' | 'reviewer';
    content: string;
    author: string;
    timestamp: string;
}

interface ActivityEvent {
    id: string;
    type: 'created' | 'uploaded' | 'analyzed' | 'modified' | 'approved' | 'rejected' | 'returned' | 'archived';
    description: string;
    timestamp: string;
    user: string;
}

interface DiagnosticModal {
    isOpen: boolean;
    recordId?: string;
}

interface WorkflowStep {
    id: string;
    label: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
}

interface KPICard {
    label: string;
    value: number | string;
    trend: 'up' | 'down' | 'neutral';
    suffix?: string;
}

interface Keyword {
    word: string;
    importance: 'high' | 'medium' | 'low';
    suggestion?: string;
}

interface FormattingIssue {
    type: string;
    severity: 'critical' | 'medium' | 'minor';
    description: string;
    location?: string;
}

interface GrammarIssue {
    type: string;
    text: string;
    suggestion: string;
    aiRecommendation: string;
}

interface SectionAnalysis {
    name: string;
    completion: number;
    atsWeight: number;
    recommendation: string;
}

interface Suggestion {
    id: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    title: string;
    description: string;
    estimatedGain: number;
    difficulty: 'easy' | 'medium' | 'hard';
    impact: 'high' | 'medium' | 'low';
    status: 'pending' | 'fixed' | 'ignored';
}

type TabType = 'overview' | 'keywords' | 'formatting' | 'grammar' | 'sections' | 'suggestions' | 'comparison' | 'charts' | 'history' | 'diagnostics' | 'upload' | 'simulation' | 'notes' | 'timeline' | 'inspector' | 'heatmap' | 'checklist' | 'compare';

export default function ATSAnalysisDashboard() {
    // Tab State
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [loading, setLoading] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [mounted, setMounted] = useState(false);

    // Canvas Preview controls
    const [zoomLevel, setZoomLevel] = useState(100);
    const [rotateDegree, setRotateDegree] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages] = useState(2);
    const [highlightSections, setHighlightSections] = useState(true);
    const [highlightKeywords, setHighlightKeywords] = useState(true);
    const [highlightedSection, setHighlightedSection] = useState<string | null>(null);

    // Database reviews state
    const [reviews, setReviews] = useState<any[]>([]);
    const [activeReviewId, setActiveReviewId] = useState<string | null>(null);
    const [activeReview, setActiveReview] = useState<any | null>(null);
    const [counterValues, setCounterValues] = useState<{ [key: string]: number }>({});

    // Upload & Drag-Drop State
    const [dragActive, setDragActive] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);

    // Parsing Pipeline Animation State
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisProgress, setAnalysisProgress] = useState(0);
    const [analysisStep, setAnalysisStep] = useState(0);

    // Notes State
    const [newNote, setNewNote] = useState('');
    const [noteType, setNoteType] = useState<'internal' | 'client' | 'reviewer'>('internal');
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [editingNoteContent, setEditingNoteContent] = useState('');

    // Modal, Drawer, Simulation State
    const [diagnosticModal, setDiagnosticModal] = useState<DiagnosticModal>({ isOpen: false });
    const [selectedScoreCard, setSelectedScoreCard] = useState<string | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({});
    const [isSimulationRunning, setIsSimulationRunning] = useState(false);
    const [simulationProgress, setSimulationProgress] = useState(0);
    const [recruiterSimulation, setRecruiterSimulation] = useState<RecruiterSimulation | null>({
        scanDuration: 6,
        attentionScore: 78,
        heatmapData: [85, 72, 90, 65, 88, 92, 78, 85, 70, 95],
        eyeTracking: []
    });

    const [expandedWorkflowSteps, setExpandedWorkflowSteps] = useState<{[key: string]: boolean}>({
        '4': true // AI Review expanded by default
    });

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const toggleSectionExpand = (sectionName: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionName]: !prev[sectionName]
        }));
    };

    // Fetch review list on mount
    const fetchAllReviews = useCallback(async (selectId?: string) => {
        try {
            const response = await fetch('/api/ats');
            if (!response.ok) throw new Error('Failed to fetch reviews');
            const data = await response.json();
            setReviews(data);
            
            let targetId = selectId || activeReviewId;
            if (!targetId && data.length > 0) {
                const queryParams = new URLSearchParams(window.location.search);
                const queryReviewId = queryParams.get('reviewId');
                if (queryReviewId && data.some((r: any) => r.reviewId === queryReviewId)) {
                    targetId = queryReviewId;
                } else {
                    targetId = data[0].reviewId;
                }
            }
            
            if (targetId) {
                await fetchReviewDetails(targetId);
            } else {
                setActiveReview(null);
                setActiveReviewId(null);
            }
            setMounted(true);
        } catch (error) {
            console.error('Error fetching reviews:', error);
            setMounted(true);
        }
    }, [activeReviewId]);

    const fetchReviewDetails = async (reviewId: string) => {
        try {
            const response = await fetch(`/api/ats?reviewId=${reviewId}`);
            if (!response.ok) throw new Error('Failed to fetch review details');
            const data = await response.json();
            setActiveReview(data);
            setActiveReviewId(data.reviewId);
            
            // Sync query parameter without reloading
            const newUrl = `${window.location.pathname}?reviewId=${reviewId}`;
            window.history.replaceState({ path: newUrl }, '', newUrl);
        } catch (error) {
            console.error('Error fetching review details:', error);
            showToast('Failed to load review details', 'error');
        }
    };

    useEffect(() => {
        fetchAllReviews();
    }, []);

    // Animate KPI counters when activeReview loads
    useEffect(() => {
        if (!activeReview?.scores) return;
        
        activeReview.scores.forEach((score: any) => {
            let start = 0;
            const end = score.value;
            const duration = 800;
            const increment = end / (duration / 16);
            
            const timer = setInterval(() => {
                start += increment;
                if (start >= end) {
                    start = end;
                    clearInterval(timer);
                }
                setCounterValues(prev => ({ ...prev, [score.metric]: Math.round(start) }));
            }, 16);
        });
    }, [activeReview]);

    // Helpers to query activeReview sub-tables
    const getMetricValue = (metric: string) => {
        if (!activeReview?.scores) return 0;
        const score = activeReview.scores.find((s: any) => s.metric === metric);
        return score ? score.value : 0;
    };

    const getKeywordsByCategory = (category: string): Keyword[] => {
        if (!activeReview?.keywords) return [];
        return activeReview.keywords
            .filter((k: any) => k.category === category)
            .map((k: any) => ({
                word: k.word,
                importance: k.importance as 'high' | 'medium' | 'low',
                suggestion: k.suggestion || ''
            }));
    };

    const getSelectedCardDetails = () => {
        if (!selectedScoreCard || !activeReview?.scores) return null;
        const score = activeReview.scores.find((s: any) => s.metric === selectedScoreCard);
        if (!score) return null;
        return {
            explanation: score.explanation,
            calculation: score.calculation,
            problems: score.problems ? score.problems.split(', ') : [],
            suggestions: score.suggestions ? score.suggestions.split(', ') : [],
            progress: score.value,
            aiRecommendation: score.aiRecommendation
        };
    };

    const getComparisonData = () => {
        if (!activeReview?.versions || activeReview.versions.length === 0) {
            return { originalScore: 61, optimizedScore: 92, improvement: 31, improvementPercent: 50 };
        }
        const sorted = [...activeReview.versions].sort((a: any, b: any) => a.score - b.score);
        const originalScore = sorted[0]?.score || 60;
        const optimizedScore = sorted[sorted.length - 1]?.score || 90;
        return {
            originalScore,
            optimizedScore,
            improvement: optimizedScore - originalScore,
            improvementPercent: Math.round(((optimizedScore - originalScore) / originalScore) * 100)
        };
    };

    // Drag and Drop File Handlers
    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileValidation(e.dataTransfer.files[0]);
        }
    };

    const handleFileValidation = (file: File) => {
        setValidationError(null);
        
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (ext !== 'pdf' && ext !== 'docx') {
            setValidationError("Invalid extension. Only PDF and DOCX files are allowed.");
            showToast("Invalid file type", "error");
            return;
        }
        
        if (file.size > 10 * 1024 * 1024) {
            setValidationError("File is too large. Maximum size allowed is 10MB.");
            showToast("File size exceeds 10MB", "error");
            return;
        }
        
        const isDuplicate = reviews.some(r => r.candidate.toLowerCase() === file.name.split('.')[0].toLowerCase());
        if (isDuplicate) {
            showToast("Warning: Duplicate resume file name detected", "error");
        }
        
        setUploadedFile(file);
        setIsUploading(true);
        setUploadProgress({ loaded: 0, total: file.size, percentage: 0 });
        
        let loaded = 0;
        const interval = setInterval(() => {
            loaded += file.size / 10;
            const percentage = Math.min(Math.round((loaded / file.size) * 100), 100);
            setUploadProgress({ loaded: Math.min(loaded, file.size), total: file.size, percentage });
            if (percentage >= 100) {
                clearInterval(interval);
                setIsUploading(false);
                showToast("Resume uploaded successfully", "success");
            }
        }, 150);
    };

    // Parsing Pipeline Execution
    const handleAnalyze = async () => {
        if (!uploadedFile) return;
        setIsAnalyzing(true);
        setAnalysisProgress(0);
        setAnalysisStep(0);
        
        const stagesCount = 9;
        
        const interval = setInterval(async () => {
            setAnalysisStep(prev => {
                const nextStep = prev + 1;
                setAnalysisProgress(Math.round((nextStep / (stagesCount - 1)) * 100));
                
                if (nextStep >= stagesCount - 1) {
                    clearInterval(interval);
                    
                    // Call POST API
                    const overallScore = Math.floor(Math.random() * 20) + 75; // 75 to 95
                    const keywordMatch = Math.floor(Math.random() * 25) + 70;
                    const grammar = Math.floor(Math.random() * 15) + 80;
                    const formatting = Math.floor(Math.random() * 15) + 80;
                    const readability = Math.floor(Math.random() * 15) + 75;
                    const actionVerbs = Math.floor(Math.random() * 15) + 75;
                    const industryMatch = Math.floor(Math.random() * 20) + 75;
                    const recruiterScore = Math.floor(Math.random() * 15) + 80;
                    
                    fetch('/api/ats', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            filename: uploadedFile.name,
                            candidate: uploadedFile.name.split('.')[0].replace(/[_-]/g, ' '),
                            overallScore,
                            keywordMatch,
                            grammar,
                            formatting,
                            readability,
                            actionVerbs,
                            industryMatch,
                            recruiterScore,
                            confidenceScore: 94,
                            missingKeywords: ['Docker', 'Kubernetes', 'CI/CD', 'Serverless', 'Terraform', 'WebAssembly'],
                            matchedKeywords: ['React', 'TypeScript', 'Next.js', 'TailwindCSS', 'Node.js', 'REST APIs'],
                            weakKeywords: ['managed', 'utilized'],
                            industryKeywords: ['Cloud Architecture', 'Agile Methodology'],
                            suggestions: [
                                'Add Docker/Kubernetes containerization experience',
                                'Standardize spacing in headers',
                                'Convert passive verbs to active verbs',
                                'Quantify more results in experience bullets'
                            ],
                            formattingIssues: [
                                'Inconsistent paragraph indentation',
                                'Font sizes in experience section vary slightly'
                            ],
                            grammarIssues: [
                                'Passive voice in third bullet of Experience',
                                'Run-on sentence in Professional Summary'
                            ]
                        })
                    })
                    .then(res => {
                        if (!res.ok) throw new Error("Failed to save review");
                        return res.json();
                    })
                    .then(async (newReview) => {
                        showToast("Analysis complete and review created!", "success");
                        await fetchAllReviews(newReview.reviewId);
                        setIsAnalyzing(false);
                        setUploadedFile(null);
                        setUploadProgress(null);
                        setActiveTab('overview');
                    })
                    .catch(err => {
                        console.error(err);
                        showToast("Error saving ATS analysis", "error");
                        setIsAnalyzing(false);
                    });
                }
                return nextStep;
            });
        }, 400);
    };

    // Review status actions in database
    const handleStatusUpdate = async (status: string) => {
        if (!activeReviewId) return;
        try {
            const response = await fetch('/api/ats', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reviewId: activeReviewId, status })
            });
            if (!response.ok) throw new Error('Status update failed');
            showToast(`Resume status updated: ${status}`, status === 'Rejected' ? 'error' : 'success');
            await fetchReviewDetails(activeReviewId);
            await fetchAllReviews(activeReviewId);
        } catch (error) {
            console.error(error);
            showToast('Failed to update status', 'error');
        }
    };

    // Notes Actions
    const handleAddNote = async () => {
        if (!newNote.trim() || !activeReviewId) return;
        try {
            const response = await fetch('/api/ats', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reviewId: activeReviewId,
                    note: {
                        type: noteType,
                        content: newNote,
                        author: 'Alex Chen'
                    }
                })
            });
            if (!response.ok) throw new Error('Failed to add note');
            setNewNote('');
            showToast('Note added to database', 'success');
            await fetchReviewDetails(activeReviewId);
        } catch (error) {
            console.error(error);
            showToast('Failed to add note', 'error');
        }
    };

    const handleSaveEditNote = async () => {
        if (!editingNoteId || !editingNoteContent.trim() || !activeReviewId) return;
        try {
            const response = await fetch('/api/ats', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reviewId: activeReviewId,
                    action: 'editNote',
                    noteId: editingNoteId,
                    content: editingNoteContent
                })
            });
            if (!response.ok) throw new Error('Failed to edit note');
            setEditingNoteId(null);
            setEditingNoteContent('');
            showToast('Note updated in database', 'success');
            await fetchReviewDetails(activeReviewId);
        } catch (error) {
            console.error(error);
            showToast('Failed to update note', 'error');
        }
    };

    const handleDeleteNote = async (noteId: string) => {
        if (!activeReviewId) return;
        try {
            const response = await fetch('/api/ats', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reviewId: activeReviewId,
                    action: 'deleteNote',
                    noteId
                })
            });
            if (!response.ok) throw new Error('Failed to delete note');
            showToast('Note deleted from database', 'success');
            await fetchReviewDetails(activeReviewId);
        } catch (error) {
            console.error(error);
            showToast('Failed to delete note', 'error');
        }
    };

    // Suggestion Status Action
    const handleSuggestionStatus = async (suggestionId: string, status: 'fixed' | 'ignored') => {
        if (!activeReviewId) return;
        try {
            const response = await fetch('/api/ats', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reviewId: activeReviewId,
                    suggestionId,
                    suggestionStatus: status
                })
            });
            if (!response.ok) throw new Error('Failed to update suggestion status');
            showToast(`Suggestion marked as ${status}`, 'success');
            await fetchReviewDetails(activeReviewId);
        } catch (error) {
            console.error(error);
            showToast('Failed to update suggestion', 'error');
        }
    };

    // Diagnostics resolutions
    const handleResolveDiagnostic = async (title: string) => {
        if (!activeReview) return;
        showToast(`Issue resolved: ${title}`, 'success');
        const overallScoreObj = activeReview.scores.find((s: any) => s.metric === 'overall');
        const currentVal = overallScoreObj ? overallScoreObj.value : 75;
        const newVal = Math.min(currentVal + 2, 100);
        
        setActiveReview((prev: any) => {
            if (!prev) return null;
            return {
                ...prev,
                scores: prev.scores.map((s: any) => s.metric === 'overall' ? { ...s, value: newVal } : s),
                diagnostics: prev.diagnostics.filter((d: any) => d.title !== title)
            };
        });
    };

    // Delete Review from DB
    const handleDeleteReview = async () => {
        if (!activeReviewId) return;
        if (!confirm("Are you sure you want to permanently delete this review from the database? This cannot be undone.")) return;
        
        try {
            const response = await fetch(`/api/ats?reviewId=${activeReviewId}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Deletion failed');
            showToast('Review deleted from database', 'success');
            
            const remaining = reviews.filter(r => r.reviewId !== activeReviewId);
            setReviews(remaining);
            if (remaining.length > 0) {
                await fetchReviewDetails(remaining[0].reviewId);
            } else {
                setActiveReviewId(null);
                setActiveReview(null);
            }
        } catch (error) {
            console.error(error);
            showToast('Failed to delete review', 'error');
        }
    };

    // Share link copied
    const handleShare = () => {
        if (!activeReviewId) return;
        const shareUrl = `${window.location.origin}${window.location.pathname}?reviewId=${activeReviewId}`;
        navigator.clipboard.writeText(shareUrl);
        showToast('Share link copied to clipboard', 'success');
    };

    // Export PDF, DOCX, JSON, CSV
    const handleExport = (format: 'pdf' | 'docx' | 'json' | 'csv') => {
        if (!activeReview) {
            showToast('No active review to export', 'error');
            return;
        }
        
        setLoading(`export-${format}`);
        showToast(`Generating ${format.toUpperCase()}...`, 'success');
        
        const candidate = activeReview.candidate;
        const reviewId = activeReview.reviewId;
        const overallScore = getMetricValue('overall');
        const timestamp = new Date().toLocaleString();
        
        const title = `ATS Compatibility Analysis Report - ${candidate}`;
        
        let content = `
ATS ANALYSIS WORKSPACE REPORT
===================================================
Generated: ${timestamp}
Review ID: ${reviewId}
Candidate: ${candidate}
Overall ATS Score: ${overallScore}%
Assigned Reviewer: ${activeReview.assignedReviewer}
Status: ${activeReview.status}
Priority: ${activeReview.priority}

METRICS BREAKDOWN:
---------------------------------------------------
${activeReview.scores.map((s: any) => `- ${s.metric.toUpperCase()}: ${s.value}% (${s.explanation})`).join('\n')}

KEYWORDS COVERAGE:
---------------------------------------------------
Matched Keywords:
${activeReview.keywords.filter((k: any) => k.category === 'matched').map((k: any) => `  * ${k.word} (Importance: ${k.importance})`).join('\n') || '  None'}

Missing Keywords:
${activeReview.keywords.filter((k: any) => k.category === 'missing').map((k: any) => `  * ${k.word} (Importance: ${k.importance}) - Suggestion: ${k.suggestion || 'Add to resume'}`).join('\n') || '  None'}

Weak Keywords:
${activeReview.keywords.filter((k: any) => k.category === 'weak').map((k: any) => `  * ${k.word} (Importance: ${k.importance}) - Suggestion: ${k.suggestion || 'Replace term'}`).join('\n') || '  None'}

FORMATTING ISSUES IDENTIFIED:
---------------------------------------------------
${activeReview.formattingIssues.map((f: any) => `- [${f.severity.toUpperCase()}] ${f.type}: ${f.description} (Location: ${f.location})`).join('\n') || 'No issues identified.'}

GRAMMAR ISSUES IDENTIFIED:
---------------------------------------------------
${activeReview.grammarIssues.map((g: any) => `- "${g.text}" -> Suggestion: "${g.suggestion}". Reason: ${g.aiRecommendation}`).join('\n') || 'No issues identified.'}

AI RECOMMENDATIONS & ACTION ITEMS:
---------------------------------------------------
${activeReview.suggestions.map((s: any) => `- [${s.priority.toUpperCase()} PRIORITY] ${s.title}: ${s.description} (Estimated ATS Gain: +${s.estimatedGain}%)`).join('\n') || 'No suggestions.'}
`;

        setTimeout(() => {
            try {
                if (format === 'csv') {
                    const csvHeader = "Metric,Value,Explanation\n";
                    const csvRows = activeReview.scores.map((s: any) => `"${s.metric}",${s.value},"${s.explanation.replace(/"/g, '""')}"`).join("\n");
                    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `${candidate.replace(/ /g, '_')}_ATS_Scores_${Date.now()}.csv`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                } else if (format === 'json') {
                    exportFile({
                        format: 'json',
                        content: JSON.stringify(activeReview, null, 2),
                        filename: `${candidate.replace(/ /g, '_')}_ATS_Review_${reviewId}`,
                        title: `ATS Review Export - ${candidate}`,
                        metadata: { reviewId, date: activeReview.reviewDate }
                    });
                } else {
                    exportFile({
                        format,
                        content,
                        filename: `${candidate.replace(/ /g, '_')}_ATS_Review_${reviewId}`,
                        title,
                        metadata: {
                            'Review ID': reviewId,
                            'Candidate': candidate,
                            'Overall Score': `${overallScore}%`,
                            'Assigned Reviewer': activeReview.assignedReviewer
                        }
                    });
                }
                showToast(`${format.toUpperCase()} exported successfully`, 'success');
            } catch (error) {
                console.error(error);
                showToast('Export failed', 'error');
            } finally {
                setLoading(null);
            }
        }, 1000);
    };

    const handleRunSimulation = () => {
        setIsSimulationRunning(true);
        setSimulationProgress(0);
        
        const interval = setInterval(() => {
            setSimulationProgress((prev) => {
                const nextVal = Math.min(prev + 2, 100);
                if (nextVal >= 100) {
                    clearInterval(interval);
                    setIsSimulationRunning(false);
                    setRecruiterSimulation(prevSim => prevSim ? {
                        ...prevSim,
                        attentionScore: Math.floor(Math.random() * 20) + 70
                    } : null);
                    showToast('Simulation completed', 'success');
                }
                return nextVal;
            });
        }, 40);
    };

    const toggleWorkflowStep = (id: string) => {
        setExpandedWorkflowSteps(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleOpenScoreDrawer = (cardKey: string) => {
        setSelectedScoreCard(cardKey);
        setIsDrawerOpen(true);
    };

    const handleCloseDrawer = () => {
        setIsDrawerOpen(false);
        setSelectedScoreCard(null);
    };

    const tabs = [
        { id: 'overview' as TabType, label: 'Overview', icon: BarChart3 },
        { id: 'keywords' as TabType, label: 'Keywords', icon: Search },
        { id: 'formatting' as TabType, label: 'Formatting', icon: Layout },
        { id: 'grammar' as TabType, label: 'Grammar', icon: BookOpen },
        { id: 'sections' as TabType, label: 'Sections', icon: Layers },
        { id: 'suggestions' as TabType, label: 'Suggestions', icon: Lightbulb },
        { id: 'comparison' as TabType, label: 'Comparison', icon: GitCompare },
        { id: 'charts' as TabType, label: 'Charts', icon: PieChart },
        { id: 'history' as TabType, label: 'History', icon: History },
        { id: 'diagnostics' as TabType, label: 'Diagnostics', icon: Scan },
        { id: 'upload' as TabType, label: 'Upload', icon: Upload },
        { id: 'simulation' as TabType, label: 'Simulation', icon: Eye },
        { id: 'notes' as TabType, label: 'Notes', icon: MessageSquare },
        { id: 'timeline' as TabType, label: 'Timeline', icon: Clock },
        { id: 'inspector' as TabType, label: 'Inspector', icon: Bot },
        { id: 'heatmap' as TabType, label: 'Heatmap', icon: Flame },
        { id: 'checklist' as TabType, label: 'Checklist', icon: CheckSquare },
        { id: 'compare' as TabType, label: 'Compare', icon: GitCompare }
    ];

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'bg-red-500/10 border-red-500/30 text-red-400';
            case 'high': return 'bg-orange-500/10 border-orange-500/30 text-orange-400';
            case 'medium': return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
            case 'minor':
            case 'low': return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
            default: return 'bg-gray-500/10 border-gray-500/30 text-gray-400';
        }
    };

    const getImportanceColor = (importance: string) => {
        switch (importance) {
            case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
            case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    const kpisMetadata = {
        overall: { label: 'ATS Score', icon: TargetIcon, color: 'text-[#FF7A00]' },
        keyword: { label: 'Keyword Match', icon: Search, color: 'text-emerald-400' },
        formatting: { label: 'Formatting', icon: Layout, color: 'text-blue-400' },
        readability: { label: 'Readability', icon: BookOpen, color: 'text-amber-400' },
        sections: { label: 'Completion', icon: Layers, color: 'text-purple-400' },
        industry: { label: 'Industry Match', icon: Building2, color: 'text-pink-400' },
        recruiter: { label: 'Recruiter Score', icon: Star, color: 'text-yellow-400' },
        confidence: { label: 'Confidence', icon: Sparkles, color: 'text-cyan-400' }
    };

    const kpiData = [
        { label: 'overall', value: counterValues['overall'] || getMetricValue('overall'), trend: 'up', suffix: '%' },
        { label: 'keyword', value: counterValues['keyword'] || getMetricValue('keyword'), trend: 'up', suffix: '%' },
        { label: 'formatting', value: counterValues['formatting'] || getMetricValue('formatting'), trend: 'up', suffix: '%' },
        { label: 'readability', value: counterValues['readability'] || getMetricValue('readability'), trend: 'up', suffix: '%' },
        { label: 'sections', value: counterValues['sections'] || getMetricValue('sections'), trend: 'neutral', suffix: '%' },
        { label: 'industry', value: counterValues['industry'] || getMetricValue('industry'), trend: 'up', suffix: '%' },
        { label: 'recruiter', value: counterValues['recruiter'] || getMetricValue('recruiter'), trend: 'up', suffix: '%' },
        { label: 'confidence', value: counterValues['confidence'] || getMetricValue('confidence'), trend: 'up', suffix: '%' }
    ];

    // Compute dynamic dashboard stats based on database reviews list
    const timelineData = [...reviews]
        .reverse()
        .map(r => ({
            name: new Date(r.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            score: r.scores?.find((s: any) => s.metric === 'overall')?.value || 70,
            id: r.reviewId
        }));

    const historyData = reviews.map((r: any) => ({
        id: r.reviewId,
        resume: r.filename,
        date: new Date(r.createdAt || Date.now()).toLocaleDateString(),
        score: r.scores?.find((s: any) => s.metric === 'overall')?.value || 70,
        staff: r.assignedReviewer || 'System'
    }));

    const keywordGrowthData = [...reviews]
        .reverse()
        .map((r, idx) => ({
            week: `R${idx + 1}`,
            matched: r.keywords?.filter((k: any) => k.category === 'matched').length || 0,
            missing: r.keywords?.filter((k: any) => k.category === 'missing').length || 0
        }));

    const workflowStepMeta = activeReview?.workflowSteps?.reduce((acc: any, step: any) => {
        acc[step.stepId] = {
            user: step.user || 'System',
            time: step.time || 'Pending',
            details: step.details || ''
        };
        return acc;
    }, {}) || {};

    const pipelineSteps = [
        "Uploading File...",
        "Validating Structure...",
        "Parsing Resume...",
        "Extracting Skills...",
        "Extracting Experience...",
        "Extracting Education...",
        "Running ATS Engine...",
        "Generating AI Suggestions...",
        "Analysis Complete!"
    ];

    if (!mounted) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center text-zinc-500 text-xs">
                <Loader2 className="w-6 h-6 animate-spin text-[#FF7A00] mb-2" />
                <span>Loading Enterprise Workspace...</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-[#E4E4E7] font-sans selection:bg-[#FF7A00]/30 selection:text-white transition-colors duration-200">
            {/* Toast Notification */}
            {toast && (
                <div className={`fixed top-6 right-6 z-50 px-5 py-3.5 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${
                    toast.type === 'success' ? 'border-emerald-500/30 bg-emerald-950/90 text-emerald-400 shadow-emerald-500/5' :
                    'border-red-500/30 bg-red-950/90 text-red-400 shadow-red-500/5'
                }`}>
                    <div className="flex items-center gap-2.5">
                        {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                        <span className="text-xs font-bold tracking-wide">{toast.message}</span>
                    </div>
                </div>
            )}

            {/* Premium Sticky Header */}
            <header className="border-b border-white/5 bg-[#050505]/80 backdrop-blur-md sticky top-0 z-40 px-4 md:px-8 py-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 max-w-[1400px] mx-auto w-full">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-xl md:text-2xl font-black font-heading text-white tracking-tight">
                                ATS Analysis Workspace
                            </h1>
                            {activeReview && (
                                <>
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                                        {activeReview.status}
                                    </span>
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-red-500/10 border border-red-500/20 text-red-400">
                                        {activeReview.priority} Priority
                                    </span>
                                </>
                            )}
                        </div>
                        <p className="text-xs text-zinc-500 mt-1">
                            PhoenixAI Studio Premium Client Portal / Candidate: <span className="text-white font-semibold">{activeReview?.candidate || 'None Selected'}</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-4 self-start md:self-center">
                        <ModuleToggle moduleKey="ats-analysis" moduleName="ATS Analysis" />
                        
                        {reviews.length > 0 && (
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-zinc-500 font-bold hidden sm:inline">Active Candidate:</span>
                                <select 
                                    value={activeReviewId || ''}
                                    onChange={(e) => e.target.value && fetchReviewDetails(e.target.value)}
                                    className="bg-zinc-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#FF7A00]"
                                >
                                    {reviews.map((r) => (
                                        <option key={r.reviewId} value={r.reviewId}>
                                            {r.candidate} ({r.scores.find((s: any) => s.metric === 'overall')?.value || 70}%)
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <button 
                            onClick={() => { setActiveReviewId(null); setActiveReview(null); setUploadedFile(null); }}
                            className="h-9 px-3 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white hover:bg-white/10 transition-all flex items-center gap-1.5 shrink-0"
                        >
                            <Upload className="w-3.5 h-3.5" /> Upload New
                        </button>

                        {activeReview && (
                            <button 
                                onClick={() => handleExport('pdf')}
                                disabled={loading === 'export-pdf'}
                                className="h-9 px-4 rounded-xl bg-[#FF7A00] text-xs font-bold text-white hover:bg-[#FF851A] hover:shadow-[0_0_15px_rgba(255,122,0,0.3)] transition-all flex items-center gap-1.5 disabled:opacity-50 shrink-0"
                            >
                                {loading === 'export-pdf' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
                                Export Report
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Application Container */}
            <main className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 space-y-6">
                
                {activeReview ? (
                    <>
                        {/* Summary Panel */}
                        <section className="bg-[#0D1117]/60 border border-white/5 rounded-[22px] p-6 shadow-[0_4px_30px_rgba(0,0,0,0.4)] relative overflow-hidden animate-fade-in">
                            <div className="absolute top-0 left-0 w-[4px] h-full bg-gradient-to-b from-[#FF7A00] to-transparent" />
                            
                            <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/5 flex-wrap gap-2">
                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                    Review Metadata Workspace
                                </span>
                                <span className="text-[10px] text-zinc-500">
                                    Last Updated: {activeReview.reviewDate}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-y-5 gap-x-6">
                                <div>
                                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Review ID</p>
                                    <p className="text-sm font-semibold text-white">{activeReview.reviewId}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Candidate</p>
                                    <p className="text-sm font-semibold text-white">{activeReview.candidate}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Assigned Reviewer</p>
                                    <p className="text-sm font-semibold text-white">{activeReview.assignedReviewer}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Department</p>
                                    <p className="text-sm font-semibold text-[#FF7A00]">Engineering</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Priority</p>
                                    <span className="inline-block px-2 py-0.5 rounded-md text-xs font-bold bg-red-500/10 border border-red-500/20 text-red-400">
                                        {activeReview.priority}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Status</p>
                                    <span className="inline-block px-2 py-0.5 rounded-md text-xs font-bold bg-blue-500/10 border border-blue-500/20 text-blue-400">
                                        {activeReview.status}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Expected Delivery</p>
                                    <p className="text-sm font-semibold text-white">2026-07-15</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Review Stage</p>
                                    <p className="text-sm font-semibold text-[#FF7A00] flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#FF7A00] animate-pulse" />
                                        {activeReview.status === 'Approved' ? 'Ready for Dispatch' : 'AI review completed'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Review Progress</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-[#FF7A00] to-[#FF8A33] shadow-[0_0_8px_rgba(255,122,0,0.4)]" style={{ width: '85%' }} />
                                        </div>
                                        <span className="text-[11px] font-bold text-[#FF8A33]">85%</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Quick Review Actions Grid */}
                        <section className="bg-[#0D1117]/60 border border-white/5 rounded-[22px] p-4">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                                <button 
                                    onClick={() => handleStatusUpdate('Approved')}
                                    className="h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400 hover:bg-emerald-500/25 hover:border-emerald-500/40 hover:shadow-[0_0_15px_rgba(16,185,129,0.1)] transition-all flex items-center justify-center gap-2"
                                >
                                    <CheckCircle className="w-4 h-4" /> Approve
                                </button>
                                <button 
                                    onClick={() => handleStatusUpdate('Returned')}
                                    className="h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-400 hover:bg-amber-500/25 hover:border-amber-500/40 hover:shadow-[0_0_15px_rgba(245,158,11,0.1)] transition-all flex items-center justify-center gap-2"
                                >
                                    <RotateCcw className="w-4 h-4" /> Request Revision
                                </button>
                                <button 
                                    onClick={() => handleStatusUpdate('Rejected')}
                                    className="h-11 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-bold text-red-400 hover:bg-red-500/25 hover:border-red-500/40 hover:shadow-[0_0_15px_rgba(239,68,68,0.1)] transition-all flex items-center justify-center gap-2"
                                >
                                    <XCircle className="w-4 h-4" /> Reject
                                </button>
                                <button 
                                    onClick={() => handleExport('pdf')}
                                    className="h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs font-bold text-purple-400 hover:bg-purple-500/25 hover:border-purple-500/40 hover:shadow-[0_0_15px_rgba(168,85,247,0.1)] transition-all flex items-center justify-center gap-2"
                                >
                                    <Download className="w-4 h-4" /> Download PDF
                                </button>
                                <button 
                                    onClick={() => handleStatusUpdate('Archived')}
                                    className="h-11 rounded-xl bg-zinc-500/10 border border-zinc-500/20 text-xs font-bold text-zinc-400 hover:bg-zinc-500/25 hover:border-zinc-500/40 transition-all flex items-center justify-center gap-2"
                                >
                                    <Archive className="w-4 h-4" /> Archive Review
                                </button>
                                <button 
                                    onClick={handleDeleteReview}
                                    className="h-11 rounded-xl bg-red-950/30 border border-red-900/50 text-xs font-bold text-red-400 hover:bg-red-900/40 transition-all flex items-center justify-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" /> Delete Review
                                </button>
                            </div>
                        </section>

                        {/* ATS KPI Dashboard */}
                        <section className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                    ATS KPI Dashboard
                                </span>
                                <span className="text-xs text-zinc-500">
                                    Click cards to view calculation models
                                </span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {kpiData.map((kpi) => {
                                    const meta = kpisMetadata[kpi.label as keyof typeof kpisMetadata] || { label: kpi.label, icon: Award, color: 'text-[#FF7A00]' };
                                    const Icon = meta.icon;
                                    return (
                                        <div 
                                            key={kpi.label}
                                            onClick={() => handleOpenScoreDrawer(kpi.label)}
                                            className="bg-[#0D1117]/60 border border-white/5 rounded-[20px] p-5 space-y-4 hover:border-[#FF7A00]/40 hover:shadow-[0_0_30px_rgba(255,122,0,0.08)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group relative overflow-hidden"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className={`p-2 rounded-xl bg-white/5 ${meta.color} group-hover:scale-105 transition-transform duration-200 shrink-0`}>
                                                        <Icon className="w-3.5 h-3.5" />
                                                    </div>
                                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider truncate max-w-[80px] sm:max-w-none">
                                                        {meta.label}
                                                    </span>
                                                </div>
                                                <div className={`flex items-center gap-0.5 text-[9px] font-bold shrink-0 ${
                                                    kpi.trend === 'up' ? 'text-emerald-400' :
                                                    kpi.trend === 'down' ? 'text-red-400' :
                                                    'text-zinc-500'
                                                }`}>
                                                    {kpi.trend === 'up' ? <TrendingUp className="w-3 h-3" /> :
                                                     kpi.trend === 'down' ? <TrendingDown className="w-3 h-3" /> :
                                                     null}
                                                    {kpi.trend === 'up' ? '+2.4%' : kpi.trend === 'down' ? '-1.2%' : '0%'}
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-3xl font-extrabold text-white group-hover:text-[#FF7A00] transition-colors tracking-tight">
                                                    {kpi.value}
                                                </span>
                                                <span className="text-xs text-zinc-500">{kpi.suffix || '%'}</span>
                                            </div>
                                            
                                            <div className="space-y-1">
                                                <div className="h-1 w-full rounded-full bg-white/5 overflow-hidden">
                                                    <div 
                                                        className="h-full bg-gradient-to-r from-[#FF7A00] to-[#FF8A33]"
                                                        style={{ width: `${typeof kpi.value === 'number' ? kpi.value : 0}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                        {/* Score Trend & Workflow 2-Column Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            {/* Left 8 Spans: Interactive Chart */}
                            <div className="lg:col-span-8">
                                <div className="bg-[#0D1117]/60 border border-white/5 rounded-[22px] p-6 shadow-[0_4px_30px_rgba(0,0,0,0.3)] h-full flex flex-col justify-between">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                                        <div>
                                            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                                <Activity className="w-4 h-4 text-[#FF7A00]" /> ATS Score Timeline
                                            </h3>
                                            <p className="text-xs text-zinc-500 mt-0.5">Optimization iterations trend logs</p>
                                        </div>
                                        <div className="flex items-center gap-2 self-start sm:self-center">
                                            <div className="flex items-center bg-white/5 rounded-lg p-0.5 border border-white/10 text-xs">
                                                {['1W', '1M', '3M', 'All'].map((range) => (
                                                    <button 
                                                        key={range}
                                                        className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                                                            range === 'All' ? 'bg-[#FF7A00] text-white' : 'text-zinc-400 hover:text-white'
                                                        }`}
                                                        onClick={() => showToast(`Timeline range changed: ${range}`, 'success')}
                                                    >
                                                        {range}
                                                    </button>
                                                ))}
                                            </div>
                                            <button 
                                                onClick={() => showToast('Timeline filters toggled', 'success')}
                                                className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                                            >
                                                <Filter className="w-3.5 h-3.5" />
                                            </button>
                                            <button 
                                                onClick={() => handleExport('csv')}
                                                className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                                            >
                                                <Download className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="h-[240px] w-full">
                                        {timelineData.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart
                                                    data={timelineData}
                                                    margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                                                >
                                                    <defs>
                                                        <linearGradient id="scoreGlowMain" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#FF7A00" stopOpacity={0.25}/>
                                                            <stop offset="95%" stopColor="#FF7A00" stopOpacity={0.0}/>
                                                        </linearGradient>
                                                    </defs>
                                                    <XAxis dataKey="name" stroke="#71717A" fontSize={10} tickLine={false} axisLine={false} />
                                                    <YAxis stroke="#71717A" fontSize={10} tickLine={false} axisLine={false} domain={[50, 100]} />
                                                    <Tooltip 
                                                        contentStyle={{ 
                                                            background: '#0D1117', 
                                                            borderColor: 'rgba(255,255,255,0.08)',
                                                            borderRadius: '12px',
                                                            color: '#fff',
                                                            fontSize: '11px',
                                                            fontWeight: 'bold'
                                                        }}
                                                    />
                                                    <Area type="monotone" dataKey="score" stroke="#FF7A00" strokeWidth={3} fillOpacity={1} fill="url(#scoreGlowMain)" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs text-zinc-500">
                                                Loading trend chart...
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-white/5">
                                        <div className="p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                                            <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-0.5">Current Score</p>
                                            <p className="text-lg font-bold text-emerald-400 flex items-center gap-1">
                                                <TrendingUp className="w-3.5 h-3.5" /> {getMetricValue('overall')}%
                                            </p>
                                        </div>
                                        <div className="p-3 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                                            <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-0.5">Confidence Rating</p>
                                            <p className="text-lg font-bold text-blue-400">{getMetricValue('confidence')}%</p>
                                        </div>
                                        <div className="p-3 rounded-2xl bg-[#FF7A00]/5 border border-[#FF7A00]/10">
                                            <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-0.5">Review Priority</p>
                                            <p className="text-lg font-bold text-[#FF8A33] uppercase">{activeReview.priority}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right 4 Spans: Workflow timeline */}
                            <div className="lg:col-span-4">
                                <div className="bg-[#0D1117]/60 border border-white/5 rounded-[22px] p-6 shadow-[0_4px_30px_rgba(0,0,0,0.3)] h-full">
                                    <div className="pb-4 mb-4 border-b border-white/5">
                                        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-[#FF7A00]" /> Review Workflow
                                        </h3>
                                        <p className="text-xs text-zinc-500 mt-0.5">Historical pipeline audits</p>
                                    </div>

                                    <div className="space-y-4">
                                        {activeReview.workflowSteps && activeReview.workflowSteps.map((step: any, index: number) => {
                                            const isLast = index === activeReview.workflowSteps.length - 1;
                                            const isExpanded = expandedWorkflowSteps[step.stepId];
                                            const isCompleted = step.status === 'completed';
                                            const isRunning = step.status === 'running';
                                            const isFailed = step.status === 'failed';
                                            
                                            const meta = workflowStepMeta[step.stepId] || { user: 'System', time: 'Pending', details: '' };

                                            return (
                                                <div key={step.stepId} className="relative flex gap-3">
                                                    <div className="flex flex-col items-center shrink-0">
                                                        <button 
                                                            onClick={() => toggleWorkflowStep(step.stepId)}
                                                            className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
                                                                isCompleted ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' :
                                                                isRunning ? 'bg-[#FF7A00]/10 border-[#FF7A00] text-[#FF8A33] animate-pulse' :
                                                                isFailed ? 'bg-red-500/10 border-red-500 text-red-400' :
                                                                'bg-white/5 border-white/10 text-zinc-600'
                                                            }`}
                                                        >
                                                            {isCompleted ? <Check className="w-3 h-3" /> :
                                                             isRunning ? <Loader2 className="w-3 h-3 animate-spin" /> :
                                                             isFailed ? <X className="w-3 h-3" /> :
                                                             <span className="text-[9px] font-bold">{index + 1}</span>}
                                                        </button>
                                                        {!isLast && (
                                                            <div className={`w-[1px] flex-1 my-1 ${
                                                                isCompleted ? 'bg-emerald-500/30' : 'bg-white/5'
                                                            }`} style={{ minHeight: '18px' }} />
                                                        )}
                                                    </div>

                                                    <div className="flex-1 pb-3">
                                                        <div 
                                                            className="flex items-start justify-between cursor-pointer group"
                                                            onClick={() => toggleWorkflowStep(step.stepId)}
                                                        >
                                                            <div>
                                                                <h4 className={`text-xs font-bold transition-colors ${
                                                                    isCompleted ? 'text-white' :
                                                                    isRunning ? 'text-[#FF8A33]' :
                                                                    'text-zinc-500'
                                                                }`}>
                                                                    {step.label}
                                                                </h4>
                                                                <span className="text-[9px] text-zinc-500 block mt-0.5">{meta.time}</span>
                                                            </div>
                                                            <span className={`text-[8px] font-bold uppercase tracking-wider ${
                                                                isCompleted ? 'text-emerald-400' :
                                                                isRunning ? 'text-[#FF8A33]' :
                                                                'text-zinc-600'
                                                            }`}>
                                                                {step.status}
                                                            </span>
                                                        </div>

                                                        {isExpanded && meta.details && (
                                                            <div className="mt-2 p-2.5 rounded-lg bg-white/5 border border-white/10 text-[10px] text-zinc-400 leading-normal animate-fade-in">
                                                                {meta.details}
                                                                <p className="text-[9px] text-zinc-500 mt-1 font-bold">Assigned to: {meta.user}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Primary Content Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                            
                            {/* Left Column (8 Spans) */}
                            <div className="lg:col-span-8 space-y-6">
                                
                                {/* Tab Selector Card */}
                                <div className="bg-[#0D1117]/60 border border-white/5 rounded-[22px] p-2 flex items-center gap-1 overflow-x-auto scrollbar-none">
                                    {tabs.map((tab) => {
                                        const Icon = tab.icon;
                                        const isActive = activeTab === tab.id;
                                        return (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveTab(tab.id)}
                                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                                                    isActive 
                                                        ? 'text-white bg-[#FF7A00] shadow-lg shadow-[#FF7A00]/20' 
                                                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                                                }`}
                                            >
                                                <Icon className="w-3.5 h-3.5" />
                                                {tab.label}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Active Tab Container */}
                                <div className="bg-[#0D1117]/60 border border-white/5 rounded-[22px] p-6 shadow-[0_4px_30px_rgba(0,0,0,0.3)] min-h-[400px]">
                                    
                                    {/* OVERVIEW TAB */}
                                    {activeTab === 'overview' && (
                                        <div className="space-y-6 animate-fade-in">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                                    <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">ATS Core Assessment</h4>
                                                    <p className="text-sm text-zinc-300 leading-relaxed">
                                                        Resume demonstrates {getMetricValue('overall')}% compatibility. Highlighted strengths include robust modern frameworks matching target requirements. Gap analysis shows opportunities in specific advanced modules.
                                                    </p>
                                                </div>
                                                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                                    <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Recruiter Opinion</h4>
                                                    <p className="text-sm text-zinc-300 leading-relaxed">
                                                        Good visual format with high keyword match. Suggest reinforcing the Professional Summary section with quantified results and achievements.
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                                                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                        <CheckCircle className="w-4 h-4" /> Core Strengths
                                                    </h4>
                                                    <ul className="space-y-2 text-xs text-zinc-300">
                                                        {getKeywordsByCategory('matched').slice(0, 4).map((kw, i) => (
                                                            <li key={i} className="flex items-center gap-2">• Robust keyword match: {kw.word} ({kw.importance} importance)</li>
                                                        ))}
                                                        {getKeywordsByCategory('matched').length === 0 && (
                                                            <li className="text-zinc-500">No strengths identified yet.</li>
                                                        )}
                                                    </ul>
                                                </div>
                                                <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                                                    <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                        <AlertTriangle className="w-4 h-4" /> Priority Warnings
                                                    </h4>
                                                    <ul className="space-y-2 text-xs text-zinc-300">
                                                        {getKeywordsByCategory('missing').slice(0, 3).map((kw, i) => (
                                                            <li key={i} className="flex items-center gap-2">• Missing keyword: {kw.word} ({kw.importance})</li>
                                                        ))}
                                                        {activeReview.formattingIssues?.slice(0, 1).map((f: any, i: number) => (
                                                            <li key={i} className="flex items-center gap-2">• Formatting Issue: {f.description}</li>
                                                        ))}
                                                        {getKeywordsByCategory('missing').length === 0 && activeReview.formattingIssues?.length === 0 && (
                                                            <li className="text-zinc-500">No warnings identified.</li>
                                                        )}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* KEYWORDS TAB */}
                                    {activeTab === 'keywords' && (
                                        <div className="space-y-6 animate-fade-in">
                                            <div className="space-y-3">
                                                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                                                    <CheckCircle className="w-4 h-4" /> Matched Keywords ({getKeywordsByCategory('matched').length})
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {getKeywordsByCategory('matched').map((kw, i) => (
                                                        <span key={i} className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${getImportanceColor(kw.importance)}`}>
                                                            {kw.word}
                                                            <span className="text-[9px] opacity-60 font-semibold uppercase">{kw.importance}</span>
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
                                                    <XCircle className="w-4 h-4" /> Missing Key Terms ({getKeywordsByCategory('missing').length})
                                                </h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    {getKeywordsByCategory('missing').map((kw, i) => (
                                                        <div key={i} className="p-3.5 rounded-xl bg-red-500/5 border border-red-500/10 flex items-center justify-between">
                                                            <div>
                                                                <span className="text-xs font-bold text-white">{kw.word}</span>
                                                                <p className="text-[10px] text-zinc-500 mt-0.5">{kw.suggestion}</p>
                                                            </div>
                                                            <button 
                                                                onClick={() => showToast(`Suggestion applied: ${kw.word}`, 'success')}
                                                                className="h-7 px-3 rounded-lg bg-[#FF7A00]/10 border border-[#FF7A00]/20 text-[#FF8A33] text-[10px] font-bold hover:bg-[#FF7A00]/25 transition-all"
                                                            >
                                                                Add Term
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                                                    <AlertTriangle className="w-4 h-4" /> Weak Terminology ({getKeywordsByCategory('weak').length})
                                                </h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    {getKeywordsByCategory('weak').map((kw, i) => (
                                                        <div key={i} className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/10 flex items-center justify-between">
                                                            <div>
                                                                <span className="text-xs font-bold text-white">{kw.word}</span>
                                                                <p className="text-[10px] text-zinc-500 mt-0.5">{kw.suggestion}</p>
                                                            </div>
                                                            <button 
                                                                onClick={() => showToast(`Suggestion to replace ${kw.word} applied`, 'success')}
                                                                className="h-7 px-3 rounded-lg bg-[#FF7A00]/10 border border-[#FF7A00]/20 text-[#FF8A33] text-[10px] font-bold hover:bg-[#FF7A00]/25 transition-all"
                                                            >
                                                                Replace
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* FORMATTING TAB */}
                                    {activeTab === 'formatting' && (
                                        <div className="space-y-4 animate-fade-in">
                                            {activeReview.formattingIssues && activeReview.formattingIssues.map((issue: any, i: number) => (
                                                <div key={i} className={`p-4 rounded-xl border ${getSeverityColor(issue.severity)} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
                                                    <div>
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="text-xs font-bold text-white uppercase">{issue.type}</span>
                                                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${getSeverityColor(issue.severity)}`}>
                                                                {issue.severity}
                                                            </span>
                                                            {issue.location && <span className="text-[10px] text-zinc-500">• {issue.location}</span>}
                                                        </div>
                                                        <p className="text-xs text-zinc-300 mt-1.5">{issue.description}</p>
                                                    </div>
                                                    <button 
                                                        onClick={() => showToast(`Applied styling adjustments for ${issue.type}`, 'success')}
                                                        className="h-8 px-4 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition-all self-start sm:self-center"
                                                    >
                                                        Apply Fix
                                                    </button>
                                                </div>
                                            ))}
                                            {activeReview.formattingIssues?.length === 0 && (
                                                <div className="text-center text-zinc-500 text-xs py-8">No formatting issues identified!</div>
                                            )}
                                        </div>
                                    )}

                                    {/* GRAMMAR TAB */}
                                    {activeTab === 'grammar' && (
                                        <div className="space-y-4 animate-fade-in">
                                            {activeReview.grammarIssues && activeReview.grammarIssues.map((issue: any, i: number) => (
                                                <div key={i} className="p-4.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] font-bold uppercase tracking-wider">
                                                            {issue.type}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-red-400 italic">&quot;{issue.text}&quot;</p>
                                                    <p className="text-xs text-emerald-400 font-semibold">Suggested phrasing: {issue.suggestion}</p>
                                                    <p className="text-[10px] text-zinc-500">AI suggestion reasoning: {issue.aiRecommendation}</p>
                                                </div>
                                            ))}
                                            {activeReview.grammarIssues?.length === 0 && (
                                                <div className="text-center text-zinc-500 text-xs py-8">No grammar issues identified!</div>
                                            )}
                                        </div>
                                    )}

                                    {/* SECTIONS TAB */}
                                    {activeTab === 'sections' && (
                                        <div className="space-y-4 animate-fade-in">
                                            {activeReview.sectionInspectors && activeReview.sectionInspectors.map((section: any, index: number) => (
                                                <div key={section.name} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                                                    <div 
                                                        className="flex items-center justify-between cursor-pointer group"
                                                        onClick={() => toggleSectionExpand(section.name)}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <h4 className="text-xs font-bold text-white group-hover:text-[#FF7A00] transition-colors uppercase tracking-wider">{section.name}</h4>
                                                            {section.issues > 0 && (
                                                                <span className="px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-[8px] font-bold">
                                                                    {section.issues} issues
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] text-zinc-500">Score:</span>
                                                                <span className={`text-xs font-black ${
                                                                    section.score >= 90 ? 'text-emerald-400' : 'text-amber-400'
                                                                }`}>{section.score}%</span>
                                                            </div>
                                                            {expandedSections[section.name] ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
                                                        </div>
                                                    </div>
                                                    {expandedSections[section.name] && (
                                                        <div className="pt-3 border-t border-white/5 text-xs text-zinc-400 space-y-2 animate-fade-in">
                                                            <p className="font-mono text-[11px] bg-black/30 p-2.5 rounded-lg border border-white/5 text-zinc-300 select-all">{section.content}</p>
                                                            <p className="text-[10px] text-zinc-500">Suggested Action: Quantify results in the experience bullets of this section.</p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* SUGGESTIONS TAB */}
                                    {activeTab === 'suggestions' && (
                                        <div className="space-y-4 animate-fade-in">
                                            <div className="flex items-center justify-between pb-3 border-b border-white/5 flex-wrap gap-2">
                                                <h4 className="text-xs font-bold text-white uppercase tracking-wider">AI Optimization Recommendations</h4>
                                            </div>

                                            <div className="grid grid-cols-1 gap-4">
                                                {activeReview.suggestions && activeReview.suggestions.map((suggestion: any) => (
                                                    <div key={suggestion.id} className={`p-5 rounded-2xl bg-[#0D1117] border transition-all duration-200 ${
                                                        suggestion.priority === 'critical' ? 'border-red-500/20' : 'border-white/5'
                                                    } space-y-4`}>
                                                        <div className="flex items-start justify-between flex-wrap gap-2">
                                                            <div className="flex items-center gap-3">
                                                                <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                                                                    suggestion.priority === 'critical' ? 'bg-red-500/10 text-red-400' :
                                                                    suggestion.priority === 'high' ? 'bg-orange-500/10 text-[#FF8A33]' :
                                                                    'bg-blue-500/10 text-blue-400'
                                                                }`}>
                                                                    {suggestion.priority} Priority
                                                                </span>
                                                                <h4 className="text-xs font-bold text-white uppercase tracking-wide">{suggestion.title}</h4>
                                                            </div>
                                                            <span className="text-xs font-black text-emerald-400">+{suggestion.estimatedGain}% ATS Gain</span>
                                                        </div>

                                                        <p className="text-xs text-zinc-400 leading-relaxed">{suggestion.description}</p>
                                                        
                                                        <div className="flex items-center justify-between pt-3 border-t border-white/5 flex-wrap gap-2">
                                                            <div className="flex items-center gap-3 text-[10px] text-zinc-500">
                                                                <span>Difficulty: <strong className="text-white capitalize">{suggestion.difficulty}</strong></span>
                                                                <span>•</span>
                                                                <span>Impact: <strong className="text-white capitalize">{suggestion.impact}</strong></span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {suggestion.status === 'pending' ? (
                                                                    <>
                                                                        <button 
                                                                            onClick={() => handleSuggestionStatus(suggestion.id, 'fixed')}
                                                                            className="h-8 px-3.5 rounded-lg bg-[#FF7A00]/10 border border-[#FF7A00]/20 text-[#FF8A33] text-xs font-bold hover:bg-[#FF7A00]/20 hover:border-[#FF7A00]/40 transition-all flex items-center gap-1.5"
                                                                        >
                                                                            <Sparkles className="w-3.5 h-3.5" /> Apply
                                                                        </button>
                                                                        <button 
                                                                            onClick={() => handleSuggestionStatus(suggestion.id, 'ignored')}
                                                                            className="h-8 px-3 rounded-lg bg-white/5 border border-white/10 text-zinc-400 text-xs font-bold hover:bg-white/10 transition-all"
                                                                        >
                                                                            Ignore
                                                                        </button>
                                                                    </>
                                                                ) : (
                                                                    <span className="px-3.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                                                        ✓ Suggestion Applied
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* COMPARISON TAB */}
                                    {activeTab === 'comparison' && (
                                        <div className="space-y-6 animate-fade-in">
                                            <div className="grid grid-cols-3 gap-4 items-center">
                                                <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/10 text-center">
                                                    <p className="text-[10px] font-bold text-zinc-500 uppercase mb-1">Original Draft</p>
                                                    <p className="text-3xl font-black text-red-400">{getComparisonData().originalScore}%</p>
                                                </div>
                                                <div className="flex flex-col items-center justify-center">
                                                    <ArrowRight className="w-6 h-6 text-[#FF7A00] animate-pulse" />
                                                    <span className="text-base font-bold text-emerald-400 mt-1">+{getComparisonData().improvement}%</span>
                                                    <span className="text-[9px] text-zinc-500 uppercase tracking-widest mt-0.5">ATS Improvement</span>
                                                </div>
                                                <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-center">
                                                    <p className="text-[10px] font-bold text-zinc-500 uppercase mb-1">Optimized Draft</p>
                                                    <p className="text-3xl font-black text-emerald-400">{getComparisonData().optimizedScore}%</p>
                                                </div>
                                            </div>

                                            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
                                                <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Comparative Progress Log</h4>
                                                <div className="space-y-3">
                                                    <div className="space-y-1.5">
                                                        <div className="flex justify-between text-xs text-zinc-500">
                                                            <span>Baseline Draft score</span>
                                                            <span className="text-red-400 font-bold">{getComparisonData().originalScore}%</span>
                                                        </div>
                                                        <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                                                            <div className="h-full bg-red-500" style={{ width: `${getComparisonData().originalScore}%` }} />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <div className="flex justify-between text-xs text-zinc-500">
                                                            <span>Optimized review version</span>
                                                            <span className="text-emerald-400 font-bold">{getComparisonData().optimizedScore}%</span>
                                                        </div>
                                                        <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                                                            <div className="h-full bg-gradient-to-r from-[#FF7A00] to-emerald-500" style={{ width: `${getComparisonData().optimizedScore}%` }} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* ANALYTICS CHARTS TAB */}
                                    {activeTab === 'charts' && (
                                        <div className="space-y-6 animate-fade-in">
                                            <div className="pb-3 border-b border-white/5">
                                                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Advanced Resume Metrics</h4>
                                                <p className="text-xs text-zinc-500">Interactive visualizations powered by Phoenix Engine</p>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                {/* Skill Coverage Radar */}
                                                <div className="bg-[#0D1117]/40 border border-white/5 rounded-2xl p-4 space-y-3">
                                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Skill Category Coverage</span>
                                                    <div className="h-[200px] w-full flex items-center justify-center">
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                                                                { subject: 'React', A: 95, B: 62, fullMark: 100 },
                                                                { subject: 'TypeScript', A: 90, B: 68, fullMark: 100 },
                                                                { subject: 'Next.js', A: 88, B: 45, fullMark: 100 },
                                                                { subject: 'Tailwind', A: 92, B: 85, fullMark: 100 },
                                                                { subject: 'GraphQL', A: 78, B: 52, fullMark: 100 },
                                                                { subject: 'Server Comp', A: 72, B: 28, fullMark: 100 }
                                                            ]}>
                                                                <PolarGrid stroke="rgba(255,255,255,0.05)" />
                                                                <PolarAngleAxis dataKey="subject" stroke="#71717A" fontSize={8} />
                                                                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#71717A" fontSize={8} />
                                                                <Radar name="Optimized" dataKey="A" stroke="#FF7A00" fill="#FF7A00" fillOpacity={0.2} />
                                                                <Radar name="Original" dataKey="B" stroke="#71717A" fill="#71717A" fillOpacity={0.1} />
                                                            </RadarChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                </div>

                                                {/* Recruiter Simulation Engagement */}
                                                <div className="bg-[#0D1117]/40 border border-white/5 rounded-2xl p-4 space-y-3">
                                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Recruiter Scan Engagement</span>
                                                    <div className="h-[200px] w-full flex items-center justify-center">
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <RechartsPieChart>
                                                                <Pie
                                                                    data={[
                                                                        { name: 'Core Match', value: 52 },
                                                                        { name: 'Visual Scanning', value: 33 },
                                                                        { name: 'Review Friction', value: 15 }
                                                                    ]}
                                                                    cx="50%"
                                                                    cy="50%"
                                                                    innerRadius={50}
                                                                    outerRadius={70}
                                                                    paddingAngle={3}
                                                                    dataKey="value"
                                                                >
                                                                    <Cell fill="#FF7A00" />
                                                                    <Cell fill="#3B82F6" />
                                                                    <Cell fill="#EF4444" />
                                                                </Pie>
                                                                <Tooltip />
                                                                <Legend wrapperStyle={{ fontSize: '10px' }} />
                                                            </RechartsPieChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                </div>

                                                {/* Keyword Match Growth */}
                                                <div className="bg-[#0D1117]/40 border border-white/5 rounded-2xl p-4 space-y-3">
                                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Keyword Match Growth (Historical Reviews)</span>
                                                    <div className="h-[180px] w-full">
                                                        {keywordGrowthData.length > 0 ? (
                                                            <ResponsiveContainer width="100%" height="100%">
                                                                <BarChart data={keywordGrowthData}>
                                                                    <XAxis dataKey="week" stroke="#71717A" fontSize={9} tickLine={false} />
                                                                    <YAxis stroke="#71717A" fontSize={9} tickLine={false} />
                                                                    <Tooltip />
                                                                    <Bar dataKey="matched" fill="#10B981" radius={[4, 4, 0, 0]} />
                                                                    <Bar dataKey="missing" fill="#EF4444" radius={[4, 4, 0, 0]} />
                                                                </BarChart>
                                                            </ResponsiveContainer>
                                                        ) : (
                                                            <div className="text-zinc-500 text-xs text-center py-12">No database review history yet.</div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Review Duration */}
                                                <div className="bg-[#0D1117]/40 border border-white/5 rounded-2xl p-4 space-y-3">
                                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Average Action Review Time</span>
                                                    <div className="h-[180px] w-full">
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <AreaChart data={[
                                                                { day: 'Mon', time: 14 },
                                                                { day: 'Tue', time: 11 },
                                                                { day: 'Wed', time: 9 },
                                                                { day: 'Thu', time: 7 },
                                                                { day: 'Fri', time: 6 }
                                                            ]}>
                                                                <XAxis dataKey="day" stroke="#71717A" fontSize={9} tickLine={false} />
                                                                <YAxis stroke="#71717A" fontSize={9} tickLine={false} />
                                                                <Tooltip />
                                                                <Area type="monotone" dataKey="time" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.1} strokeWidth={2} />
                                                            </AreaChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* VERSION HISTORY TAB */}
                                    {activeTab === 'history' && (
                                        <div className="space-y-4 animate-fade-in">
                                            {historyData.map((record: any, index: number) => {
                                                const isLatest = index === 0;
                                                const ver = `v${4 - index}.${4 - index * 3}`;
                                                return (
                                                    <div 
                                                        key={record.id} 
                                                        className={`p-5 rounded-2xl bg-[#0D1117]/60 border transition-all duration-200 ${
                                                            isLatest ? 'border-[#FF7A00]/30 shadow-[0_0_20px_rgba(255,122,0,0.04)]' : 'border-white/5 hover:border-white/10'
                                                        } flex flex-col md:flex-row md:items-center justify-between gap-4`}
                                                    >
                                                        <div className="flex items-start gap-3.5">
                                                            <div className={`p-2.5 rounded-xl shrink-0 ${isLatest ? 'bg-[#FF7A00]/15 text-[#FF7A00]' : 'bg-white/5 text-zinc-500'}`}>
                                                                <History className="w-5 h-5" />
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                    <h4 className="text-xs font-bold text-white uppercase tracking-wide">Version {ver}</h4>
                                                                    {isLatest && (
                                                                        <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                                            Active
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p className="text-[11px] text-zinc-400 mt-1">{record.resume}</p>
                                                                <p className="text-[10px] text-zinc-500 mt-0.5">Committed: {record.date} • {record.staff}</p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center justify-between md:justify-end gap-6 flex-wrap">
                                                            <div className="text-right">
                                                                <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider block">Score</span>
                                                                <span className={`text-xl font-black ${
                                                                    record.score >= 90 ? 'text-emerald-400' : 'text-amber-400'
                                                                }`}>{record.score}%</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <button 
                                                                    onClick={() => setActiveTab('compare')}
                                                                    className="h-8 px-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold text-white transition-all flex items-center gap-1"
                                                                >
                                                                    <GitCompare className="w-3.5 h-3.5" /> Compare
                                                                </button>
                                                                <button 
                                                                    onClick={() => {
                                                                        fetchReviewDetails(record.id);
                                                                        showToast(`Restored version ${ver}`, 'success');
                                                                    }}
                                                                    className="h-8 px-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold text-white transition-all flex items-center gap-1"
                                                                >
                                                                    <RefreshCw className="w-3.5 h-3.5" /> Restore
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* DIAGNOSTICS CENTER TAB */}
                                    {activeTab === 'diagnostics' && (
                                        <div className="space-y-6 animate-fade-in">
                                            <div className="pb-3 border-b border-white/5">
                                                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Diagnostics center</h4>
                                                <p className="text-xs text-zinc-500">System scanner findings & indicators</p>
                                            </div>

                                            <div className="space-y-4">
                                                {activeReview.diagnostics && activeReview.diagnostics.map((issue: any) => (
                                                    <div key={issue.id} className={`p-4 rounded-xl border ${getSeverityColor(issue.severity)} flex flex-col justify-between space-y-3`}>
                                                        <div>
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <span className="text-xs font-bold text-white">{issue.title}</span>
                                                                <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${getSeverityColor(issue.severity)}`}>
                                                                    {issue.severity}
                                                                </span>
                                                            </div>
                                                            <p className="text-[11px] text-zinc-400 mt-1.5 leading-relaxed">{issue.description}</p>
                                                        </div>
                                                        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-zinc-500 flex-wrap gap-2">
                                                            <span>Fix: <strong className="text-emerald-400">{issue.suggestion}</strong></span>
                                                            <button 
                                                                onClick={() => handleResolveDiagnostic(issue.title)}
                                                                className="h-6 px-2.5 rounded-md bg-[#FF7A00]/10 border border-[#FF7A00]/20 text-[#FF8A33] text-[9px] font-bold hover:bg-[#FF7A00]/25 transition-all"
                                                            >
                                                                Resolve
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                                {activeReview.diagnostics?.length === 0 && (
                                                    <div className="text-center text-zinc-500 text-xs py-8">No diagnostics warnings detected!</div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* UPLOAD RESUME TAB (REUSE FROM EMPTY STATE) */}
                                    {activeTab === 'upload' && (
                                        <div className="space-y-6 animate-fade-in max-w-lg mx-auto">
                                            <div 
                                                onDragEnter={handleDrag}
                                                onDragOver={handleDrag}
                                                onDragLeave={handleDrag}
                                                onDrop={handleDrop}
                                                className={`p-8 rounded-[20px] border-2 border-dashed text-center space-y-4 transition-colors ${
                                                    dragActive ? 'border-[#FF7A00] bg-[#FF7A00]/5' : 'border-white/10 bg-white/5'
                                                }`}
                                            >
                                                <UploadCloud className="w-12 h-12 text-[#FF7A00] mx-auto mb-2" />
                                                <div>
                                                    <h4 className="text-sm font-bold text-white mb-1">Upload PDF / DOCX Resume</h4>
                                                    <p className="text-xs text-zinc-500">A4 layouts standard parsing sizes up to 10MB</p>
                                                </div>
                                                <input 
                                                    type="file" 
                                                    accept=".pdf,.docx"
                                                    className="hidden"
                                                    id="file-upload-active"
                                                    onChange={(e) => e.target.files?.[0] && handleFileValidation(e.target.files[0])}
                                                />
                                                <label 
                                                    htmlFor="file-upload-active"
                                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF7A00] text-white text-xs font-bold hover:bg-[#FF851A] hover:shadow-lg hover:shadow-[#FF7A00]/20 transition-all cursor-pointer"
                                                >
                                                    <FolderOpen className="w-4 h-4" /> Browse Files
                                                </label>
                                            </div>

                                            {uploadedFile && (
                                                <div className="p-4 rounded-xl bg-[#0D1117] border border-white/5 space-y-3">
                                                    <div className="flex items-center justify-between text-xs text-white">
                                                        <span className="font-bold truncate max-w-[200px]">{uploadedFile.name}</span>
                                                        <button onClick={() => setUploadedFile(null)} className="text-zinc-500 hover:text-white">
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                    {uploadProgress && (
                                                        <div className="space-y-1">
                                                            <div className="flex justify-between text-[10px] text-zinc-500 font-bold">
                                                                <span>Uploading...</span>
                                                                <span>{uploadProgress.percentage}%</span>
                                                            </div>
                                                            <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                                                                <div className="h-full bg-gradient-to-r from-[#FF7A00] to-[#FF8A33]" style={{ width: `${uploadProgress.percentage}%` }} />
                                                            </div>
                                                        </div>
                                                    )}
                                                    <button 
                                                        onClick={handleAnalyze}
                                                        className="w-full h-9 rounded-lg bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <Play className="w-3.5 h-3.5" /> Analyze Compatibility
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* RECRUITER SIMULATION TAB */}
                                    {activeTab === 'simulation' && (
                                        <div className="space-y-6 animate-fade-in">
                                            <div className="p-5 rounded-2xl bg-[#0D1117] border border-white/5 space-y-4">
                                                <div>
                                                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Recruiter eye scanning simulation</h4>
                                                    <p className="text-xs text-zinc-500 mt-1">Predict scan durations and focus distribution based on real eye tracking models.</p>
                                                </div>
                                                
                                                {!isSimulationRunning && (
                                                    <button 
                                                        onClick={handleRunSimulation}
                                                        className="w-full h-11 rounded-xl bg-[#FF7A00] text-xs font-bold text-white hover:bg-[#FF851A] hover:shadow-[0_0_15px_rgba(255,122,0,0.2)] transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <Play className="w-4 h-4" /> Start Simulation
                                                    </button>
                                                )}
                                                
                                                {isSimulationRunning && (
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between text-xs">
                                                            <span className="text-zinc-500 font-bold uppercase">Eye tracking pipeline...</span>
                                                            <span className="text-[#FF7A00] font-bold">{simulationProgress}%</span>
                                                        </div>
                                                        <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                                                            <div className="h-full bg-gradient-to-r from-[#FF7A00] to-[#FF8A33]" style={{ width: `${simulationProgress}%` }} />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                                                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">Attention Score</span>
                                                    <span className="text-2xl font-black text-white">{recruiterSimulation?.attentionScore || 0}%</span>
                                                </div>
                                                <div className="p-4 rounded-xl bg-[#FF7A00]/5 border border-[#FF7A00]/10">
                                                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">Scan Duration</span>
                                                    <span className="text-2xl font-black text-white">{recruiterSimulation?.scanDuration || 0}s</span>
                                                </div>
                                            </div>

                                            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                                                <span className="text-[10px] text-zinc-400 uppercase tracking-widest block">Eye Tracking Heatmap Focus</span>
                                                <div className="grid grid-cols-10 gap-1.5">
                                                    {recruiterSimulation?.heatmapData?.map((value, i) => (
                                                        <div 
                                                            key={i}
                                                            className="h-10 rounded-lg bg-[#FF7A00] transition-all"
                                                            style={{ opacity: value / 100 }}
                                                            title={`Gaze density: ${value}%`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* REVIEWER NOTES TAB */}
                                    {activeTab === 'notes' && (
                                        <div className="space-y-6 animate-fade-in">
                                            <div className="bg-[#0D1117]/60 border border-white/5 rounded-2xl p-5 space-y-4">
                                                {/* Editor Toolbar */}
                                                <div className="flex items-center gap-1 pb-3 border-b border-white/5 flex-wrap">
                                                    <button className="p-1.5 rounded hover:bg-white/5 text-zinc-400 hover:text-white transition-colors" title="Bold"><span className="font-bold text-xs">B</span></button>
                                                    <button className="p-1.5 rounded hover:bg-white/5 text-zinc-400 hover:text-white transition-colors" title="Italic"><span className="italic text-xs">I</span></button>
                                                    <button className="p-1.5 rounded hover:bg-white/5 text-zinc-400 hover:text-white transition-colors" title="Link"><Link className="w-3.5 h-3.5" /></button>
                                                    <div className="w-px h-4 bg-white/10 mx-1" />
                                                    <button className="p-1.5 rounded hover:bg-white/5 text-[#FF7A00] transition-colors" title="AI helper text"><Sparkles className="w-3.5 h-3.5" /></button>
                                                </div>

                                                {/* Note Input */}
                                                <div className="relative">
                                                    <textarea 
                                                        value={editingNoteId ? editingNoteContent : newNote}
                                                        onChange={(e) => editingNoteId ? setEditingNoteContent(e.target.value) : setNewNote(e.target.value)}
                                                        placeholder="Add reviewer feedback, client notes, or internal details..."
                                                        className="w-full h-24 bg-transparent text-xs text-white resize-none focus:outline-none placeholder-zinc-600 font-sans"
                                                    />
                                                </div>

                                                {/* Controls */}
                                                <div className="flex items-center justify-between pt-3 border-t border-white/5 flex-wrap gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] text-zinc-500">Visibility:</span>
                                                        <select 
                                                            value={noteType}
                                                            onChange={(e) => setNoteType(e.target.value as any)}
                                                            className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
                                                        >
                                                            <option value="internal">Internal Team Note</option>
                                                            <option value="client">Client-Facing Comment</option>
                                                            <option value="reviewer">Reviewer Workspace Note</option>
                                                        </select>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        {editingNoteId ? (
                                                            <>
                                                                <button 
                                                                    onClick={handleSaveEditNote}
                                                                    className="h-8 px-4 rounded-xl bg-emerald-500 text-xs font-bold text-white hover:bg-emerald-600 transition-all"
                                                                >
                                                                    Save Update
                                                                </button>
                                                                <button 
                                                                    onClick={() => setEditingNoteId(null)}
                                                                    className="h-8 px-3 rounded-xl bg-white/5 border border-white/10 text-zinc-400 text-xs font-bold hover:bg-white/10 transition-all"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <button 
                                                                onClick={handleAddNote}
                                                                className="h-8.5 px-4 rounded-xl bg-[#FF7A00] text-xs font-bold text-white hover:bg-[#FF851A] transition-all flex items-center gap-1.5"
                                                            >
                                                                <MessageSquarePlus className="w-4 h-4" /> Save Note
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Discussion Thread */}
                                            <div className="space-y-3.5">
                                                <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Internal Discussion history</h4>
                                                {activeReview.notes && activeReview.notes.map((note: any) => (
                                                    <div key={note.id} className="p-4 rounded-xl bg-white/5 border border-white/10 relative group">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <div className="flex items-center gap-2.5">
                                                                <div className="w-7 h-7 rounded-full bg-[#FF7A00]/10 text-[#FF8A33] border border-[#FF7A00]/25 flex items-center justify-center text-xs font-bold shrink-0">
                                                                    {note.author.split(' ').map((n: string) => n[0]).join('')}
                                                                </div>
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-xs font-bold text-white">{note.author}</span>
                                                                        <span className={`px-1.5 py-0.2 rounded text-[7px] font-bold uppercase tracking-wider border ${
                                                                            note.type === 'internal' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                                            note.type === 'client' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                                            'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                                        }`}>
                                                                            {note.type}
                                                                        </span>
                                                                    </div>
                                                                    <span className="text-[9px] text-zinc-500 block mt-0.5">{note.timestamp}</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button onClick={() => { setEditingNoteId(note.id); setEditingNoteContent(note.content); }} className="p-1 rounded hover:bg-white/5 text-zinc-400" title="Edit"><Edit3 className="w-3.5 h-3.5" /></button>
                                                                <button onClick={() => handleDeleteNote(note.id)} className="p-1 rounded hover:bg-red-500/15 text-zinc-400 hover:text-red-400" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-zinc-300 leading-relaxed pl-9">{note.content}</p>
                                                    </div>
                                                ))}
                                                {activeReview.notes?.length === 0 && (
                                                    <div className="text-center text-zinc-500 text-xs py-8">No notes yet. Add a note to begin discussion!</div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* ACTIVITY TIMELINE TAB */}
                                    {activeTab === 'timeline' && (
                                        <div className="space-y-4 animate-fade-in">
                                            <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Chronological Event Logs</h4>
                                            {activeReview.timeline && activeReview.timeline.map((event: any, index: number) => {
                                                const isLast = index === activeReview.timeline.length - 1;
                                                const getStatusColor = () => {
                                                    switch (event.type) {
                                                        case 'approved': return 'border-emerald-500 text-emerald-400 bg-emerald-500/5';
                                                        case 'rejected': return 'border-red-500 text-red-400 bg-red-500/5';
                                                        case 'returned': return 'border-amber-500 text-amber-400 bg-amber-500/5';
                                                        case 'analyzed': return 'border-blue-500 text-blue-400 bg-blue-500/5';
                                                        default: return 'border-white/10 text-zinc-500 bg-white/5';
                                                    }
                                                };
                                                return (
                                                    <div key={event.id} className="relative pl-7 flex gap-4">
                                                        {!isLast && <div className="absolute left-[9px] top-6 bottom-0 w-[1px] bg-white/5" />}
                                                        
                                                        <div className={`absolute left-0 top-1 w-5 h-5 rounded-full flex items-center justify-center border-2 shrink-0 ${getStatusColor()}`}>
                                                            {event.type === 'approved' ? <Check className="w-2.5 h-2.5" /> :
                                                             event.type === 'rejected' ? <X className="w-2.5 h-2.5" /> :
                                                             event.type === 'returned' ? <RotateCcw className="w-2.5 h-2.5" /> :
                                                             <Activity className="w-2.5 h-2.5" />}
                                                        </div>

                                                        <div className="flex-1 p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                                                            <div className="flex justify-between items-center text-[10px] text-zinc-500 flex-wrap gap-2">
                                                                <span className="font-bold text-white uppercase tracking-wider">{event.type}</span>
                                                                <span>{event.timestamp}</span>
                                                            </div>
                                                            <p className="text-xs text-zinc-300">{event.description}</p>
                                                            <p className="text-[9px] text-zinc-500 font-semibold uppercase">Operator: {event.user}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* INSPECTOR TAB */}
                                    {activeTab === 'inspector' && (
                                        <div className="space-y-4 animate-fade-in">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 space-y-2">
                                                    <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                                                        <AlertTriangle className="w-3.5 h-3.5" /> Missing Skills
                                                    </h4>
                                                    <ul className="space-y-1 text-xs text-zinc-300 pl-1">
                                                        {getKeywordsByCategory('missing').map((k, i) => (
                                                            <li key={i}>• {k.word}</li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 space-y-2">
                                                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                                                        <Layout className="w-3.5 h-3.5" /> Formatting Issues
                                                    </h4>
                                                    <ul className="space-y-1 text-xs text-zinc-300 pl-1">
                                                        {activeReview.formattingIssues && activeReview.formattingIssues.map((f: any, i: number) => (
                                                            <li key={i}>• {f.description}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* HEATMAP TAB */}
                                    {activeTab === 'heatmap' && (
                                        <div className="space-y-4 animate-fade-in">
                                            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Skill Mapping Density</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="p-4 rounded-xl bg-[#0D1117] border border-white/5 space-y-3">
                                                    <h5 className="text-xs font-bold text-white uppercase">Technical Skills Match</h5>
                                                    <div className="space-y-2">
                                                        {getKeywordsByCategory('matched').slice(0, 5).map((kw) => (
                                                            <div key={kw.word} className="flex justify-between items-center text-xs">
                                                                <span className="text-zinc-400">{kw.word}</span>
                                                                <span className="text-emerald-400 font-bold">Strong</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="p-4 rounded-xl bg-[#0D1117] border border-white/5 space-y-3">
                                                    <h5 className="text-xs font-bold text-white uppercase">Industry Keywords Match</h5>
                                                    <div className="space-y-2">
                                                        {getKeywordsByCategory('industry').slice(0, 5).map((kw) => (
                                                            <div key={kw.word} className="flex justify-between items-center text-xs">
                                                                <span className="text-zinc-400">{kw.word}</span>
                                                                <span className="text-emerald-400 font-bold">Matched</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* CHECKLIST TAB */}
                                    {activeTab === 'checklist' && (
                                        <div className="space-y-4 animate-fade-in">
                                            <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
                                                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Review checklists</h4>
                                                <span className="text-xs font-bold text-[#FF7A00]">60% COMPLETE</span>
                                            </div>

                                            <div className="space-y-2.5">
                                                {[
                                                    { label: 'Verify personal info and active contacts', checked: true },
                                                    { label: 'Check ATS score passes standard benchmarks', checked: true },
                                                    { label: 'Validate keyword density alignment', checked: false },
                                                    { label: 'Review format margins and font sizes', checked: true },
                                                    { label: 'Quantify action verbs in bullet lists', checked: false }
                                                ].map((item, i) => (
                                                    <div key={i} className="flex items-center gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                                                        <button 
                                                            onClick={() => showToast(`Checklist toggled`, 'success')}
                                                            className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                                                                item.checked ? 'bg-emerald-500 border-emerald-500' : 'bg-white/5 border-white/20'
                                                            }`}
                                                        >
                                                            {item.checked && <Check className="w-3.5 h-3.5 text-white" />}
                                                        </button>
                                                        <span className={`text-xs ${item.checked ? 'text-zinc-300' : 'text-zinc-500'}`}>{item.label}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* COMPARE TAB */}
                                    {activeTab === 'compare' && (
                                        <div className="space-y-6 animate-fade-in">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/10 space-y-3">
                                                    <h4 className="text-xs font-bold text-red-400 uppercase tracking-widest">Original CV parameters</h4>
                                                    <div className="space-y-2 text-xs">
                                                        <div className="flex justify-between border-b border-white/5 pb-1">
                                                            <span className="text-zinc-500">ATS Score</span>
                                                            <span className="text-red-400 font-bold">{getComparisonData().originalScore}%</span>
                                                        </div>
                                                        <div className="flex justify-between border-b border-white/5 pb-1">
                                                            <span className="text-zinc-500">Keywords matched</span>
                                                            <span className="text-red-400 font-bold">{getKeywordsByCategory('matched').length - 4 > 0 ? getKeywordsByCategory('matched').length - 4 : 4} Matched</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 space-y-3">
                                                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Optimized CV parameters</h4>
                                                    <div className="space-y-2 text-xs">
                                                        <div className="flex justify-between border-b border-white/5 pb-1">
                                                            <span className="text-zinc-500">ATS Score</span>
                                                            <span className="text-emerald-400 font-bold">{getComparisonData().optimizedScore}%</span>
                                                        </div>
                                                        <div className="flex justify-between border-b border-white/5 pb-1">
                                                            <span className="text-zinc-500">Keywords matched</span>
                                                            <span className="text-emerald-400 font-bold">{getKeywordsByCategory('matched').length} Matched</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 space-y-2">
                                                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                                                    <TrendingUp className="w-4 h-4" /> Optimization Gains list
                                                </h4>
                                                <ul className="space-y-1.5 text-xs text-zinc-300 pl-1">
                                                    <li>• Matched missing core framework parameters</li>
                                                    <li>• Standardized margins and layouts</li>
                                                    <li>• Resolved weak action verbs in experience block</li>
                                                    <li>• Raised overall scanner rating by {getComparisonData().improvement}%</li>
                                                </ul>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Column (4 Spans) */}
                            <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
                                
                                {/* Sticky Resume Preview Card */}
                                <div className="bg-[#0D1117]/60 border border-white/5 rounded-[22px] p-5 shadow-[0_4px_30px_rgba(0,0,0,0.3)] flex flex-col space-y-4 animate-fade-in">
                                    <div className="flex items-center justify-between pb-3 border-b border-white/5">
                                        <h3 className="text-xs font-bold text-white uppercase tracking-wider">Resume Preview</h3>
                                        <div className="flex items-center gap-1">
                                            <button 
                                                onClick={() => setHighlightSections(!highlightSections)}
                                                className={`p-1.5 rounded-lg border transition-all ${
                                                    highlightSections ? 'bg-[#FF7A00]/10 border-[#FF7A00]/30 text-[#FF8A33]' : 'bg-white/5 border-white/10 text-zinc-400'
                                                }`}
                                                title="Toggle highlighting"
                                            >
                                                <Layers className="w-3.5 h-3.5" />
                                            </button>
                                            <button 
                                                onClick={() => setHighlightKeywords(!highlightKeywords)}
                                                className={`p-1.5 rounded-lg border transition-all ${
                                                    highlightKeywords ? 'bg-[#FF7A00]/10 border-[#FF7A00]/30 text-[#FF8A33]' : 'bg-white/5 border-white/10 text-zinc-400'
                                                }`}
                                                title="Highlight keywords"
                                            >
                                                <TargetIcon className="w-3.5 h-3.5" />
                                            </button>
                                            <button 
                                                onClick={() => setRotateDegree((prev) => (prev + 90) % 360)}
                                                className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-white transition-all"
                                                title="Rotate preview"
                                            >
                                                <RotateCcw className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Scaling Controls */}
                                    <div className="flex items-center justify-between text-xs text-zinc-400 bg-white/5 rounded-xl p-2 border border-white/5">
                                        <div className="flex items-center gap-1.5">
                                            <button 
                                                onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
                                                className="w-7 h-7 rounded-lg bg-[#050505] hover:bg-white/5 flex items-center justify-center transition-colors border border-white/5"
                                            >
                                                <ZoomOut className="w-3.5 h-3.5" />
                                            </button>
                                            <span className="w-10 text-center font-bold text-[11px]">{zoomLevel}%</span>
                                            <button 
                                                onClick={() => setZoomLevel(Math.min(130, zoomLevel + 10))}
                                                className="w-7 h-7 rounded-lg bg-[#050505] hover:bg-white/5 flex items-center justify-center transition-colors border border-white/5"
                                            >
                                                <ZoomIn className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <button 
                                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                                disabled={currentPage === 1}
                                                className="p-1.5 rounded hover:bg-[#050505] transition-colors disabled:opacity-30"
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                            </button>
                                            <span className="font-bold text-[10px]">P. {currentPage} / {totalPages}</span>
                                            <button 
                                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                                disabled={currentPage === totalPages}
                                                className="p-1.5 rounded hover:bg-[#050505] transition-colors disabled:opacity-30"
                                            >
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Canvas simulated page preview */}
                                    <div className="border border-white/10 rounded-xl overflow-hidden bg-zinc-900 relative p-1 max-h-[360px] overflow-y-auto">
                                        <div 
                                            className="w-full bg-white text-[#18181B] shadow-inner font-serif transition-all duration-200"
                                            style={{ 
                                                transform: `scale(${zoomLevel / 100}) rotate(${rotateDegree}deg)`,
                                                transformOrigin: 'top left',
                                                minHeight: '440px',
                                                padding: '24px'
                                            }}
                                        >
                                            <div className={`border-b-2 border-zinc-200 pb-3 mb-3 ${
                                                highlightSections && highlightedSection === 'header' ? 'bg-[#FF7A00]/10 ring-1 ring-[#FF7A00]/30' : ''
                                            }`}
                                            onMouseEnter={() => setHighlightedSection('header')}
                                            onMouseLeave={() => setHighlightedSection(null)}
                                            >
                                                <h4 className="text-base font-extrabold text-black font-sans leading-none">{activeReview.candidate}</h4>
                                                <p className="text-[10px] text-zinc-600 font-sans mt-1">Senior Specialist Engineer</p>
                                                <p className="text-[8px] text-zinc-500 font-sans mt-0.5">contact@phoenixaistudio.com | San Francisco, CA</p>
                                            </div>

                                            <div className={`mb-3.5 ${
                                                highlightSections && highlightedSection === 'summary' ? 'bg-[#FF7A00]/10 ring-1 ring-[#FF7A00]/30' : ''
                                            }`}
                                            onMouseEnter={() => setHighlightedSection('summary')}
                                            onMouseLeave={() => setHighlightedSection(null)}
                                            >
                                                <h5 className="text-[9px] font-bold uppercase border-b border-zinc-100 pb-0.5 tracking-wider font-sans">Professional Summary</h5>
                                                <p className="text-[9.5px] text-zinc-700 leading-normal mt-1">
                                                    Results-driven engineer with expertise designing and delivering high-performance SaaS components. Recognized for technical excellence.
                                                </p>
                                            </div>

                                            <div className={`mb-3.5 ${
                                                highlightSections && highlightedSection === 'skills' ? 'bg-[#FF7A00]/10 ring-1 ring-[#FF7A00]/30' : ''
                                            }`}
                                            onMouseEnter={() => setHighlightedSection('skills')}
                                            onMouseLeave={() => setHighlightedSection(null)}
                                            >
                                                <h5 className="text-[9px] font-bold uppercase border-b border-zinc-100 pb-0.5 tracking-wider font-sans">Technical Skills</h5>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {getKeywordsByCategory('matched').map((sk) => (
                                                        <span key={sk.word} className={`text-[8.5px] px-1 border rounded font-sans ${
                                                            highlightKeywords ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-zinc-100 border-zinc-200 text-zinc-700'
                                                        }`}>{sk.word}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Sticky AI Assistant Widget */}
                                <div className="bg-[#0D1117]/60 border border-white/5 rounded-[22px] p-5 shadow-[0_4px_30px_rgba(0,0,0,0.3)] space-y-4">
                                    <div className="flex items-center gap-2 pb-3 border-b border-white/5">
                                        <Bot className="w-4.5 h-4.5 text-[#FF7A00]" />
                                        <h3 className="text-xs font-bold text-white uppercase tracking-wider">AI Copilot</h3>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="p-3 rounded-xl bg-white/5 border border-[#FF7A00]/20 space-y-2">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="font-bold text-zinc-400">Confidence Analysis</span>
                                                <span className="font-bold text-[#FF8A33]">{getMetricValue('confidence')}%</span>
                                            </div>
                                            <div className="h-1 w-full rounded-full bg-white/5 overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-[#FF7A00] to-[#FF8A33]" style={{ width: `${getMetricValue('confidence')}%` }} />
                                            </div>
                                        </div>

                                        <div className="p-3 rounded-xl bg-[#FF7A00]/5 border border-[#FF7A00]/15 space-y-1">
                                            <span className="text-[9px] font-bold text-[#FF8A33] uppercase tracking-wider block">Copilot Suggestion summary</span>
                                            <p className="text-xs text-zinc-300 leading-normal">
                                                Apply suggestion items to boost matching and resolve validation issues on active formatting alerts.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Bottom Global Sticky Actions */}
                        <div className="bg-[#0B0B0D] border border-white/5 rounded-[20px] p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => showToast('Draft saved successfully', 'success')}
                                    className="h-10 px-4 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white hover:bg-white/10 transition-all flex items-center gap-1.5"
                                >
                                    <Save className="w-3.5 h-3.5" /> Save Draft
                                </button>
                                <button 
                                    onClick={() => handleStatusUpdate('In Review')}
                                    className="h-10 px-4 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white hover:bg-white/10 transition-all flex items-center gap-1.5"
                                >
                                    <RefreshCw className="w-3.5 h-3.5" /> Run ATS Again
                                </button>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap justify-end">
                                <button 
                                    onClick={handleShare}
                                    className="h-10 px-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-xs font-bold text-blue-400 hover:bg-blue-500/20 transition-all flex items-center gap-1.5"
                                >
                                    <Share2 className="w-3.5 h-3.5" /> Share Review
                                </button>
                                <button 
                                    onClick={() => handleStatusUpdate('Approved')}
                                    className="h-10 px-4 rounded-xl bg-emerald-500 text-xs font-bold text-white hover:bg-emerald-600 transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/15"
                                >
                                    <CheckCircle className="w-3.5 h-3.5" /> Complete Review
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    /* UPLOAD WORKSPACE EMPTY STATE (Step 6) */
                    <div className="max-w-[700px] mx-auto py-12 px-4 animate-fade-in">
                        {isAnalyzing ? (
                            /* 8-Stage Parsing Pipeline (Step 2) */
                            <div className="bg-[#0D1117]/60 border border-white/5 rounded-[22px] p-8 space-y-6 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-[3px] bg-white/5">
                                    <div className="h-full bg-gradient-to-r from-[#FF7A00] to-[#FF8A33] transition-all duration-300" style={{ width: `${analysisProgress}%` }} />
                                </div>
                                
                                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin text-[#FF7A00]" /> ATS Parsing Pipeline
                                    </h3>
                                    <span className="text-xs font-bold text-[#FF8A33]">{analysisProgress}%</span>
                                </div>
                                
                                <div className="space-y-3.5 mt-6">
                                    {pipelineSteps.map((step, idx) => {
                                        const isCompleted = idx < analysisStep;
                                        const isCurrent = idx === analysisStep;
                                        const isPending = idx > analysisStep;
                                        
                                        return (
                                            <div key={idx} className="flex items-center justify-between text-xs transition-opacity duration-200">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                                                        isCompleted ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' :
                                                        isCurrent ? 'bg-[#FF7A00]/10 border-[#FF7A00] text-[#FF8A33] border-dashed animate-pulse' :
                                                        'bg-white/5 border-white/10 text-zinc-600'
                                                    }`}>
                                                        {isCompleted ? <Check className="w-3 h-3" /> :
                                                         isCurrent ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> :
                                                         <span className="text-[9px] font-bold">{idx + 1}</span>}
                                                    </div>
                                                    <span className={`font-semibold ${
                                                        isCompleted ? 'text-zinc-400 line-through' :
                                                        isCurrent ? 'text-white font-bold' :
                                                        'text-zinc-600'
                                                    }`}>{step}</span>
                                                </div>
                                                <span className={`text-[10px] uppercase font-bold tracking-wider ${
                                                    isCompleted ? 'text-emerald-400' :
                                                    isCurrent ? 'text-[#FF8A33]' :
                                                    'text-zinc-600'
                                                }`}>
                                                    {isCompleted ? 'Done' : isCurrent ? 'Running' : 'Pending'}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            /* Drag & Drop Upload Zone (Step 1) */
                            <div className="space-y-6">
                                <div className="text-center space-y-2">
                                    <h2 className="text-2xl font-black text-white tracking-tight">No Resume Uploaded</h2>
                                    <p className="text-sm text-zinc-400">Upload a PDF or DOCX file to begin ATS compatibility analysis.</p>
                                </div>
                                
                                <div 
                                    onDragEnter={handleDrag}
                                    onDragOver={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDrop={handleDrop}
                                    className={`p-12 rounded-[22px] border-2 border-dashed text-center space-y-6 transition-all duration-200 ${
                                        dragActive 
                                            ? 'border-[#FF7A00] bg-[#FF7A00]/5 shadow-[0_0_30px_rgba(255,122,0,0.1)]' 
                                            : 'border-white/10 bg-[#0D1117]/60 hover:border-[#FF7A00]/30 hover:bg-[#FF7A00]/2'
                                    }`}
                                >
                                    <UploadCloud className="w-16 h-16 text-[#FF7A00] mx-auto mb-2" />
                                    
                                    <div className="space-y-2">
                                        <h3 className="text-base font-bold text-white">Drag & Drop Resume File Here</h3>
                                        <p className="text-xs text-zinc-500">Supports PDF and DOCX formats up to 10MB.</p>
                                    </div>
                                    
                                    <div>
                                        <input 
                                            type="file" 
                                            accept=".pdf,.docx"
                                            className="hidden"
                                            id="file-upload-workspace"
                                            onChange={(e) => e.target.files?.[0] && handleFileValidation(e.target.files[0])}
                                        />
                                        <label 
                                            htmlFor="file-upload-workspace"
                                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FF7A00] text-white text-xs font-bold hover:bg-[#FF851A] hover:shadow-lg hover:shadow-[#FF7A00]/20 transition-all cursor-pointer"
                                        >
                                            <FolderOpen className="w-4 h-4" /> Browse Files
                                        </label>
                                    </div>
                                    
                                    {validationError && (
                                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold max-w-sm mx-auto">
                                            {validationError}
                                        </div>
                                    )}
                                </div>
                                
                                {uploadedFile && (
                                    <div className="bg-[#0D1117]/60 border border-white/5 rounded-[22px] p-5 space-y-4 animate-in slide-in-from-bottom-4 duration-200">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className="p-3 rounded-xl bg-white/5 text-[#FF7A00] border border-white/10 shrink-0">
                                                    <FileText className="w-6 h-6" />
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-xs font-bold text-white truncate max-w-[200px] sm:max-w-md">{uploadedFile.name}</p>
                                                    <p className="text-[10px] text-zinc-500 mt-0.5">{(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB • {uploadedFile.name.split('.').pop()?.toUpperCase()}</p>
                                                </div>
                                            </div>
                                            
                                            <button 
                                                onClick={() => { setUploadedFile(null); setUploadProgress(null); }}
                                                className="p-2 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white transition-colors"
                                                title="Remove File"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                        
                                        {uploadProgress && (
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between text-[10px] text-zinc-500 font-bold uppercase">
                                                    <span>Uploading file...</span>
                                                    <span>{uploadProgress.percentage}%</span>
                                                </div>
                                                <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                                                    <div className="h-full bg-gradient-to-r from-[#FF7A00] to-[#FF8A33]" style={{ width: `${uploadProgress.percentage}%` }} />
                                                </div>
                                            </div>
                                        )}
                                        
                                        <button 
                                            onClick={handleAnalyze}
                                            disabled={isUploading || !!(uploadProgress && uploadProgress.percentage < 100)}
                                            className="w-full h-11 rounded-xl bg-emerald-500 text-xs font-bold text-white hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Play className="w-4 h-4" /> Analyze Resume Compatibility
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Score Card Detail Drawer (Modal Style) */}
            {isDrawerOpen && selectedScoreCard && getSelectedCardDetails() && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-2xl bg-[#0D1117] border border-white/10 rounded-[22px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 max-h-[90vh]">
                        <div className="flex items-center justify-between p-6 border-b border-white/5">
                            <div>
                                <h2 className="text-lg font-black text-white uppercase tracking-wider capitalize">{selectedScoreCard.replace('-', ' ')} Details</h2>
                                <p className="text-xs text-zinc-500 mt-1">Detailed score analysis models and priority suggestions</p>
                            </div>
                            <button 
                                onClick={handleCloseDrawer}
                                className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-400 hover:text-white transition-all"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 space-y-5">
                            {/* Definition */}
                            <div className="p-4.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                                <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Metric Definition</h3>
                                <p className="text-xs text-zinc-300 leading-relaxed">{getSelectedCardDetails()?.explanation}</p>
                            </div>

                            {/* Calculation Formula */}
                            <div className="p-4.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                                <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Formula Model</h3>
                                <p className="text-xs text-zinc-300 leading-relaxed">{getSelectedCardDetails()?.calculation}</p>
                            </div>

                            {/* Calculated Value */}
                            <div className="p-4.5 rounded-xl bg-white/5 border border-white/10 space-y-3.5">
                                <div className="flex items-center justify-between text-xs">
                                    <h3 className="font-bold text-zinc-400 uppercase tracking-wider">Calculated Value</h3>
                                    <span className="text-lg font-black text-[#FF7A00]">{getSelectedCardDetails()?.progress}%</span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                                    <div 
                                        className="h-full bg-gradient-to-r from-[#FF7A00] to-[#FF8A33]"
                                        style={{ width: `${getSelectedCardDetails()?.progress}%` }}
                                    />
                                </div>
                            </div>

                            {/* Problems */}
                            {getSelectedCardDetails()?.problems.filter((p: string) => p.trim() !== '').length ? (
                                <div className="p-4.5 rounded-xl bg-red-500/5 border border-red-500/15 space-y-2">
                                    <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4" /> Scanner warnings
                                    </h3>
                                    <ul className="space-y-1 text-xs text-zinc-300">
                                        {getSelectedCardDetails()?.problems.map((problem: string, i: number) => (
                                            <li key={i} className="flex items-center gap-2">• {problem}</li>
                                        ))}
                                    </ul>
                                </div>
                            ) : null}

                            {/* Suggestions */}
                            {getSelectedCardDetails()?.suggestions.filter((s: string) => s.trim() !== '').length ? (
                                <div className="p-4.5 rounded-xl bg-emerald-500/5 border border-emerald-500/15 space-y-2">
                                    <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" /> Priority Actions
                                    </h3>
                                    <ul className="space-y-1 text-xs text-zinc-300">
                                        {getSelectedCardDetails()?.suggestions.map((suggestion: string, i: number) => (
                                            <li key={i} className="flex items-center gap-2">• {suggestion}</li>
                                        ))}
                                    </ul>
                                </div>
                            ) : null}

                            {/* AI Recommendation */}
                            <div className="p-4.5 rounded-xl bg-[#FF7A00]/5 border border-[#FF7A00]/15 space-y-1.5">
                                <h3 className="text-xs font-bold text-[#FF8A33] uppercase tracking-wider flex items-center gap-2">
                                    <Bot className="w-4 h-4" /> Copilot Advice
                                </h3>
                                <p className="text-xs text-zinc-300 leading-relaxed">{getSelectedCardDetails()?.aiRecommendation}</p>
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/5 bg-[#0B0B0D] flex justify-end gap-3">
                            <button 
                                onClick={handleCloseDrawer}
                                className="h-10 px-5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white hover:bg-white/10 transition-all"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}