export type UserRole = 'ADMIN' | 'USER';

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  watch_zones: string[];
  watch_events: ('nevada' | 'lluvia' | 'viento' | 'frio')[];
  min_confidence: number;
  digest_enabled: boolean;
  digest_hour: string;
  quiet_hours: [string, string];
  created_at: string;
}

export interface AuthState {
  user: UserAccount | null;
  isAuthenticated: boolean;
}
