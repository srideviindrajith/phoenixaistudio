import { create } from 'zustand';
import { db, Company, User, Role, Permission, License, Subscription, AuditLog } from '../services/db';

interface TenantState {
  companies: Company[];
  companyUsers: User[];
  roles: Role[];
  permissions: Permission[];
  licenses: License[];
  subscriptions: Subscription[];
  isLoading: boolean;
  error: string | null;

  loadTenantData: (companyId: string) => void;
  updateCompanyEnabledCores: (companyId: string, cores: string[]) => void;
  updateCompanySettings: (companyId: string, data: Partial<Company>) => void;
  upgradeSubscription: (companyId: string, plan: 'Trial' | 'Growth' | 'Enterprise') => void;
  
  // User Management
  addCompanyUser: (userData: Omit<User, 'id' | 'createdAt'>) => void;
  updateCompanyUser: (userId: string, data: Partial<User>) => void;
  deleteCompanyUser: (userId: string) => void;

  // Role Management
  addCustomRole: (roleName: string, description: string, permissions: string[]) => void;
  updateRolePermissions: (roleId: string, permissions: string[]) => void;
}

export const useTenantStore = create<TenantState>((set, get) => ({
  companies: [],
  companyUsers: [],
  roles: [],
  permissions: [],
  licenses: [],
  subscriptions: [],
  isLoading: false,
  error: null,

  loadTenantData: (companyId) => {
    set({ isLoading: true });
    
    const companies = db.getCompanies();
    const allUsers = db.getUsers();
    const companyUsers = allUsers.filter(u => u.companyId === companyId);
    
    const roles = db.getRoles();
    const permissions = db.getPermissions();
    const licenses = db.getLicenses().filter(l => l.companyId === companyId);
    const subscriptions = db.getSubscriptions().filter(s => s.companyId === companyId);

    set({
      companies,
      companyUsers,
      roles,
      permissions,
      licenses,
      subscriptions,
      isLoading: false
    });
  },

  updateCompanyEnabledCores: (companyId, cores) => {
    const companies = db.getCompanies();
    const index = companies.findIndex(c => c.id === companyId);
    if (index !== -1) {
      companies[index].enabledCores = cores;
      companies[index].updatedAt = new Date().toISOString();
      db.saveCompanies(companies);
      set({ companies });
      
      // Add system log
      const logs = db.getAuditLogs();
      logs.push({
        id: `log-${Math.random().toString(36).substring(2)}`,
        userId: 'system',
        userName: 'License Manager',
        action: `UPDATED_ENABLED_CORES_TO_${cores.join(', ')}`,
        ipAddress: '127.0.0.1',
        userAgent: 'PhoenixAI System Event',
        createdAt: new Date().toISOString(),
      });
      db.saveAuditLogs(logs);
    }
  },

  updateCompanySettings: (companyId, data) => {
    const companies = db.getCompanies();
    const index = companies.findIndex(c => c.id === companyId);
    if (index !== -1) {
      companies[index] = { ...companies[index], ...data, updatedAt: new Date().toISOString() };
      db.saveCompanies(companies);
      set({ companies });
    }
  },

  upgradeSubscription: (companyId, plan) => {
    const subs = db.getSubscriptions();
    const index = subs.findIndex(s => s.companyId === companyId);
    
    const days = plan === 'Growth' ? 30 : 365;
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
    
    if (index !== -1) {
      subs[index].plan = plan;
      subs[index].status = 'ACTIVE';
      subs[index].expiresAt = expiresAt;
      subs[index].trialEndsAt = undefined;
      db.saveSubscriptions(subs);
    } else {
      subs.push({
        id: `sub-${Math.random().toString(36).substring(2)}`,
        companyId,
        plan,
        status: 'ACTIVE',
        expiresAt,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      db.saveSubscriptions(subs);
    }

    // In tandem, update/generate new license key
    const licenses = db.getLicenses();
    const licIndex = licenses.findIndex(l => l.companyId === companyId);
    const key = `PHX-${plan.toUpperCase()}-${Math.random().toString(36).substring(2).toUpperCase()}-${Math.floor(Math.random()*900+100)}`;
    
    if (licIndex !== -1) {
      licenses[licIndex].key = key;
      licenses[licIndex].status = 'ACTIVE';
      licenses[licIndex].expiresAt = expiresAt;
      db.saveLicenses(licenses);
    } else {
      licenses.push({
        id: `lic-${Math.random().toString(36).substring(2)}`,
        companyId,
        key,
        status: 'ACTIVE',
        expiresAt,
        createdAt: new Date().toISOString()
      });
      db.saveLicenses(licenses);
    }

    const currentCompany = db.getCompanies().find(c => c.id === companyId);
    if (currentCompany) {
      get().loadTenantData(companyId);
    }
  },

  addCompanyUser: (userData) => {
    const users = db.getUsers();
    const newUserId = `usr-${Math.random().toString(36).substring(2)}`;
    const newUser: User = {
      ...userData,
      id: newUserId,
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    db.saveUsers(users);
    
    if (userData.companyId) {
      get().loadTenantData(userData.companyId);
    }
  },

  updateCompanyUser: (userId, data) => {
    const users = db.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      users[index] = { ...users[index], ...data };
      db.saveUsers(users);
      
      const companyId = users[index].companyId;
      if (companyId) {
        get().loadTenantData(companyId);
      }
    }
  },

  deleteCompanyUser: (userId) => {
    const users = db.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    const filteredUsers = users.filter(u => u.id !== userId);
    db.saveUsers(filteredUsers);
    
    if (user.companyId) {
      get().loadTenantData(user.companyId);
    }
  },

  addCustomRole: (roleName, description, permissions) => {
    const roles = db.getRoles();
    const newRole: Role = {
      id: `role-${roleName.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).substring(2, 6)}`,
      name: roleName,
      description,
      permissions,
      createdAt: new Date().toISOString()
    };
    roles.push(newRole);
    db.saveRoles(roles);
    
    set({ roles });
  },

  updateRolePermissions: (roleId, permissions) => {
    const roles = db.getRoles();
    const index = roles.findIndex(r => r.id === roleId);
    if (index !== -1) {
      roles[index].permissions = permissions;
      db.saveRoles(roles);
      set({ roles });
      
      // Update local storage representation
      const logs = db.getAuditLogs();
      logs.push({
        id: `log-${Math.random().toString(36).substring(2)}`,
        userId: 'system',
        userName: 'Role Manager',
        action: `UPDATED_ROLE_PERMISSIONS_${roleId}`,
        ipAddress: '127.0.0.1',
        userAgent: 'PhoenixAI System Event',
        createdAt: new Date().toISOString(),
      });
      db.saveAuditLogs(logs);
    }
  }
}));
