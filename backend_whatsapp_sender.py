"""
Script Backend Python para el envío de alertas por WhatsApp Business Cloud API (Meta)
o alternativa rápida gratuita (CallMeBot API).
"""

import requests
import json

# ==============================================================================
# OPCIÓN A: Meta WhatsApp Business Cloud API (Oficial)
# ==============================================================================
META_PHONE_NUMBER_ID = "YOUR_META_PHONE_NUMBER_ID"
META_ACCESS_TOKEN = "YOUR_META_PERMANENT_ACCESS_TOKEN"

def send_whatsapp_meta(to_phone: str, bulletin_code: str, costa_laguna_status: str, cordillera_status: str):
    """
    Envía una alerta meteorológica mediante la API oficial de Meta.
    Requiere una plantilla aprobada llamada 'weather_alert_update' en Meta Business.
    """
    url = f"https://graph.facebook.com/v18.0/{META_PHONE_NUMBER_ID}/messages"
    
    headers = {
        "Authorization": f"Bearer {META_ACCESS_TOKEN}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "messaging_product": "whatsapp",
        "to": to_phone.replace("+", "").replace(" ", ""),
        "type": "template",
        "template": {
            "name": "weather_alert_update",
            "language": {"code": "es"},
            "components": [
                {
                    "type": "body",
                    "parameters": [
                        {"type": "text", "text": bulletin_code},
                        {"type": "text", "text": cordillera_status},
                        {"type": "text", "text": costa_laguna_status}
                    ]
                }
            ]
        }
    }
    
    response = requests.post(url, headers=headers, json=payload)
    print(f"Respuesta Meta: Status {response.status_code}")
    return response.json()


# ==============================================================================
# OPCIÓN B: CallMeBot API (Gratuito e Inmediato para Pruebas en WhatsApp)
# ==============================================================================
CALLMEBOT_PHONE = "56912345678"  # Tu número con código de país
CALLMEBOT_API_KEY = "YOUR_CALLMEBOT_API_KEY"  # Se obtiene al enviar "I allow callmebot to send me messages" al +34 644 10 55 84

def send_whatsapp_fast_test(to_phone: str, api_key: str, message: str):
    """
    Envía una alerta inmediata a tu WhatsApp personal sin configurar Meta Developers.
    """
    url = f"https://api.callmebot.com/whatsapp.php?phone={to_phone}&text={requests.utils.quote(message)}&apikey={api_key}"
    response = requests.get(url)
    print(f"Respuesta CallMeBot: Status {response.status_code}")
    return response.text


if __name__ == "__main__":
    print("Módulo de envío de WhatsApp cargado.")
    # Ejemplo de uso:
    # send_whatsapp_meta("+56912345678", "A422-1/2026", "Sin nieve. Viento 45km/h.", "Nevadas sobre 2200m")
