import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { Loader2, ArrowRight, ArrowLeft, Building2, User, Key, CheckCircle, Mail, Phone, Globe, Shield } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { motion } from 'framer-motion';

const signupSchema = zod.object({
  companyName: zod.string().min(2, 'Company name must contain at least 2 characters'),
  companySlug: zod.string().min(2, 'Company slug must contain at least 2 characters').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and dashes'),
  companyLogo: zod.string().optional(),
  companySize: zod.string().min(1, 'Please select company size'),
  ownerName: zod.string().min(2, 'Owner name must contain at least 2 characters'),
  email: zod.string().email('Please enter a valid business email address'),
  phone: zod.string().optional(),
  country: zod.string().min(1, 'Please select your country'),
  timezone: zod.string().min(1, 'Please select your timezone'),
  currency: zod.string().min(1, 'Please select your business currency'),
  industry: zod.string().optional(),
  password: zod.string().min(8, 'Password must contain at least 8 characters'),
  confirmPassword: zod.string(),
  acceptTerms: zod.boolean().refine(val => val === true, 'You must accept the terms of service to proceed'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

type SignupFields = zod.infer<typeof signupSchema>;

export const Signup: React.FC = () => {
  const { signup, error, clearError, isLoading } = useAuthStore();
  const [step, setStep] = useState(1);
  const [password, setPassword] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const navigate = useNavigate();

  const { register, handleSubmit, trigger, setValue, formState: { errors } } = useForm<SignupFields>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      country: 'United States',
      timezone: 'UTC',
      currency: 'USD',
      acceptTerms: false,
      companySize: '1-10',
      companyLogo: ''
    }
  });

  // Dynamic slug generator
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const slug = value.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    setValue('companySlug', slug);
  };

  const checkPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'None', color: 'bg-transparent' };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    switch (score) {
      case 1: return { score: 25, label: 'Weak', color: 'bg-red-500' };
      case 2: return { score: 50, label: 'Fair', color: 'bg-amber-500' };
      case 3: return { score: 75, label: 'Good', color: 'bg-yellow-500' };
      case 4: return { score: 100, label: 'Strong', color: 'bg-emerald-500' };
      default: return { score: 0, label: 'None', color: 'bg-transparent' };
    }
  };

  const strength = checkPasswordStrength(password);

  const nextStep = async () => {
    const fieldsToValidate = step === 1 
      ? ['companyName', 'companySlug', 'country', 'currency', 'timezone', 'industry', 'companyLogo', 'companySize'] as const
      : ['ownerName', 'email', 'phone'] as const;
      
    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid) {
      setStep(prev => prev + 1);
      clearError();
    }
  };

  const onSubmit = async (data: SignupFields) => {
    clearError();
    const success = await signup({
      companyName: data.companyName,
      companyLogo: data.companyLogo,
      companySize: data.companySize,
      ownerName: data.ownerName,
      email: data.email,
      phone: data.phone,
      country: data.country,
      timezone: data.timezone,
      currency: data.currency,
      industry: data.industry,
      companySlug: data.companySlug,
    }, data.password);

    if (success) {
      setRegisteredEmail(data.email);
    }
  };

  if (registeredEmail) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6"
      >
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Verification Link Dispatched</h3>
          <p className="text-xs text-darkGray mt-2 leading-relaxed">
            We have sent a verification code to <span className="text-white font-semibold">{registeredEmail}</span>. Please verify your business profile to activate your portal workspace.
          </p>
        </div>
        <div className="p-4 bg-background/50 border border-borderBg rounded-xl text-[11px] text-left text-darkGray font-mono">
          <p className="font-semibold text-white mb-1">Sandbox Node Direct Access Link:</p>
          <p className="break-all text-primaryOrange hover:underline">
            <Link to="/auth/verify">Click here to simulate Verification click</Link>
          </p>
        </div>
        <button
          onClick={() => navigate('/auth/login')}
          className="w-full py-2 px-4 rounded-xl text-xs font-semibold text-white bg-background border border-borderBg hover:bg-[#161616] transition-all cursor-pointer"
        >
          Return to Login
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h3 className="text-xl font-bold text-white">Create Core Tenant</h3>
        <p className="text-xs text-darkGray mt-1">
          {step === 1 ? 'Configure business details' : step === 2 ? 'Provide administrator profile' : 'Set secure password credentials'}
        </p>
      </div>

      {/* Progress timeline */}
      <div className="flex justify-center gap-1.5 items-center">
        <div className={`h-1.5 rounded-full transition-all duration-300 ${step >= 1 ? 'w-8 bg-primaryOrange' : 'w-4 bg-borderBg'}`} />
        <div className={`h-1.5 rounded-full transition-all duration-300 ${step >= 2 ? 'w-8 bg-primaryOrange' : 'w-4 bg-borderBg'}`} />
        <div className={`h-1.5 rounded-full transition-all duration-300 ${step >= 3 ? 'w-8 bg-primaryOrange' : 'w-4 bg-borderBg'}`} />
      </div>

      {error && (
        <div className="p-3.5 rounded-xl border border-red-500/30 bg-red-500/10 text-xs text-red-400 font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* STEP 1: Company Profile */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-white">Company Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-darkGray">
                  <Building2 className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Acme Corp"
                  {...register('companyName')}
                  onChange={(e) => {
                    register('companyName').onChange(e);
                    handleNameChange(e);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-borderBg bg-background text-sm text-white placeholder-mutedGray focus:outline-none focus:border-primaryOrange/50 focus:ring-1 focus:ring-primaryOrange/20 transition-all"
                />
              </div>
              {errors.companyName && (
                <p className="text-[10px] text-red-400 font-semibold mt-0.5">{errors.companyName.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-white">Company Slug</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-darkGray font-mono text-[10px]">slug/</span>
                <input
                  type="text"
                  placeholder="acme-corp"
                  {...register('companySlug')}
                  className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-borderBg bg-background text-sm text-white placeholder-mutedGray focus:outline-none focus:border-primaryOrange/50 focus:ring-1 focus:ring-primaryOrange/20 transition-all"
                />
              </div>
              {errors.companySlug && (
                <p className="text-[10px] text-red-400 font-semibold mt-0.5">{errors.companySlug.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-white">Country</label>
                <select
                  {...register('country')}
                  className="w-full px-3 py-2.5 rounded-xl border border-borderBg bg-background text-sm text-white focus:outline-none focus:border-primaryOrange/50 focus:ring-1 focus:ring-primaryOrange/20 transition-all"
                >
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Canada">Canada</option>
                  <option value="Germany">Germany</option>
                  <option value="India">India</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-white">Currency</label>
                <select
                  {...register('currency')}
                  className="w-full px-3 py-2.5 rounded-xl border border-borderBg bg-background text-sm text-white focus:outline-none focus:border-primaryOrange/50 focus:ring-1 focus:ring-primaryOrange/20 transition-all"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD ($)</option>
                  <option value="INR">INR (₹)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-white">Timezone</label>
                <select
                  {...register('timezone')}
                  className="w-full px-3 py-2.5 rounded-xl border border-borderBg bg-background text-sm text-white focus:outline-none focus:border-primaryOrange/50 focus:ring-1 focus:ring-primaryOrange/20 transition-all"
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">EST (New York)</option>
                  <option value="America/Chicago">CST (Chicago)</option>
                  <option value="America/Los_Angeles">PST (Los Angeles)</option>
                  <option value="Europe/London">GMT (London)</option>
                  <option value="Asia/Kolkata">IST (Kolkata)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-white">Industry</label>
                <input
                  type="text"
                  placeholder="e.g. Technology"
                  {...register('industry')}
                  className="w-full px-3 py-2.5 rounded-xl border border-borderBg bg-background text-sm text-white placeholder-mutedGray focus:outline-none focus:border-primaryOrange/50 focus:ring-1 focus:ring-primaryOrange/20 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-white">Company Logo URL (Optional)</label>
                <input
                  type="text"
                  placeholder="https://example.com/logo.png"
                  {...register('companyLogo')}
                  className="w-full px-3 py-2.5 rounded-xl border border-borderBg bg-background text-sm text-white placeholder-mutedGray focus:outline-none focus:border-primaryOrange/50 focus:ring-1 focus:ring-primaryOrange/20 transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-white">Company Size</label>
                <select
                  {...register('companySize')}
                  className="w-full px-3 py-2.5 rounded-xl border border-borderBg bg-background text-sm text-white focus:outline-none focus:border-primaryOrange/50 focus:ring-1 focus:ring-primaryOrange/20 transition-all"
                >
                  <option value="1-10">1-10 Employees</option>
                  <option value="11-50">11-50 Employees</option>
                  <option value="51-200">51-200 Employees</option>
                  <option value="201-500">201-500 Employees</option>
                  <option value="500+">500+ Employees</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={nextStep}
              className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white orange-gradient-bg hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(249,115,22,0.3)] cursor-pointer"
            >
              <span>Continue Account Setup</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: Administrator Profile */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-white">Owner Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-darkGray">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Sarah Jenkins"
                  {...register('ownerName')}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-borderBg bg-background text-sm text-white placeholder-mutedGray focus:outline-none focus:border-primaryOrange/50 focus:ring-1 focus:ring-primaryOrange/20 transition-all"
                />
              </div>
              {errors.ownerName && (
                <p className="text-[10px] text-red-400 font-semibold mt-0.5">{errors.ownerName.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-white">Business Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-darkGray">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  placeholder="sarah@company.com"
                  {...register('email')}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-borderBg bg-background text-sm text-white placeholder-mutedGray focus:outline-none focus:border-primaryOrange/50 focus:ring-1 focus:ring-primaryOrange/20 transition-all"
                />
              </div>
              {errors.email && (
                <p className="text-[10px] text-red-400 font-semibold mt-0.5">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-white">Phone Contact (Optional)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-darkGray">
                  <Phone className="w-4 h-4" />
                </span>
                <input
                  type="tel"
                  placeholder="+1 (555) 902-3920"
                  {...register('phone')}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-borderBg bg-background text-sm text-white placeholder-mutedGray focus:outline-none focus:border-primaryOrange/50 focus:ring-1 focus:ring-primaryOrange/20 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-background border border-borderBg hover:bg-[#161616] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="py-2.5 px-4 rounded-xl text-xs font-semibold text-white orange-gradient-bg hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(249,115,22,0.3)] cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Password Credentials */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-white">Create Security Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-darkGray">
                  <Key className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                  onChange={(e) => {
                    register('password').onChange(e);
                    setPassword(e.target.value);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-borderBg bg-background text-sm text-white placeholder-mutedGray focus:outline-none focus:border-primaryOrange/50 focus:ring-1 focus:ring-primaryOrange/20 transition-all"
                />
              </div>
              {errors.password && (
                <p className="text-[10px] text-red-400 font-semibold mt-0.5">{errors.password.message}</p>
              )}
            </div>

            {/* Password strength meter */}
            {password && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-semibold">
                  <span className="text-darkGray">Strength:</span>
                  <span className={`text-white`}>{strength.label}</span>
                </div>
                <div className="h-1.5 w-full bg-background rounded-full overflow-hidden border border-borderBg">
                  <div 
                    className={`h-full transition-all duration-300 ${strength.color}`} 
                    style={{ width: `${strength.score}%` }} 
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-white">Confirm Security Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-darkGray">
                  <Key className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register('confirmPassword')}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-borderBg bg-background text-sm text-white placeholder-mutedGray focus:outline-none focus:border-primaryOrange/50 focus:ring-1 focus:ring-primaryOrange/20 transition-all"
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-[10px] text-red-400 font-semibold mt-0.5">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="flex items-start py-2">
              <input
                id="accept-terms"
                type="checkbox"
                {...register('acceptTerms')}
                className="w-4 h-4 rounded border-borderBg bg-background text-primaryOrange focus:ring-primaryOrange/30 focus:ring-offset-0 focus:outline-none mt-0.5 cursor-pointer"
              />
              <label htmlFor="accept-terms" className="ml-2.5 text-xs text-darkGray select-none cursor-pointer">
                I accept the <a href="https://phoenixai.studio" target="_blank" rel="noreferrer" className="text-primaryOrange hover:underline font-medium">Terms of Service</a> and consent to data processing under GDPR regulations.
              </label>
            </div>
            {errors.acceptTerms && (
              <p className="text-[10px] text-red-400 font-semibold mt-0.5">{errors.acceptTerms.message}</p>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-background border border-borderBg hover:bg-[#161616] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="py-2.5 px-4 rounded-xl text-xs font-semibold text-white orange-gradient-bg hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(249,115,22,0.3)] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Registering...</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-4 h-4" />
                    <span>Deploy Tenant</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>

      <div className="text-center pt-2">
        <p className="text-xs text-darkGray">
          Already registered?{' '}
          <Link to="/auth/login" className="font-semibold text-primaryOrange hover:text-accentOrange transition-colors">
            Login
          </Link>
        </p>
      </div>
    </motion.div>
  );
};
