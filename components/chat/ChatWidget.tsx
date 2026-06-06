class PortfolioChatbot {
  private containerId = 'chat-widget-container';
  private isOpen = false;
  private isMaximized = false;
  private chatHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [];
  private typingIndicatorEl: HTMLDivElement | null = null;
  private messagesContainerEl: HTMLDivElement | null = null;
  private inputEl: HTMLInputElement | null = null;
  private sendBtnEl: HTMLButtonElement | null = null;
  private windowEl: HTMLDivElement | null = null;
  private toggleBtnEl: HTMLButtonElement | null = null;

  constructor() {
    this.loadHistory();
    this.init();
  }

  private loadHistory() {
    this.chatHistory = [
      {
        role: 'assistant',
        content: "Hello! I'm Mithun's AI portfolio assistant. Ask me anything about his projects (like Ship Spy Live), skills, engineering experience, or how to contact him!"
      }
    ];
  }

  private saveHistory() {
    // In-memory only; history resets on refresh
  }

  private init() {
    if (document.getElementById(this.containerId)) return;

    const container = document.createElement('div');
    container.id = this.containerId;
    container.className = 'fixed bottom-6 right-6 z-[9999] flex flex-col items-end font-sans';

    container.innerHTML = this.renderHTML();
    document.body.appendChild(container);

    this.windowEl = container.querySelector('.chat-window');
    this.toggleBtnEl = container.querySelector('.chat-widget-button');
    this.messagesContainerEl = container.querySelector('.chat-messages-container');
    this.inputEl = container.querySelector('.chat-input');
    this.sendBtnEl = container.querySelector('.chat-send-btn');

    this.registerEvents(container);
    this.renderMessages();
  }

  private renderHTML(): string {
    return `
      <!-- Floating Chat Button (Holographic AI Core) -->
      <button class="chat-widget-button w-14 h-14 bg-[#0a0a0a]/90 border border-[#00d2ff]/30 text-[#00d2ff] rounded-full flex items-center justify-center backdrop-blur-md cursor-pointer select-none transition-all duration-300 relative focus:outline-none pulse-neon-btn">
        <svg class="w-7 h-7" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="38" stroke="currentColor" stroke-width="2.5" stroke-dasharray="12 6" />
          <circle cx="50" cy="50" r="26" stroke="currentColor" stroke-width="1.5" />
          <circle cx="50" cy="50" r="14" fill="currentColor" fill-opacity="0.85" />
          <circle cx="50" cy="50" r="5" fill="#fff" />
          <path d="M50 8 L50 20 M50 80 L50 92 M8 50 L20 50 M80 50 L92 50" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
        </svg>
        <span class="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#00d2ff] rounded-full border-2 border-[#0a0a0a] animate-ping"></span>
        <span class="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#00d2ff] rounded-full border-2 border-[#0a0a0a]"></span>
      </button>

      <!-- Chat Window -->
      <div class="chat-window fixed bottom-24 right-6 w-[380px] h-[520px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-120px)] bg-[#050505]/95 border border-[#2a2a2a] rounded-2xl flex flex-col overflow-hidden backdrop-blur-xl shadow-[0_10px_35px_rgba(0,210,255,0.15)] transition-all duration-300">
        <!-- Header -->
        <div class="chat-header px-4 py-3 bg-[#2a2a2a]/20 border-b border-[#2a2a2a]/40 flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="relative w-8 h-8 rounded-full bg-[#00d2ff]/10 border border-[#00d2ff]/30 flex items-center justify-center">
              <svg class="w-4.5 h-4.5 text-[#00d2ff]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="30" stroke="currentColor" stroke-width="8" />
                <circle cx="50" cy="50" r="10" fill="currentColor" />
              </svg>
              <span class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#00d2ff] rounded-full border border-[#0a0a0a] animate-pulse"></span>
            </div>
            <div>
              <h3 class="font-tech text-[10px] font-bold text-white tracking-widest uppercase">SYS.CORE // AI_CONN.09</h3>
              <p class="text-[8px] font-mono text-[#00d2ff]/80 uppercase">LOC: SEC_0xFB82 // ONLINE</p>
            </div>
          </div>
          <div class="flex items-center gap-3.5">
            <!-- Telemetry Pulse Waveform -->
            <div class="telemetry-pulse">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div class="flex items-center gap-1">
              <!-- Maximize Button -->
              <button class="chat-maximize-btn p-1.5 hover:bg-white/5 rounded text-[#8a8a8a] hover:text-white transition-colors focus:outline-none" title="Toggle Size">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5 max-icon">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75v4.5m0-4.5h-4.5m4.5 0L15 9m5.25 11.25v-4.5m0 4.5h-4.5m4.5 0L15 15" />
                </svg>
              </button>
              <!-- Minimize Button -->
              <button class="chat-minimize-btn p-1.5 hover:bg-white/5 rounded text-[#8a8a8a] hover:text-white transition-colors focus:outline-none" title="Minimize">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Chat Messages -->
        <div class="chat-messages-container flex-1 overflow-y-auto p-4 space-y-4 flex flex-col">
          <!-- Dynamically populated -->
        </div>

        <!-- Suggested Questions -->
        <div class="chat-suggestions-container px-4 py-2 border-t border-[#2a2a2a]/20 flex flex-wrap gap-1.5 overflow-x-auto whitespace-nowrap bg-black/20">
          <button class="suggested-question-btn text-[10px] font-mono border border-[#2a2a2a] rounded-full px-2.5 py-1 text-[#8a8a8a] hover:text-[#00d2ff] hover:border-[#00d2ff]/40 transition-all select-none cursor-pointer">Tell me about Mithun</button>
          <button class="suggested-question-btn text-[10px] font-mono border border-[#2a2a2a] rounded-full px-2.5 py-1 text-[#8a8a8a] hover:text-[#00d2ff] hover:border-[#00d2ff]/40 transition-all select-none cursor-pointer">What projects has Mithun built?</button>
          <button class="suggested-question-btn text-[10px] font-mono border border-[#2a2a2a] rounded-full px-2.5 py-1 text-[#8a8a8a] hover:text-[#00d2ff] hover:border-[#00d2ff]/40 transition-all select-none cursor-pointer">Explain Ship Spy Live</button>
          <button class="suggested-question-btn text-[10px] font-mono border border-[#2a2a2a] rounded-full px-2.5 py-1 text-[#8a8a8a] hover:text-[#00d2ff] hover:border-[#00d2ff]/40 transition-all select-none cursor-pointer">What technologies does Mithun use?</button>
          <button class="suggested-question-btn text-[10px] font-mono border border-[#2a2a2a] rounded-full px-2.5 py-1 text-[#8a8a8a] hover:text-[#00d2ff] hover:border-[#00d2ff]/40 transition-all select-none cursor-pointer">How can I contact Mithun?</button>
        </div>

        <!-- Input Box (Terminal Style) -->
        <form class="chat-input-form p-3 border-t border-[#2a2a2a]/40 flex items-center gap-2 bg-[#050505] relative">
          <div class="flex-1 flex items-center bg-black/40 border border-[#2a2a2a] rounded-lg px-2.5 focus-within:border-[#00d2ff]/60 transition-all">
            <span class="text-[#00d2ff] font-mono text-xs select-none mr-1.5">&gt;_</span>
            <input type="text" class="chat-input flex-1 bg-transparent border-none py-2 text-xs text-white placeholder-[#8a8a8a]/40 focus:outline-none font-mono" placeholder="Send query..." maxlength="300" required>
          </div>
          <button type="submit" class="chat-send-btn p-2 bg-[#00d2ff]/10 hover:bg-[#00d2ff]/20 border border-[#00d2ff]/30 text-[#00d2ff] rounded-lg flex items-center justify-center transition-all focus:outline-none cursor-pointer" title="Send message">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </form>
      </div>
    `;
  }

  private registerEvents(container: HTMLDivElement) {
    const minimizeBtn = container.querySelector('.chat-minimize-btn');
    const maximizeBtn = container.querySelector('.chat-maximize-btn');
    const form = container.querySelector('.chat-input-form');
    const suggestionBtns = container.querySelectorAll('.suggested-question-btn');

    this.toggleBtnEl?.addEventListener('click', () => {
      this.toggleWindow();
    });

    minimizeBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.closeWindow();
    });

    maximizeBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleMaximize();
    });

    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleUserSubmit();
    });

    suggestionBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const text = btn.textContent || '';
        if (text && this.inputEl) {
          this.inputEl.value = text;
          this.handleUserSubmit();
        }
      });
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.closeWindow();
      }
    });
  }

  private toggleWindow() {
    if (this.isOpen) {
      this.closeWindow();
    } else {
      this.openWindow();
    }
  }

  private openWindow() {
    this.isOpen = true;
    this.windowEl?.classList.add('open');
    this.toggleBtnEl?.classList.add('hidden');
    this.scrollToBottom();
    this.inputEl?.focus();
  }

  private closeWindow() {
    this.isOpen = false;
    this.windowEl?.classList.remove('open');
    this.toggleBtnEl?.classList.remove('hidden');
  }

  private toggleMaximize() {
    this.isMaximized = !this.isMaximized;
    const maxIcon = this.windowEl?.querySelector('.max-icon');

    if (this.isMaximized) {
      this.windowEl?.classList.add('w-[550px]', 'h-[700px]');
      this.windowEl?.classList.remove('w-[380px]', 'h-[520px]');
      if (maxIcon) {
        maxIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3 3m12 6V4.5m0 4.5h4.5m-4.5 0l6-6M9 15v4.5M9 15H4.5m4.5 0l-6 6m6-6v4.5m0-4.5h4.5m-4.5 0l6 6" />`;
      }
    } else {
      this.windowEl?.classList.remove('w-[550px]', 'h-[700px]');
      this.windowEl?.classList.add('w-[380px]', 'h-[520px]');
      if (maxIcon) {
        maxIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75v4.5m0-4.5h-4.5m4.5 0L15 9m5.25 11.25v-4.5m0 4.5h-4.5m4.5 0L15 15" />`;
      }
    }
    this.scrollToBottom();
  }

  private scrollToBottom() {
    if (this.messagesContainerEl) {
      setTimeout(() => {
        this.messagesContainerEl!.scrollTop = this.messagesContainerEl!.scrollHeight;
      }, 50);
    }
  }

  private renderMessages() {
    if (!this.messagesContainerEl) return;

    this.messagesContainerEl.innerHTML = '';
    this.chatHistory.forEach(msg => {
      this.appendMessageHTML(msg.role, msg.content);
    });

    this.scrollToBottom();
  }

  private appendMessageHTML(role: 'user' | 'assistant', content: string) {
    if (!this.messagesContainerEl) return;

    const msgWrapper = document.createElement('div');
    msgWrapper.className = `flex w-full ${role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`;

    const innerDiv = document.createElement('div');
    if (role === 'user') {
      innerDiv.className = 'message-bubble-user max-w-[80%] px-3 py-2 text-xs font-mono leading-relaxed text-left border border-[#00d2ff]/30 text-white rounded-2xl';
      innerDiv.textContent = `> ${content}`;
    } else {
      innerDiv.className = 'message-bubble-assistant max-w-[85%] px-3 py-2 text-xs font-sans leading-relaxed text-left border border-white/5 text-[#8a8a8a] rounded-2xl';
      innerDiv.innerHTML = this.parseMarkdown(content);
    }

    msgWrapper.appendChild(innerDiv);
    this.messagesContainerEl.appendChild(msgWrapper);
  }

  private parseMarkdown(text: string): string {
    let html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    html = html.replace(/```([\s\S]+?)```/g, (match, code) => {
      return `<pre class="bg-[#050505]/80 border border-[#2a2a2a] p-2 rounded my-1.5 overflow-x-auto font-mono text-[10px] text-[#00d2ff] leading-normal"><code>${code.trim()}</code></pre>`;
    });

    html = html.replace(/`([^`]+)`/g, '<code class="bg-[#1e1e1e] text-[#00d2ff] border border-[#2a2a2a]/40 px-1 py-0.5 rounded font-mono text-[10px]">$1</code>');

    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="text-white font-bold">$1</strong>');

    html = html.replace(/\n/g, '<br>');

    return html;
  }

  private showTypingIndicator() {
    if (this.typingIndicatorEl || !this.messagesContainerEl) return;

    this.typingIndicatorEl = document.createElement('div');
    this.typingIndicatorEl.className = 'flex w-full justify-start typing-indicator-wrapper';
    this.typingIndicatorEl.innerHTML = `
      <div class="max-w-[80%] bg-[#2a2a2a]/10 border border-[#2a2a2a]/40 text-[#8a8a8a] rounded-2xl px-3 py-2.5 text-xs flex items-center gap-1.5">
        <span class="text-[10px] font-mono mr-1 uppercase text-[#8a8a8a]/60">AI processing</span>
        <div class="typing-dots flex items-center gap-1">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    `;

    this.messagesContainerEl.appendChild(this.typingIndicatorEl);
    this.scrollToBottom();
  }

  private hideTypingIndicator() {
    if (this.typingIndicatorEl && this.messagesContainerEl) {
      this.messagesContainerEl.removeChild(this.typingIndicatorEl);
      this.typingIndicatorEl = null;
    }
  }

  private async handleUserSubmit() {
    if (!this.inputEl) return;

    const message = this.inputEl.value.trim();
    if (!message) return;

    this.inputEl.value = '';

    this.chatHistory.push({ role: 'user', content: message });
    this.saveHistory();
    this.appendMessageHTML('user', message);
    this.scrollToBottom();

    if (this.inputEl) this.inputEl.disabled = true;
    if (this.sendBtnEl) this.sendBtnEl.disabled = true;

    this.showTypingIndicator();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: message,
          history: this.chatHistory.slice(0, -1)
        })
      });

      this.hideTypingIndicator();

      let data;
      try {
        data = await response.json();
      } catch (parseErr) {
        // Fallback for non-JSON responses
      }

      if (!response.ok) {
        const errorMsg = (data && data.error) ? data.error : `Server returned code ${response.status}`;
        throw new Error(errorMsg);
      }

      if (data && data.response) {
        const reply = data.response;
        this.chatHistory.push({ role: 'assistant', content: reply });
        this.saveHistory();
        this.appendMessageHTML('assistant', reply);
      } else {
        throw new Error("Empty response payload");
      }

    } catch (e: any) {
      this.hideTypingIndicator();
      console.error("Chat error:", e);
      this.appendMessageHTML('assistant', `⚠️ **System Error**: ${e.message || "Unable to contact the AI assistant system. Please ensure the backend server is running."}`);
    } finally {
      if (this.inputEl) {
        this.inputEl.disabled = false;
        this.inputEl.focus();
      }
      if (this.sendBtnEl) this.sendBtnEl.disabled = false;
      this.scrollToBottom();
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new PortfolioChatbot());
} else {
  new PortfolioChatbot();
}
