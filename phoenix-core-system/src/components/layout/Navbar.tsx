import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Search } from 'lucide-react';
import { ProfileMenu } from './ProfileMenu';
import { CommandPalette } from './CommandPalette';

interface NavbarProps {
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ collapsed, setCollapsed }) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();

  // Generate page title based on path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/' || path.startsWith('/dashboard')) return 'Dashboard';
    if (path.startsWith('/products')) return 'Products Launchpad';
    return 'Console';
  };

  return (
    <>
      <header className="fixed top-0 right-0 h-16 border-b border-borderBg bg-cardBg/80 backdrop-blur-md z-10 flex items-center justify-between px-6 transition-all duration-300 left-0 md:left-auto"
        style={{
          left: window.innerWidth >= 768 ? (collapsed ? '5rem' : '16rem') : '0'
        }}
      >
        {/* Left header toggle & title */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="md:hidden p-2 rounded-xl border border-borderBg bg-[#121212] text-darkGray hover:text-white transition-all cursor-pointer"
          >
            <Menu className="w-4 h-4" />
          </button>
          <h1 className="text-base md:text-lg font-bold text-white tracking-tight font-heading">
            {getPageTitle()}
          </h1>
        </div>

        {/* Right header actions */}
        <div className="flex items-center gap-3">
          {/* Global Search command palette trigger button */}
          <button 
            onClick={() => setSearchOpen(true)}
            className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-xl border border-borderBg hover:border-primaryOrange/50 bg-[#121212]/80 hover:bg-[#161616] text-darkGray hover:text-white text-xs transition-all cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="pr-4">Search...</span>
            <span className="text-[9px] font-semibold bg-background border border-borderBg px-1.5 py-0.5 rounded font-mono">Ctrl+K</span>
          </button>

          {/* User Profile Info Dropdown */}
          <ProfileMenu />
        </div>
      </header>

      {/* Ctrl + K command palette modal search trigger */}
      <CommandPalette isOpen={searchOpen} setIsOpen={setSearchOpen} />
    </>
  );
};
