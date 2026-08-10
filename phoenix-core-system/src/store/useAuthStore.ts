import { create } from 'zustand';
import { db, User, Session, Company, Role, AuditLog } from '../services/db';

interface AuthState {
  user: User | null;
  company: Company | null;
  role: Role | null;
  session: Session | null;
  sessions: Session[];
  auditLogs: AuditLog[];
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, passwordHash: string, rememberMe?: boolean) => Promise<boolean>;
  signup: (companyData: {
    companyName: string;
    companyLogo?: string;
    companySize?: string;
    ownerName: string;
    email: string;
    phone?: string;
    country: string;
    timezone: string;
    currency: string;
    industry?: string;
    companySlug: string;
  }, passwordHash: string) => Promise<boolean>;
  logout: () => void;
  logoutDevice: (sessionId: string) => void;
  logoutAllDevices: () => void;
  verifyEmail: (token: string) => Promise<boolean>;
  resetPassword: (email: string, newPasswordHash: string) => Promise<boolean>;
  updateProfile: (data: Partial<User>) => void;
  addAuditLog: (action: string) => void;
  clearError: () => void;
  loadSession: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  company: null,
  role: null,
  session: null,
  sessions: [],
  auditLogs: [],
  isAuthenticated: false,
  isLoading: false,
  error: null,

  loadSession: () => {
    const token = localStorage.getItem('phx_active_token');
    if (!token) return;

    const sessions = db.getSessions();
    const session = sessions.find(s => s.token === token);
    if (!session || new Date(session.expiresAt) < new Date()) {
      localStorage.removeItem('phx_active_token');
      return;
    }

    const users = db.getUsers();
    const user = users.find(u => u.id === session.userId);
    if (!user || user.status === 'SUSPENDED') {
      localStorage.removeItem('phx_active_token');
      return;
    }

    const companies = db.getCompanies();
    const company = companies.find(c => c.id === user.companyId) || null;

    const roles = db.getRoles();
    const role = roles.find(r => r.id === user.roleId) || null;

    const userAuditLogs = db.getAuditLogs().filter(l => l.userId === user.id);
    const userSessions = db.getSessions().filter(s => s.userId === user.id);

    set({
      user,
      company,
      role,
      session,
      sessions: userSessions,
      auditLogs: userAuditLogs,
      isAuthenticated: true,
    });
  },

  login: async (email, passwordHash, rememberMe = false) => {
    set({ isLoading: true, error: null });
    try {
      const users = db.getUsers();
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (!user || user.passwordHash !== passwordHash) {
        set({ error: 'Invalid credentials. Use admin@phoenixai.studio / admin123 or register a new company.', isLoading: false });
        return false;
      }

      if (user.status === 'PENDING_VERIFICATION') {
        set({ error: 'Your email has not been verified yet.', isLoading: false });
        return false;
      }

      if (user.status === 'SUSPENDED') {
        set({ error: 'This user account has been suspended.', isLoading: false });
        return false;
      }

      const companies = db.getCompanies();
      const company = companies.find(c => c.id === user.companyId) || null;

      const roles = db.getRoles();
      const role = roles.find(r => r.id === user.roleId) || null;

      // Create new session
      const token = `jwt-${Math.random().toString(36).substring(2)}-${Date.now()}`;
      const newSession: Session = {
        id: `sess-${Math.random().toString(36).substring(2)}`,
        userId: user.id,
        token,
        deviceType: window.innerWidth < 768 ? 'Mobile' : 'Desktop',
        deviceName: navigator.userAgent.includes('Mac') ? 'MacBook Pro 16"' : 'Windows Workstation',
        ipAddress: '192.168.1.100',
        lastActive: new Date().toISOString(),
        expiresAt: new Date(Date.now() + (rememberMe ? 30 : 1) * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
      };

      const sessions = db.getSessions();
      sessions.push(newSession);
      db.saveSessions(sessions);

      // Create login history/audit log
      const newAuditLog: AuditLog = {
        id: `log-${Math.random().toString(36).substring(2)}`,
        userId: user.id,
        userName: user.name,
        action: 'USER_LOGIN',
        ipAddress: '192.168.1.100',
        userAgent: navigator.userAgent,
        location: 'New York, US',
        createdAt: new Date().toISOString(),
      };

      const auditLogs = db.getAuditLogs();
      auditLogs.push(newAuditLog);
      db.saveAuditLogs(auditLogs);

      localStorage.setItem('phx_active_token', token);

      const userSessions = sessions.filter(s => s.userId === user.id);
      const userAuditLogs = auditLogs.filter(l => l.userId === user.id);

      set({
        user,
        company,
        role,
        session: newSession,
        sessions: userSessions,
        auditLogs: userAuditLogs,
        isAuthenticated: true,
        isLoading: false,
      });

      return true;
    } catch {
      set({ error: 'Server authentication timeout.', isLoading: false });
      return false;
    }
  },

  signup: async (companyData, passwordHash) => {
    set({ isLoading: true, error: null });
    try {
      const users = db.getUsers();
      if (users.some(u => u.email.toLowerCase() === companyData.email.toLowerCase())) {
        set({ error: 'This business email is already registered.', isLoading: false });
        return false;
      }

      // Create company
      const companyId = `co-${Math.random().toString(36).substring(2)}`;
      const newCompany: Company = {
        id: companyId,
        name: companyData.companyName,
        slug: companyData.companySlug,
        logoUrl: companyData.companyLogo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=80&auto=format&fit=crop&q=60',
        country: companyData.country,
        timezone: companyData.timezone,
        currency: companyData.currency,
        industry: companyData.industry,
        companySize: companyData.companySize || '1-10',
        enabledCores: ['Billing Core', 'Automation Core', 'CRM Core'], // default active cores
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const companies = db.getCompanies();
      companies.push(newCompany);
      db.saveCompanies(companies);

      // Create user (Company Admin)
      const userId = `usr-${Math.random().toString(36).substring(2)}`;
      const newUser: User = {
        id: userId,
        email: companyData.email,
        passwordHash,
        name: companyData.ownerName,
        phone: companyData.phone,
        status: 'PENDING_VERIFICATION', // needs email verification
        language: 'en',
        timezone: companyData.timezone,
        emailNotifications: true,
        securityAlerts: true,
        twoFactorEnabled: false,
        companyId,
        roleId: 'role-company-admin',
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      db.saveUsers(users);

      // Create trial license & subscription
      const licenses = db.getLicenses();
      licenses.push({
        id: `lic-${Math.random().toString(36).substring(2)}`,
        companyId,
        key: `PHX-TRIAL-${Math.random().toString(36).substring(2).toUpperCase()}-99`,
        status: 'ACTIVE',
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days trial
        createdAt: new Date().toISOString(),
      });
      db.saveLicenses(licenses);

      const subscriptions = db.getSubscriptions();
      subscriptions.push({
        id: `sub-${Math.random().toString(36).substring(2)}`,
        companyId,
        plan: 'Trial',
        status: 'ACTIVE',
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
      });
      db.saveSubscriptions(subscriptions);

      set({ isLoading: false });
      return true;
    } catch {
      set({ error: 'Company signup registration error.', isLoading: false });
      return false;
    }
  },

  logout: () => {
    const token = localStorage.getItem('phx_active_token');
    if (token) {
      const sessions = db.getSessions().filter(s => s.token !== token);
      db.saveSessions(sessions);
    }
    localStorage.removeItem('phx_active_token');
    set({
      user: null,
      company: null,
      role: null,
      session: null,
      sessions: [],
      isAuthenticated: false,
    });
  },

  logoutDevice: (sessionId) => {
    const activeSession = get().session;
    const currentSessions = db.getSessions();
    const updatedSessions = currentSessions.filter(s => s.id !== sessionId);
    db.saveSessions(updatedSessions);

    if (activeSession && activeSession.id === sessionId) {
      localStorage.removeItem('phx_active_token');
      set({
        user: null,
        company: null,
        role: null,
        session: null,
        sessions: [],
        isAuthenticated: false,
      });
    } else if (get().user) {
      const userSessions = updatedSessions.filter(s => s.userId === get().user!.id);
      set({ sessions: userSessions });
      get().addAuditLog(`TERMINATED_SESSION_${sessionId}`);
    }
  },

  logoutAllDevices: () => {
    const currentUserId = get().user?.id;
    if (!currentUserId) return;

    const currentSessions = db.getSessions();
    const updatedSessions = currentSessions.filter(s => s.userId !== currentUserId);
    db.saveSessions(updatedSessions);

    localStorage.removeItem('phx_active_token');
    set({
      user: null,
      company: null,
      role: null,
      session: null,
      sessions: [],
      isAuthenticated: false,
    });
  },

  verifyEmail: async (token) => {
    set({ isLoading: true });
    try {
      const users = db.getUsers();
      // Simulating simple verify: find pending verification user and make active
      const pendingUserIndex = users.findIndex(u => u.status === 'PENDING_VERIFICATION');
      if (pendingUserIndex !== -1) {
        users[pendingUserIndex].status = 'ACTIVE';
        db.saveUsers(users);
        set({ isLoading: false });
        return true;
      }
      set({ error: 'Verification token invalid or expired.', isLoading: false });
      return false;
    } catch {
      set({ error: 'Could not complete verification process.', isLoading: false });
      return false;
    }
  },

  resetPassword: async (email, newPasswordHash) => {
    set({ isLoading: true });
    try {
      const users = db.getUsers();
      const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
      if (userIndex !== -1) {
        users[userIndex].passwordHash = newPasswordHash;
        db.saveUsers(users);
        set({ isLoading: false });
        return true;
      }
      set({ error: 'Email address not found.', isLoading: false });
      return false;
    } catch {
      set({ error: 'Reset password failed.', isLoading: false });
      return false;
    }
  },

  updateProfile: (data) => {
    const currentUser = get().user;
    if (!currentUser) return;

    const users = db.getUsers();
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
      const updatedUser = { ...users[userIndex], ...data };
      users[userIndex] = updatedUser;
      db.saveUsers(users);
      set({ user: updatedUser });
      get().addAuditLog('UPDATE_PROFILE');
    }
  },

  addAuditLog: (action) => {
    const currentUser = get().user;
    if (!currentUser) return;

    const newAuditLog: AuditLog = {
      id: `log-${Math.random().toString(36).substring(2)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      action,
      ipAddress: '192.168.1.100',
      userAgent: navigator.userAgent,
      location: 'New York, US',
      createdAt: new Date().toISOString(),
    };

    const logs = db.getAuditLogs();
    logs.push(newAuditLog);
    db.saveAuditLogs(logs);
    set({ auditLogs: logs.filter(l => l.userId === currentUser.id) });
  },

  clearError: () => set({ error: null }),
}));
