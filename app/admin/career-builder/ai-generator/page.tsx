'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import JSZip from 'jszip';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import DOMPurify from 'dompurify';
import { 
    Upload, 
    FolderOpen, 
    FileArchive, 
    Search, 
    Filter, 
    CheckCircle, 
    XCircle, 
    AlertCircle,
    Eye,
    Info,
    FileText,
    Image as ImageIcon,
    Code,
    Layout,
    Trash2,
    Download,
    Sparkles,
    FileEdit,
    Save,
    ArrowRight,
    Globe,
    ZoomIn,
    ZoomOut,
    Maximize2,
    RefreshCw,
    ChevronRight,
    ChevronLeft,
    History,
    Lock,
    ChevronDown,
    ChevronUp,
    FileCheck,
    Wand2,
    Check,
    PanelLeftClose,
    PanelLeftOpen,
    PanelRightClose,
    PanelRightOpen,
    Sliders,
    Layers,
    Zap,
    FilePlus,
    FileSpreadsheet
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ModuleToggle } from '@/components/admin/module-toggle';

const IGNORED_FILES = [
  'node_modules',
  '.next',
  '.git',
  'dist',
  'build',
  'coverage',
  '.vscode',
  '.idea',
  'package.json',
  'package-lock.json',
  'pnpm-lock.yaml',
  'yarn.lock',
  'README',
  'readme',
  'readme.md',
  'LICENSE',
  'license',
  'Thumbs.db',
  '.DS_Store',
  '.gitignore',
];

const REJECTED_EXTENSIONS = ['.exe', '.dll', '.bat', '.cmd', '.msi', '.sh'];

interface Template {
  id: string;
  name: string;
  category: 'resume' | 'portfolio' | 'cover-letter';
  htmlContent: string;
  cssContent?: string;
  thumbnail?: string;
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
}

type FormType = 'resume' | 'portfolio' | 'cover-letter';

interface ResumeData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  website: string;
  summary: string;
  experience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
    current: boolean;
  }>;
  skills: string;
  certifications: string;
}

interface PortfolioData {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  website: string;
  bio: string;
  projects: Array<{
    name: string;
    description: string;
    technologies: string;
    liveUrl: string;
    githubUrl: string;
  }>;
  skills: string;
  experience: string;
}

interface CoverLetterData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  recipientName: string;
  recipientTitle: string;
  companyName: string;
  companyAddress: string;
  jobTitle: string;
  jobReference: string;
  salutation: string;
  opening: string;
  body: string;
  closing: string;
  signOff: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

type WizardStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;

const STORAGE_KEY = 'phoenix-ai-generator-wizard-state';

const EXAMPLE_PROMPTS = [
  {
    title: 'Modern ATS Resume',
    description: 'Clean ATS-friendly layout for software engineers & tech roles',
    prompt: 'Create a clean ATS-friendly software engineer resume with modern structure',
    type: 'resume' as FormType
  },
  {
    title: 'Creative Portfolio',
    description: 'Vibrant grid layout for designers & visual creators',
    prompt: 'Create a modern creative designer portfolio showcasing key projects and skills',
    type: 'portfolio' as FormType
  },
  {
    title: 'Professional Cover Letter',
    description: 'Polished executive cover letter template',
    prompt: 'Create a professional cover letter template for a senior engineering role',
    type: 'cover-letter' as FormType
  }
];

