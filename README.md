# 📖 Agenda Devocional R07 — «Pasa tiempo Conmigo»

[![Angular](https://img.shields.io/badge/Angular-19.1-DD0031.svg)](https://angular.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6.svg)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC.svg)](https://tailwindcss.com)
[![Express](https://img.shields.io/badge/Express-SSR_%26_AI_API-000000.svg)](https://expressjs.com)
[![Gemini](https://img.shields.io/badge/Google_Gemini-3.7_Flash-4285F4.svg)](https://ai.google.dev)

**Agenda Devocional R07** es una aplicación web full-stack moderna desarrollada en **Angular 19 (Signals & Zoneless SSR)** y **Node.js Express** con estilos en **Tailwind CSS v4**. Está diseñada para acompañar y estructurar el tiempo devocional diario de 7 días, combinando la metodología R07 de 4 pasos, integración bíblica offline y en línea (RVR1960 y NTV), temporizador de oración, muro de testimonios, escáner OCR de libretas manuscritas con Gemini 3.7 Flash, y exportación oficial de reportes en PDF y resúmenes para WhatsApp dirigidos a líderes de célula y pastores.

---

## ✨ Características Principales

### 🕊️ 1. Método Devocional R07 (4 Pasos Diarios)
- **Paso 1: Encuentro y Lectura Bíblica**: Registro de fecha, hora, estado de ánimo y cita bíblica del día.
- **Paso 2: Rhema («Dios me habló»)**: Principio eterno, promesa o convicción que resalta al corazón.
- **Paso 3: Reflexión Personal**: Aplicación práctica y meditación honesta en las decisiones diarias.
- **Paso 4: Compromiso y Oración**: Declaración de fe, pasos de obediencia y oración escrita.

### 📚 2. Biblia Integrada (66 Libros - RVR1960 y NTV)
- Explorador bíblico con búsqueda instantánea de libros, testamentos y capítulos.
- Selector de temas devocionales clave (*Paz, Confianza, Intimidad, Fortaleza*).
- Carga de capítulos en vivo y versículos precargados para funcionamiento sin conexión.

### 🙏 3. Módulo de Oración & Clamor
- **Temporizador de Oración** con selector de minutos, barra de progreso circular y citas inspiradoras.
- Control de asistencia a los 2 Tiempos de Clamor Semanal y Culto Dominical.
- Registro de **Peticiones de Oración** con categorías, contador de intercesión y marcado de respuestas.
- **Muro de Testimonios** («¡Dios Respondió!») para celebrar la fidelidad del Señor.

### 📊 4. Matriz Semanal & Metas Espirituales
- Hoja de consolidación de 7 días con estados de cumplimiento en tiempo real.
- Metas semanales categorizadas con seguimiento de avance visual.
- Asistencia a Grupo de Conexión, reflexiones grupales y motivos de ausencia justificados.

### 🤖 5. Inteligencia Espiritual con Google Gemini 3.7 Flash
- **Inspiración Devocional**: Generación de mensajes, aplicaciones prácticas y oraciones guiadas basadas en el pasaje bíblico y estado de ánimo.
- **Orador Guiado (4 Pilares)**: Asistente para estructurar oraciones personales (Adoración, Confesión, Petición, Gratitud).
- **Resumen para Líderes**: Síntesis semanal ejecutiva lista para rendir cuentas a líderes de célula.
- **Escáner OCR de Libreta**: Transcripción y digitalización inteligente de fotos de cuadernos manuscritos.

### 📄 6. Exportador PDF Oficial & WhatsApp
- Generación de informe semanal membretado R07 en formato A4 con tablas de registro y anexos fotográficos (`jsPDF` + `jspdf-autotable`).
- Generación de resumen estructurado para compartir por WhatsApp con un solo clic.

### 🎨 7. Sistema de Diseño Multi-Edición
- **Edición Hombres** (Azul Real / Cobalto) y **Edición Mujeres** (Rosa Suave / Oro Rosa).
- **5 Paletas de Color**: Rosa Pastel, Lavanda, Menta Esmeralda, Dorado Real y Azul Índigo.
- **Modo Claro y Modo Oscuro** calibrados en contraste y legibilidad.

---

## 🛠️ Arquitectura y Tecnologías

- **Frontend**: Angular 19 con Signals reactivos y modo Zoneless (`provideExperimentalZonelessChangeDetection`).
- **Estilos**: Tailwind CSS v4 con variables de diseño temático.
- **Backend / SSR**: Express.js con `@angular/ssr/node` sirviendo la aplicación y proxiando las llamadas a la API de Gemini de forma segura.
- **Persistencia**: Almacenamiento local reactivo (`localStorage`) con soporte offline e importación/exportación JSON.
- **Generación de Documentos**: `jspdf` y `jspdf-autotable`.

---

## 🚀 Instalación y Ejecución

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Configurar la clave de API de Gemini (opcional pero recomendado para funciones de IA):
   ```bash
   cp .env.example .env
   # Agregar GEMINI_API_KEY=tu_clave
   ```

3. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```
   Accede en `http://localhost:3000`.

4. Compilación para producción:
   ```bash
   npm run build
   ```

---

## 📄 Licencia

Desarrollado con dedicación para la comunidad devocional de la **Agenda R07**.
