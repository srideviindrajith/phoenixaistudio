import React from 'react';
import { Outlet } from 'react-router-dom';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#090909] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 flex flex-col items-center">
        <img 
          src="/uploads/logo/logo.png" 
          alt="PhoenixAI Studio" 
          className="h-12 object-contain mb-4" 
        />
        <h2 className="text-center text-3xl font-extrabold text-white tracking-tight font-heading">
          PhoenixAI <span className="gradient-text">Studio</span>
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="glass-card p-8 bg-[#121212]/90 border border-borderBg shadow-2xl relative overflow-hidden">
          {/* Subtle top glow line */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primaryOrange/50 to-transparent" />
          
          <Outlet />
        </div>
      </div>
    </div>
  );
};
