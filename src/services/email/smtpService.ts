import { RenderedEmail } from '../../types/emailAlert';

// Detect whether running in production on Vercel or locally
const BACKEND_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/send-email'
  : '/api/send_email';

const APP_PASS_KEY = 'meteo_antofagasta_gmail_app_password';
export const DEFAULT_APP_PASS = 'linrkasyfquqkvgw';

export function getSavedGmailAppPassword(): string {
  try {
    const saved = localStorage.getItem(APP_PASS_KEY);
    if (saved) return saved;
  } catch (e) {
    console.error('Error getting Gmail App Password:', e);
  }
  return DEFAULT_APP_PASS;
}

export function saveGmailAppPassword(appPassword: string): void {
  try {
    localStorage.setItem(APP_PASS_KEY, appPassword.trim());
  } catch (e) {
    console.error('Error saving Gmail App Password:', e);
  }
}

export interface RealEmailDispatchResult {
  success: boolean;
  message?: string;
  error?: string;
  sender?: string;
  recipient?: string;
  timestamp?: string;
}

export async function sendRealGmailNotification(
  toEmail: string,
  renderedEmail: RenderedEmail,
  customAppPassword?: string
): Promise<RealEmailDispatchResult> {
  const appPassword = (customAppPassword || getSavedGmailAppPassword() || DEFAULT_APP_PASS).trim();

  try {
    const res = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to_email: toEmail,
        subject: renderedEmail.subject,
        html_body: renderedEmail.htmlBody,
        text_body: renderedEmail.textBody,
        app_password: appPassword
      })
    });

    const data = await res.json();

    if (res.ok && data.success) {
      return {
        success: true,
        message: data.message || `¡Correo real enviado a ${toEmail} desde thefilex07@gmail.com!`,
        sender: 'thefilex07@gmail.com',
        recipient: toEmail,
        timestamp: new Date().toISOString()
      };
    } else {
      return {
        success: false,
        error: data.error || 'Error al comunicar con el servidor Gmail SMTP.'
      };
    }

  } catch (err: any) {
    console.error('Error sending real email via backend:', err);
    return {
      success: false,
      error: `Error al conectar con la API de envío de correos (/api/send_email).`
    };
  }
}
