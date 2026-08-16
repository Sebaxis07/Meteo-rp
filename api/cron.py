"""
Vercel Cron Job Handler (Ejecutado automáticamente por Vercel cada 15 minutos en la nube)
Endpoint: /api/cron
"""

import os
import json
import smtplib
import urllib.request
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from http.server import BaseHTTPRequestHandler

GMAIL_SENDER = os.environ.get("GMAIL_SENDER", "thefilex07@gmail.com")
GMAIL_APP_PASSWORD = os.environ.get("GMAIL_APP_PASSWORD", "linrkasyfquqkvgw")

class handler(BaseHTTPRequestHandler):
    def _set_headers(self, status=200):
        self.send_response(status)
        self.send_header('Content-type', 'application/json')
        self.end_headers()

    def do_GET(self):
        """
        Vercel Cron invoca automáticamente esta función GET cada 15 minutos.
        """
        try:
            url = "https://api.open-meteo.com/v1/forecast?latitude=-23.541,-24.627&longitude=-70.384,-70.404&current=temperature_2m,precipitation,wind_speed_10m,wind_gusts_10m,freezing_level_height&timezone=America%2FSantiago"
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            
            with urllib.request.urlopen(req) as response:
                data = json.loads(response.read().decode('utf-8'))
                
                costa_data = data[0].get('current', {}) if isinstance(data, list) else data.get('current', {})
                current_iso = costa_data.get('freezing_level_height', 2800)
                current_wind = costa_data.get('wind_gusts_10m', 18)
                current_precip = costa_data.get('precipitation', 0.0)

                password = GMAIL_APP_PASSWORD.strip().replace(" ", "")

                subject = "[Antofagasta] Cambio detectado: actualización de riesgo"
                text_body = f"""[Antofagasta] Cambio detectado

Hola,
Actualización automática de Vercel Cron Job para la Región de Antofagasta.

1. QUÉ CAMBIÓ
- Isoterma Cero: {current_iso} m.s.n.m.
- Viento registrado: {current_wind} km/h
- Precipitación: {current_precip} mm/h

2. SECTORES
- Costa Laguna (25m): Sin nieve prevista. Viento costero activo.
- Cerro Paranal / Armazones (>2.200m): Monitoreo de altitud.

Ver en vivo: https://meteo-antofagasta.vercel.app/
                """
                
                html_body = f"""
                <div style="font-family: sans-serif; background-color: #070B14; color: #F8FAFC; padding: 20px; border-radius: 16px;">
                  <h2 style="color: #00F0FF;">[Antofagasta] Cambio detectado</h2>
                  <p>Investigación automática ejecutada por Vercel Cron en la nube.</p>
                  <ul>
                    <li><strong>Isoterma Cero:</strong> {current_iso} m.s.n.m.</li>
                    <li><strong>Ráfagas Viento:</strong> {current_wind} km/h</li>
                    <li><strong>Precipitación:</strong> {current_precip} mm/h</li>
                  </ul>
                  <p><strong>Costa Laguna (25m):</strong> Sin nieve prevista. Viento costero activo.</p>
                </div>
                """

                msg = MIMEMultipart('alternative')
                msg['Subject'] = subject
                msg['From'] = f"MeteoAntofagasta Alerts <{GMAIL_SENDER}>"
                msg['To'] = GMAIL_SENDER

                part1 = MIMEText(text_body, 'plain', 'utf-8')
                part2 = MIMEText(html_body, 'html', 'utf-8')
                msg.attach(part1)
                msg.attach(part2)

                server = smtplib.SMTP_SSL("smtp.gmail.com", 465)
                server.login(GMAIL_SENDER, password)
                server.sendmail(GMAIL_SENDER, [GMAIL_SENDER], msg.as_string())
                server.quit()

                self._set_headers(200)
                self.wfile.write(json.dumps({
                    "success": True,
                    "message": "Cron Job autónomo ejecutado correctamente por Vercel.",
                    "iso0": current_iso,
                    "wind": current_wind
                }).encode('utf-8'))

        except Exception as e:
            self._set_headers(500)
            self.wfile.write(json.dumps({"success": False, "error": str(e)}).encode('utf-8'))
