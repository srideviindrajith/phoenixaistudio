import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { Eye, EyeOff, Loader2, Mail, Lock, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { motion } from 'framer-motion';

const loginSchema = zod.object({
  email: zod.string().email('Please enter a valid business email address'),
  password: zod.string().min(6, 'Password must contain at least 6 characters'),
  rememberMe: zod.boolean().optional(),
});

type LoginFields = zod.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const { login, error, clearError, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFields>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    }
  });

  const onSubmit = async (data: LoginFields) => {
    clearError();
    const success = await login(data.email, data.password, data.rememberMe);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h3 className="text-xl font-bold text-white tracking-tight">Access Account</h3>
        <p className="text-xs text-darkGray mt-1">Authenticate to connect to PhoenixAI platforms.</p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl border border-red-500/30 bg-red-500/10 text-xs text-red-400 font-medium leading-relaxed">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-white">Business Email</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-darkGray">
              <Mail className="w-4 h-4" />
            </span>
            <input
              type="email"
              placeholder="name@company.com"
              {...register('email')}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-borderBg bg-background text-sm text-white placeholder-mutedGray focus:outline-none focus:border-primaryOrange/50 focus:ring-1 focus:ring-primaryOrange/20 transition-all"
            />
          </div>
          {errors.email && (
            <p className="text-[10px] text-red-400 font-semibold mt-0.5">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-white">Password</label>
            <Link 
              to="/auth/forgot-password" 
              className="text-[10px] font-semibold text-primaryOrange hover:text-accentOrange transition-colors"
            >
              Forgot Password?
            </Link>
          </div>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-darkGray">
              <Lock className="w-4 h-4" />
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('password')}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-borderBg bg-background text-sm text-white placeholder-mutedGray focus:outline-none focus:border-primaryOrange/50 focus:ring-1 focus:ring-primaryOrange/20 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-darkGray hover:text-white cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-[10px] text-red-400 font-semibold mt-0.5">{errors.password.message}</p>
          )}
        </div>

        {/* Remember me */}
        <div className="flex items-center">
          <input
            id="remember-me"
            type="checkbox"
            {...register('rememberMe')}
            className="w-4 h-4 rounded border-borderBg bg-background text-primaryOrange focus:ring-primaryOrange/30 focus:ring-offset-0 focus:outline-none cursor-pointer"
          />
          <label htmlFor="remember-me" className="ml-2 text-xs text-darkGray select-none cursor-pointer">
            Remember my session
          </label>
        </div>

        {/* Action button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white orange-gradient-bg hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(249,115,22,0.3)] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying credentials...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>Sign In to System</span>
            </>
          )}
        </button>
      </form>

      {/* Social options placeholders */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-borderBg" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-2 bg-[#121212] text-mutedGray">Or authenticate via SSO</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={() => alert('Google authentication is currently locked for this sandbox node.')}
          className="py-2 px-3 rounded-xl border border-borderBg bg-background hover:bg-[#161616] text-[11px] font-semibold text-white flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.58 0-6.49-2.91-6.49-6.49s2.91-6.49 6.49-6.49c1.678 0 3.204.64 4.35 1.688l3.072-3.072C19.344 2.233 15.932 1 12.24 1 5.656 1 0 6.656 0 13.24s5.656 12.24 12.24 12.24c6.31 0 11.233-4.437 11.233-11.233 0-.663-.075-1.3-.2-1.96H12.24Z"/>
          </svg>
          <span>Google Workspace</span>
        </button>
        <button 
          onClick={() => alert('Microsoft Entra ID authentication is currently locked for this sandbox node.')}
          className="py-2 px-3 rounded-xl border border-borderBg bg-background hover:bg-[#161616] text-[11px] font-semibold text-white flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 23 23">
            <path fill="#f35325" d="M0 0h11v11H0z"/>
            <path fill="#81bc06" d="M12 0h11v11H12z"/>
            <path fill="#05a6f0" d="M0 12h11v11H0z"/>
            <path fill="#ffba08" d="M12 12h11v11H12z"/>
          </svg>
          <span>Microsoft Entra</span>
        </button>
      </div>

      <div className="text-center pt-2">
        <p className="text-xs text-darkGray">
          Need to register a new tenant?{' '}
          <Link to="/auth/signup" className="font-semibold text-primaryOrange hover:text-accentOrange transition-colors">
            Register Business
          </Link>
        </p>
      </div>
    </motion.div>
  );
};
