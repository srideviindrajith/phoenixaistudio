'use client';

import { useState, useEffect } from 'react';
import { Check, Star, Sparkles, Zap, Building2 } from 'lucide-react';
import Link from 'next/link';

interface PackageItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  features: string;
  launchUrl?: string | null;
  demoUrl?: string | null;
  documentationUrl?: string | null;
  buttonText?: string;
  buttonUrl?: string | null;
  billingCycle?: string;
  currency?: string;
  popular: boolean;
  featured?: boolean;
  visibility?: string;
  status?: string | boolean;
  tags?: string | null;
  shortDescription?: string | null;
  longDescription?: string | null;
  buttonColor?: string | null;
  gradient?: string | null;
  buttonIcon?: string | null;
  buttonAction?: string;
  order: number;
  offerEnabled?: boolean;
  offerLabel?: string | null;
  customOfferLabel?: string | null;
  originalPrice?: number | null;
  offerPrice?: number | null;
  offerStartDate?: string | Date | null;
  offerEndDate?: string | Date | null;
  discountPercentage?: number | null;
  offerMetadata?: string | null;
  createdAt: string;
  agents?: Array<{
    id: string;
    name: string;
    description: string;
    category: string;
  }>;
  _count?: {
    agents: number;
  };
}

const mockCareerBuilderPackages: PackageItem[] = [];

function splitPackageFeatures(features: string) {
  const [featureText] = (features || '').split('\n\n[METADATA]\n');
  return featureText
    .split('\n')
    .map((feature) => feature.trim())
    .filter(Boolean);
}

function getPackageDescription(pkg: {
  shortDescription?: string | null;
  description: string;
}) {
  return pkg.shortDescription || pkg.description;
}

function getPackageCtaUrl(pkg: {
  buttonAction?: string | null;
  buttonUrl?: string | null;
  launchUrl?: string | null;
  demoUrl?: string | null;
  documentationUrl?: string | null;
}) {
  if (pkg.buttonAction === 'Launch') return pkg.launchUrl || pkg.buttonUrl || '/contact';
  if (pkg.buttonAction === 'Demo') return pkg.demoUrl || pkg.buttonUrl || '/contact';
  if (pkg.buttonAction === 'Documentation') return pkg.documentationUrl || pkg.buttonUrl || '/contact';
  if (pkg.buttonAction === 'Custom URL') return pkg.buttonUrl || '/contact';

  return pkg.buttonUrl || '/contact';
}

function isExternalUrl(url: string) {
  return /^https?:\/\//i.test(url);
}

function CountdownTimer({ endDateStr, currentTime }: { endDateStr: string; currentTime: Date }) {
  const difference = new Date(endDateStr).getTime() - currentTime.getTime();
  if (difference <= 0) return null;

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  return (
    <div className="mt-2.5 flex items-center gap-1.5 text-xs text-amber-500 font-semibold bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl w-fit">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
      <span>Offer Ends In: {days} Days {hours} Hours</span>
    </div>
  );
}

const packageIcons = [Sparkles, Zap, Building2];

interface PackagesListClientProps {
  initialPackages: PackageItem[];
  defaultCategory?: 'Client Solution' | 'AI Agent' | 'Career Builder';
  careerBuilderVisible?: boolean;
}

