import { WeatherEventClaim, RenderedEmail, EmailTemplateKey } from '../../types/emailAlert';

export function composeWelcomeEmail(toEmail: string, watchZones: string[]): RenderedEmail {
  const subject = '[Antofagasta] ¡Inscripción confirmada!';
  const preheader = 'Te has inscrito exitosamente al sistema de alertas meteorológicas verificadas.';
  const name = toEmail.split('@')[0];

  const htmlBody = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #070B14; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #F8FAFC;">
  
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #070B14; padding: 30px 0;">
    <tr>
      <td align="center">
        
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #0F172A; border: 1px solid #1E293B; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          
          <tr>
            <td style="padding: 24px 30px; background: linear-gradient(135deg, #0F172A 0%, #0B1120 100%); border-bottom: 2px solid #00F0FF;">
              <span style="font-size: 11px; font-family: monospace; font-weight: bold; color: #00F0FF; text-transform: uppercase; letter-spacing: 1px;">
                ⚡ METEOANTOFAGASTA ALERTS
              </span>
              <h1 style="margin: 6px 0 0 0; font-size: 22px; font-weight: 800; color: #F8FAFC;">
                ¡Inscripción Confirmada!
              </h1>
            </td>
          </tr>

          <tr>
            <td style="padding: 26px 30px; font-size: 14px; line-height: 1.6; color: #E2E8F0;">
              
              <p style="margin: 0 0 16px 0; font-size: 15px; color: #F8FAFC;">
                Hola <strong>${name}</strong>,
              </p>

              <p style="margin: 0 0 20px 0;">
                Oye, te has inscrito exitosamente en el sistema de alertas meteorológicas verificadas para la <strong>Región de Antofagasta</strong> y el sector de <strong>Costa Laguna</strong>.
              </p>

              <div style="background-color: #0B1120; border: 1px solid #1E293B; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                <div style="font-size: 11px; font-family: monospace; font-weight: bold; color: #00F0FF; text-transform: uppercase; margin-bottom: 8px;">
                  Tus Sectores Suscritos:
                </div>
                <div style="font-size: 13px; color: #F8FAFC;">
                  📍 ${watchZones.length > 0 ? watchZones.join(', ') : 'Costa Laguna, Antofagasta Ciudad'}
                </div>
              </div>

              <div style="background-color: rgba(0, 240, 255, 0.06); border: 1px solid rgba(0, 240, 255, 0.2); border-radius: 12px; padding: 16px; margin-bottom: 20px; font-size: 13px; color: #CBD5E1;">
                🛡️ <strong>¿Cómo funciona?</strong> Recibirás correos únicamente cuando la Dirección Meteorológica de Chile o SENAPRED confirmen un evento meteorológico relevante (lluvia, nieve en cordillera, viento fuerte) en tus zonas. No enviamos spam ni mensajes duplicados.
              </div>

              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="http://localhost:3000/" style="display: inline-block; background-color: #00F0FF; color: #070B14; font-size: 13px; font-weight: bold; padding: 10px 24px; border-radius: 10px; text-decoration: none; font-family: sans-serif;">
                      Ver Mapa & Calendario 7 Días →
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <tr>
            <td style="padding: 16px 30px; background-color: #0B1120; border-top: 1px solid #1E293B; text-align: center; font-size: 11px; color: #64748B; font-family: monospace;">
              Servicio de Alertas Meteorológicas • Costa Laguna & Antofagasta<br>
              Enviado desde thefilex07@gmail.com
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
  `;

  const textBody = `
${subject}

Hola ${name},

Oye, te has inscrito exitosamente en el sistema de alertas meteorológicas verificadas para Antofagasta y Costa Laguna.

Tus Sectores Suscritos:
${watchZones.join(', ')}

Recibirás correos únicamente cuando se confirmen eventos meteorológicos relevantes (lluvia, viento, nieve en cordillera).

Ver mapa y calendario en vivo: http://localhost:3000/
  `.trim();

  return {
    templateKey: 'NEW_CONFIRMED',
    subject,
    preheader,
    htmlBody,
    textBody
  };
}

export function composeAlertEmail(
  event: WeatherEventClaim,
  userName: string = 'Suscriptor',
  templateKeyOverride?: EmailTemplateKey
): RenderedEmail {
  
  let key: EmailTemplateKey = templateKeyOverride || 'NEW_CONFIRMED';
  
  if (!templateKeyOverride) {
    switch (event.change_type) {
      case 'new':
        key = 'NEW_CONFIRMED';
        break;
      case 'update':
        key = 'RELEVANT_UPDATE';
        break;
      case 'escalation':
        key = 'ESCALATION';
        break;
      case 'deescalation':
        key = 'CORRECTION';
        break;
      case 'all_clear':
        key = 'ALL_CLEAR';
        break;
    }
  }

  const validFromStr = new Date(event.valid_from).toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' });
  const validFromTime = new Date(event.valid_from).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  const validToTime = new Date(event.valid_to).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });

  let subject = '[Antofagasta] Riesgo en sectores altos';
  let preheader = 'Evento validado para sectores elevados; revisa si afecta tus rutas.';

  switch (key) {
    case 'NEW_CONFIRMED':
      subject = '[Antofagasta] Riesgo en sectores altos';
      preheader = 'Evento validado para sectores elevados; revisa si afecta tus rutas.';
      break;
    case 'RELEVANT_UPDATE':
      subject = '[Antofagasta] Cambio detectado';
      preheader = 'Se actualizó el alcance o intensidad del evento en la región.';
      break;
    case 'NO_AFFECTATION':
      subject = '[Antofagasta] Sin riesgo para tu zona';
      preheader = 'El evento se mantiene fuera de tus sectores vigilados.';
      break;
    case 'ESCALATION':
      subject = '[Antofagasta] Riesgo aumenta';
      preheader = 'Subió el nivel de afectación en sectores vigilados de la región.';
      break;
    case 'CORRECTION':
      subject = '[Antofagasta] Corrección del monitoreo';
      preheader = 'Se corrigió información previa tras nueva verificación oficial.';
      break;
    case 'ALL_CLEAR':
      subject = '[Antofagasta] Fin del evento';
      preheader = 'Las condiciones meteorológicas volvieron a la normalidad.';
      break;
  }

  const htmlBody = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #070B14; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #F8FAFC;">
  
  <div style="display: none; max-height: 0px; overflow: hidden;">
    ${preheader}
  </div>

  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #070B14; padding: 20px 0;">
    <tr>
      <td align="center">
        
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #0F172A; border: 1px solid #1E293B; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          
          <!-- Header Banner -->
          <tr>
            <td style="padding: 24px 30px; background: linear-gradient(135deg, #0F172A 0%, #0B1120 100%); border-bottom: 2px solid #00F0FF;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <span style="font-size: 11px; font-family: monospace; font-weight: bold; color: #00F0FF; text-transform: uppercase; letter-spacing: 1px;">
                      ⚡ METEOANTOFAGASTA ALERTS
                    </span>
                    <h1 style="margin: 6px 0 0 0; font-size: 20px; font-weight: 800; color: #F8FAFC; line-height: 1.3;">
                      ${subject.replace('[Antofagasta] ', '')}
                    </h1>
                  </td>
                  <td align="right" valign="top">
                    <span style="display: inline-block; background-color: rgba(0, 240, 255, 0.1); border: 1px solid rgba(0, 240, 255, 0.3); color: #00F0FF; font-size: 10px; font-weight: bold; padding: 4px 10px; border-radius: 6px; font-family: monospace;">
                      ${event.change_type.toUpperCase()}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 24px 30px; font-size: 14px; line-height: 1.6; color: #E2E8F0;">
              
              <p style="margin: 0 0 20px 0; font-size: 15px; color: #F8FAFC;">
                Hola, <strong>${userName}</strong>.
              </p>

              <!-- Block 1: Qué cambió -->
              <div style="margin-bottom: 20px; background-color: #0B1120; border: 1px solid #1E293B; border-radius: 12px; padding: 16px;">
                <div style="font-size: 11px; font-family: monospace; font-weight: bold; color: #00F0FF; text-transform: uppercase; margin-bottom: 6px;">
                  1. Qué pasó
                </div>
                <div style="font-size: 14px; color: #F8FAFC; font-weight: 600;">
                  Evento: <span style="text-transform: capitalize;">${event.event_type}</span>
                </div>
                <div style="font-size: 13px; color: #94A3B8; margin-top: 4px;">
                  Vigencia: ${validFromStr}, ${validFromTime} a ${validToTime} hrs.
                </div>
              </div>

              <!-- Block 2: Impacto por sector -->
              <div style="margin-bottom: 20px;">
                <div style="font-size: 11px; font-family: monospace; font-weight: bold; color: #00F0FF; text-transform: uppercase; margin-bottom: 8px;">
                  2. Diagnóstico por Sector
                </div>
                
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: separate; border-spacing: 0 6px;">
                  <tr>
                    <td style="padding: 10px 14px; background-color: #1E293B; border-radius: 8px; font-size: 13px;">
                      <strong style="color: #00F0FF;">Costa Laguna (25m):</strong> ${event.impact_summary.costa_laguna}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 14px; background-color: #1E293B; border-radius: 8px; font-size: 13px;">
                      <strong style="color: #F8FAFC;">Antofagasta Ciudad:</strong> ${event.impact_summary.antofagasta_ciudad}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 14px; background-color: #1E293B; border-radius: 8px; font-size: 13px;">
                      <strong style="color: #F59E0B;">Cerro Paranal / Armazones:</strong> ${event.impact_summary.paranal_armazones}
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Block 3: Qué deberías hacer -->
              <div style="margin-bottom: 24px; background-color: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 12px; padding: 16px;">
                <div style="font-size: 11px; font-family: monospace; font-weight: bold; color: #10B981; text-transform: uppercase; margin-bottom: 4px;">
                  3. Acción Recomendada
                </div>
                <div style="font-size: 13px; color: #E2E8F0; line-height: 1.5;">
                  ${event.recommended_action}
                </div>
              </div>

              <!-- Block 4: Próxima actualización & Mapa -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-t: 1px solid #1E293B; padding-top: 16px;">
                <tr>
                  <td style="font-size: 12px; color: #94A3B8; font-family: monospace;">
                    Próxima actualización: <strong>${event.next_update_time}</strong>
                  </td>
                  <td align="right">
                    <a href="http://localhost:3000/" style="display: inline-block; background-color: #00F0FF; color: #070B14; font-size: 12px; font-weight: bold; padding: 8px 16px; border-radius: 8px; text-decoration: none; font-family: sans-serif;">
                      Ver Mapa Regional →
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 16px 30px; background-color: #0B1120; border-top: 1px solid #1E293B; text-align: center; font-size: 11px; color: #64748B; font-family: monospace;">
              Servicio de Alertas Meteorológicas • Costa Laguna & Antofagasta<br>
              Enviado desde thefilex07@gmail.com
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
  `;

  const textBody = `
${subject}

Hola ${userName},

${preheader}

1. QUÉ PASÓ
Evento: ${event.event_type}
Vigencia: ${validFromStr}, ${validFromTime} a ${validToTime} hrs.

2. SECTORES
- Costa Laguna (25m): ${event.impact_summary.costa_laguna}
- Antofagasta Ciudad: ${event.impact_summary.antofagasta_ciudad}
- Paranal / Armazones: ${event.impact_summary.paranal_armazones}

3. ACCIÓN RECOMENDADA
${event.recommended_action}

Próxima actualización: ${event.next_update_time}
Ver mapa en vivo: http://localhost:3000/
  `.trim();

  return {
    templateKey: key,
    subject,
    preheader,
    htmlBody,
    textBody
  };
}
