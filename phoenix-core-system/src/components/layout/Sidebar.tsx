import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Cpu, 
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const { role, company, logout } = useAuthStore();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['Super Admin', 'Company Admin', 'Manager', 'Employee', 'Client'] },
    { name: 'Products', path: '/products', icon: Cpu, roles: ['Super Admin', 'Company Admin', 'Manager', 'Employee', 'Client'] },
  ];

  // Filter routes based on user roles
  const filteredNav = navItems.filter(item => {
    if (!role) return false;
    return item.roles.includes(role.name);
  });

  return (
    <div 
      className={`fixed top-0 left-0 h-screen z-20 border-r border-borderBg bg-cardBg transition-all duration-300 flex flex-col ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-borderBg">
        <div className="flex items-center gap-3 overflow-hidden">
          <img 
            src="/uploads/logo/logo.png" 
            alt="PhoenixAI Studio" 
            className="w-8 h-8 object-contain flex-shrink-0" 
          />
          {!collapsed && (
            <span className="font-bold text-sm tracking-wider gradient-text font-heading whitespace-nowrap">
              PhoenixAI Studio
            </span>
          )}
        </div>
      </div>

      {/* Tenant / Company Info Card */}
      {!collapsed && company && (
        <div className="px-4 py-3 mx-3 mt-4 rounded-xl border border-borderBg bg-background flex items-center gap-3">
          {company.logoUrl ? (
            <img 
              src={company.logoUrl} 
              alt={company.name} 
              className="w-8 h-8 rounded-lg object-cover bg-[#161616] border border-borderBg" 
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-cardBg flex items-center justify-center border border-borderBg">
              <span className="text-xs font-bold text-primaryOrange">
                {company.name.slice(0, 2).toUpperCase()}
              </span>
            </div>
          )}
          <div className="overflow-hidden">
            <p className="text-sm font-semibold truncate text-white leading-tight">{company.name}</p>
            <p className="text-[10px] text-darkGray font-mono truncate leading-none mt-1 uppercase tracking-wider">{role?.name}</p>
          </div>
        </div>
      )}

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {filteredNav.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive 
                  ? 'bg-[#1e1e1e] border-l-2 border-primaryOrange text-white shadow-[0_4px_15px_rgba(0,0,0,0.2)]' 
                  : 'text-darkGray hover:text-white hover:bg-[#161616]'
              }`
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0 group-hover:text-primaryOrange transition-colors" />
            {!collapsed && <span className="whitespace-nowrap">{item.name}</span>}
          </NavLink>
        ))}

        {/* Logout Button */}
        <button
          onClick={() => {
            if (confirm('Are you sure you want to sign out of the identity console?')) {
              logout();
            }
          }}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium text-darkGray hover:text-red-400 hover:bg-[#161616] transition-all duration-200 group cursor-pointer"
        >
          <LogOut className="w-5 h-5 flex-shrink-0 group-hover:text-red-400 transition-colors" />
          {!collapsed && <span className="whitespace-nowrap">Logout</span>}
        </button>
      </nav>

      {/* Collapse Toggle Trigger */}
      <div className="p-4 border-t border-borderBg flex justify-end">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-8 h-8 rounded-lg border border-borderBg hover:border-primaryOrange/50 hover:bg-[#161616] flex items-center justify-center text-darkGray hover:text-white transition-all cursor-pointer"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
