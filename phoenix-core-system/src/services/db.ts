// High-fidelity Client-side Database Mock simulating PostgreSQL persistence in localStorage

export interface Company {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  country: string;
  timezone: string;
  currency: string;
  industry?: string;
  companySize?: string; // "1-10", "11-50", etc.
  enabledCores: string[]; // "Billing Core", "Automation Core", etc.
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[]; // Array of Permission IDs
  createdAt: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  phone?: string;
  status: 'ACTIVE' | 'PENDING_VERIFICATION' | 'SUSPENDED';
  photoUrl?: string;
  language: string;
  timezone: string;
  emailNotifications: boolean;
  securityAlerts: boolean;
  twoFactorEnabled: boolean;
  companyId: string | null;
  roleId: string;
  createdAt: string;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  deviceType: 'Desktop' | 'Mobile' | 'Tablet';
  deviceName: string;
  ipAddress: string;
  lastActive: string;
  expiresAt: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  ipAddress: string;
  userAgent: string;
  location?: string;
  createdAt: string;
}

export interface License {
  id: string;
  companyId: string;
  key: string;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
  expiresAt: string;
  createdAt: string;
}

export interface Subscription {
  id: string;
  companyId: string;
  plan: 'Trial' | 'Growth' | 'Enterprise';
  status: 'ACTIVE' | 'PAST_DUE' | 'CANCELED';
  trialEndsAt?: string;
  expiresAt: string;
  createdAt: string;
  updatedAt?: string;
}

// Initial seed data
const DEFAULT_PERMISSIONS: Permission[] = [
  { id: '1', name: 'CREATE_USER', description: 'Allows creating new user profiles', category: 'User Management' },
  { id: '2', name: 'READ_USER', description: 'Allows viewing team members and client lists', category: 'User Management' },
  { id: '3', name: 'UPDATE_USER', description: 'Allows modifying user accounts and details', category: 'User Management' },
  { id: '4', name: 'DELETE_USER', description: 'Allows deleting/suspending user profiles', category: 'User Management' },
  { id: '5', name: 'MANAGE_COMPANY', description: 'Allows changing branding, currency, and settings', category: 'Company Settings' },
  { id: '6', name: 'MANAGE_LICENSES', description: 'Allows updating core licenses and upgrading subscriptions', category: 'License Control' },
  { id: '7', name: 'MANAGE_PRODUCTS', description: 'Allows activating and launching Phoenix cores', category: 'Product Control' },
  { id: '8', name: 'VIEW_REPORTS', description: 'Allows viewing security logs and system statistics', category: 'System Reports' },
  { id: '9', name: 'MANAGE_ROLES', description: 'Allows configuring RBAC custom roles and permissions', category: 'Role Control' },
];

const DEFAULT_ROLES: Role[] = [
  { id: 'role-super-admin', name: 'Super Admin', description: 'Unrestricted master control of all systems and multi-tenant nodes', permissions: DEFAULT_PERMISSIONS.map(p => p.name), createdAt: new Date().toISOString() },
  { id: 'role-company-admin', name: 'Company Admin', description: 'Full access to managing users, licenses, and settings for their company', permissions: ['CREATE_USER', 'READ_USER', 'UPDATE_USER', 'DELETE_USER', 'MANAGE_COMPANY', 'MANAGE_PRODUCTS', 'VIEW_REPORTS', 'MANAGE_ROLES'], createdAt: new Date().toISOString() },
  { id: 'role-manager', name: 'Manager', description: 'Can manage core users and view reports, but cannot change company licenses or billing', permissions: ['CREATE_USER', 'READ_USER', 'UPDATE_USER', 'VIEW_REPORTS'], createdAt: new Date().toISOString() },
  { id: 'role-employee', name: 'Employee', description: 'Access to product launch pads and basic profile editing', permissions: ['READ_USER', 'VIEW_REPORTS'], createdAt: new Date().toISOString() },
  { id: 'role-client', name: 'Client', description: 'Read-only access to portal resources and launch pads', permissions: ['VIEW_REPORTS'], createdAt: new Date().toISOString() },
];

