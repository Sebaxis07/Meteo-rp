import { UserAccount, UserRole } from '../types/auth';

const STORAGE_KEY = 'meteo_antofagasta_current_user';
const USERS_LIST_KEY = 'meteo_antofagasta_all_users';

export const ADMIN_EMAIL = 'thefilex07@gmail.com';
export const ADMIN_PASS = 'Dpastora2#';

export const DEFAULT_ADMIN_ACCOUNT: UserAccount = {
  id: 'usr_admin_001',
  email: ADMIN_EMAIL,
  name: 'Administrador',
  role: 'ADMIN',
  watch_zones: ['Costa Laguna', 'Antofagasta ciudad', 'Paranal', 'Armazones', 'Cordillera de la Costa'],
  watch_events: ['nevada', 'lluvia', 'viento', 'frio'],
  min_confidence: 80,
  digest_enabled: true,
  digest_hour: '08:00',
  quiet_hours: ['00:00', '07:00'],
  created_at: '2026-08-15T22:00:00-04:00'
};

export const DEFAULT_USER_ACCOUNT: UserAccount = {
  id: 'usr_user_visitante',
  email: '', // Empty by default
  name: 'Visitante',
  role: 'USER',
  watch_zones: ['Costa Laguna', 'Antofagasta ciudad'],
  watch_events: ['nevada', 'lluvia', 'viento', 'frio'],
  min_confidence: 80,
  digest_enabled: true,
  digest_hour: '08:00',
  quiet_hours: ['00:00', '07:00'],
  created_at: '2026-08-15T22:00:00-04:00'
};

export function getCurrentUser(): UserAccount {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.role === 'ADMIN' && parsed.email !== ADMIN_EMAIL) {
        parsed.email = ADMIN_EMAIL;
        saveCurrentUser(parsed);
      }
      return parsed;
    }
  } catch (e) {
    console.error('Error loading current user session:', e);
  }
  return DEFAULT_USER_ACCOUNT;
}

export function saveCurrentUser(user: UserAccount): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    if (user.email) {
      updateUserInList(user);
    }
  } catch (e) {
    console.error('Error saving user session:', e);
  }
}

export function getAllUsers(): UserAccount[] {
  try {
    const saved = localStorage.getItem(USERS_LIST_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error loading all users:', e);
  }
  return [DEFAULT_ADMIN_ACCOUNT];
}

function updateUserInList(user: UserAccount): void {
  const users = getAllUsers();
  const idx = users.findIndex(u => u.id === user.id || (u.email && u.email.toLowerCase() === user.email.toLowerCase()));
  if (idx >= 0) {
    users[idx] = user;
  } else {
    users.push(user);
  }
  localStorage.setItem(USERS_LIST_KEY, JSON.stringify(users));
}

export function validateAndLogin(email: string, passwordAttempt: string, roleAttempt: UserRole): { success: boolean; user?: UserAccount; error?: string } {
  const cleanEmail = email.trim().toLowerCase();

  // Strict Admin Validation
  if (roleAttempt === 'ADMIN' || cleanEmail === ADMIN_EMAIL.toLowerCase()) {
    if (passwordAttempt !== ADMIN_PASS) {
      return {
        success: false,
        error: '🔐 Credenciales de administrador incorrectas. Acceso restringido.'
      };
    }
    const adminUser = { ...DEFAULT_ADMIN_ACCOUNT };
    saveCurrentUser(adminUser);
    return { success: true, user: adminUser };
  }

  // Regular User Login / Register
  const users = getAllUsers();
  let existing = users.find(u => u.email.toLowerCase() === cleanEmail);

  if (!existing) {
    existing = {
      id: `usr_${Date.now()}`,
      email: cleanEmail,
      name: cleanEmail.split('@')[0],
      role: 'USER',
      watch_zones: ['Costa Laguna', 'Antofagasta ciudad'],
      watch_events: ['nevada', 'lluvia', 'viento', 'frio'],
      min_confidence: 80,
      digest_enabled: true,
      digest_hour: '08:00',
      quiet_hours: ['00:00', '07:00'],
      created_at: new Date().toISOString()
    };
  }

  saveCurrentUser(existing);
  return { success: true, user: existing };
}
