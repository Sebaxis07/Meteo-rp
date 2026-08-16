# ⚡ MeteoAntofagasta Alerts

> **Sistema Autónomo de Monitoreo, Verificación de 3 Capas y Alertas Meteorológicas por Correo para Costa Laguna y la Región de Antofagasta.**

![React](https://img.shields.io/badge/Frontend-React%2018%20%7C%20TypeScript%20%7C%20Vite-blue?style=for-the-badge&logo=react)
![TailwindCSS](https://img.shields.io/badge/Styling-Corporate%20Dark%20%7C%20LED%20Cyan-00F0FF?style=for-the-badge&logo=tailwindcss)
![Python](https://img.shields.io/badge/Backend-Python%20SMTP%20%7C%20Vercel%20Serverless-yellow?style=for-the-badge&logo=python)
![Open-Meteo](https://img.shields.io/badge/Data%20Source-Open--Meteo%20API%20%7C%20MeteoChile-green?style=for-the-badge)

---

## 📋 Descripción del Proyecto

**MeteoAntofagasta Alerts** es una plataforma web integral diseñada para monitorear, auditar y notificar eventos meteorológicos (lluvia, nieve en cordillera, ráfagas de viento y descensos de la Isoterma Cero) en la Región de Antofagasta, con especial foco en el sector residencial costero de **Costa Laguna** y altitudes de la Cordillera de la Costa.

El sistema funciona de manera **100% autónoma**, consultando fuentes meteorológicas reales (API de Open-Meteo y boletines oficiales de MeteoChile / SENAPRED). Cuando detecta un cambio relevante, envía automáticamente correos electrónicos de **Actualización** a las casillas de los suscriptores mediante **Gmail SMTP SSL**.

---

## ✨ Características Principales

### 📅 1. Calendario de Pronóstico a 7 Días por Hora
- Consulta en tiempo real las variables meteorológicas tramo por tramo (cada 3 horas) para los 21 sectores de la región.
- Visualiza la **probabilidad de lluvia (%)**, **acumulación (mm/h)**, **nieve (cm)**, **temperatura (°C)** y **altura de la Isoterma Cero (m.s.n.m.)**.

### 🛡️ 2. Motor de Verificación de 3 Capas (`verify_event_claim`)
- Separa la **Recolección**, **Validación** y **Decisión Operativa**.
- Algoritmo de puntuación de confianza de 0 a 100 puntos evaluando coherencia espacial y altitudinal (ej. diferencia entre nivel del mar 25m en Costa Laguna y altitudes >2.200m en Paranal / Armazones).

### 📧 3. Sistema de Notificaciones por Correo Electrónico (Gmail SMTP)
- Remitente oficial configurado: `thefilex07@gmail.com`.
- **6 Plantillas Oficiales de Correo**:
  1. `Nuevo Evento Confirmado` (`[Antofagasta] Riesgo en sectores altos`)
  2. `Actualización Relevante` (`[Antofagasta] Cambio detectado`)
  3. `Sin Riesgo para la Zona`
  4. `Escalada de Riesgo`
  5. `Corrección de Monitoreo`
  6. `Fin del Evento`
- **Correo Real de Confirmación de Inscripción**: Enviado al instante cuando un usuario registra su casilla ("*Oye, te has inscrito en esto*").
- Botón para **reenviar correos de prueba** a voluntad a cualquier dirección de correo.

### ⚡ 4. Monitoreo Autónomo en Segundo Plano
- El backend ejecuta una tarea autónoma continua (Auto-Polling cada 15 minutos).
- Detecta cambios reales en la Isoterma Cero o vientos y despacha las notificaciones por correo de manera **100% automática sin requerir que los usuarios tengan la web abierta**.

### 🔐 5. Control de Acceso por Roles (RBAC)
- **Modo Usuario**: Interfaz limpia, modal de bienvenida (*"¿Quieres que te notifiquemos?"*), calendario de lluvia a 7 días, mapa interactivo y gestión de preferencias.
- **Modo Administrador**: Panel de control técnico protegido por contraseña estricta (`Dpastora2#` para `thefilex07@gmail.com`), auditoría de avisos oficiales y control de suscriptores.

---

## 📍 Catálogo Maestro de 21 Sectores

| Macrozona | Sectores Incluidos |
| :--- | :--- |
| **Sector Norte** | 🌊 Costa Laguna (25m), 🌊 La Portada Litoral, 🏖️ Acceso Juan López / B-446, 🏡 La Chimba, ⛰️ La Chimba Alto, 🏙️ Bonilla, 🏢 Los Arenales. |
| **Sector Centro** | 🏛️ Centro Histórico, 🚉 Barrio Estación, 🌳 Bellavista, 🏞️ Parque Brasil, 🌊 Avenida Grecia / Gran Vía, 🏭 Salar del Carmen. |
| **Sector Sur** | ⚓ Coloso, 🏡 Coviefi, 🌺 Jardines del Sur, 🎓 Angamos Sur / UCN, 🏖️ Balneario Municipal / El Huáscar. |
| **Cordillera Regional** | 🔭 Cerro Paranal / VLT (2.635m), 🏔️ Cerro Armazones / ELT (3.046m), ⛰️ Sierra Vicuña Mackenna, 🌵 Paso Sico / Precordillera. |

---

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React (Íconos).
- **Mapas**: Leaflet / React-Leaflet con azulejos oscuros corporativos de CartoDB.
- **Backend SMTP**: Python 3 (servidor `HTTP` nativo + cliente `smtplib` SSL en puerto 465).
- **Despliegue Serverless**: Vercel Python Serverless Functions (`api/send_email.py` & `api/cron.py`).

---

## 🚀 Instalación y Ejecución Local

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/meteo-antofagasta.git
cd meteo-antofagasta
```

### 2. Instalar dependencias del Frontend
```bash
npm install
```

### 3. Configurar el archivo `.env`
Crea un archivo `.env` en la raíz del proyecto con las siguientes credenciales:

```env
# Configuración de Servidor de Correos Gmail SMTP
GMAIL_SENDER=thefilex07@gmail.com
GMAIL_APP_PASSWORD=linrkasyfquqkvgw

# Credenciales de Administrador para la Interfaz
ADMIN_EMAIL=thefilex07@gmail.com
ADMIN_PASS=Dpastora2#
```

### 4. Iniciar el Servidor Backend de Correos en Python
```bash
python backend_email_server.py
```
*(Se ejecutará en `http://localhost:5000/` con el hilo de investigación autónoma activo).*

### 5. Iniciar la aplicación Frontend
```bash
npm run dev
```
*(Abre en tu navegador `http://localhost:3000/` o la URL indicada por Vite).*

---

## ☁️ Guía de Despliegue en Vercel (Gratuito)

El proyecto está listo para ser desplegado en **Vercel** en menos de 2 minutos:

1. **Subir a GitHub**: Realiza un `git push` de todo el proyecto a tu cuenta de GitHub.
2. **Importar en Vercel**: Ve a [Vercel.com](https://vercel.com/) -> **Add New** -> **Project** e importa tu repositorio.
3. **Variables de Entorno**: En la pestaña **Environment Variables**, agrega:
   - `GMAIL_SENDER` = `thefilex07@gmail.com`
   - `GMAIL_APP_PASSWORD` = `linrkasyfquqkvgw`
   - `ADMIN_EMAIL` = `thefilex07@gmail.com`
   - `ADMIN_PASS` = `Dpastora2#`
4. **Desplegar**: Haz clic en **Deploy**. Vercel compilará React y desplegará la función Serverless Python en `/api/send_email`.

### 🔄 Configurar Investigación Autónoma Gratuita (Cada 15 min)
Como la cuenta gratuita de Vercel (Hobby) limita los crons internos a 1 vez por día, usa **[cron-job.org](https://cron-job.org/)** (100% gratis):

1. Crea una cuenta en [cron-job.org](https://cron-job.org/).
2. Crea un **Cronjob** apuntando a tu URL pública de Vercel:
   `https://tu-proyecto.vercel.app/api/cron`
3. Ajusta la frecuencia a **Every 15 minutes**.
4. ¡Listo! **Cron-job.org** activará la investigación autónoma cada 15 minutos en la nube y se enviarán los correos de **Actualización** de forma 100% automática.

---

## 📜 Licencia

Desarrollado para el sistema de alertamiento de **Costa Laguna & Región de Antofagasta**.
