import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { motion } from 'framer-motion';

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { resetPassword } = useAuthStore();

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    // Simulating sending reset link
    const ok = await resetPassword(email, 'reset-pass-placeholder');
    if (ok) {
      setSuccess(true);
    } else {
      alert('Password reset trigger failed. Ensure this email is registered in local db.');
    }
    setLoading(false);
  };

  if (success) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6"
      >
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Reset Dispatch Successful</h3>
          <p className="text-xs text-darkGray mt-2 leading-relaxed">
            We have sent a secure recovery link to <span className="text-white font-semibold">{email}</span>. Click the link inside the email to configure your new authentication passphrase.
          </p>
        </div>
        <div className="p-4 bg-background/50 border border-borderBg rounded-xl text-[11px] text-left text-darkGray font-mono">
          <p className="font-semibold text-white mb-1">Sandbox Direct Action URL:</p>
          <p className="break-all text-primaryOrange hover:underline">
            <Link to={`/auth/reset-password?email=${encodeURIComponent(email)}`}>
              Click here to simulate Password Reset landing
            </Link>
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
        <h3 className="text-xl font-bold text-white">Recover Password</h3>
        <p className="text-xs text-darkGray mt-1">Enter your registered email address to receive recovery credentials.</p>
      </div>

      <form onSubmit={handleSend} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-white">Business Email</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-darkGray">
              <Mail className="w-4 h-4" />
            </span>
            <input
              type="email"
              placeholder="name@company.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-borderBg bg-background text-sm text-white placeholder-mutedGray focus:outline-none focus:border-primaryOrange/50 focus:ring-1 focus:ring-primaryOrange/20 transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !email}
          className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white orange-gradient-bg hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(249,115,22,0.3)] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Sending secure token...</span>
            </>
          ) : (
            <span>Send Reset Token</span>
          )}
        </button>
      </form>

      <div className="text-center pt-2">
        <Link 
          to="/auth/login" 
          className="inline-flex items-center gap-2 text-xs font-semibold text-darkGray hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Login</span>
        </Link>
      </div>
    </motion.div>
  );
};
