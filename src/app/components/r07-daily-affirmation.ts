import { Component, ChangeDetectionStrategy, inject, signal, output, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { R07StorageService } from '../services/r07-storage.service';
import { DailyScripturePlan } from '../models/r07.models';

@Component({
  selector: 'app-r07-daily-affirmation',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rounded-3xl p-5 sm:p-6 border shadow-xs mb-4 relative overflow-hidden transition-colors duration-300"
         [style.backgroundColor]="colors.surface"
         [style.borderColor]="colors.border"
         [style.color]="colors.textPrimary">
      
      <!-- Subtle Spiritual Watermark -->
      <div class="absolute -right-4 -bottom-6 text-7xl sm:text-8xl opacity-10 select-none pointer-events-none">
        {{ storage.logoSymbolIcon() }}
      </div>

      <div class="flex flex-col gap-4 relative z-10">
        
        <!-- Header Row -->
        <div class="flex items-center justify-between gap-2 flex-wrap">
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1"
                  [style.backgroundColor]="colors.primaryLight"
                  [style.color]="colors.primary">
              <span>{{ storage.logoSymbolIcon() }}</span>
              <span>{{ storage.edition() === 'female' ? '🌸 Proverbios 31' : '🛡️ Valientes' }} — Lectura del Día</span>
            </span>
          </div>

          <!-- Bible Reference Button — opens Bible tab on that exact chapter -->
          <button
            type="button"
            (click)="openBibleToToday()"
            class="text-xs font-bold flex items-center gap-1 transition hover:opacity-80 cursor-pointer"
            [style.color]="colors.primary">
            <span class="material-icons text-sm">menu_book</span>
            <span>{{ todayPlanRef() }}</span>
          </button>
        </div>

        <!-- Daily Scripture Title -->
        @if (todayPlan(); as plan) {
          <div class="rounded-2xl p-4 border"
               [style.backgroundColor]="colors.primaryLight"
               [style.borderColor]="colors.border">
            <p class="text-[11px] font-extrabold uppercase tracking-widest mb-1"
               [style.color]="colors.primary">
              📖 Pasaje de Hoy: {{ plan.book }} {{ plan.chapter }}:{{ plan.verses }}
            </p>
            <blockquote class="italic text-sm sm:text-base leading-relaxed {{ storage.fontClass() }}"
                        [style.color]="colors.textPrimary">
              «{{ plan.scriptureSnippet }}»
            </blockquote>
          </div>
        }

        <!-- Affirmation / Declaration -->
        <div class="space-y-2 {{ storage.fontClass() }}">
          <p class="text-[10px] font-extrabold uppercase tracking-widest"
             [style.color]="colors.primary">
            ✨ Declaración del Día
          </p>
          <blockquote class="italic text-base sm:text-lg leading-relaxed font-serif"
                      [style.color]="colors.textPrimary">
            @if (todayPlan()?.dailyAffirmation) {
              «{{ todayPlan()!.dailyAffirmation }}»
            } @else if (storage.edition() === 'female') {
              «Soy una mujer sabia, revestida de fortaleza y dignidad; mi boca habla con sabiduría.» (Proverbios 31:25-26)
            } @else {
              «Soy un hombre de fe e integridad; el Señor endereza mis pasos y me ciñe de poder.» (Salmos 18:32)
            }
          </blockquote>
          <p class="text-xs" [style.color]="colors.textSecondary">
            Pasa tiempo con Dios: medita en Su palabra, escucha Su voz en el secreto y anota lo que Él te habló.
          </p>
        </div>

        <!-- Quick Interactive Action Bar -->
        <div class="pt-2 border-t flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none"
             [style.borderColor]="colors.border">
          
          <!-- 📖 Open today's Bible passage -->
          <button
            type="button"
            (click)="openBibleToToday()"
            class="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition hover:scale-105 cursor-pointer shadow-2xs text-white"
            [style.backgroundColor]="colors.primary">
            <span>📖</span>
            <span>Abrir Lectura de Hoy</span>
          </button>

          <!-- 💛 Heart Reflection -->
          <button
            type="button"
            (click)="openHeartReflection.emit()"
            class="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition hover:scale-105 cursor-pointer shadow-2xs"
            [style.backgroundColor]="colors.primaryLight"
            [style.color]="colors.primary">
            <span>💛</span>
            <span>¿Qué hay en tu corazón?</span>
          </button>

          <!-- AI Devotional Modal -->
          <button
            type="button"
            (click)="openAiDevotional.emit()"
            class="px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 shrink-0 transition hover:opacity-80 cursor-pointer"
            [style.borderColor]="colors.border"
            [style.backgroundColor]="colors.background"
            [style.color]="colors.textPrimary">
            <span class="material-icons text-sm text-amber-500">auto_awesome</span>
            <span>Comentar con IA</span>
          </button>

          <!-- 💬 Asistente Bíblico IA Direct Tab -->
          <button
            type="button"
            (click)="storage.setMobileTab('chat')"
            class="px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 shrink-0 transition hover:scale-105 cursor-pointer shadow-2xs"
            [style.borderColor]="colors.border"
            [style.backgroundColor]="colors.background"
            [style.color]="colors.textPrimary">
            <span class="material-icons text-sm text-sky-500">chat</span>
            <span>Chat Bíblico IA</span>
          </button>

          <!-- OCR Scan -->
          <button
            type="button"
            (click)="openOcrModal.emit()"
            class="px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 shrink-0 transition hover:opacity-80 cursor-pointer"
            [style.borderColor]="colors.border"
            [style.backgroundColor]="colors.background"
            [style.color]="colors.textPrimary">
            <span class="material-icons text-sm text-rose-500">document_scanner</span>
            <span>Escanear Foto</span>
          </button>

          <!-- Guided Prayer -->
          <button
            type="button"
            (click)="openAiPrayer.emit()"
            class="px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 shrink-0 transition hover:opacity-80 cursor-pointer"
            [style.borderColor]="colors.border"
            [style.backgroundColor]="colors.background"
            [style.color]="colors.textPrimary">
            <span class="material-icons text-sm text-emerald-500">favorite</span>
            <span>Oración Guiada</span>
          </button>

          <!-- Prayer Timer Toggle -->
          <button
            type="button"
            (click)="togglePrayerTimer()"
            class="px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 shrink-0 transition hover:opacity-80 cursor-pointer"
            [style.borderColor]="colors.border"
            [style.backgroundColor]="isTimerRunning() ? colors.primary : colors.background"
            [style.color]="isTimerRunning() ? '#ffffff' : colors.textPrimary">
            <span class="material-icons text-sm">timer</span>
            <span>{{ isTimerRunning() ? timerDisplay() : 'Temporizador Oración' }}</span>
          </button>

        </div>

        <!-- Prayer Timer Active Bar -->
        @if (showTimerControls()) {
          <div class="pt-3 border-t flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeSlideUp"
               [style.borderColor]="colors.border">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold" [style.color]="colors.primary">
                ⏱️ Tiempo en el Secreto:
              </span>
              <span class="text-base font-extrabold font-mono tracking-wider px-3 py-1 rounded-xl"
                    [style.backgroundColor]="colors.primaryLight"
                    [style.color]="colors.primary">
                {{ timerDisplay() }}
              </span>
            </div>

            <div class="flex items-center gap-1.5">
              <button
                type="button"
                (click)="setTimerDuration(300)"
                class="px-2.5 py-1 rounded-lg border text-[11px] font-bold transition hover:opacity-80 cursor-pointer"
                [style.borderColor]="colors.border"
                [style.backgroundColor]="colors.background"
                [style.color]="colors.textPrimary">
                5 min
              </button>
              <button
                type="button"
                (click)="setTimerDuration(600)"
                class="px-2.5 py-1 rounded-lg border text-[11px] font-bold transition hover:opacity-80 cursor-pointer"
                [style.borderColor]="colors.border"
                [style.backgroundColor]="colors.background"
                [style.color]="colors.textPrimary">
                10 min
              </button>
              <button
                type="button"
                (click)="setTimerDuration(900)"
                class="px-2.5 py-1 rounded-lg border text-[11px] font-bold transition hover:opacity-80 cursor-pointer"
                [style.borderColor]="colors.border"
                [style.backgroundColor]="colors.background"
                [style.color]="colors.textPrimary">
                15 min
              </button>

              @if (!isTimerRunning()) {
                <button
                  type="button"
                  (click)="startTimer()"
                  class="px-3.5 py-1 rounded-xl text-white text-xs font-bold shadow-xs hover:opacity-90 transition cursor-pointer"
                  [style.backgroundColor]="colors.primary">
                  Iniciar
                </button>
              } @else {
                <button
                  type="button"
                  (click)="pauseTimer()"
                  class="px-3.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-bold shadow-xs transition cursor-pointer">
                  Pausar
                </button>
              }

              <button
                type="button"
                (click)="resetTimer()"
                class="p-1 rounded-lg hover:bg-stone-200/50 text-stone-400 transition cursor-pointer"
                title="Reiniciar">
                <span class="material-icons text-base">replay</span>
              </button>
            </div>
          </div>
        }

      </div>
    </div>
  `
})
export class R07DailyAffirmation implements OnDestroy {
  public storage = inject(R07StorageService);

  public openHeartReflection = output<void>();
  public openAiDevotional = output<void>();
  public openBibleReader = output<void>();
  public openOcrModal = output<void>();
  public openAiPrayer = output<void>();

  // Today's dynamic scripture plan
  public todayPlan = computed<DailyScripturePlan | null>(() => this.storage.getTodayScripturePlan());

  public todayPlanRef = computed<string>(() => {
    const plan = this.todayPlan();
    if (!plan) return 'Biblia';
    return `${plan.book} ${plan.chapter}:${plan.verses}`;
  });

  public openBibleToToday(): void {
    this.storage.openBibleReadingForToday();
    this.openBibleReader.emit();
  }

  // Prayer Timer State
  public showTimerControls = signal<boolean>(false);
  public isTimerRunning = signal<boolean>(false);
  public totalSeconds = signal<number>(300); // 5 mins default
  public remainingSeconds = signal<number>(300);
  private timerInterval?: any;
  private audioContext?: AudioContext;

  get colors() {
    return this.storage.currentThemeColors();
  }

  ngOnDestroy(): void {
    this.pauseTimer();
    if (this.audioContext) {
      try {
        this.audioContext.close();
      } catch {}
    }
  }

  public timerDisplay(): string {
    const total = this.remainingSeconds();
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  public togglePrayerTimer(): void {
    this.showTimerControls.update((v: boolean) => !v);
  }

  public setTimerDuration(seconds: number): void {
    this.pauseTimer();
    this.totalSeconds.set(seconds);
    this.remainingSeconds.set(seconds);
  }

  public startTimer(): void {
    if (this.isTimerRunning()) return;
    this.isTimerRunning.set(true);

    // Pre-warm AudioContext on direct user tap so iOS WebKit doesn't block the end chime
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        if (!this.audioContext) {
          this.audioContext = new AudioCtx();
        }
        if (this.audioContext.state === 'suspended') {
          this.audioContext.resume();
        }
      }
    } catch {}

    this.timerInterval = setInterval(() => {
      const current = this.remainingSeconds();
      if (current <= 1) {
        this.completeTimer();
      } else {
        this.remainingSeconds.set(current - 1);
      }
    }, 1000);
  }

  public pauseTimer(): void {
    this.isTimerRunning.set(false);
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  public resetTimer(): void {
    this.pauseTimer();
    this.remainingSeconds.set(this.totalSeconds());
  }

  private completeTimer(): void {
    this.pauseTimer();
    this.remainingSeconds.set(0);
    this.playChime();
    this.storage.showSnackbar('🕊️ ¡Gloria a Dios! Has completado tu tiempo de intimidad y oración.');
  }

  private playChime(): void {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = this.audioContext || (AudioCtx ? new AudioCtx() : null);
      if (ctx) {
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(528, ctx.currentTime); // Solfeggio 528Hz frequency
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 1.8);
      }
    } catch {
      // Audio not supported
    }
  }
}