const DEFAULT_COMPANIES: Company[] = [
  {
    id: 'co-phoenix',
    name: 'PhoenixAI Studio Inc',
    slug: 'phoenixai',
    logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=80&auto=format&fit=crop&q=60',
    country: 'United States',
    timezone: 'America/New_York',
    currency: 'USD',
    industry: 'Artificial Intelligence',
    companySize: '500+',
    enabledCores: ['Billing Core', 'Automation Core', 'CRM Core', 'Client Portal', 'Admin Intelligence'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'co-acme',
    name: 'Acme Enterprises',
    slug: 'acme',
    logoUrl: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=80&auto=format&fit=crop&q=60',
    country: 'Canada',
    timezone: 'America/Toronto',
    currency: 'CAD',
    industry: 'SaaS Software',
    companySize: '11-50',
    enabledCores: ['Billing Core', 'CRM Core'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const DEFAULT_USERS: User[] = [
  {
    id: 'usr-1',
    email: 'admin@phoenixai.studio',
    passwordHash: 'admin123', // simulated plain hash comparison
    name: 'Sarah Jenkins',
    phone: '+1 (555) 902-3920',
    status: 'ACTIVE',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    language: 'en',
    timezone: 'America/New_York',
    emailNotifications: true,
    securityAlerts: true,
    twoFactorEnabled: true,
    companyId: 'co-phoenix',
    roleId: 'role-super-admin',
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr-2',
    email: 'john@acme.com',
    passwordHash: 'acme123',
    name: 'John Miller',
    phone: '+1 (555) 302-9482',
    status: 'ACTIVE',
    photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    language: 'en',
    timezone: 'America/Toronto',
    emailNotifications: true,
    securityAlerts: false,
    twoFactorEnabled: false,
    companyId: 'co-acme',
    roleId: 'role-company-admin',
    createdAt: new Date().toISOString()
  }
];

const DEFAULT_LICENSES: License[] = [
  { id: 'lic-1', companyId: 'co-phoenix', key: 'PHX-CORE-MASTER-KEY-999', status: 'ACTIVE', expiresAt: '2029-12-31T23:59:59Z', createdAt: new Date().toISOString() },
  { id: 'lic-2', companyId: 'co-acme', key: 'PHX-CORE-ACME-KEY-302', status: 'ACTIVE', expiresAt: '2027-06-30T23:59:59Z', createdAt: new Date().toISOString() }
];

const DEFAULT_SUBSCRIPTIONS: Subscription[] = [
  { id: 'sub-1', companyId: 'co-phoenix', plan: 'Enterprise', status: 'ACTIVE', expiresAt: '2029-12-31T23:59:59Z', createdAt: new Date().toISOString() },
  { id: 'sub-2', companyId: 'co-acme', plan: 'Growth', status: 'ACTIVE', expiresAt: '2027-06-30T23:59:59Z', createdAt: new Date().toISOString() }
];

const DEFAULT_AUDIT_LOGS: AuditLog[] = [
  { id: 'log-1', userId: 'usr-1', userName: 'Sarah Jenkins', action: 'USER_LOGIN', ipAddress: '192.168.1.100', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', location: 'New York, US', createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'log-2', userId: 'usr-1', userName: 'Sarah Jenkins', action: 'MANAGE_LICENSES', ipAddress: '192.168.1.100', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', location: 'New York, US', createdAt: new Date(Date.now() - 1800000).toISOString() },
  { id: 'log-3', userId: 'usr-2', userName: 'John Miller', action: 'USER_LOGIN', ipAddress: '184.202.93.18', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', location: 'Toronto, CA', createdAt: new Date(Date.now() - 7200000).toISOString() },
];

const DEFAULT_SESSIONS: Session[] = [
  { id: 'sess-1', userId: 'usr-1', token: 'mock-jwt-token-1', deviceType: 'Desktop', deviceName: 'MacBook Pro 16"', ipAddress: '192.168.1.100', lastActive: new Date().toISOString(), expiresAt: new Date(Date.now() + 86400000).toISOString(), createdAt: new Date().toISOString() },
  { id: 'sess-2', userId: 'usr-2', token: 'mock-jwt-token-2', deviceType: 'Desktop', deviceName: 'Dell XPS 15', ipAddress: '184.202.93.18', lastActive: new Date().toISOString(), expiresAt: new Date(Date.now() + 86400000).toISOString(), createdAt: new Date().toISOString() }
];

// Helper to initialize local storage
const initializeLocalStorage = () => {
  if (!localStorage.getItem('phx_companies')) localStorage.setItem('phx_companies', JSON.stringify(DEFAULT_COMPANIES));
  if (!localStorage.getItem('phx_roles')) localStorage.setItem('phx_roles', JSON.stringify(DEFAULT_ROLES));
  if (!localStorage.getItem('phx_permissions')) localStorage.setItem('phx_permissions', JSON.stringify(DEFAULT_PERMISSIONS));
  if (!localStorage.getItem('phx_users')) localStorage.setItem('phx_users', JSON.stringify(DEFAULT_USERS));
  if (!localStorage.getItem('phx_licenses')) localStorage.setItem('phx_licenses', JSON.stringify(DEFAULT_LICENSES));
  if (!localStorage.getItem('phx_subscriptions')) localStorage.setItem('phx_subscriptions', JSON.stringify(DEFAULT_SUBSCRIPTIONS));
  if (!localStorage.getItem('phx_audit_logs')) localStorage.setItem('phx_audit_logs', JSON.stringify(DEFAULT_AUDIT_LOGS));
  if (!localStorage.getItem('phx_sessions')) localStorage.setItem('phx_sessions', JSON.stringify(DEFAULT_SESSIONS));
};

initializeLocalStorage();

// Simple mock DB helpers
export const db = {
  getCompanies: (): Company[] => JSON.parse(localStorage.getItem('phx_companies') || '[]'),
  saveCompanies: (companies: Company[]) => localStorage.setItem('phx_companies', JSON.stringify(companies)),
  
  getRoles: (): Role[] => JSON.parse(localStorage.getItem('phx_roles') || '[]'),
  saveRoles: (roles: Role[]) => localStorage.setItem('phx_roles', JSON.stringify(roles)),

  getPermissions: (): Permission[] => JSON.parse(localStorage.getItem('phx_permissions') || '[]'),

  getUsers: (): User[] => JSON.parse(localStorage.getItem('phx_users') || '[]'),
  saveUsers: (users: User[]) => localStorage.setItem('phx_users', JSON.stringify(users)),

  getLicenses: (): License[] => JSON.parse(localStorage.getItem('phx_licenses') || '[]'),
  saveLicenses: (licenses: License[]) => localStorage.setItem('phx_licenses', JSON.stringify(licenses)),

  getSubscriptions: (): Subscription[] => JSON.parse(localStorage.getItem('phx_subscriptions') || '[]'),
  saveSubscriptions: (subscriptions: Subscription[]) => localStorage.setItem('phx_subscriptions', JSON.stringify(subscriptions)),

  getAuditLogs: (): AuditLog[] => JSON.parse(localStorage.getItem('phx_audit_logs') || '[]'),
  saveAuditLogs: (logs: AuditLog[]) => localStorage.setItem('phx_audit_logs', JSON.stringify(logs)),

  getSessions: (): Session[] => JSON.parse(localStorage.getItem('phx_sessions') || '[]'),
  saveSessions: (sessions: Session[]) => localStorage.setItem('phx_sessions', JSON.stringify(sessions)),
};
