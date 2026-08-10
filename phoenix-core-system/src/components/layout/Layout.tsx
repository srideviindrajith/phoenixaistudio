import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useAuthStore } from '../../store/useAuthStore';
import { useTenantStore } from '../../store/useTenantStore';

export const Layout: React.FC = () => {
  const { isAuthenticated, loadSession, user } = useAuthStore();
  const { loadTenantData } = useTenantStore();
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  // Guard: if not authenticated, redirect to /auth/login
  useEffect(() => {
    loadSession();
  }, [loadSession]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth/login');
    } else if (user?.companyId) {
      loadTenantData(user.companyId);
    }
  }, [isAuthenticated, user, navigate, loadTenantData]);

  if (!isAuthenticated) {
    return null; // wait for navigation
  }

  return (
    <div className="min-h-screen bg-[#090909]">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      
      <div 
        className="min-h-screen flex flex-col transition-all duration-300"
        style={{
          paddingLeft: window.innerWidth >= 768 ? (collapsed ? '5rem' : '16rem') : '0'
        }}
      >
        <Navbar collapsed={collapsed} setCollapsed={setCollapsed} />
        
        {/* Main Content Body */}
        <main className="flex-1 p-6 md:p-8 pt-24 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
