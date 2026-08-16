"""
Vercel Serverless Function en Python para envío de correos por Gmail SMTP.
Endpoint en producción: /api/send_email
"""

import os
import json
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from http.server import BaseHTTPRequestHandler

GMAIL_SENDER = "thefilex07@gmail.com"
GMAIL_APP_PASSWORD = os.environ.get("GMAIL_APP_PASSWORD", "linrkasyfquqkvgw")

def handler(request):
    """
    Función Serverless compatible con Vercel Python Runtime.
    """
    pass

class handler(BaseHTTPRequestHandler):
    def _set_headers(self, status=200):
        self.send_response(status)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers(200)

    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
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

            password = (app_password or GMAIL_APP_PASSWORD or "linrkasyfquqkvgw").strip().replace(" ", "")

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

            self._set_headers(200)
            self.wfile.write(json.dumps({
                "success": True,
                "message": f"¡Correo enviado exitosamente a {to_email} desde Vercel Serverless!",
                "sender": GMAIL_SENDER
            }).encode('utf-8'))

        except Exception as e:
            self._set_headers(500)
            self.wfile.write(json.dumps({"success": False, "error": str(e)}).encode('utf-8'))
