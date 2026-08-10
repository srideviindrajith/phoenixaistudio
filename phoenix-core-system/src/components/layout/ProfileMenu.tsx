import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HelpCircle, 
  LogOut,
  ChevronDown
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export const ProfileMenu: React.FC = () => {
  const { user, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  if (!user) return null;

  const menuItems = [
    { label: 'Help & Docs', icon: HelpCircle, action: () => window.open('https://phoenixai.studio', '_blank') },
  ];

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-1 px-2 rounded-xl border border-borderBg hover:border-primaryOrange/50 bg-[#121212]/80 hover:bg-[#161616] transition-all cursor-pointer"
      >
        {user.photoUrl ? (
          <img 
            src={user.photoUrl} 
            alt={user.name} 
            className="w-7 h-7 rounded-lg object-cover border border-borderBg"
          />
        ) : (
          <div className="w-7 h-7 rounded-lg bg-borderBg flex items-center justify-center text-xs font-bold text-primaryOrange">
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="text-sm font-medium text-white hidden md:inline truncate max-w-[120px]">
          {user.name}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-darkGray transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-borderBg bg-cardBg p-2 shadow-2xl z-30 animate-in fade-in duration-100">
          {/* Header Profile Summary */}
          <div className="px-3 py-3 border-b border-borderBg">
            <p className="text-xs font-semibold text-white">{user.name}</p>
            <p className="text-[10px] text-darkGray truncate mt-0.5">{user.email}</p>
          </div>

          {/* Nav List */}
          <div className="py-2 space-y-0.5">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  item.action();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-xs font-medium text-darkGray hover:text-white hover:bg-[#161616] transition-all cursor-pointer"
              >
                <item.icon className="w-4 h-4 text-primaryOrange/80" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Footer Action */}
          <div className="border-t border-borderBg pt-1">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
