import React, { useState } from 'react';
import { UserRole, UserAccount } from '../types/auth';
import { validateAndLogin } from '../services/authService';
import { ShieldCheck, UserCheck, Key, Mail, Lock, AlertTriangle, X } from 'lucide-react';

interface AuthModalProps {
  onLoginSuccess: (user: UserAccount) => void;
  onClose?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onLoginSuccess, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('USER');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const result = validateAndLogin(email, password, role);

    if (!result.success || !result.user) {
      setErrorMessage(result.error || 'Credenciales no válidas.');
      return;
    }

    onLoginSuccess(result.user);
  };

  const handleSelectRole = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setErrorMessage(null);
    setEmail('');
    setPassword('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/85 backdrop-blur-md">
      
      <div className="card-corporate w-full max-w-md p-6 rounded-3xl border border-led-cyan/40 shadow-led-glow space-y-6 relative">
        
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-dark-800 text-slate-400 hover:text-slate-100 hover:bg-dark-700 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-led-cyan/10 border border-led-cyan/30 text-led-cyan flex items-center justify-center mx-auto shadow-led-glow">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-100 font-sans">
            Acceso Seguro a MeteoAntofagasta
          </h2>
          <p className="text-xs text-slate-400">
            {role === 'ADMIN'
              ? 'Ingreso protegido de administrador'
              : 'Ingresa tu correo para administrar tus alertas'}
          </p>
        </div>

        {/* Role Toggle Selector */}
        <div className="bg-dark-900 p-1 rounded-xl border border-dark-700 grid grid-cols-2 gap-1 text-xs">
          <button
            type="button"
            onClick={() => handleSelectRole('USER')}
            className={`py-2.5 rounded-lg font-mono font-bold transition-all flex items-center justify-center space-x-1.5 ${
              role === 'USER'
                ? 'bg-led-cyan text-dark-950 shadow-led-glow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Modo Usuario</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectRole('ADMIN')}
            className={`py-2.5 rounded-lg font-mono font-bold transition-all flex items-center justify-center space-x-1.5 ${
              role === 'ADMIN'
                ? 'bg-led-cyan text-dark-950 shadow-led-glow font-extrabold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Administrador 🔐</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="text-xs font-mono font-bold text-slate-300 block mb-1.5 flex items-center space-x-1.5">
              <Mail className="w-3.5 h-3.5 text-led-cyan" />
              <span>Correo Electrónico</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={role === 'ADMIN' ? 'Ingresa correo de administrador' : 'tu@correo.com'}
              className="w-full bg-dark-900 border border-dark-700 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-100 focus:border-led-cyan focus:outline-none"
              required
              autoComplete="off"
            />
          </div>

          <div>
            <label className="text-xs font-mono font-bold text-slate-300 block mb-1.5 flex items-center space-x-1.5">
              <Lock className="w-3.5 h-3.5 text-led-cyan" />
              <span>Contraseña</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-dark-900 border border-dark-700 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-100 focus:border-led-cyan focus:outline-none"
              required
              autoComplete="new-password"
            />
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-500/15 border border-red-500/40 text-red-300 rounded-xl text-xs flex items-center space-x-2 font-mono">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-led-cyan to-led-blue text-dark-950 font-extrabold transition-all hover:shadow-led-glow text-xs uppercase tracking-wider flex items-center justify-center space-x-2 mt-2"
          >
            <span>Iniciar Sesión ({role})</span>
          </button>

        </form>

      </div>

    </div>
  );
};
