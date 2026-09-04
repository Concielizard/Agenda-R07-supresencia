import { Component, ChangeDetectionStrategy, inject, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { R07StorageService } from '../services/r07-storage.service';
import { GeminiService } from '../services/gemini.service';

interface TopicChip {
  label: string;
  icon: string;
  prompt: string;
}

@Component({
  selector: 'app-r07-chat-tab',
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col h-[calc(100vh-140px)] max-w-2xl mx-auto pb-2 animate-fadeIn">
      
      <!-- Chat Header / Title -->
      <div class="px-4 py-3 border-b flex items-center justify-between rounded-2xl mb-3 shadow-xs"
           [style.backgroundColor]="colors.surface"
           [style.borderColor]="colors.border">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl flex items-center justify-center text-lg shadow-xs"
               [style.backgroundColor]="colors.primaryLight"
               [style.color]="colors.primary">
            💬
          </div>
          <div>
            <h2 class="text-sm sm:text-base font-bold tracking-tight">Asistente Bíblico IA</h2>
            <p class="text-[11px]" [style.color]="colors.textSecondary">
              Consejería espiritual, oraciones y respuestas basadas en la Palabra
            </p>
          </div>
        </div>

        <button
          type="button"
          (click)="storage.clearChat()"
          title="Reiniciar conversación"
          class="p-2 rounded-xl border text-xs flex items-center gap-1 hover:opacity-80 transition cursor-pointer"
          [style.borderColor]="colors.border"
          [style.color]="colors.textMuted">
          <span class="material-icons text-sm">refresh</span>
          <span class="hidden sm:inline">Limpiar</span>
        </button>
      </div>

      <!-- Quick Topic Chips -->
      <div class="flex items-center gap-2 overflow-x-auto pb-2 px-1 scrollbar-none mb-2">
        @for (chip of topicChips; track chip.label) {
          <button
            type="button"
            (click)="selectTopic(chip)"
            class="px-3 py-1.5 rounded-full border text-[11px] font-semibold flex items-center gap-1.5 shrink-0 transition hover:scale-105 cursor-pointer shadow-2xs"
            [style.backgroundColor]="colors.surface"
            [style.borderColor]="colors.border"
            [style.color]="colors.textPrimary">
            <span>{{ chip.icon }}</span>
            <span>{{ chip.label }}</span>
          </button>
        }
      </div>

      <!-- Messages Stream -->
      <div #scrollContainer class="flex-1 overflow-y-auto space-y-3 px-1 py-2 pr-2">
        @for (msg of storage.chatMessages(); track msg.id) {
          <div [class]="msg.sender === 'user' ? 'flex justify-end' : 'flex justify-start'">
            <div class="max-w-[85%] sm:max-w-[80%] rounded-2xl px-4 py-3 shadow-xs text-xs sm:text-sm space-y-2 leading-relaxed"
                 [style.backgroundColor]="msg.sender === 'user' ? colors.primary : colors.surface"
                 [style.color]="msg.sender === 'user' ? '#ffffff' : colors.textPrimary"
                 [style.border]="msg.sender === 'user' ? 'none' : '1px solid ' + colors.border">
              
              <!-- Sender Header for Assistant -->
              @if (msg.sender === 'assistant') {
                <div class="flex items-center gap-1.5 font-bold text-[11px] opacity-75 pb-1 border-b"
                     [style.borderColor]="colors.border">
                  <span>{{ storage.logoSymbolIcon() }}</span>
                  <span>Agenda R07 • Consejero Espiritual</span>
                </div>
              }

              <!-- Text Content -->
              <p class="whitespace-pre-wrap">{{ msg.text }}</p>

              <!-- Scripture Badges -->
              @if (msg.scriptureRefs && msg.scriptureRefs.length > 0) {
                <div class="pt-2 flex flex-wrap gap-1.5">
                  @for (ref of msg.scriptureRefs; track ref) {
                    <span class="px-2 py-0.5 rounded-md text-[10px] font-bold shadow-2xs flex items-center gap-1"
                          [style.backgroundColor]="msg.sender === 'user' ? 'rgba(255,255,255,0.2)' : colors.primaryLight"
                          [style.color]="msg.sender === 'user' ? '#ffffff' : colors.primary">
                      <span class="material-icons text-[10px]">menu_book</span>
                      {{ ref }}
                    </span>
                  }
                </div>
              }

              <!-- Timestamp -->
              <span class="text-[9px] opacity-60 block text-right">
                {{ formatTime(msg.timestamp) }}
              </span>
            </div>
          </div>
        }

        <!-- Loading Bubble -->
        @if (gemini.isGenerating()) {
          <div class="flex justify-start">
            <div class="rounded-2xl px-4 py-3 border shadow-xs text-xs flex items-center gap-2"
                 [style.backgroundColor]="colors.surface"
                 [style.borderColor]="colors.border"
                 [style.color]="colors.textPrimary">
              <span class="inline-block w-2 h-2 rounded-full bg-amber-500 animate-bounce"></span>
              <span class="inline-block w-2 h-2 rounded-full bg-amber-500 animate-bounce [animation-delay:0.2s]"></span>
              <span class="inline-block w-2 h-2 rounded-full bg-amber-500 animate-bounce [animation-delay:0.4s]"></span>
              <span class="text-[11px] ml-1" [style.color]="colors.textMuted">Buscando en las Escrituras...</span>
            </div>
          </div>
        }
      </div>

      <!-- Input Bar -->
      <div class="pt-2">
        <form (ngSubmit)="sendMessage()" class="flex items-center gap-2">
          <div class="flex-1 relative" (click)="chatInputField.focus()">
            <input
              #chatInputField
              type="text"
              [(ngModel)]="inputText"
              name="chatInput"
              placeholder="¿Qué hay en tu corazón hoy? Pregunta o pide una oración..."
              [disabled]="gemini.isGenerating()"
              class="w-full pl-4 pr-11 py-3 rounded-2xl border text-xs sm:text-sm focus:outline-none focus:ring-2 shadow-xs transition"
              [style.backgroundColor]="colors.surface"
              [style.borderColor]="colors.border"
              [style.color]="colors.textPrimary">
            
            <button
              type="button"
              (click)="startVoicePrompt($event)"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition p-1 cursor-pointer">
              <span class="material-icons text-base">mic</span>
            </button>
          </div>

          <button
            type="submit"
            [disabled]="!inputText.trim() || gemini.isGenerating()"
            class="w-11 h-11 rounded-2xl text-white flex items-center justify-center transition disabled:opacity-40 hover:scale-105 cursor-pointer shadow-xs shrink-0"
            [style.backgroundColor]="colors.primary">
            <span class="material-icons text-base">send</span>
          </button>
        </form>
      </div>

    </div>
  `
})
export class R07ChatTab implements AfterViewChecked {
  public storage = inject(R07StorageService);
  public gemini = inject(GeminiService);

  @ViewChild('scrollContainer') private scrollContainer?: ElementRef;
  @ViewChild('chatInputField') private chatInputField?: ElementRef<HTMLInputElement>;

  public inputText: string = '';

  get colors() {
    return this.storage.currentThemeColors();
  }

  public topicChips: TopicChip[] = [
    { label: 'Sanar el dolor', icon: '🕊️', prompt: 'Necesito una palabra bíblica y una oración para sanar una herida emocional profunda y tener paz.' },
    { label: 'Perdón sincero', icon: '❤️', prompt: '¿Cómo puedo perdonar de corazón según las enseñanzas de Jesús cuando me han ofendido gravemente?' },
    { label: 'Dirección divina', icon: '🧭', prompt: 'Tengo que tomar una decisión importante. ¿Qué principios bíblicos me ayudan a discernir la voluntad de Dios?' },
    { label: 'Ansiedad & Paz', icon: '🌿', prompt: 'Siento mucha ansiedad hoy. Guíame en una oración y versículos para descansar en Su Presencia.' },
    { label: 'Restaurar familia', icon: '🏡', prompt: 'Una promesa bíblica y clamor de fe por la bendición, unidad y protección sobre mi hogar.' },
    { label: 'Declaración de fe', icon: '🔥', prompt: 'Escribe una declaración profética basada en la Palabra para afirmar mi identidad hoy.' }
  ];

  private lastMessageCount = 0;
  private forceScrollNext = false;

  ngAfterViewChecked(): void {
    const currentCount = this.storage.chatMessages().length;
    if (currentCount !== this.lastMessageCount || this.forceScrollNext) {
      this.lastMessageCount = currentCount;
      this.forceScrollNext = false;
      this.scrollToBottom();
    }
  }

  private scrollToBottom(): void {
    if (this.scrollContainer) {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    }
  }

  public selectTopic(chip: TopicChip): void {
    this.inputText = chip.prompt;
    this.sendMessage();
  }

  public async sendMessage(): Promise<void> {
    const text = this.inputText.trim();
    if (!text || this.gemini.isGenerating()) return;

    this.inputText = '';
    this.forceScrollNext = true;
    this.storage.addChatMessage('user', text);

    try {
      const response = await this.gemini.askBiblicalAssistant(text);
      this.storage.addChatMessage('assistant', response.text, response.scriptureRefs);
    } catch {
      this.storage.addChatMessage(
        'assistant',
        '«El Señor es mi pastor; nada me faltará» (Salmos 23:1). Confía en que Su gracia te sostiene.',
        ['Salmos 23:1']
      );
    }
  }

  public startVoicePrompt(ev?: Event): void {
    ev?.stopPropagation();
    this.chatInputField?.nativeElement?.focus();
    this.storage.showSnackbar('Teclado activo: escribe o usa el dictado por voz de tu teclado 🎙️');
  }

  public formatTime(ts: number): string {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
