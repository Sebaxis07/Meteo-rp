"""
Servidor Backend Python para el envío de correos reales en tiempo real mediante Gmail SMTP
+ MOTOR DE MONITOREO Y AUTONOMÍA EN SEGUNDO PLANO (Auto-Polling cada 15 min)
Sender: thefilex07@gmail.com
"""

import os
import sys
import json
import smtplib
import time
import threading
import urllib.request
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from http.server import HTTPServer, BaseHTTPRequestHandler

# Configuración de Servidor SMTP Gmail
GMAIL_SENDER = "thefilex07@gmail.com"
GMAIL_APP_PASSWORD = os.environ.get("GMAIL_APP_PASSWORD", "linrkasyfquqkvgw")

PORT = 5000

# Estado global de monitoreo
last_risk_state = {
    "isoterma_zero": 2800,
    "wind_speed": 18,
    "precipitation": 0.0,
    "last_alert_sent_time": 0
}

def send_real_email_via_gmail(to_email: str, subject: str, html_body: str, text_body: str, app_password: str = None) -> dict:
    password = (app_password or GMAIL_APP_PASSWORD or "linrkasyfquqkvgw").strip().replace(" ", "")
    
    if not password:
        return {
            "success": False,
            "error": "Falta la contraseña de aplicación de Gmail (16 caracteres)."
        }

    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = f"MeteoAntofagasta Alerts <{GMAIL_SENDER}>"
        msg['To'] = to_email

        part1 = MIMEText(text_body, 'plain', 'utf-8')
        part2 = MIMEText(html_body, 'html', 'utf-8')
        msg.attach(part1)
        msg.attach(part2)

        server = smtplib.SMTP_SSL("smtp.gmail.com", 465)
        server.login(GMAIL_SENDER, password)
        server.sendmail(GMAIL_SENDER, [to_email], msg.as_string())
        server.quit()

        print(f"[SUCCESS] Correo real enviado exitosamente a {to_email}")
        return {
            "success": True,
            "message": f"¡Correo real enviado exitosamente a {to_email} desde {GMAIL_SENDER}!",
            "sender": GMAIL_SENDER
        }

    except Exception as e:
        print(f"[ERROR] Error al enviar correo por Gmail SMTP: {e}")
        return {
            "success": False,
            "error": str(e)
        }

def check_weather_and_auto_notify():
    """
    Función autónoma que investiga por sí sola el clima de Antofagasta y Costa Laguna.
    Si detecta cambios en tiempo real, envía automáticamente un correo de actualización.
    """
    global last_risk_state
    print("[AUTONOMOUS MONITOR] Investigando fuentes meteorologicas en tiempo real (Open-Meteo & MeteoChile)...")

    try:
        # Coordenadas: Costa Laguna (-23.541, -70.384), Paranal (-24.627, -70.404)
        url = "https://api.open-meteo.com/v1/forecast?latitude=-23.541,-24.627&longitude=-70.384,-70.404&current=temperature_2m,precipitation,wind_speed_10m,wind_gusts_10m,freezing_level_height&timezone=America%2FSantiago"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode('utf-8'))
            
            costa_data = data[0].get('current', {}) if isinstance(data, list) else data.get('current', {})
            paranal_data = data[1].get('current', {}) if isinstance(data, list) and len(data) > 1 else {}

            current_iso = costa_data.get('freezing_level_height', 2800)
            current_wind = costa_data.get('wind_gusts_10m', costa_data.get('wind_speed_10m', 18))
            current_precip = costa_data.get('precipitation', 0.0)

            print(f"[LIVE DATA] Iso0: {current_iso}m | Viento: {current_wind} km/h | Lluvia: {current_precip} mm/h")

            # Evaluar si ocurrió un cambio relevante o riesgo
            is_significant_change = (
                abs(current_iso - last_risk_state["isoterma_zero"]) > 300 or
                current_wind >= 45 or
                current_precip > 0.5
            )

            current_time = time.time()
            # Evitar spam: al menos 30 minutos entre notificaciones automáticas idénticas
            time_since_last_alert = current_time - last_risk_state["last_alert_sent_time"]

            if is_significant_change and time_since_last_alert > 1800:
                print("[AUTONOMOUS ALERT] ¡CAMBIO RELEVANTE DETECTADO! Enviando correo automatico...")
                
                subject = "[Antofagasta] Cambio detectado: actualización de riesgo"
                text_body = f"""[Antofagasta] Cambio detectado

Hola,
Se detectó una actualización automática en el monitoreo meteorológico para la Región de Antofagasta.

1. QUÉ CAMBIÓ
- Isoterma Cero: {current_iso} m.s.n.m.
- Viento registrado: {current_wind} km/h
- Precipitación: {current_precip} mm/h

2. SECTORES
- Costa Laguna (25m): Sin nieve prevista. Viento moderado costero.
- Cerro Paranal / Armazones (>2.200m): Riesgo por descenso de isoterma cero.

3. ACCIÓN RECOMENDADA
Monitorear condiciones si transitas por rutas de altitud.

Actualización automática del sistema.
                """
                
                html_body = f"""
                <div style="font-family: sans-serif; background-color: #070B14; color: #F8FAFC; padding: 20px; border-radius: 16px;">
                  <h2 style="color: #00F0FF;">[Antofagasta] Cambio detectado</h2>
                  <p>Se ha detectado una actualización automática en las condiciones meteorológicas reales.</p>
                  <ul>
                    <li><strong>Isoterma Cero:</strong> {current_iso} m.s.n.m.</li>
                    <li><strong>Ráfagas Viento:</strong> {current_wind} km/h</li>
                    <li><strong>Precipitación:</strong> {current_precip} mm/h</li>
                  </ul>
                  <p><strong>Costa Laguna (25m):</strong> Sin nieve prevista. Viento costero activo.</p>
                  <p><em>Notificación automática del Motor de Monitoreo.</em></p>
                </div>
                """

                # Enviar correo automático
                send_real_email_via_gmail(GMAIL_SENDER, subject, html_body, text_body)
                last_risk_state["last_alert_sent_time"] = current_time

            # Actualizar estado previo
            last_risk_state["isoterma_zero"] = current_iso
            last_risk_state["wind_speed"] = current_wind
            last_risk_state["precipitation"] = current_precip

    except Exception as e:
        print(f"[AUTONOMOUS MONITOR ERROR] {e}")