export default function AIGeneratorPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'resume' | 'portfolio' | 'cover-letter'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'published'>('all');
  const [formType, setFormType] = useState<FormType>('resume');
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [previewZoom, setPreviewZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [validationMessages, setValidationMessages] = useState<string[]>([]);
  const [aiPrompt, setAiPrompt] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('modern');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStatus, setGenerationStatus] = useState('');
  const [generatedTemplate, setGeneratedTemplate] = useState<Template | null>(null);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile' | 'a4'>('a4');
  const [drafts, setDrafts] = useState<Template[]>([]);
  const [editorTab, setEditorTab] = useState<'general' | 'html' | 'css' | 'metadata'>('general');
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [versionHistory, setVersionHistory] = useState<Template[]>([]);
  const [qualityWarnings, setQualityWarnings] = useState<string[]>([]);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishProgress, setPublishProgress] = useState(0);
  const [publishStatus, setPublishStatus] = useState('');
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [publishedTemplate, setPublishedTemplate] = useState<Template | null>(null);
  const [publishValidationErrors, setPublishValidationErrors] = useState<string[]>([]);

  const activeTemplate = editingTemplate || selectedTemplate || generatedTemplate;

  // UI state for collapsible panels and sections
  const [collapsedSections, setCollapsedSections] = useState({
    configure: false,
    generate: false,
    library: false
  });
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);

  const [resumeData, setResumeData] = useState<ResumeData>({
    fullName: 'John Doe',
    email: 'john@example.com',
    phone: '+1 234 567 8900',
    location: 'New York, NY',
    linkedin: 'linkedin.com/in/johndoe',
    github: 'github.com/johndoe',
    website: 'johndoe.com',
    summary: 'Experienced professional with a proven track record of delivering results.',
    experience: [
      {
        company: 'Tech Company',
        position: 'Senior Developer',
        startDate: '2020-01',
        endDate: '2024-01',
        current: false,
        description: 'Led development of key projects.'
      }
    ],
    education: [
      {
        institution: 'University',
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        startDate: '2016-09',
        endDate: '2020-05',
        current: false
      }
    ],
    skills: 'JavaScript, React, Node.js, Python',
    certifications: 'AWS Certified, Google Cloud Certified'
  });

  const [portfolioData, setPortfolioData] = useState<PortfolioData>({
    fullName: 'John Doe',
    title: 'Full Stack Developer',
    email: 'john@example.com',
    phone: '+1 234 567 8900',
    location: 'New York, NY',
    linkedin: 'linkedin.com/in/johndoe',
    github: 'github.com/johndoe',
    website: 'johndoe.com',
    bio: 'Passionate developer creating innovative solutions.',
    projects: [
      {
        name: 'Project A',
        description: 'A web application for task management.',
        technologies: 'React, Node.js, MongoDB',
        liveUrl: 'https://projecta.com',
        githubUrl: 'https://github.com/johndoe/projecta'
      }
    ],
    skills: 'JavaScript, React, Node.js, Python',
    experience: '5 years of experience in web development.'
  });

  const [coverLetterData, setCoverLetterData] = useState<CoverLetterData>({
    fullName: 'John Doe',
    email: 'john@example.com',
    phone: '+1 234 567 8900',
    location: 'New York, NY',
    recipientName: 'Hiring Manager',
    recipientTitle: 'HR Manager',
    companyName: 'Target Company',
    companyAddress: '123 Business St, City, State',
    jobTitle: 'Software Engineer',
    jobReference: 'REF-123',
    salutation: 'Dear',
    opening: 'I am writing to express my interest in the Software Engineer position.',
    body: 'With my experience in web development, I believe I would be a great fit.',
    closing: 'Thank you for considering my application.',
    signOff: 'Sincerely'
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLIFrameElement>(null);
  const intervalsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Load templates from API on mount
  useEffect(() => {
    fetchTemplates();
  }, []);

  // Helper to restore dates in template objects
  const restoreTemplateDates = (template: any): Template | null => {
    if (!template) return null;
    return {
      ...template,
      createdAt: template.createdAt ? new Date(template.createdAt) : new Date(),
      updatedAt: template.updatedAt ? new Date(template.updatedAt) : new Date(),
    };
  };

  // Load wizard state from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem(STORAGE_KEY);
      if (savedState) {
        try {
          const parsed = JSON.parse(savedState);
          if (parsed.currentStep) setCurrentStep(parsed.currentStep);
          if (parsed.formType) setFormType(parsed.formType);
          if (parsed.aiPrompt) setAiPrompt(parsed.aiPrompt);
          if (parsed.selectedTheme) setSelectedTheme(parsed.selectedTheme);
          if (parsed.generatedTemplate) setGeneratedTemplate(restoreTemplateDates(parsed.generatedTemplate));
          if (parsed.editingTemplate) setEditingTemplate(restoreTemplateDates(parsed.editingTemplate));
          if (parsed.selectedTemplate) setSelectedTemplate(restoreTemplateDates(parsed.selectedTemplate));
          if (parsed.drafts) setDrafts(parsed.drafts.map(restoreTemplateDates));
          if (parsed.resumeData) setResumeData(parsed.resumeData);
          if (parsed.portfolioData) setPortfolioData(parsed.portfolioData);
          if (parsed.coverLetterData) setCoverLetterData(parsed.coverLetterData);
          if (parsed.versionHistory) setVersionHistory(parsed.versionHistory.map(restoreTemplateDates));
          if (parsed.publishSuccess) setPublishSuccess(parsed.publishSuccess);
          if (parsed.publishedTemplate) setPublishedTemplate(restoreTemplateDates(parsed.publishedTemplate));
          if (parsed.previewMode) setPreviewMode(parsed.previewMode);
          if (parsed.editorTab) setEditorTab(parsed.editorTab);
        } catch (e) {
          console.error('Error loading wizard state from localStorage', e);
        }
      }
    }
  }, []);

  // Open right panel when in edit or later steps
  useEffect(() => {
    if (currentStep >= 5) {
      setRightPanelOpen(true);
    }
  }, [currentStep]);

  // Save wizard state to localStorage on changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stateToSave = {
        currentStep,
        formType,
        aiPrompt,
        selectedTheme,
        generatedTemplate,
        editingTemplate,
        selectedTemplate,
        drafts,
        resumeData,
        portfolioData,
        coverLetterData,
        versionHistory,
        publishSuccess,
        publishedTemplate,
        previewMode,
        editorTab
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    }
  }, [
    currentStep,
    formType,
    aiPrompt,
    selectedTheme,
    generatedTemplate,
    editingTemplate,
    selectedTemplate,
    drafts,
    resumeData,
    portfolioData,
    coverLetterData,
    versionHistory,
    publishSuccess,
    publishedTemplate,
    previewMode,
    editorTab
  ]);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/career-builder/templates');
      const data = await response.json();
      if (data.templates) {
        setTemplates(data.templates);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  // Cleanup intervals and timeouts on unmount
  useEffect(() => {
    const intervals = intervalsRef.current;
    const timeouts = timeoutsRef.current;
    
    return () => {
      intervals.forEach(clearInterval);
      timeouts.forEach(clearTimeout);
      intervals.clear();
      timeouts.clear();
    };
  }, []);

  const validateTemplate = useCallback(async (files: FileList | File[]): Promise<ValidationResult> => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const fileArray = Array.from(files);

    const validFiles = fileArray.filter(f => {
      const fileName = f.name.toLowerCase();
      const fileExt = fileName.substring(fileName.lastIndexOf('.'));
      
      if (IGNORED_FILES.some(invalid => fileName.includes(invalid.toLowerCase()))) {
        return false;
      }
      
      if (fileName.startsWith('.')) {
        return false;
      }

      if (REJECTED_EXTENSIONS.includes(fileExt)) {
        return false;
      }
      
      return true;
    });

    if (validFiles.length === 0) {
      errors.push('No valid template files found');
      return { isValid: false, errors, warnings };
    }

    const requiredHtmlFiles = ['index.html', 'resume.html', 'template.html'];
    const hasRequiredHtml = validFiles.some(f => 
      requiredHtmlFiles.includes(f.name.toLowerCase())
    );
    
    if (!hasRequiredHtml) {
      errors.push('Missing HTML entry file');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }, []);

  const handleFileUpload = useCallback(async (files: FileList | File[], type: 'folder' | 'zip') => {
    setIsUploading(true);
    setUploadProgress(0);

    const fileArray = Array.from(files);
    const totalSize = fileArray.reduce((acc, f) => acc + f.size, 0);
    let processedSize = 0;

    const validFiles = fileArray.filter(f => {
      const fileName = f.name.toLowerCase();
      
      if (IGNORED_FILES.some(invalid => fileName.includes(invalid.toLowerCase()))) {
        return false;
      }
      
      if (fileName.startsWith('.')) {
        return false;
      }
      
      return true;
    });

    const uploadId = `upload-${Date.now()}`;
    const progressInterval = setInterval(() => {
      processedSize += totalSize / 10;
      setUploadProgress(Math.min((processedSize / totalSize) * 100, 100));
    }, 100);
    intervalsRef.current.set(uploadId, progressInterval);

    const validation = await validateTemplate(files);

    clearInterval(progressInterval);
    intervalsRef.current.delete(uploadId);
    setUploadProgress(100);

    if (!validation.isValid) {
      setIsUploading(false);
      setUploadProgress(0);
      alert(validation.errors.join(', '));
      return;
    }

    const requiredHtmlFiles = ['index.html', 'resume.html', 'template.html'];
    const htmlFile = validFiles.find(f => 
      requiredHtmlFiles.includes(f.name.toLowerCase())
    ) || validFiles.find(f => f.name.endsWith('.html') || f.name.endsWith('.htm'));
    
    const cssFile = validFiles.find(f => f.name.endsWith('.css'));
    
    let htmlContent = '';
    let cssContent = '';
    
    if (htmlFile) {
      htmlContent = await htmlFile.text();
    }
    
    if (cssFile) {
      cssContent = await cssFile.text();
    }

    const assetFiles = validFiles.filter(f => 
      !f.name.endsWith('.html') && 
      !f.name.endsWith('.htm') && 
      !f.name.endsWith('.css')
    );

    const assetMap = new Map<string, string>();
    for (const asset of assetFiles) {
      try {
        const arrayBuffer = await asset.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        
        let mimeType = 'application/octet-stream';
        if (asset.name.endsWith('.png')) mimeType = 'image/png';
        else if (asset.name.endsWith('.jpg') || asset.name.endsWith('.jpeg')) mimeType = 'image/jpeg';
        else if (asset.name.endsWith('.gif')) mimeType = 'image/gif';
        else if (asset.name.endsWith('.svg')) mimeType = 'image/svg+xml';
        else if (asset.name.endsWith('.woff')) mimeType = 'font/woff';
        else if (asset.name.endsWith('.woff2')) mimeType = 'font/woff2';
        else if (asset.name.endsWith('.ttf')) mimeType = 'font/ttf';
        else if (asset.name.endsWith('.js')) mimeType = 'application/javascript';
        else if (asset.name.endsWith('.json')) mimeType = 'application/json';
        
        const dataUrl = `data:${mimeType};base64,${base64}`;
        assetMap.set(asset.name, dataUrl);
      } catch (error) {
        console.error(`Error processing asset ${asset.name}:`, error);
      }
    }

    let processedHtmlContent = htmlContent;
    assetMap.forEach((dataUrl, fileName) => {
      processedHtmlContent = processedHtmlContent.replace(
        new RegExp(`(["'])${fileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(["'])`, 'g'),
        `$1${dataUrl}$1`
      );
      processedHtmlContent = processedHtmlContent.replace(
        new RegExp(`url\\(['"]?${fileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]?\\)`, 'g'),
        `url('${dataUrl}')`
      );
    });

    let processedCssContent = cssContent;
    assetMap.forEach((dataUrl, fileName) => {
      processedCssContent = processedCssContent.replace(
        new RegExp(`url\\(['"]?${fileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]?\\)`, 'g'),
        `url('${dataUrl}')`
      );
    });

    const thumbnail = await generateThumbnail(processedHtmlContent, processedCssContent);

    const templateName = type === 'zip' 
      ? fileArray[0].name.replace(/\.(zip|rar|7z)$/i, '')
      : validFiles[0].name.split('/')[0] || 'Untitled Template';

    try {
      const response = await fetch('/api/career-builder/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: templateName,
          category: formType,
          htmlContent: processedHtmlContent,
          cssContent: processedCssContent,
          thumbnail,
          status: 'draft'
        })
      });

      const data = await response.json();
      
      if (data.template) {
        setTemplates(prev => [data.template, ...prev]);
        setSelectedTemplate(data.template);
        alert('Template uploaded successfully');
      }
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Failed to save template');
    }

    setIsUploading(false);
    setUploadProgress(0);
  }, [validateTemplate, formType]);

  const handleZipUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const zipFile = files[0];
      
      try {
        const zip = new JSZip();
        const zipContent = await zip.loadAsync(zipFile);
        
        const extractedFiles: File[] = [];
        
        for (const [relativePath, zipEntry] of Object.entries(zipContent.files)) {
          if (!zipEntry.dir) {
            const content = await zipEntry.async('blob');
            const fileName = relativePath.split('/').pop() || relativePath;
            const file = new File([content], fileName, { type: content.type });
            extractedFiles.push(file);
          }
        }
        
        if (extractedFiles.length > 0) {
          handleFileUpload(extractedFiles, 'zip');
        } else {
          alert('No files found in ZIP archive');
        }
      } catch (error) {
        console.error('Error extracting ZIP:', error);
        alert('Failed to extract ZIP file');
      }
    }
  }, [handleFileUpload]);

  const handleFolderUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files, 'folder');
    }
  }, [handleFileUpload]);

  const handleDeleteTemplate = useCallback(async (templateId: string, category: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/career-builder/templates/${templateId}?category=${category}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setTemplates(prev => prev.filter(t => t.id !== templateId));
        if (selectedTemplate?.id === templateId) {
          setSelectedTemplate(null);
        }
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Failed to delete template');
    }
    setIsDeleting(false);
  }, [selectedTemplate]);

  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      const matchesSearch = (template.name || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'all' || template.category === filterCategory;
      const matchesStatus = filterStatus === 'all' || template.status === filterStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [templates, searchQuery, filterCategory, filterStatus]);

  const getCurrentData = useCallback(() => {
    switch (formType) {
      case 'resume': return resumeData;
      case 'portfolio': return portfolioData;
      case 'cover-letter': return coverLetterData;
    }
  }, [formType, resumeData, portfolioData, coverLetterData]);

  const addExperience = useCallback(() => {
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, { company: '', position: '', startDate: '', endDate: '', current: false, description: '' }]
    }));
  }, []);

  const addEducation = useCallback(() => {
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, { institution: '', degree: '', field: '', startDate: '', endDate: '', current: false }]
    }));
  }, []);

  const addProject = useCallback(() => {
    setPortfolioData(prev => ({
      ...prev,
      projects: [...prev.projects, { name: '', description: '', technologies: '', liveUrl: '', githubUrl: '' }]
    }));
  }, []);

  const injectDataIntoHTML = useCallback((html: string, data: any): string => {
    let injectedHtml: string = DOMPurify.sanitize(html);
    
    Object.keys(data).forEach(key => {
      const value = data[key];
      if (typeof value === 'string' && injectedHtml) {
        const sanitizedValue = DOMPurify.sanitize(value);
        injectedHtml = injectedHtml.replace(new RegExp(`{{${key}}}`, 'gi'), sanitizedValue);
        injectedHtml = injectedHtml.replace(new RegExp(`{${key}}`, 'gi'), sanitizedValue);
      }
    });
    
    return injectedHtml;
  }, []);

  const generateThumbnail = async (htmlContent: string, cssContent: string): Promise<string> => {
    try {
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.width = '800px';
      container.style.height = '1000px';
      container.style.background = 'white';
      document.body.appendChild(container);

      const iframe = document.createElement('iframe');
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = 'none';
      container.appendChild(iframe);

      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
              ${cssContent || ''}
            </style>
          </head>
          <body>
            ${htmlContent}
          </body>
          </html>
        `);
        doc.close();

        await new Promise(resolve => setTimeout(resolve, 1000));

        const canvas = await html2canvas(iframe.contentDocument?.body || doc.body, {
          scale: 0.5,
          useCORS: true,
          allowTaint: true,
          width: 800,
          height: 1000
        });

        const thumbnailData = canvas.toDataURL('image/png', 0.8);
        document.body.removeChild(container);
        return thumbnailData;
      }

      document.body.removeChild(container);
      return '';
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      return '';
    }
  };

  const handleStepChange = (step: WizardStep) => {
    setCurrentStep(step);
  };

  const validateGeneration = (): boolean => {
    const errors: string[] = [];
    
    if (!formType) {
      errors.push('Template type is required');
    }
    
    if (!aiPrompt.trim()) {
      errors.push('AI prompt cannot be empty');
    }
    
    setValidationMessages(errors);
    return errors.length === 0;
  };

  const generateTemplate = async () => {
    if (!validateGeneration()) {
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(25);
    setGenerationStatus('Connecting to Gemini AI server...');

    try {
      setGenerationProgress(45);
      setGenerationStatus('Synthesizing template structure & styles...');

      const response = await fetch('/api/career-builder/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formType,
          aiPrompt,
          selectedTheme,
          sampleData: getCurrentData()
        })
      });

      setGenerationProgress(80);
      setGenerationStatus('Validating & sanitizing generated output...');

      const data = await response.json();

      if (!response.ok || !data.success || !data.template) {
        throw new Error(data.error || 'Failed to generate template via Gemini AI.');
      }

      setGenerationProgress(100);
      setGenerationStatus('Complete');

      const newTemplate: Template = {
        id: data.template.id || `generated-${Date.now()}`,
        name: data.template.name,
        category: data.template.category,
        htmlContent: data.template.htmlContent,
        cssContent: data.template.cssContent,
        status: 'draft',
        createdAt: data.template.createdAt ? new Date(data.template.createdAt) : new Date(),
        updatedAt: data.template.updatedAt ? new Date(data.template.updatedAt) : new Date()
      };

      setGeneratedTemplate(newTemplate);
      setSelectedTemplate(newTemplate);
      setEditingTemplate(newTemplate);
      setCurrentStep(4); // Move to Preview step
      setValidationMessages([]);
    } catch (error: any) {
      const errorMessage = error?.message || 'Generation failed. Please try again.';
      setValidationMessages([errorMessage]);
      console.error('Template generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateHTMLContent = (type: FormType, prompt: string, theme: string): string => {
    const data = getCurrentData();
    
    if (type === 'resume') {
      return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Resume - ${data.fullName}</title>
</head>
<body class="resume-${theme}">
  <div class="resume-container">
    <header class="resume-header">
      <h1 class="name">${data.fullName}</h1>
      <div class="contact-info">
        <span>${data.email}</span>
        <span>${data.phone}</span>
        <span>${data.location}</span>
      </div>
    </header>
    <section class="summary">
      <h2>Professional Summary</h2>
      <p>${(data as any).summary}</p>
    </section>
    <section class="experience">
      <h2>Work Experience</h2>
      ${(data as any).experience.map((exp: any) => `
        <div class="experience-item">
          <h3>${exp.position}</h3>
          <div class="company">${exp.company}</div>
          <div class="date">${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}</div>
          <p>${exp.description}</p>
        </div>
      `).join('')}
    </section>
    <section class="education">
      <h2>Education</h2>
      ${(data as any).education.map((edu: any) => `
        <div class="education-item">
          <h3>${edu.degree}</h3>
          <div class="institution">${edu.institution}</div>
          <div class="date">${edu.startDate} - ${edu.endDate}</div>
        </div>
      `).join('')}
    </section>
    <section class="skills">
      <h2>Skills</h2>
      <p>${(data as any).skills}</p>
    </section>
  </div>
</body>
</html>`;
    } else if (type === 'portfolio') {
      return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Portfolio - ${data.fullName}</title>
</head>
<body class="portfolio-${theme}">
  <div class="portfolio-container">
    <header class="portfolio-header">
      <h1 class="name">${data.fullName}</h1>
      <p class="title">${(data as any).title}</p>
      <div class="contact-info">
        <span>${data.email}</span>
        <span>${data.phone}</span>
        <span>${data.location}</span>
      </div>
    </header>
    <section class="bio">
      <h2>About Me</h2>
      <p>${(data as any).bio}</p>
    </section>
    <section class="projects">
      <h2>Projects</h2>
      ${(data as any).projects.map((proj: any) => `
        <div class="project-item">
          <h3>${proj.name}</h3>
          <p class="description">${proj.description}</p>
          <p class="technologies">${proj.technologies}</p>
          <div class="links">
            <a href="${proj.liveUrl}">Live Demo</a>
            <a href="${proj.githubUrl}">GitHub</a>
          </div>
        </div>
      `).join('')}
    </section>
    <section class="skills">
      <h2>Skills</h2>
      <p>${(data as any).skills}</p>
    </section>
  </div>
</body>
</html>`;
    } else {
      return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cover Letter - ${data.fullName}</title>
</head>
<body class="cover-letter-${theme}">
  <div class="cover-letter-container">
    <header class="letter-header">
      <div class="sender-info">
        <p class="name">${data.fullName}</p>
        <p class="email">${data.email}</p>
        <p class="phone">${data.phone}</p>
        <p class="location">${data.location}</p>
      </div>
      <div class="date">${new Date().toLocaleDateString()}</div>
    </header>
    <div class="recipient-info">
      <p class="name">${(data as any).recipientName}</p>
      <p class="title">${(data as any).recipientTitle}</p>
      <p class="company">${(data as any).companyName}</p>
      <p class="address">${(data as any).companyAddress}</p>
    </div>
    <div class="letter-content">
      <p class="salutation">${(data as any).salutation} ${(data as any).recipientName},</p>
      <p class="opening">${(data as any).opening}</p>
      <p class="body">${(data as any).body}</p>
      <p class="closing">${(data as any).closing}</p>
      <p class="sign-off">${(data as any).signOff},</p>
      <p class="signature">${data.fullName}</p>
    </div>
  </div>
</body>
</html>`;
    }
  };

  const generateCSSContent = (theme: string): string => {
    const baseStyles = `
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: #333;
  background: #fff;
}

.resume-container,
.portfolio-container,
.cover-letter-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px;
}

h1, h2, h3 {
  color: #2c3e50;
}

h1 {
  font-size: 2.5em;
  margin-bottom: 0.5em;
}

h2 {
  font-size: 1.8em;
  margin: 1.5em 0 0.5em;
  border-bottom: 2px solid #3498db;
  padding-bottom: 0.3em;
}

h3 {
  font-size: 1.3em;
  margin: 0.5em 0;
}

.contact-info span {
  margin-right: 15px;
  color: #666;
}

section {
  margin: 2em 0;
}
`;

    const themeStyles = {
      modern: `
.resume-modern,
.portfolio-modern,
.cover-letter-modern {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.resume-modern h1,
.portfolio-modern h1,
.cover-letter-modern h1,
.resume-modern h2,
.portfolio-modern h2,
.cover-letter-modern h2 {
  color: white;
}

.resume-modern h2,
.portfolio-modern h2,
.cover-letter-modern h2 {
  border-bottom-color: rgba(255,255,255,0.3);
}
`,
      classic: `
.resume-classic,
.portfolio-classic,
.cover-letter-classic {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
}

.resume-classic h1,
.portfolio-classic h1,
.cover-letter-classic h1 {
  color: #1a1a1a;
  font-family: 'Georgia', serif;
}
`,
      minimal: `
.resume-minimal,
.portfolio-minimal,
.cover-letter-minimal {
  background: white;
}

.resume-minimal h2,
.portfolio-minimal h2,
.cover-letter-minimal h2 {
  border-bottom: 1px solid #e0e0e0;
  font-weight: 300;
}
`,
      creative: `
.resume-creative,
.portfolio-creative,
.cover-letter-creative {
  background: linear-gradient(45deg, #ff6b6b, #feca57);
  color: white;
}

.resume-creative h1,
.portfolio-creative h1,
.cover-letter-creative h1 {
  text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
}
`
    };

    return baseStyles + (themeStyles[theme as keyof typeof themeStyles] || themeStyles.modern);
  };

  const saveDraft = async () => {
    const templateToSave = activeTemplate;
    if (!templateToSave) {
      setValidationMessages(['No template available to save']);
      return;
    }

    try {
      let thumbnail = templateToSave.thumbnail;
      if (!thumbnail) {
        thumbnail = await generateThumbnailFromPreview();
      }

      const response = await fetch('/api/career-builder/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: templateToSave.name,
          category: templateToSave.category,
          htmlContent: templateToSave.htmlContent,
          cssContent: templateToSave.cssContent,
          thumbnail,
          status: 'draft',
          theme: (templateToSave as any).theme || selectedTheme,
          prompt: (templateToSave as any).prompt || aiPrompt,
          tags: (templateToSave as any).tags || [templateToSave.category],
          metadata: (templateToSave as any).metadata || {}
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to save draft');
      }

      const result = await response.json();
      const savedTemplate = restoreTemplateDates(result.template) || {
        ...templateToSave,
        status: 'draft' as const,
        updatedAt: new Date()
      };

      setDrafts(prev => {
        const idx = prev.findIndex(d => d.id === savedTemplate.id);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = savedTemplate;
          return copy;
        }
        return [...prev, savedTemplate];
      });

      setEditingTemplate(savedTemplate);
      setSelectedTemplate(savedTemplate);
      setGeneratedTemplate(savedTemplate);

      setCurrentStep(5);
      setValidationMessages(['Draft saved successfully to library']);
    } catch (error: any) {
      console.error('Save draft error:', error);
      setValidationMessages([`Save draft failed: ${error.message}`]);
    }
  };

  const getPreviewWidth = () => {
    switch (previewMode) {
      case 'desktop': return '100%';
      case 'tablet': return '768px';
      case 'mobile': return '375px';
      case 'a4': return '794px';
      default: return '100%';
    }
  };

  const getPreviewHeight = () => {
    switch (previewMode) {
      case 'desktop': return '100%';
      case 'tablet': return '1024px';
      case 'mobile': return '667px';
      case 'a4': return '1123px';
      default: return '100%';
    }
  };

  const handleZoomIn = () => {
    setPreviewZoom(prev => Math.min(prev + 0.25, 2));
  };

  const handleZoomOut = () => {
    setPreviewZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleRefresh = () => {
    if (previewRef.current) {
      previewRef.current.srcdoc = previewRef.current.srcdoc;
    }
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const getStepLabel = (step: WizardStep) => {
    const labels = {
      1: 'Configure',
      2: 'Prompt',
      3: 'Generate',
      4: 'Preview',
      5: 'Review & Edit',
      6: 'Save Draft',
      7: 'Publish'
    };
    return labels[step];
  };

  const handleTemplateEdit = useCallback((field: keyof Template, value: any) => {
    setEditingTemplate(prevEditingTemplate => {
      const base = prevEditingTemplate || activeTemplate;
      if (!base) return prevEditingTemplate;
      return {
        ...base,
        [field]: value,
        updatedAt: new Date()
      };
    });
    setSelectedTemplate(prevSelectedTemplate => {
      if (!prevSelectedTemplate) return prevSelectedTemplate;
      return {
        ...prevSelectedTemplate,
        [field]: value,
        updatedAt: new Date()
      };
    });
    setGeneratedTemplate(prevGeneratedTemplate => {
      if (!prevGeneratedTemplate) return prevGeneratedTemplate;
      return {
        ...prevGeneratedTemplate,
        [field]: value,
        updatedAt: new Date()
      };
    });
  }, [activeTemplate]);

  const createVersion = useCallback((template: Template) => {
    setVersionHistory(prev => {
      const newVersion = {
        ...template,
        id: `${template.id}-v${prev.length + 1}`,
        updatedAt: new Date()
      };
      return [...prev, newVersion];
    });
  }, []);

  const restoreVersion = useCallback((version: Template) => {
    setEditingTemplate(version);
    setSelectedTemplate(version);
    setGeneratedTemplate(version);
    setQualityWarnings([]);
  }, []);

  const handleFitWidth = useCallback(() => {
    setPreviewZoom(1);
  }, []);

  const handleFitPage = useCallback(() => {
    setPreviewZoom(0.8);
  }, []);

  // Auto-save effect
  useEffect(() => {
    if (!autoSaveEnabled || !editingTemplate) return;

    const interval = setInterval(() => {
      if (editingTemplate) {
        createVersion(editingTemplate);
        setDrafts(prev => {
          const existingIndex = prev.findIndex(d => d.id === editingTemplate.id);
          if (existingIndex >= 0) {
            const updated = [...prev];
            updated[existingIndex] = editingTemplate;
            return updated;
          }
          return [...prev, editingTemplate];
        });
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [autoSaveEnabled, editingTemplate, createVersion]);

  // Quality check function
  const validateTemplateQuality = useCallback((template: Template): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!template.htmlContent || template.htmlContent.trim().length === 0) {
      errors.push('HTML content is missing');
    } else {
      if (!template.htmlContent.includes('<html>') || !template.htmlContent.includes('</html>')) {
        warnings.push('HTML missing standard document structure');
      }
      if (!template.htmlContent.includes('<body>') || !template.htmlContent.includes('</body>')) {
        warnings.push('HTML missing body elements');
      }
    }

    if (!template.cssContent || template.cssContent.trim().length === 0) {
      warnings.push('CSS styles missing');
    }

    if (template.htmlContent && !template.htmlContent.includes('class=')) {
      warnings.push('HTML lacks style classes');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }, []);

  // Quality check effect when template changes
  useEffect(() => {
    if (editingTemplate) {
      const validation = validateTemplateQuality(editingTemplate);
      setQualityWarnings(validation.warnings);
    }
  }, [editingTemplate, validateTemplateQuality]);

  const validateForPublish = (template: Template | null): boolean => {
    const errors: string[] = [];
    
    if (!template) {
      errors.push('No template to publish');
      setPublishValidationErrors(errors);
      return false;
    }
    
    if (!template.name || template.name.trim().length === 0) {
      errors.push('Template name is required');
    }
    
    if (!template.category) {
      errors.push('Template category is required');
    }
    
    if (!template.htmlContent || template.htmlContent.trim().length === 0) {
      errors.push('HTML content is required');
    }
    
    if (!template.cssContent || template.cssContent.trim().length === 0) {
      errors.push('CSS content is required');
    }
    
    setPublishValidationErrors(errors);
    return errors.length === 0;
  };

  const generateThumbnailFromPreview = async (): Promise<string> => {
    try {
      if (previewRef.current && previewRef.current.contentWindow) {
        const canvas = await html2canvas(previewRef.current.contentWindow.document.body, {
          scale: 2,
          useCORS: true,
          logging: false,
          allowTaint: true
        });
        
        const thumbnail = canvas.toDataURL('image/png', 0.8);
        return thumbnail;
      }
      return '';
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      return '';
    }
  };

  const generateSamplePDF = async (): Promise<string> => {
    const currentTpl = activeTemplate;
    if (!currentTpl) return '';

    try {
      let canvas: HTMLCanvasElement | null = null;

      if (previewRef.current && previewRef.current.contentWindow?.document?.body) {
        canvas = await html2canvas(previewRef.current.contentWindow.document.body, {
          scale: 2,
          useCORS: true,
          logging: false,
          allowTaint: true
        });
      } else {
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.left = '-9999px';
        container.style.top = '0';
        container.style.width = '800px';
        container.style.height = '1120px';
        container.style.background = 'white';
        document.body.appendChild(container);

        const iframe = document.createElement('iframe');
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        container.appendChild(iframe);

        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (doc) {
          doc.open();
          doc.write(`
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <style>
                body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
                ${currentTpl.cssContent || ''}
              </style>
            </head>
            <body>
              ${injectDataIntoHTML(currentTpl.htmlContent, getCurrentData())}
            </body>
            </html>
          `);
          doc.close();
          await new Promise(resolve => setTimeout(resolve, 500));
          canvas = await html2canvas(doc.body, { scale: 2, useCORS: true, allowTaint: true });
        }
        document.body.removeChild(container);
      }

      if (!canvas) return '';

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, Math.min(imgHeight, pdfHeight));
      return pdf.output('datauristring');
    } catch (error) {
      console.error('Error generating sample PDF:', error);
      return '';
    }
  };

  const publishTemplate = async () => {
    const targetTemplate = activeTemplate;
    if (!targetTemplate || !validateForPublish(targetTemplate)) {
      return;
    }

    setCurrentStep(7 as WizardStep);
    setIsPublishing(true);
    setPublishProgress(0);
    setPublishStatus('Validating template...');

    try {
      setPublishProgress(25);
      setPublishStatus('Generating thumbnail...');

      const thumbnail = await generateThumbnailFromPreview() || targetTemplate.thumbnail || '';
      setPublishProgress(50);
      setPublishStatus('Generating sample PDF...');

      const samplePdf = await generateSamplePDF();
      setPublishProgress(75);
      setPublishStatus('Publishing template record to database library...');

      const response = await fetch('/api/career-builder/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: targetTemplate.name,
          category: targetTemplate.category,
          htmlContent: targetTemplate.htmlContent,
          cssContent: targetTemplate.cssContent,
          thumbnail,
          status: 'published',
          theme: (targetTemplate as any).theme || selectedTheme,
          prompt: (targetTemplate as any).prompt || aiPrompt,
          tags: (targetTemplate as any).tags || [targetTemplate.category],
          metadata: {
            ...((targetTemplate as any).metadata || {}),
            samplePdf
          },
          version: '1.0'
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to register template in library');
      }

      const result = await response.json();
      const dbTemplate = restoreTemplateDates(result.template) || {
        ...targetTemplate,
        status: 'published' as const,
        updatedAt: new Date()
      };
      
      setTemplates(prev => {
        const existingIdx = prev.findIndex(t => t.id === dbTemplate.id);
        if (existingIdx >= 0) {
          const updated = [...prev];
          updated[existingIdx] = dbTemplate;
          return updated;
        }
        return [...prev, dbTemplate];
      });

      setPublishProgress(100);
      setPublishStatus('Complete!');

      setPublishedTemplate(dbTemplate);
      setEditingTemplate(dbTemplate);
      setSelectedTemplate(dbTemplate);
      setGeneratedTemplate(dbTemplate);

      setPublishSuccess(true);
      setPublishValidationErrors([]);
      
      createVersion(dbTemplate);
    } catch (error: any) {
      setPublishValidationErrors([error.message || 'Publishing failed. Please try again.']);
      console.error('Publish error:', error);
    } finally {
      setIsPublishing(false);
    }
  };

  const resetPublishFlow = () => {
    setPublishSuccess(false);
    setPublishedTemplate(null);
    setPublishValidationErrors([]);
    setPublishProgress(0);
    setPublishStatus('');
    setCurrentStep(1);
    setGeneratedTemplate(null);
    setEditingTemplate(null);
    setSelectedTemplate(null);
    setAiPrompt('');
    setFormType('resume');
    setDrafts([]);
    setVersionHistory([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const duplicateTemplate = () => {
    if (publishedTemplate || editingTemplate || selectedTemplate) {
      const source = publishedTemplate || editingTemplate || selectedTemplate;
      if (!source) return;
      
      const duplicate: Template = {
        ...source,
        id: `duplicate-${Date.now()}`,
        name: `${source.name} (Copy)`,
        status: 'draft' as const,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setEditingTemplate(duplicate);
      setSelectedTemplate(duplicate);
      setGeneratedTemplate(duplicate);
      setPublishSuccess(false);
      setCurrentStep(5);
    }
  };

  // Real Validation Checks Calculation
  const validationChecks = useMemo(() => {
    const currentTpl = activeTemplate;
    const isPromptValid = aiPrompt.trim().length >= 10;
    const isTypeValid = !!formType;
    const isHtmlValid = !!(currentTpl && currentTpl.htmlContent && currentTpl.htmlContent.trim().length > 50);
    const isStructureValid = !!(currentTpl && currentTpl.htmlContent && (
      currentTpl.htmlContent.includes('<header') || 
      currentTpl.htmlContent.includes('<div') || 
      currentTpl.htmlContent.includes('<section')
    ));
    const isQualityValid = currentTpl ? qualityWarnings.length === 0 : false;

    const items = [
      {
        id: 'type',
        label: 'Template Type',
        status: isTypeValid ? 'passed' : 'pending',
        detail: formType ? formType.toUpperCase() : 'Not selected'
      },
      {
        id: 'prompt',
        label: 'Prompt Quality',
        status: !aiPrompt.trim() ? 'pending' : isPromptValid ? 'passed' : 'warning',
        detail: !aiPrompt.trim() ? 'Empty prompt' : isPromptValid ? `${aiPrompt.length} chars` : 'Short prompt'
      },
      {
        id: 'html',
        label: 'Generated HTML',
        status: !currentTpl ? 'pending' : isHtmlValid ? 'passed' : 'error',
        detail: !currentTpl ? 'Pending' : isHtmlValid ? 'Valid HTML' : 'Empty HTML'
      },
      {
        id: 'structure',
        label: 'Content Structure',
        status: !currentTpl ? 'pending' : isStructureValid ? 'passed' : 'warning',
        detail: !currentTpl ? 'Pending' : isStructureValid ? 'Semantic tags' : 'Basic layout'
      },
      {
        id: 'quality',
        label: 'Quality Check',
        status: !currentTpl ? 'pending' : isQualityValid ? 'passed' : 'warning',
        detail: !currentTpl ? 'Pending' : isQualityValid ? '0 Warnings' : `${qualityWarnings.length} Warnings`
      }
    ];

    const passedCount = items.filter(i => i.status === 'passed').length;
    const score = currentTpl ? Math.round((passedCount / items.length) * 100) : 0;

    return { items, passedCount, total: items.length, score };
  }, [formType, aiPrompt, activeTemplate, qualityWarnings]);

  // Real State-Aware Workflow Steps Definition
  const workflowTimeline = useMemo(() => {
    const hasTemplate = !!activeTemplate;
    const hasPrompt = aiPrompt.trim().length > 0;

    return [
      {
        stepNum: 1,
        title: 'Template Type',
        subtitle: 'Choose resume, portfolio, or cover letter',
        isCompleted: !!formType,
        isCurrent: currentStep === 1,
        isLocked: false,
        canAccess: true,
        action: () => setCurrentStep(1)
      },
      {
        stepNum: 2,
        title: 'Prompt',
        subtitle: 'Describe your ideal template',
        isCompleted: hasPrompt,
        isCurrent: currentStep === 2,
        isLocked: !formType,
        canAccess: !!formType,
        action: () => setCurrentStep(2)
      },
      {
        stepNum: 3,
        title: 'Generate',
        subtitle: 'AI template synthesis',
        isCompleted: hasTemplate,
        isCurrent: currentStep === 3 || isGenerating,
        isLocked: !hasPrompt,
        canAccess: hasPrompt,
        action: () => generateTemplate()
      },
      {
        stepNum: 4,
        title: 'Preview',
        subtitle: 'Visual layout canvas',
        isCompleted: hasTemplate && currentStep > 4,
        isCurrent: currentStep === 4,
        isLocked: !hasTemplate,
        canAccess: hasTemplate,
        action: () => setCurrentStep(4)
      },
      {
        stepNum: 5,
        title: 'Review & Edit',
        subtitle: 'Refine code & content',
        isCompleted: hasTemplate && currentStep > 5,
        isCurrent: currentStep === 5,
        isLocked: !hasTemplate,
        canAccess: hasTemplate,
        action: () => {
          const templateToEdit = editingTemplate || selectedTemplate || generatedTemplate;
          if (templateToEdit) {
            if (!editingTemplate) {
              setEditingTemplate(templateToEdit);
            }
            setCurrentStep(5);
          }
        }
      },
      {
        stepNum: 6,
        title: 'Save Draft',
        subtitle: 'Store local snapshot',
        isCompleted: drafts.length > 0 || publishSuccess,
        isCurrent: currentStep === 6,
        isLocked: !hasTemplate,
        canAccess: hasTemplate,
        action: () => saveDraft()
      },
      {
        stepNum: 7,
        title: 'Publish',
        subtitle: 'Deploy to Template Library',
        isCompleted: publishSuccess,
        isCurrent: currentStep === 7,
        isLocked: !hasTemplate || (publishValidationErrors.length > 0 && !publishSuccess),
        canAccess: hasTemplate,
        action: () => publishTemplate()
      }
    ];
  }, [currentStep, formType, aiPrompt, activeTemplate, isGenerating, drafts, publishSuccess, publishValidationErrors, generateTemplate, saveDraft, publishTemplate, editingTemplate, selectedTemplate, generatedTemplate]);

  const toggleSection = (section: keyof typeof collapsedSections) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="h-screen flex flex-col bg-[#050505] text-gray-200 select-none overflow-hidden font-sans">
      {/* 1. TOP HEADER IMPROVEMENT */}
      <header className="border-b border-white/[0.08] bg-[#080808]/95 backdrop-blur-md px-6 py-3 z-20 shrink-0">
        <div className="flex items-center justify-between gap-4">
          {/* Header Title & Status Badges */}
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#FF6A00]/20 to-[#FF6A00]/5 border border-[#FF6A00]/30 shadow-[0_0_12px_rgba(255,106,0,0.15)] flex items-center justify-center">
              <Wand2 className="w-5 h-5 text-[#FF6A00]" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-heading text-lg font-bold text-white tracking-wide">AI Template Generator</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-[#FF6A00]/10 border border-[#FF6A00]/30 text-[#FF6A00] text-[11px] font-semibold uppercase tracking-wider">
                  {formType}
                </span>
                {publishedTemplate ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-medium flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Published
                  </span>
                ) : activeTemplate ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-medium flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" /> Active Draft
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-gray-400 text-[11px]">
                    New Session
                  </span>
                )}
              </div>
              <p className="text-gray-400 text-xs mt-0.5">Create production-ready Resume, Portfolio & Cover Letter templates</p>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2.5">
            <ModuleToggle moduleKey="ai-generator" moduleName="AI Generator" />
            <button
              onClick={() => setLeftPanelOpen(!leftPanelOpen)}
              className="hidden lg:flex p-2 rounded-lg bg-white/[0.03] border border-white/[0.08] text-gray-400 hover:text-white hover:bg-white/[0.08] transition-all text-xs items-center gap-1.5"
              title="Toggle Controls Panel"
              aria-label="Toggle left configuration panel"
            >
              {leftPanelOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setRightPanelOpen(!rightPanelOpen)}
              className="hidden lg:flex p-2 rounded-lg bg-white/[0.03] border border-white/[0.08] text-gray-400 hover:text-white hover:bg-white/[0.08] transition-all text-xs items-center gap-1.5"
              title="Toggle Workflow Panel"
              aria-label="Toggle right workflow panel"
            >
              {rightPanelOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
            </button>
            <div className="h-4 w-px bg-white/[0.1] hidden lg:block mx-0.5" />
            <button
              onClick={() => {
                setGeneratedTemplate(null);
                setEditingTemplate(null);
                setSelectedTemplate(null);
                setAiPrompt('');
                setCurrentStep(1);
                setFormType('resume');
              }}
              className="phoenix-button-secondary text-xs px-3.5 py-2 flex items-center gap-1.5 shadow-sm"
              aria-label="Create new template"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FF6A00]" />
              <span>New Template</span>
            </button>
            <button
              onClick={saveDraft}
              disabled={!activeTemplate}
              className="phoenix-button-secondary text-xs px-3.5 py-2 flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Save current template as draft"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Draft</span>
            </button>
          </div>
        </div>
      </header>

      {/* THREE-PANEL WORKSPACE */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* 2. LEFT PANEL — ORGANIZED CONFIGURATION */}
        <aside
          className={cn(
            'border-r border-white/[0.08] bg-[#080808] transition-all duration-300 flex flex-col shrink-0 overflow-y-auto custom-scrollbar',
            leftPanelOpen ? 'w-80 md:w-84' : 'w-0 border-r-0 hidden'
          )}
        >
          <div className="p-4 space-y-4">
            {/* SECTION A — CONFIGURE */}
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] overflow-hidden transition-all">
              <button
                onClick={() => toggleSection('configure')}
                className="w-full flex items-center justify-between p-3.5 bg-white/[0.02] border-b border-white/[0.04] text-left hover:bg-white/[0.04] transition-all"
              >
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#FF6A00]" />
                  <span className="text-xs font-bold text-white tracking-wider uppercase">SECTION A — CONFIGURE</span>
                </div>
                {collapsedSections.configure ? <ChevronDown className="w-3.5 h-3.5 text-gray-500" /> : <ChevronUp className="w-3.5 h-3.5 text-gray-500" />}
              </button>

              {!collapsedSections.configure && (
                <div className="p-3.5 space-y-4">
                  {/* Template Type Selector */}
                  <div>
                    <label className="text-[11px] font-semibold text-gray-400 mb-2 block uppercase tracking-wider">Template Type</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        onClick={() => setFormType('resume')}
                        className={cn(
                          'flex flex-col items-center justify-center p-2 rounded-lg text-xs font-medium transition-all gap-1 border',
                          formType === 'resume'
                            ? 'bg-[#FF6A00]/10 border-[#FF6A00]/40 text-white shadow-[0_0_8px_rgba(255,106,0,0.15)]'
                            : 'bg-white/[0.02] border-white/[0.05] text-gray-400 hover:bg-white/[0.05] hover:text-gray-200'
                        )}
                      >
                        <FileText className={cn('w-4 h-4', formType === 'resume' ? 'text-[#FF6A00]' : 'text-gray-400')} />
                        <span className="text-[10px]">Resume</span>
                      </button>
                      <button
                        onClick={() => setFormType('portfolio')}
                        className={cn(
                          'flex flex-col items-center justify-center p-2 rounded-lg text-xs font-medium transition-all gap-1 border',
                          formType === 'portfolio'
                            ? 'bg-[#FF6A00]/10 border-[#FF6A00]/40 text-white shadow-[0_0_8px_rgba(255,106,0,0.15)]'
                            : 'bg-white/[0.02] border-white/[0.05] text-gray-400 hover:bg-white/[0.05] hover:text-gray-200'
                        )}
                      >
                        <Globe className={cn('w-4 h-4', formType === 'portfolio' ? 'text-[#FF6A00]' : 'text-gray-400')} />
                        <span className="text-[10px]">Portfolio</span>
                      </button>
                      <button
                        onClick={() => setFormType('cover-letter')}
                        className={cn(
                          'flex flex-col items-center justify-center p-2 rounded-lg text-xs font-medium transition-all gap-1 border',
                          formType === 'cover-letter'
                            ? 'bg-[#FF6A00]/10 border-[#FF6A00]/40 text-white shadow-[0_0_8px_rgba(255,106,0,0.15)]'
                            : 'bg-white/[0.02] border-white/[0.05] text-gray-400 hover:bg-white/[0.05] hover:text-gray-200'
                        )}
                      >
                        <FileEdit className={cn('w-4 h-4', formType === 'cover-letter' ? 'text-[#FF6A00]' : 'text-gray-400')} />
                        <span className="text-[10px]">Cover Letter</span>
                      </button>
                    </div>
                  </div>

                  {/* AI Prompt Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">AI Prompt</label>
                      <span className="text-[10px] text-gray-500">{aiPrompt.length}/1000</span>
                    </div>

                    <div className="mb-2 flex flex-wrap gap-1">
                      {formType === 'resume' && [
                        'Clean ATS Software Engineer',
                        'Creative Tech CV',
                        'Executive Resume'
                      ].map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => setAiPrompt(suggestion)}
                          className="px-2 py-0.5 text-[10px] bg-white/[0.04] border border-white/[0.08] rounded text-gray-400 hover:bg-[#FF6A00]/10 hover:border-[#FF6A00]/30 hover:text-white transition-all"
                        >
                          + {suggestion}
                        </button>
                      ))}
                      {formType === 'portfolio' && [
                        'Full Stack Portfolio',
                        'UI Designer Showcase',
                        'Creative Grid'
                      ].map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => setAiPrompt(suggestion)}
                          className="px-2 py-0.5 text-[10px] bg-white/[0.04] border border-white/[0.08] rounded text-gray-400 hover:bg-[#FF6A00]/10 hover:border-[#FF6A00]/30 hover:text-white transition-all"
                        >
                          + {suggestion}
                        </button>
                      ))}
                      {formType === 'cover-letter' && [
                        'Senior Tech Role',
                        'Product Manager',
                        'Startup Pitch Letter'
                      ].map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => setAiPrompt(suggestion)}
                          className="px-2 py-0.5 text-[10px] bg-white/[0.04] border border-white/[0.08] rounded text-gray-400 hover:bg-[#FF6A00]/10 hover:border-[#FF6A00]/30 hover:text-white transition-all"
                        >
                          + {suggestion}
                        </button>
                      ))}
                    </div>

                    <textarea
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="Describe your ideal template design, section layout, and stylistic preferences..."
                      className="w-full min-h-[90px] bg-white/[0.02] border border-white/[0.08] rounded-lg p-2.5 text-xs text-white placeholder-gray-600 resize-none focus:outline-none focus:border-[#FF6A00]/60 transition-all"
                      maxLength={1000}
                    />
                  </div>

                  {/* Theme Selection */}
                  <div>
                    <label className="text-[11px] font-semibold text-gray-400 mb-2 block uppercase tracking-wider">Visual Theme</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {['modern', 'classic', 'minimal', 'creative'].map((theme) => (
                        <button
                          key={theme}
                          onClick={() => setSelectedTheme(theme)}
                          className={cn(
                            'p-2 rounded-lg text-xs font-medium capitalize transition-all border text-center',
                            selectedTheme === theme
                              ? 'bg-[#FF6A00] border-[#FF6A00] text-white shadow-[0_0_10px_rgba(255,106,0,0.3)]'
                              : 'bg-white/[0.03] border-white/[0.06] text-gray-400 hover:bg-white/[0.07] hover:text-white'
                          )}
                        >
                          {theme}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SECTION B — GENERATE */}
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] overflow-hidden transition-all">
              <button
                onClick={() => toggleSection('generate')}
                className="w-full flex items-center justify-between p-3.5 bg-white/[0.02] border-b border-white/[0.04] text-left hover:bg-white/[0.04] transition-all"
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#FF6A00]" />
                  <span className="text-xs font-bold text-white tracking-wider uppercase">SECTION B — GENERATE</span>
                </div>
                {collapsedSections.generate ? <ChevronDown className="w-3.5 h-3.5 text-gray-500" /> : <ChevronUp className="w-3.5 h-3.5 text-gray-500" />}
              </button>

              {!collapsedSections.generate && (
                <div className="p-3.5 space-y-3">
                  {/* Single Primary Generate Action */}
                  <button
                    onClick={generateTemplate}
                    disabled={isGenerating || !aiPrompt.trim()}
                    className="w-full phoenix-button text-xs py-2.5 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,106,0,0.2)] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                        <span>Generating Template...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-white" />
                        <span className="font-semibold">Generate Document</span>
                      </>
                    )}
                  </button>

                  {/* Upload Template Actions */}
                  <div className="pt-2 border-t border-white/[0.06] space-y-2">
                    <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block">Or Upload Existing Template</span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => folderInputRef.current?.click()}
                        disabled={isUploading}
                        className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-dashed border-white/[0.1] hover:border-[#FF6A00]/50 bg-white/[0.02] text-xs text-gray-400 hover:text-white transition-all disabled:opacity-50"
                      >
                        <FolderOpen className="w-3.5 h-3.5 text-[#FF6A00]" />
                        <span>Folder</span>
                      </button>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-dashed border-white/[0.1] hover:border-[#FF6A00]/50 bg-white/[0.02] text-xs text-gray-400 hover:text-white transition-all disabled:opacity-50"
                      >
                        <FileArchive className="w-3.5 h-3.5 text-[#FF6A00]" />
                        <span>ZIP File</span>
                      </button>
                    </div>

                    <input
                      ref={folderInputRef}
                      type="file"
                      {...({ webkitdirectory: '', directory: '' } as any)}
                      multiple
                      onChange={handleFolderUpload}
                      className="hidden"
                      accept="*/*"
                    />
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleZipUpload}
                      className="hidden"
                      accept="application/zip,application/x-zip-compressed"
                    />
                  </div>

                  {/* Generation Progress Indicator */}
                  {isGenerating && (
                    <div className="p-3 rounded-lg bg-[#FF6A00]/10 border border-[#FF6A00]/30 space-y-2 mt-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white font-medium">{generationStatus}</span>
                        <span className="text-[#FF6A00] font-bold">{generationProgress}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/[0.1] overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#FF6A00] to-amber-400 transition-all duration-300"
                          style={{ width: `${generationProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* SECTION C — TEMPLATE LIBRARY */}
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] overflow-hidden transition-all">
              <button
                onClick={() => toggleSection('library')}
                className="w-full flex items-center justify-between p-3.5 bg-white/[0.02] border-b border-white/[0.04] text-left hover:bg-white/[0.04] transition-all"
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#FF6A00]" />
                  <span className="text-xs font-bold text-white tracking-wider uppercase">SECTION C — TEMPLATE LIBRARY</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] text-gray-400">{filteredTemplates.length}</span>
                  {collapsedSections.library ? <ChevronDown className="w-3.5 h-3.5 text-gray-500" /> : <ChevronUp className="w-3.5 h-3.5 text-gray-500" />}
                </div>
              </button>

              {!collapsedSections.library && (
                <div className="p-3.5 space-y-3">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search saved templates..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full py-1.5 pl-8 pr-3 text-xs bg-white/[0.02] border border-white/[0.08] rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-[#FF6A00]/50"
                    />
                  </div>

                  <div className="flex gap-1 overflow-x-auto pb-1 custom-scrollbar">
                    {(['all', 'resume', 'portfolio', 'cover-letter'] as const).map(cat => (
                      <button
                        key={cat}
                        onClick={() => setFilterCategory(cat)}
                        className={cn(
                          'px-2 py-1 rounded text-[10px] font-medium capitalize whitespace-nowrap border transition-all',
                          filterCategory === cat
                            ? 'bg-[#FF6A00]/20 border-[#FF6A00]/50 text-[#FF6A00]'
                            : 'bg-white/[0.02] border-white/[0.05] text-gray-400 hover:text-white'
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-1.5 max-h-[220px] overflow-y-auto custom-scrollbar">
                    {filteredTemplates.length === 0 ? (
                      <div className="text-center py-6 text-gray-500 text-xs">
                        No saved templates found
                      </div>
                    ) : (
                      filteredTemplates.map((template) => (
                        <div
                          key={template.id}
                          onClick={() => {
                            setSelectedTemplate(template);
                            setEditingTemplate(template);
                            setCurrentStep(4);
                          }}
                          className={cn(
                            'group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all border',
                            selectedTemplate?.id === template.id
                              ? 'bg-[#FF6A00]/10 border-[#FF6A00]/40 text-white'
                              : 'bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.05] text-gray-400'
                          )}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded bg-white/[0.04] flex items-center justify-center shrink-0">
                              {template.category === 'resume' ? <FileText className="w-3.5 h-3.5 text-[#FF6A00]" /> : template.category === 'portfolio' ? <Globe className="w-3.5 h-3.5 text-[#FF6A00]" /> : <FileEdit className="w-3.5 h-3.5 text-[#FF6A00]" />}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-white truncate">{template.name}</p>
                              <p className="text-[9px] text-gray-500 capitalize">{template.category} • {template.status}</p>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTemplate(template.id, template.category);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-400 transition-all"
                            title="Delete Template"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* 3. CENTER PANEL — PROFESSIONAL PREVIEW CANVAS */}
        <main className="flex-1 flex flex-col bg-[#050505] overflow-hidden min-w-0">
          {/* Professional Preview Toolbar */}
          <div className="flex flex-wrap items-center justify-between px-4 py-2 border-b border-white/[0.08] bg-[#080808]/90 shrink-0 gap-2">
            {/* Viewport Mode Buttons */}
            <div className="flex items-center bg-white/[0.03] p-1 rounded-lg border border-white/[0.06] gap-1">
              {[
                { id: 'a4', label: 'A4' },
                { id: 'desktop', label: 'Desktop' },
                { id: 'tablet', label: 'Tablet' },
                { id: 'mobile', label: 'Mobile' },
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setPreviewMode(mode.id as any)}
                  className={cn(
                    'px-3 py-1 text-xs font-medium rounded-md transition-all',
                    previewMode === mode.id
                      ? 'bg-[#FF6A00] text-white shadow-sm'
                      : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
                  )}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            {/* Canvas Control Tools */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-white/[0.03] px-2 py-1 rounded-lg border border-white/[0.06] gap-2">
                <button
                  onClick={handleZoomOut}
                  className="p-1 rounded hover:bg-white/[0.08] text-gray-400 hover:text-white transition-all"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs text-gray-300 font-mono w-10 text-center">{Math.round(previewZoom * 100)}%</span>
                <button
                  onClick={handleZoomIn}
                  className="p-1 rounded hover:bg-white/[0.08] text-gray-400 hover:text-white transition-all"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={handleFullscreen}
                className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.08] text-gray-400 hover:text-white transition-all text-xs"
                title="Toggle Fullscreen"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleRefresh}
                className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.08] text-gray-400 hover:text-white transition-all text-xs"
                title="Refresh Preview"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Main Preview Container */}
          <div className="flex-1 overflow-auto p-4 md:p-8 flex items-start justify-center custom-scrollbar bg-[radial-gradient(#1a1a1a_1px,transparent_1px)] [background-size:16px_16px]">
            {activeTemplate ? (
              <div
                className="transition-all duration-200 shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/[0.1] rounded-lg overflow-hidden bg-white"
                style={{
                  transform: `scale(${previewZoom})`,
                  transformOrigin: 'top center',
                  width: getPreviewWidth(),
                  minHeight: getPreviewHeight()
                }}
              >
                <iframe
                  ref={previewRef}
                  key={`${activeTemplate.id}-${previewMode}`}
                  srcDoc={`
                    <!DOCTYPE html>
                    <html>
                    <head>
                      <meta charset="UTF-8">
                      <meta name="viewport" content="width=device-width, initial-scale=1.0">
                      <style>
                        body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
                        ${activeTemplate.cssContent || ''}
                      </style>
                    </head>
                    <body>
                      ${injectDataIntoHTML(activeTemplate.htmlContent, getCurrentData())}
                    </body>
                    </html>
                  `}
                  className="w-full h-full border-0 min-h-[700px] bg-white"
                  title="Template Preview Canvas"
                  sandbox="allow-same-origin"
                />
              </div>
            ) : (
              /* EMPTY CANVAS STATE */
              <div className="max-w-2xl w-full my-auto text-center py-12 px-6 rounded-2xl bg-[#080808]/80 border border-white/[0.08] backdrop-blur-xl shadow-2xl">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF6A00]/20 to-[#FF6A00]/5 border border-[#FF6A00]/30 shadow-[0_0_30px_rgba(255,106,0,0.2)] flex items-center justify-center mx-auto mb-5">
                  <Sparkles className="w-8 h-8 text-[#FF6A00]" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-white mb-2 font-heading tracking-wide">
                  Create something remarkable
                </h2>
                <p className="text-gray-400 text-xs md:text-sm max-w-md mx-auto mb-6 leading-relaxed">
                  Describe your ideal template on the left configuration panel. PhoenixAI will generate a production-ready document preview here.
                </p>

                <button
                  onClick={generateTemplate}
                  disabled={!aiPrompt.trim()}
                  className="phoenix-button text-xs md:text-sm px-6 py-3 mx-auto mb-8 flex items-center gap-2 shadow-[0_0_20px_rgba(255,106,0,0.3)] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Generate Document</span>
                </button>

                {/* 3 Small Example Prompt Cards */}
                <div className="pt-6 border-t border-white/[0.08]">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3 block">
                    Or click an example prompt to get started:
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {EXAMPLE_PROMPTS.map((ex, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setFormType(ex.type);
                          setAiPrompt(ex.prompt);
                        }}
                        className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-[#FF6A00]/40 hover:bg-[#FF6A00]/5 cursor-pointer text-left transition-all group"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-white group-hover:text-[#FF6A00] transition-colors">
                            {ex.title}
                          </span>
                          <Sparkles className="w-3 h-3 text-gray-500 group-hover:text-[#FF6A00]" />
                        </div>
                        <p className="text-[10px] text-gray-500 line-clamp-2">
                          &quot;{ex.prompt}&quot;
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Contextual Actions Toolbar when Template Exists */}
          {activeTemplate && (
            <div className="px-4 py-2.5 border-t border-white/[0.08] bg-[#080808]/90 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const templateToEdit = editingTemplate || selectedTemplate || generatedTemplate;
                    if (templateToEdit) {
                      if (!editingTemplate) {
                        setEditingTemplate(templateToEdit);
                      }
                      setCurrentStep(5);
                    }
                  }}
                  className="phoenix-button-secondary text-xs px-3 py-1.5 flex items-center gap-1.5"
                >
                  <FileEdit className="w-3.5 h-3.5 text-[#FF6A00]" />
                  <span>Edit Template</span>
                </button>
                <button
                  onClick={async () => {
                    const thumb = await generateThumbnailFromPreview();
                    if (thumb && editingTemplate) {
                      handleTemplateEdit('thumbnail', thumb);
                      alert('Thumbnail generated successfully!');
                    }
                  }}
                  className="phoenix-button-secondary text-xs px-3 py-1.5 flex items-center gap-1.5"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-[#FF6A00]" />
                  <span>Generate Thumbnail</span>
                </button>
                <button
                  onClick={async () => {
                    const pdfUri = await generateSamplePDF();
                    if (pdfUri) {
                      const link = document.createElement('a');
                      link.href = pdfUri;
                      link.download = `${(activeTemplate.name || 'template').replace(/[^a-z0-9]/gi, '_').toLowerCase()}_sample.pdf`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    } else {
                      alert('Failed to generate sample PDF');
                    }
                  }}
                  className="phoenix-button-secondary text-xs px-3 py-1.5 flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-[#FF6A00]" />
                  <span>Sample PDF</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={generateTemplate}
                  disabled={isGenerating || !aiPrompt.trim()}
                  className="phoenix-button text-xs px-3 py-1.5 flex items-center gap-1.5 disabled:opacity-40"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Regenerate</span>
                </button>
              </div>
            </div>
          )}
        </main>

        {/* 4. RIGHT PANEL — REAL WORKFLOW TIMELINE */}
        <aside
          className={cn(
            'border-l border-white/[0.08] bg-[#080808] transition-all duration-300 flex flex-col shrink-0 overflow-y-auto custom-scrollbar',
            rightPanelOpen ? 'w-80 md:w-84' : 'w-0 border-l-0 hidden'
          )}
        >
          <div className="p-4 space-y-4">
            {/* WORKFLOW TIMELINE CARD */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <div className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-[#FF6A00]" />
                  <span className="text-xs font-bold text-white tracking-wider uppercase">Workflow Progress</span>
                </div>
                <span className="text-[10px] text-gray-500 font-mono">Step {currentStep} of 7</span>
              </div>

              {/* Vertical Progress Timeline */}
              <div className="relative pl-3 space-y-5 before:absolute before:left-5 before:top-3 before:bottom-3 before:w-0.5 before:bg-white/[0.08]">
                {workflowTimeline.map((item, idx) => {
                  const isCompleted = item.isCompleted;
                  const isCurrent = item.isCurrent;
                  const isLocked = item.isLocked;

                  return (
                    <div key={item.stepNum} className="relative flex items-start gap-3 group">
                      {/* Timeline Indicator Badge */}
                      <div
                        className={cn(
                          'w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 transition-all border text-xs font-bold',
                          isCompleted
                            ? 'bg-[#FF6A00] border-[#FF6A00] text-white shadow-[0_0_10px_rgba(255,106,0,0.4)]'
                            : isCurrent
                            ? 'bg-[#FF6A00]/20 border-[#FF6A00] text-[#FF6A00] ring-2 ring-[#FF6A00]/30 shadow-[0_0_12px_rgba(255,106,0,0.3)]'
                            : isLocked
                            ? 'bg-white/[0.02] border-white/[0.08] text-gray-600'
                            : 'bg-white/[0.04] border-white/[0.1] text-gray-400'
                        )}
                      >
                        {isCompleted ? (
                          <Check className="w-3.5 h-3.5 text-white" />
                        ) : isLocked ? (
                          <Lock className="w-3 h-3 text-gray-600" />
                        ) : (
                          <span>{item.stepNum}</span>
                        )}
                      </div>

                      {/* Step Content Card */}
                      <div
                        onClick={() => {
                          if (!isLocked && item.action) {
                            item.action();
                          }
                        }}
                        className={cn(
                          'flex-1 p-2.5 rounded-lg border transition-all cursor-pointer',
                          isCurrent
                            ? 'bg-[#FF6A00]/10 border-[#FF6A00]/40 shadow-[0_0_10px_rgba(255,106,0,0.1)]'
                            : isCompleted
                            ? 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]'
                            : isLocked
                            ? 'bg-white/[0.01] border-white/[0.04] opacity-50 cursor-not-allowed'
                            : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]'
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <h4
                            className={cn(
                              'text-xs font-semibold',
                              isCurrent
                                ? 'text-[#FF6A00]'
                                : isCompleted
                                ? 'text-white'
                                : isLocked
                                ? 'text-gray-500'
                                : 'text-gray-300'
                            )}
                          >
                            {item.title}
                          </h4>
                          {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-[#FF6A00] animate-pulse" />}
                        </div>
                        <p className="text-[10px] text-gray-500 mt-0.5">{item.subtitle}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 5. VALIDATION PANEL IMPROVEMENT */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-3">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-[#FF6A00]" />
                  <span className="text-xs font-bold text-white tracking-wider uppercase">Validation Status</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-mono font-bold text-[#FF6A00]">
                    {validationChecks.passedCount} / {validationChecks.total}
                  </span>
                  <span className="text-[10px] text-gray-500">Passed</span>
                </div>
              </div>

              {/* Quality Checklist */}
              <div className="space-y-2">
                {validationChecks.items.map((v) => (
                  <div key={v.id} className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                    <div className="flex items-center gap-2">
                      {v.status === 'passed' ? (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : v.status === 'warning' ? (
                        <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      ) : v.status === 'error' ? (
                        <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-gray-600 shrink-0" />
                      )}
                      <span className="text-xs text-gray-300 font-medium">{v.label}</span>
                    </div>
                    <span
                      className={cn(
                        'text-[10px] font-mono capitalize',
                        v.status === 'passed'
                          ? 'text-emerald-400'
                          : v.status === 'warning'
                          ? 'text-amber-400'
                          : v.status === 'error'
                          ? 'text-red-400'
                          : 'text-gray-500'
                      )}
                    >
                      {v.detail}
                    </span>
                  </div>
                ))}
              </div>

              {/* Warning/Validation Messages list */}
              {qualityWarnings.length > 0 && (
                <div className="pt-2 border-t border-white/[0.06] space-y-1">
                  <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider block">Quality Warnings:</span>
                  {qualityWarnings.map((warn, idx) => (
                    <div key={idx} className="text-[10px] text-amber-300/80 flex items-start gap-1">
                      <span>•</span>
                      <span>{warn}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CODE / HTML / CSS / METADATA EDITOR PANEL */}
            {activeTemplate && (
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-3">
                <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
                  <FileEdit className="w-4 h-4 text-[#FF6A00]" />
                  <span className="text-xs font-bold text-white tracking-wider uppercase">Template Inspector</span>
                </div>

                <div className="flex gap-1 border-b border-white/[0.06] pb-2 overflow-x-auto">
                  {(['general', 'html', 'css', 'metadata'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setEditorTab(tab)}
                      className={cn(
                        'px-2.5 py-1 rounded text-[10px] font-medium capitalize transition-all whitespace-nowrap',
                        editorTab === tab
                          ? 'bg-[#FF6A00] text-white font-semibold'
                          : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                      )}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {editorTab === 'general' && (
                  <div className="space-y-2.5">
                    <div>
                      <label className="text-[10px] text-gray-500 block mb-1">Template Name</label>
                      <input
                        type="text"
                        value={editingTemplate?.name || activeTemplate.name}
                        onChange={(e) => handleTemplateEdit('name', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white/[0.02] border border-white/[0.08] rounded-lg text-white focus:outline-none focus:border-[#FF6A00]/50"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 block mb-1">Category</label>
                      <select
                        value={editingTemplate?.category || activeTemplate.category}
                        onChange={(e) => handleTemplateEdit('category', e.target.value as FormType)}
                        className="w-full px-2.5 py-1.5 text-xs bg-[#080808] border border-white/[0.08] rounded-lg text-white focus:outline-none focus:border-[#FF6A00]/50"
                      >
                        <option value="resume">Resume</option>
                        <option value="portfolio">Portfolio</option>
                        <option value="cover-letter">Cover Letter</option>
                      </select>
                    </div>
                  </div>
                )}

                {editorTab === 'html' && (
                  <div>
                    <label className="text-[10px] text-gray-500 block mb-1">HTML Markup</label>
                    <textarea
                      value={editingTemplate?.htmlContent || activeTemplate.htmlContent}
                      onChange={(e) => handleTemplateEdit('htmlContent', e.target.value)}
                      className="w-full min-h-[140px] p-2 text-[10px] font-mono bg-[#050505] border border-white/[0.08] rounded-lg text-emerald-400 resize-none focus:outline-none focus:border-[#FF6A00]/50 custom-scrollbar"
                    />
                  </div>
                )}

                {editorTab === 'css' && (
                  <div>
                    <label className="text-[10px] text-gray-500 block mb-1">CSS Stylesheet</label>
                    <textarea
                      value={editingTemplate?.cssContent || activeTemplate.cssContent || ''}
                      onChange={(e) => handleTemplateEdit('cssContent', e.target.value)}
                      className="w-full min-h-[140px] p-2 text-[10px] font-mono bg-[#050505] border border-white/[0.08] rounded-lg text-amber-400 resize-none focus:outline-none focus:border-[#FF6A00]/50 custom-scrollbar"
                    />
                  </div>
                )}

                {editorTab === 'metadata' && (
                  <div className="space-y-2 text-[10px] font-mono text-gray-400">
                    <div className="flex justify-between border-b border-white/[0.04] pb-1">
                      <span>ID:</span>
                      <span className="text-white truncate max-w-[120px]">{activeTemplate.id}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/[0.04] pb-1">
                      <span>Category:</span>
                      <span className="text-white uppercase">{activeTemplate.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Updated:</span>
                      <span className="text-white">{new Date(activeTemplate.updatedAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ACTION FOOTER BUTTONS */}
            <div className="space-y-2 pt-2">
              <button
                onClick={saveDraft}
                disabled={!activeTemplate}
                className="w-full phoenix-button-secondary text-xs py-2.5 flex items-center justify-center gap-1.5 disabled:opacity-40"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Working Draft</span>
              </button>
              <button
                onClick={publishTemplate}
                disabled={!activeTemplate || isPublishing}
                className="w-full phoenix-button text-xs py-2.5 flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(255,106,0,0.2)] disabled:opacity-40"
              >
                {isPublishing ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                )}
                <span>Publish to Library</span>
              </button>
            </div>

            {/* VERSION HISTORY SNAPSHOTS */}
            {versionHistory.length > 0 && (
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-3">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-[#FF6A00]" />
                    <span className="text-xs font-bold text-white tracking-wider uppercase">History Log</span>
                  </div>
                  <span className="text-[10px] text-gray-500 font-mono">{versionHistory.length}</span>
                </div>

                <div className="space-y-1.5 max-h-[140px] overflow-y-auto custom-scrollbar">
                  {versionHistory.slice().reverse().map((version, idx) => (
                    <div
                      key={version.id}
                      onClick={() => restoreVersion(version)}
                      className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.05] cursor-pointer flex items-center justify-between text-xs transition-all"
                    >
                      <div className="min-w-0">
                        <span className="text-white font-medium block truncate text-[11px]">v{versionHistory.length - idx} • {version.name}</span>
                        <span className="text-[9px] text-gray-500">{new Date(version.updatedAt).toLocaleTimeString()}</span>
                      </div>
                      <span className="text-[10px] text-[#FF6A00] hover:underline">Restore</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* PUBLISH SUCCESS MODAL OVERLAY */}
      {publishSuccess && publishedTemplate && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="phoenix-card p-8 max-w-md w-full border border-white/[0.1] shadow-2xl rounded-2xl bg-[#080808]">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2 font-heading">Template Published!</h2>
              <p className="text-gray-400 text-xs">Your template is now available in the production library</p>
            </div>

            {/* Checklist items */}
            <div className="mb-6 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-300">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Template Name: <strong className="text-white">{publishedTemplate.name}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-300">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Category: <strong className="text-white capitalize">{publishedTemplate.category}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-300">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>HTML & CSS content validated</span>
              </div>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={() => {
                  setPublishSuccess(false);
                  setPublishedTemplate(null);
                  window.location.href = '/admin/career-builder';
                }}
                className="w-full phoenix-button text-sm py-3"
              >
                <Layout className="w-4 h-4 inline mr-2" />
                View Library
              </button>
              <button
                onClick={resetPublishFlow}
                className="w-full phoenix-button-secondary text-sm py-3"
              >
                <Sparkles className="w-4 h-4 inline mr-2" />
                Create Another
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
