import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Globe, Cpu, CornerDownLeft } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, setIsOpen }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setIsOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
      setQuery('');
    }
  }, [isOpen]);

  const items = [
    // Pages / Settings Shortcuts
    { id: 'sh-dash', title: 'Go to Dashboard', category: 'Shortcuts', icon: Globe, action: () => navigate('/') },
    { id: 'sh-prod', title: 'Go to Products Launchpad', category: 'Shortcuts', icon: Cpu, action: () => navigate('/products') },
    
    // Static products
    { id: 'p-bill', title: 'Launch Billing Core Suite', category: 'Products', icon: Cpu, action: () => navigate('/products') },
    { id: 'p-auto', title: 'Launch Automation Core Suite', category: 'Products', icon: Cpu, action: () => navigate('/products') },
    { id: 'p-crm', title: 'Launch CRM Core Client Panel', category: 'Products', icon: Cpu, action: () => navigate('/products') },
    { id: 'p-admin', title: 'Launch Admin Intelligence Engine', category: 'Products', icon: Cpu, action: () => navigate('/products') },
  ];

  const allItems = [...items];

  const filteredItems = query.trim() === ''
    ? allItems.slice(0, 6)
    : allItems.filter(item => item.title.toLowerCase().includes(query.toLowerCase()));

  // Keyboard navigation inside list
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
        setIsOpen(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-24 px-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl rounded-2xl border border-borderBg bg-cardBg shadow-2xl flex flex-col overflow-hidden"
        onKeyDown={handleKeyDown}
      >
        {/* Search header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-borderBg">
          <Search className="w-5 h-5 text-darkGray" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search users, companies, products, settings... (Arrow keys to navigate)"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="flex-1 bg-transparent border-0 text-sm text-white placeholder-darkGray focus:outline-none"
          />
          <span className="text-[10px] font-semibold bg-background border border-borderBg px-2 py-1 rounded text-darkGray font-mono">ESC</span>
        </div>

        {/* Results list */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredItems.length > 0 ? (
            filteredItems.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => {
                  item.action();
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs transition-all ${
                  idx === selectedIndex 
                    ? 'bg-[#1e1e1e] text-white border-l-2 border-primaryOrange shadow-lg' 
                    : 'text-darkGray hover:bg-[#161616] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-4 h-4 text-primaryOrange" />
                  <span>{item.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] uppercase font-bold text-mutedGray tracking-wider bg-background px-2 py-0.5 rounded border border-borderBg">
                    {item.category}
                  </span>
                  {idx === selectedIndex && (
                    <CornerDownLeft className="w-3 h-3 text-primaryOrange" />
                  )}
                </div>
              </button>
            ))
          ) : (
            <div className="py-8 text-center text-darkGray">
              No matching shortcuts or logs found.
            </div>
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2 bg-background/50 border-t border-borderBg flex items-center justify-between text-[10px] text-mutedGray">
          <div className="flex items-center gap-2">
            <span>↑↓ Navigate</span>
            <span>•</span>
            <span>↵ Select</span>
          </div>
          <span>PhoenixAI Core Palette</span>
        </div>
      </div>
    </div>
  );
};