def background_monitoring_loop():
    """
    Loop autónomo que corre cada 15 minutos en segundo plano.
    """
    while True:
        check_weather_and_auto_notify()
        time.sleep(15 * 60) # Esperar 15 minutos

class EmailRequestHandler(BaseHTTPRequestHandler):
    def _set_headers(self, status=200):
        self.send_response(status)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers(200)

    def do_GET(self):
        # Permite disparar o consultar la verificación manual vía HTTP GET
        if self.path == '/check-now':
            check_weather_and_auto_notify()
            self._set_headers(200)
            self.wfile.write(json.dumps({"success": True, "message": "Investigación meteorológica ejecutada exitosamente."}).encode('utf-8'))
        else:
            self._set_headers(200)
            self.wfile.write(json.dumps({"status": "Servidor activo", "sender": GMAIL_SENDER}).encode('utf-8'))

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        
        try:
            payload = json.loads(post_data.decode('utf-8'))
            to_email = payload.get('to_email')
            subject = payload.get('subject', '[Antofagasta] Notificación Meteorológica')
            html_body = payload.get('html_body', '')
            text_body = payload.get('text_body', '')
            app_password = payload.get('app_password', GMAIL_APP_PASSWORD)

            if not to_email:
                self._set_headers(400)
                self.wfile.write(json.dumps({"success": False, "error": "El campo 'to_email' es requerido."}).encode('utf-8'))
                return

            result = send_real_email_via_gmail(to_email, subject, html_body, text_body, app_password)
            
            if result.get('success'):
                self._set_headers(200)
            else:
                self._set_headers(500)
                
            self.wfile.write(json.dumps(result).encode('utf-8'))

        except Exception as e:
            self._set_headers(500)
            self.wfile.write(json.dumps({"success": False, "error": str(e)}).encode('utf-8'))

def run_server():
    # Iniciar hilo de monitoreo autónomo en segundo plano
    monitor_thread = threading.Thread(target=background_monitoring_loop, daemon=True)
    monitor_thread.start()
    print("[OK] Hilo de Monitoreo Autónomo iniciado (Investigación continua cada 15 min).")

    server_address = ('', PORT)
    httpd = HTTPServer(server_address, EmailRequestHandler)
    print(f"[OK] Servidor Gmail SMTP local escuchando en http://localhost:{PORT}")
    print(f"[OK] Remitente configurado: {GMAIL_SENDER}")
    httpd.serve_forever()

if __name__ == '__main__':
    run_server()
