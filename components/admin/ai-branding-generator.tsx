'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Wand2, RefreshCw, Eye, EyeOff, Check, X } from 'lucide-react';
import { getServiceIcon, getIconName } from '@/lib/service-icon-engine';
import { getServiceColorScheme, generateRandomColorScheme } from '@/lib/service-color-engine';
import { LucideIcon } from 'lucide-react';

interface GeneratedBranding {
  icon: LucideIcon;
  iconName: string;
  colorScheme: {
    primary: string;
    secondary: string;
    glow: string;
    gradient: string;
    accent: string;
  };
  thumbnail: string;
  banner: string;
  ctaText: string;
  seoTitle: string;
  seoDescription: string;
  urlSlug: string;
  tags: string[];
}

interface AIBrandingGeneratorProps {
  serviceName: string;
  category: string;
  description: string;
  onBrandingGenerated: (branding: GeneratedBranding) => void;
  initialBranding?: Partial<GeneratedBranding>;
}

export function AIBrandingGenerator({
  serviceName,
  category,
  description,
  onBrandingGenerated,
  initialBranding,
}: AIBrandingGeneratorProps) {
  const [branding, setBranding] = useState<GeneratedBranding | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [overrides, setOverrides] = useState<Partial<GeneratedBranding>>(initialBranding || {});

  // Generate branding when inputs change
  useEffect(() => {
    if (serviceName || category || description) {
      generateBranding();
    }
  }, [serviceName, category, description]);

  const generateBranding = () => {
    setIsGenerating(true);
    
    // Simulate AI generation delay
    setTimeout(() => {
      const icon = getServiceIcon(serviceName, category, description);
      const colorScheme = getServiceColorScheme(category, serviceName, description);
      
      // Generate URL slug
      const slug = serviceName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || 'service';

      // Generate SEO title
      const seoTitle = serviceName 
        ? `${serviceName} - Professional ${category || 'Service'} by Phoenix AI Studio`
        : 'Professional Service by Phoenix AI Studio';

      // Generate SEO description
      const seoDescription = description
        ? description.substring(0, 160)
        : `Get professional ${serviceName || 'services'} from Phoenix AI Studio. Expert solutions with guaranteed results.`;

      // Generate CTA text
      const ctaOptions = [
        'Get Started',
        'Learn More',
        'Explore Now',
        'Request Quote',
        'Book Demo',
        'Start Free Trial',
      ];
      const ctaText = ctaOptions[Math.floor(Math.random() * ctaOptions.length)];

      // Generate tags based on category and name
      const baseTags = [category || 'Service', serviceName || 'Professional'];
      const additionalTags = [
        'AI-Powered',
        'Expert',
        'Quality',
        'Fast Delivery',
        '24/7 Support',
        'Custom Solution',
      ];
      const tags = [...baseTags, ...additionalTags.slice(0, 3)];

      // Generate placeholder URLs for thumbnail and banner
      const thumbnail = `/api/placeholder/thumbnail/${slug}`;
      const banner = `/api/placeholder/banner/${slug}`;

      const newBranding: GeneratedBranding = {
        icon,
        iconName: getIconName(icon),
        colorScheme,
        thumbnail,
        banner,
        ctaText,
        seoTitle,
        seoDescription,
        urlSlug: slug,
        tags,
      };

      setBranding(newBranding);
      
      // Apply overrides
      const finalBranding = { ...newBranding, ...overrides };
      onBrandingGenerated(finalBranding);
      setIsGenerating(false);
    }, 800);
  };

  const handleRegenerate = () => {
    generateBranding();
  };

  const handleOverride = (field: keyof GeneratedBranding, value: any) => {
    const newOverrides = { ...overrides, [field]: value };
    setOverrides(newOverrides);
    
    if (branding) {
      const finalBranding = { ...branding, ...newOverrides };
      onBrandingGenerated(finalBranding);
    }
  };

  const handleResetOverride = (field: keyof GeneratedBranding) => {
    const newOverrides = { ...overrides };
    delete newOverrides[field];
    setOverrides(newOverrides);
    
    if (branding) {
      const finalBranding = { ...branding, ...newOverrides };
      onBrandingGenerated(finalBranding);
    }
  };

  if (!branding) {
    return (
      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
        <div className="flex items-center gap-3 text-zinc-400">
          <Sparkles className="w-5 h-5 text-[#FF7A00] animate-pulse" />
          <span>Enter service details to generate AI branding...</span>
        </div>
      </div>
    );
  }

  const IconComponent = overrides.icon || branding.icon;
  const colorScheme = overrides.colorScheme || branding.colorScheme;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FF7A00]/10 flex items-center justify-center">
            <Wand2 className="w-5 h-5 text-[#FF7A00]" />
          </div>
          <div>
            <h3 className="font-heading text-sm font-bold text-white">AI Branding Generator</h3>
            <p className="text-xs text-zinc-500">Automatically generated branding assets</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
            title={showPreview ? 'Hide Preview' : 'Show Preview'}
          >
            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button
            onClick={handleRegenerate}
            disabled={isGenerating}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Regenerate"
          >
            <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Live Preview Card */}
      {showPreview && (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0c0c0c] to-[#1a1a1a] border border-white/[0.08]">
          <div className="mb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Live Preview</span>
          </div>
          
          <div className="group relative">
            <div className="card-phoenix h-full flex flex-col p-6 rounded-2xl border border-white/[0.08] bg-white/[0.02]">
              {/* Icon container */}
              <div className="relative mb-6">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110"
                  style={{
                    background: `linear-gradient(135deg, ${colorScheme.primary}15, ${colorScheme.primary}05)`,
                    border: `1px solid ${colorScheme.primary}20`,
                  }}
                >
                  <IconComponent
                    className="w-8 h-8 transition-all duration-500"
                    style={{ color: colorScheme.primary }}
                  />
                </div>
                {/* Glow effect on hover */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
                  style={{ background: colorScheme.glow }}
                />
              </div>

              {/* Title */}
              <h3 className="card-title mb-3 transition-colors duration-300 group-hover:text-[#FF8A33]">
                {serviceName || 'Service Name'}
              </h3>

              {/* Description */}
              <p className="mb-6 flex-grow leading-relaxed text-[#A1A1AA] text-sm">
                {description || 'Service description will appear here...'}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {(overrides.tags || branding.tags).slice(0, 3).map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 rounded-full text-[10px] font-medium text-zinc-400 bg-white/[0.05] border border-white/[0.08]"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <button
                className="w-full py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 hover:shadow-lg"
                style={{
                  background: colorScheme.gradient,
                  color: 'white',
                }}
              >
                {overrides.ctaText || branding.ctaText}
              </button>

              {/* Bottom accent line */}
              <div className="absolute bottom-0 left-0 right-0 h-px rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: `linear-gradient(90deg, transparent, ${colorScheme.primary}50, transparent)`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Generated Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Icon */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Icon</span>
            {overrides.icon && (
              <button
                onClick={() => handleResetOverride('icon')}
                className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${colorScheme.primary}15, ${colorScheme.primary}05)`,
                border: `1px solid ${colorScheme.primary}20`,
              }}
            >
              <IconComponent className="w-5 h-5" style={{ color: colorScheme.primary }} />
            </div>
            <span className="text-sm text-white font-medium">{branding.iconName}</span>
            {overrides.icon && <Check className="w-4 h-4 text-green-400" />}
          </div>
        </div>

        {/* Color Scheme */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Color Scheme</span>
            {overrides.colorScheme && (
              <button
                onClick={() => handleResetOverride('colorScheme')}
                className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full"
              style={{ background: colorScheme.primary }}
              title="Primary"
            />
            <div
              className="w-6 h-6 rounded-full"
              style={{ background: colorScheme.secondary }}
              title="Secondary"
            />
            <div
              className="w-6 h-6 rounded-full"
              style={{ background: colorScheme.accent }}
              title="Accent"
            />
            <div
              className="w-6 h-6 rounded-full"
              style={{ background: colorScheme.gradient }}
              title="Gradient"
            />
            {overrides.colorScheme && <Check className="w-4 h-4 text-green-400" />}
          </div>
        </div>

        {/* URL Slug */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">URL Slug</span>
            {overrides.urlSlug && (
              <button
                onClick={() => handleResetOverride('urlSlug')}
                className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <code className="text-sm text-[#FF8A33] font-mono">
              {overrides.urlSlug || branding.urlSlug}
            </code>
            {overrides.urlSlug && <Check className="w-4 h-4 text-green-400" />}
          </div>
        </div>

        {/* CTA Text */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">CTA Text</span>
            {overrides.ctaText && (
              <button
                onClick={() => handleResetOverride('ctaText')}
                className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-white">
              {overrides.ctaText || branding.ctaText}
            </span>
            {overrides.ctaText && <Check className="w-4 h-4 text-green-400" />}
          </div>
        </div>

        {/* SEO Title */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-3 md:col-span-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">SEO Title</span>
            {overrides.seoTitle && (
              <button
                onClick={() => handleResetOverride('seoTitle')}
                className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <p className="text-sm text-zinc-300 truncate">
              {overrides.seoTitle || branding.seoTitle}
            </p>
            {overrides.seoTitle && <Check className="w-4 h-4 text-green-400" />}
          </div>
        </div>

        {/* SEO Description */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-3 md:col-span-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">SEO Description</span>
            {overrides.seoDescription && (
              <button
                onClick={() => handleResetOverride('seoDescription')}
                className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <p className="text-sm text-zinc-300 truncate">
              {overrides.seoDescription || branding.seoDescription}
            </p>
            {overrides.seoDescription && <Check className="w-4 h-4 text-green-400" />}
          </div>
        </div>

        {/* Tags */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-3 md:col-span-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Suggested Tags</span>
            {overrides.tags && (
              <button
                onClick={() => handleResetOverride('tags')}
                className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {(overrides.tags || branding.tags).map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-1 rounded-full text-xs font-medium text-zinc-400 bg-white/[0.05] border border-white/[0.08]"
              >
                {tag}
              </span>
            ))}
            {overrides.tags && <Check className="w-4 h-4 text-green-400 ml-2" />}
          </div>
        </div>
      </div>
    </div>
  );
}