export function PackagesListClient({ initialPackages, defaultCategory = 'Client Solution', careerBuilderVisible = true }: PackagesListClientProps) {
  const [packages, setPackages] = useState<PackageItem[]>(initialPackages);
  const [activeTab, setActiveTab] = useState<'Client Solution' | 'AI Agent' | 'Career Builder'>(defaultCategory);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Filter categories based on careerBuilderVisible setting
  const categories: Array<{ id: 'Client Solution' | 'AI Agent' | 'Career Builder'; label: string }> = [
    { id: 'Client Solution', label: 'Client Solutions' },
    { id: 'AI Agent', label: 'AI Agents' }
  ];
  
  if (careerBuilderVisible) {
    categories.push({ id: 'Career Builder', label: 'Career Builder' });
  }



  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const cat = searchParams.get('category');
      // Only set Career Builder tab if it's visible
      if (cat === 'Career Builder' && careerBuilderVisible) {
        setActiveTab('Career Builder');
        setTimeout(() => {
          const el = document.getElementById('our-packages');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 150);
      } else if (cat === 'AI Agent' || cat === 'AI Agents') {
        setActiveTab('AI Agent');
        setTimeout(() => {
          const el = document.getElementById('our-packages');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 150);
      }
      // If Career Builder is not visible and active tab is Career Builder, switch to default
      if (!careerBuilderVisible && activeTab === 'Career Builder') {
        setActiveTab('Client Solution');
      }
    }
  }, [careerBuilderVisible, activeTab]);

  // Filter packages for the active category
  const filteredPackages = packages.filter(p => p.category === activeTab);

  return (
    <div id="our-packages">
      {/* Category Tabs */}
      <div className="flex flex-wrap justify-center items-center gap-3 mb-12 max-w-lg mx-auto px-4">
        {categories.map((cat) => {
          const isActive = activeTab === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveTab(cat.id)}
              className={`px-5 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                isActive
                  ? 'bg-[#FF6A00]/15 border-[#FF6A00] text-[#FF8A33] shadow-[0_0_15px_rgba(255,106,0,0.2)]'
                  : 'bg-white/[0.02] border-white/10 text-gray-400 hover:text-white hover:border-white/20'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {filteredPackages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          {filteredPackages.map((pkg, index) => {
            const IconComponent = packageIcons[index % packageIcons.length];
            const isPopular = pkg.popular;
            const featuresList = splitPackageFeatures(pkg.features);
            const formattedPrice = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(pkg.price);
            const billingCycle = pkg.billingCycle;
            const ctaUrl = getPackageCtaUrl(pkg);
            const ctaExternal = isExternalUrl(ctaUrl);
            const currencySymbol = pkg.currency || '₹';

            const activeOffer = pkg.offerEnabled && 
              (!pkg.offerStartDate || new Date(pkg.offerStartDate) <= currentTime) && 
              (!pkg.offerEndDate || new Date(pkg.offerEndDate) > currentTime);

            const formattedOfferPrice = activeOffer && pkg.offerPrice !== null && pkg.offerPrice !== undefined
              ? new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(pkg.offerPrice)
              : null;

            const formattedOriginalPrice = activeOffer && pkg.originalPrice !== null && pkg.originalPrice !== undefined
              ? new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(pkg.originalPrice)
              : null;

            const offerLabelToShow = activeOffer
              ? (pkg.offerLabel === 'Custom' ? pkg.customOfferLabel : pkg.offerLabel)
              : '';

            const offerEndFormatted = activeOffer && pkg.offerEndDate
              ? new Date(pkg.offerEndDate).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
              : '';

            return (
              <div
                key={pkg.id}
                className={`relative group ${isPopular ? 'lg:-mt-4 lg:mb-4' : ''}`}
              >
                {/* Popular glow effect */}
                {isPopular && (
                  <div className="absolute -inset-px rounded-[20px] bg-gradient-to-b from-[#FF6A00]/20 to-transparent opacity-50 blur-sm" />
                )}

                <div
                  className={`relative h-full rounded-3xl transition-all duration-500 ${
                    isPopular
                      ? 'bg-gradient-to-b from-[#FF6A00]/10 to-[#0B0B0D] border-2 border-[#FF6A00]/50 group-hover:border-[#FF6A00]'
                      : 'glass-card border border-white/[0.06] group-hover:border-[#FF6A00]/30'
                  }`}
                >
                  {/* Popular badge */}
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                      <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FF6A00] to-[#CC4F00] px-5 py-1.5 text-sm font-semibold text-white shadow-lg shadow-[#FF6A00]/30">
                        <Star className="w-4 h-4 fill-current" />
                        <span>Most Popular</span>
                      </div>
                    </div>
                  )}

                  <div className="p-8 flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                        isPopular ? 'bg-[#FF6A00]/20' : 'bg-white/5'
                      }`}>
                        <IconComponent className={`w-7 h-7 ${
                          isPopular ? 'text-[#FF6A00]' : 'text-gray-400'
                        }`} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white leading-tight">{pkg.name}</h3>
                        <div className="flex gap-2 mt-1">
                          <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
                            {pkg.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="mb-6">
                      {activeOffer && formattedOriginalPrice && formattedOfferPrice ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="flex items-baseline gap-1">
                              <span className="text-2xl font-bold text-gray-400">{currencySymbol}</span>
                              <span className={`text-5xl font-bold tracking-tight ${
                                isPopular ? 'gradient-text' : 'text-white'
                              }`}>
                                {formattedOfferPrice}
                              </span>
                               {billingCycle && pkg.category === 'AI Agent' && <span className="text-gray-500 text-sm">/{billingCycle}</span>}
                            </div>
                            
                            <div className="flex flex-col">
                              <span className="text-sm text-zinc-500 line-through">
                                {currencySymbol}{formattedOriginalPrice}
                              </span>
                              <span className="text-[10px] font-bold text-[#FF6A00] bg-[#FF6A00]/10 border border-[#FF6A00]/20 px-1.5 py-0.5 rounded mt-0.5 w-fit">
                                {pkg.discountPercentage || 0}% OFF
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-0.5">
                            {offerLabelToShow && (
                              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                                {offerLabelToShow}
                              </span>
                            )}
                            <span className="text-xs text-zinc-500">
                              Offer Ends {offerEndFormatted}
                            </span>
                          </div>

                          {pkg.offerEndDate && (
                            <CountdownTimer endDateStr={typeof pkg.offerEndDate === 'string' ? pkg.offerEndDate : pkg.offerEndDate.toISOString()} currentTime={currentTime} />
                          )}
                        </div>
                      ) : (
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-bold text-gray-400">{currencySymbol}</span>
                           <span className={`text-5xl font-bold tracking-tight ${isPopular ? 'gradient-text' : 'text-white'}`}>
                             {formattedPrice}
                           </span>
                            {billingCycle && pkg.category === 'AI Agent' && <span className="text-gray-500 text-sm">/{billingCycle}</span>}
                        </div>
                      )}
                      <p className="text-gray-400 mt-3 leading-relaxed text-sm min-h-[50px]">{getPackageDescription(pkg)}</p>
                    </div>

                    {/* Divider */}
                    <div className={`h-px my-6 ${
                      isPopular ? 'bg-[#FF6A00]/20' : 'bg-white/10'
                    }`} />

                    {/* Features */}
                    <ul className="space-y-4 mb-8 flex-1">
                      {featuresList.map((feature, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-3"
                        >
                          <div className={`mt-1 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                            isPopular ? 'bg-[#FF6A00]/20' : 'bg-white/5'
                          }`}>
                            <Check className={`w-3 h-3 ${
                              isPopular ? 'text-[#FF6A00]' : 'text-gray-400'
                            }`} />
                          </div>
                          <span className="text-gray-300 leading-relaxed text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Linked AI Agents */}
                    {pkg.agents && pkg.agents.length > 0 && (
                      <div className="mb-8">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                          Included AI Agents ({pkg._count?.agents || pkg.agents.length})
                        </div>
                        <div className="space-y-2">
                          {pkg.agents.slice(0, 3).map((agent) => (
                            <Link
                              key={agent.id}
                              href={`/ai-agents/${agent.id}`}
                              className="block text-sm text-gray-300 hover:text-[#FF6A00] transition-colors"
                            >
                              • {agent.name}
                            </Link>
                          ))}
                          {pkg.agents.length > 3 && (
                            <div className="text-xs text-gray-500">
                              +{pkg.agents.length - 3} more agents
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* CTA Button */}
                    <Link
                      href={ctaUrl}
                      target={ctaExternal ? '_blank' : undefined}
                      rel={ctaExternal ? 'noopener noreferrer' : undefined}
                      className={`block w-full text-center py-4 rounded-xl font-semibold transition-all duration-500 ${
                        isPopular
                          ? 'btn-fire'
                          : 'border-2 border-white/20 text-white hover:border-[#FF6A00] hover:text-[#FF6A00] hover:bg-[#FF6A00]/5'
                      }`}
                    >
                      {pkg.buttonText || 'Get Started'}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 max-w-xl mx-auto glass-card rounded-[20px] p-12">
          <div className="w-20 h-20 rounded-full glass flex items-center justify-center mx-auto mb-6">
            <Star className="w-10 h-10 text-[#FF6A00] animate-pulse" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">
            No Packages Available
          </h3>
          <p className="text-gray-400 max-w-md mx-auto leading-relaxed text-sm">
            Packages for this category are currently being tailored. Contact us for custom quotes or support services.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
            <Link href="/contact?type=quote" className="btn-fire px-6 py-3 text-sm font-semibold rounded-xl text-center">
              Request Quote
            </Link>
            <Link href="/contact" className="px-6 py-3 text-sm font-semibold text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all text-center">
              Contact Us
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
