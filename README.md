# 📖 Agenda Devocional R07 — «Pasa tiempo Conmigo»

[![Android](https://img.shields.io/badge/Platform-Android-green.svg)](https://developer.android.com)
[![Kotlin](https://img.shields.io/badge/Kotlin-2.0.21-purple.svg)](https://kotlinlang.org)
[![Jetpack Compose](https://img.shields.io/badge/Jetpack%20Compose-Material%203-blue.svg)](https://developer.android.com/jetpack/compose)
[![Database](https://img.shields.io/badge/Room-SQLite%20Offline-orange.svg)](https://developer.android.com/training/data-storage/room)

**Agenda Devocional R07** es una aplicación móvil nativa en **Android / Jetpack Compose** diseñada para acompañar y estructurar el tiempo devocional diario de 7 días. Combina el método devocional R07 de 4 pasos, integración bíblica 100% offline, gestión de oración, metas espirituales, reconocimiento de escritura a mano (OCR) y exportación oficial de reportes en PDF para líderes y pastores.

---

## ✨ Características Principales

### 🕊️ 1. Método Devocional R07 (4 Pasos Diarios)
- **Paso 1: Encuentro y Lectura Bíblica**: Registro de hora, estado de ánimo y cita bíblica del día.
- **Paso 2: Rhema («Dios me habló»)**: Principio eterno o promesa que resalta al corazón.
- **Paso 3: Reflexión Personal**: Aplicación práctica y meditación honesta en las decisiones diarias.
- **Paso 4: Compromiso y Oración**: Declaración de fe y oración escrita.

### 📚 2. Biblia Integrada Offline (66 Libros)
- Versiones **Reina Valera 1960 (RVR1960)** y **Nueva Traducción Viviente (NTV)**.
- **Lector Completo**: Lectura continua de capítulos con selector rápido de testamentos y libros.
- **Selector Inteligente de Versículos**: Búsqueda por temas clave (*Paz, Sabiduría, Fuerza, Propósito*) e inserción por rango o cita.

### 🙏 3. Módulo de Oración & Clamor
- **Cronómetro de Oración** para tiempos a solas con Dios.
- Control de asistencia a los 2 Tiempos de Clamor Semanal.
- Registro de **Peticiones de Oración** con contador de intercesión.
- **Muro de Testimonios** («¡Dios Respondió!») para celebrar y registrar la fidelidad divina.

### 📊 4. Matriz Semanal & Metas Espirituales
- Hoja de consolidación de 7 días con estados de cumplimiento.
- Metas espirituales con barra de progreso dinámico en tiempo real.

### 📷 5. Escáner OCR de Notas Manuscritas
- Captura fotos de tu libreta física o notas escritas y digitaliza automáticamente los 4 pasos hacia el diario de la aplicación.

### 📄 6. Exportador PDF Oficial para Líderes
- Generación de informe semanal membretado R07 listo para enviar por WhatsApp o correo a tu líder o pastor.

### 🎨 7. Motor de Temas y Sistema de Diseño Premium
- **Modo Claro y Modo Oscuro (Dark Mode)** completamente calibrados en contraste y accesibilidad.
- **5 Paletas de Color**: Rosa Pastel, Lavanda Pastel, Menta Esmeralda, Dorado Real y Azul Índigo.
- **4 Familias Tipográficas**: Moderna (Inter), Elegante (Serif), Cálida (Rounded), Compacta (Condensed).
- **Logotipos Dinámicos**: Símbolos bíblicos personalizables (León de Judá, Paloma y Cruz, Libro Abierto, Corona Real, Espiga de Trigo, Escudo de Fe).

---

## 🛠️ Arquitectura y Tecnologías

- **Lenguaje**: Kotlin 2.0.21 / JVM 21
- **UI**: Jetpack Compose con Material 3 Design Tokens
- **Patrón**: MVI / MVVM reactivo con `StateFlow`
- **Base de Datos**: Room SQLite local
- **Exportación**: Generación nativa de PDF con `android.graphics.pdf.PdfDocument`

---

## 🚀 Compilación y Ejecución

1. Clona el repositorio:
   ```bash
   git clone https://github.com/juansantiagogonzalezmarin/Remix-Agenda-R07.git
   cd Remix-Agenda-R07
   ```
2. Abre el proyecto en **Android Studio**.
3. Compila y ejecuta en tu dispositivo o emulador:
   ```bash
   ./gradlew assembleDebug
   ```

---

## 📄 Licencia

Desarrollado para la comunidad devocional de la **Agenda R07**.
Todos los derechos reservados.
