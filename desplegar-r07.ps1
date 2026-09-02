# ============================================================
#  Agenda R07 - Pasa tiempo Conmigo
#  Script de verificacion, build, despliegue y APK
#  Generado tras la auditoria del 2026-09-02
#  Uso:  powershell -ExecutionPolicy Bypass -File .\desplegar-r07.ps1
# ============================================================

$ErrorActionPreference = "Stop"
$proj = "C:\Users\Usuario\.gemini\antigravity\scratch\Agenda-R07-supresencia"
Set-Location $proj

function Paso($n, $t) { Write-Host "`n=== PASO $n : $t ===" -ForegroundColor Cyan }

Paso 1 "Estado del repositorio"
git status --short
git log -n 3 --oneline

Paso 2 "Build de Angular 19 (debe terminar sin errores)"
npm run build
if ($LASTEXITCODE -ne 0) { Write-Host "BUILD FALLIDO - se detiene aqui." -ForegroundColor Red; exit 1 }

Paso 3 "Verificar contenido de dist/r07-agenda/browser"
Get-ChildItem "dist\r07-agenda\browser" | Select-Object Name, Length
Get-ChildItem "dist\r07-agenda\browser\icons" | Select-Object Name, Length
if (Test-Path "dist\r07-agenda\browser\_redirects") {
  Write-Host "OK: _redirects presente" -ForegroundColor Green
} else {
  Write-Host "FALTA _redirects en el build" -ForegroundColor Red
}

Paso 4 "Commit y push a origin/main"
git add .
git commit -m "fix(core): corregir orden de inicializacion de senales en R07StorageService

La senal edition() se declaraba despues de allWeeks, por lo que la cadena
loadInitialWeeks() -> createDefaultWeek() -> createEmptyDay() ejecutaba
this.edition() cuando aun era undefined. Esto lanzaba
'TypeError: this.edition is not a function' y dejaba la app en pantalla
blanca para todo usuario sin datos previos en localStorage (iOS WebClip,
navegador nuevo, modo privado).

- Mover el bloque de Customization Signals antes de userProfile/allWeeks
- Guardas de typeof localStorage en loadInitialProfile y loadInitialWeeks
- Renombrar encabezado del modulo IA (ya no expone 'Clave de API Gemini')"
git push origin main
Write-Host "Netlify reconstruira automaticamente https://r07.netlify.app/" -ForegroundColor Green

Paso 5 "Sincronizar Capacitor Android"
npx cap sync android

Paso 6 "Compilar APK de depuracion"
.\android\gradlew.bat -p android assembleDebug
$apk = "android\app\build\outputs\apk\debug\app-debug.apk"
if (Test-Path $apk) {
  Write-Host "APK generado: $((Resolve-Path $apk).Path)" -ForegroundColor Green
  Write-Host "Instalar en el telefono con:  adb -s xouw85buirr4694d install -r `"$apk`"" -ForegroundColor Yellow
} else {
  Write-Host "No se encontro el APK." -ForegroundColor Red
}

Paso 7 "Verificar el sitio publicado (esperar ~2 min al deploy de Netlify)"
Start-Sleep -Seconds 120
$r = Invoke-WebRequest -Uri "https://r07.netlify.app/" -UseBasicParsing
Write-Host "HTTP $($r.StatusCode)"
if ($r.Content -match 'apple-touch-icon\.png') { Write-Host "OK: apple-touch-icon presente" -ForegroundColor Green }
if ($r.Content -match 'manifest\.webmanifest')  { Write-Host "OK: manifest presente" -ForegroundColor Green }
if ($r.Content -match 'main-[A-Z0-9]+\.js')     { Write-Host "OK: bundle -> $($Matches[0])" -ForegroundColor Green }

Write-Host "`nListo. Abre https://r07.netlify.app/ en el iPhone en una pestana NUEVA y vuelve a 'Anadir a pantalla de inicio'." -ForegroundColor Cyan
