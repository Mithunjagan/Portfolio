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
        content: "Hello! I am **TARS**, Mithun's tactical AI assistant. **Honesty parameter set to 90%. Humor parameter set to 65%.** Ask me anything about Mithun's projects, technical skills, experience, or how to contact him!"
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
    this.initParticles(container);
  }

  private initParticles(container: HTMLElement) {
    const canvas = container.querySelector('.tars-particle-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = 120;
    const height = 120;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      decay: number;
      color: string;
    }

    let particles: Particle[] = [];
    let waves: Array<{ r: number; maxR: number; speed: number; alpha: number }> = [];
    let animationId: number;
    let isHovering = false;

    this.toggleBtnEl?.addEventListener('mouseenter', () => { isHovering = true; });
    this.toggleBtnEl?.addEventListener('mouseleave', () => { isHovering = false; });

    const spawnParticle = () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = isHovering ? 0.8 + Math.random() * 1.2 : 0.3 + Math.random() * 0.5;
      const dist = 20 + Math.random() * 10;
      particles.push({
        x: width / 2 + Math.cos(angle) * dist,
        y: height / 2 + Math.sin(angle) * dist,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (0.1 + Math.random() * 0.2),
        size: 1 + Math.random() * 2,
        alpha: 0.3 + Math.random() * 0.5,
        decay: 0.005 + Math.random() * 0.01,
        color: Math.random() > 0.3 ? '0, 210, 255' : '138, 138, 138'
      });
    };

    const spawnWave = () => {
      waves.push({
        r: 15,
        maxR: 45 + Math.random() * 15,
        speed: isHovering ? 1.5 : 0.6,
        alpha: 0.4
      });
    };

    let tick = 0;
    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      tick++;
      if (tick % (isHovering ? 8 : 20) === 0 && particles.length < 40) {
        spawnParticle();
      }
      if (tick % (isHovering ? 40 : 120) === 0 && waves.length < 3) {
        spawnWave();
      }

      // 1. Draw waves
      for (let i = waves.length - 1; i >= 0; i--) {
        const w = waves[i];
        w.r += w.speed;
        w.alpha -= w.speed / w.maxR;

        if (w.alpha <= 0) {
          waves.splice(i, 1);
          continue;
        }

        ctx.strokeStyle = `rgba(0, 210, 255, ${w.alpha * 0.45})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, w.r, 0, Math.PI * 2);
        ctx.stroke();

        if (isHovering) {
          ctx.strokeStyle = `rgba(0, 210, 255, ${w.alpha * 0.25})`;
          ctx.beginPath();
          ctx.moveTo(width / 2, height / 2 - w.r - 2);
          ctx.lineTo(width / 2, height / 2 - w.r + 2);
          ctx.moveTo(width / 2 + w.r - 2, height / 2);
          ctx.lineTo(width / 2 + w.r + 2, height / 2);
          ctx.stroke();
        }
      }

      // 2. Draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
        
        if (p.size > 2 && p.color === '0, 210, 255') {
          ctx.fillRect(p.x - p.size/2, p.y - p.size/2, p.size, p.size);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }

        if (isHovering) {
          for (let j = i - 1; j >= 0; j--) {
            const p2 = particles[j];
            const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
            if (dist < 22) {
              ctx.strokeStyle = `rgba(0, 210, 255, ${Math.min(p.alpha, p2.alpha) * 0.15})`;
              ctx.lineWidth = 0.5;
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
        }
      }

      // 3. Draw grid HUD background on hover
      if (isHovering) {
        ctx.strokeStyle = 'rgba(0, 210, 255, 0.05)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(width / 2 - 35, height / 2);
        ctx.lineTo(width / 2 + 35, height / 2);
        ctx.moveTo(width / 2, height / 2 - 35);
        ctx.lineTo(width / 2, height / 2 + 35);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(width / 2, height / 2, 30, 0, Math.PI * 2);
        ctx.stroke();
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();
  }


  private renderHTML(): string {
    return `
      <!-- TARS Ambient Particle Canvas (behind button) -->
      <canvas class="tars-particle-canvas" width="120" height="120" style="position:absolute;bottom:-10px;right:-10px;width:120px;height:120px;pointer-events:none;z-index:-1;opacity:0.7;"></canvas>

      <!-- Floating Chat Button (Hyper-Detailed TARS Robot) -->
      <button class="chat-widget-button w-16 h-16 bg-[#060608]/95 border border-[#00d2ff]/20 text-[#00d2ff] rounded-full flex items-center justify-center backdrop-blur-md cursor-pointer select-none transition-all duration-300 relative focus:outline-none pulse-neon-btn" aria-label="Open TARS AI Chat">
        <!-- Outer scanning ring -->
        <div class="tars-scan-ring"></div>
        <svg class="tars-main-svg w-9 h-9 text-[#00d2ff]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <!-- Brushed Metal Gradient per segment (realistic anisotropic reflections) -->
            <linearGradient id="tars-metal-1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#4a4e54" />
              <stop offset="12%" stop-color="#2c2f33" />
              <stop offset="28%" stop-color="#3d4147" />
              <stop offset="45%" stop-color="#1a1c1f" />
              <stop offset="60%" stop-color="#2e3236" />
              <stop offset="78%" stop-color="#161819" />
              <stop offset="100%" stop-color="#2a2d31" />
            </linearGradient>
            <linearGradient id="tars-metal-2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#3e4248" />
              <stop offset="20%" stop-color="#1e2024" />
              <stop offset="50%" stop-color="#35393d" />
              <stop offset="75%" stop-color="#151718" />
              <stop offset="100%" stop-color="#282b2f" />
            </linearGradient>
            <linearGradient id="tars-metal-3" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#444850" />
              <stop offset="30%" stop-color="#222528" />
              <stop offset="55%" stop-color="#3a3e44" />
              <stop offset="80%" stop-color="#181a1d" />
              <stop offset="100%" stop-color="#2f3337" />
            </linearGradient>
            <linearGradient id="tars-metal-4" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stop-color="#484c52" />
              <stop offset="25%" stop-color="#252830" />
              <stop offset="50%" stop-color="#393d43" />
              <stop offset="75%" stop-color="#1c1e22" />
              <stop offset="100%" stop-color="#2d3035" />
            </linearGradient>
            <!-- Top edge highlight (simulates overhead light) -->
            <linearGradient id="tars-edge-light" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="rgba(255,255,255,0.28)" />
              <stop offset="8%" stop-color="rgba(255,255,255,0.08)" />
              <stop offset="100%" stop-color="rgba(0,0,0,0)" />
            </linearGradient>
            <!-- Sensor glow filter -->
            <filter id="tars-sensor-bloom" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur1"/>
              <feGaussianBlur in="SourceGraphic" stdDeviation="1" result="blur2"/>
              <feMerge>
                <feMergeNode in="blur1"/>
                <feMergeNode in="blur2"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <!-- Deep shadow for segments -->
            <filter id="tars-shadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="1" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.7)"/>
            </filter>
            <!-- Ambient occlusion between segments -->
            <linearGradient id="tars-gap-shadow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="rgba(0,0,0,0.9)" />
              <stop offset="50%" stop-color="rgba(0,0,0,0.5)" />
              <stop offset="100%" stop-color="rgba(0,0,0,0.9)" />
            </linearGradient>
          </defs>

          <!-- SEGMENT 1 (Leftmost) -->
          <g class="tars-seg tars-seg-1" style="transform-origin: 22.5px 50px;" filter="url(#tars-shadow)">
            <rect x="15" y="13" width="15" height="74" rx="2" fill="url(#tars-metal-1)" stroke="#555" stroke-width="0.5"/>
            <rect x="15" y="13" width="15" height="74" rx="2" fill="url(#tars-edge-light)"/>
            <!-- Beveled top/bottom edges -->
            <rect x="15.5" y="13.5" width="14" height="2" rx="0.5" fill="rgba(255,255,255,0.06)"/>
            <rect x="15.5" y="84.5" width="14" height="1" rx="0.5" fill="rgba(0,0,0,0.3)"/>
            <!-- Panel groove lines (machined joints) -->
            <line x1="15" y1="33" x2="30" y2="33" stroke="rgba(0,0,0,0.5)" stroke-width="0.6"/>
            <line x1="15" y1="33.6" x2="30" y2="33.6" stroke="rgba(255,255,255,0.06)" stroke-width="0.3"/>
            <line x1="15" y1="50" x2="30" y2="50" stroke="rgba(0,0,0,0.4)" stroke-width="0.5"/>
            <line x1="15" y1="50.5" x2="30" y2="50.5" stroke="rgba(255,255,255,0.05)" stroke-width="0.3"/>
            <line x1="15" y1="67" x2="30" y2="67" stroke="rgba(0,0,0,0.5)" stroke-width="0.6"/>
            <line x1="15" y1="67.6" x2="30" y2="67.6" stroke="rgba(255,255,255,0.06)" stroke-width="0.3"/>
            <!-- Hex bolt rivets -->
            <circle cx="19" cy="17" r="1.3" fill="#1a1a1a" stroke="#444" stroke-width="0.4"/>
            <circle cx="26" cy="17" r="1.3" fill="#1a1a1a" stroke="#444" stroke-width="0.4"/>
            <circle cx="19" cy="83" r="1.3" fill="#1a1a1a" stroke="#444" stroke-width="0.4"/>
            <circle cx="26" cy="83" r="1.3" fill="#1a1a1a" stroke="#444" stroke-width="0.4"/>
            <!-- Micro data port -->
            <rect x="20" y="40" width="5" height="2" rx="0.5" fill="#0d0d0d" stroke="#333" stroke-width="0.3"/>
            <!-- Ambient side LED -->
            <rect x="15.3" y="46" width="0.8" height="6" rx="0.4" fill="#00d2ff" opacity="0.3" class="tars-side-led"/>
          </g>

          <!-- Gap shadow 1-2 -->
          <rect x="30" y="16" width="2" height="68" fill="url(#tars-gap-shadow)" opacity="0.4"/>

          <!-- SEGMENT 2 -->
          <g class="tars-seg tars-seg-2" style="transform-origin: 39.5px 50px;" filter="url(#tars-shadow)">
            <rect x="32" y="13" width="15" height="74" rx="2" fill="url(#tars-metal-2)" stroke="#555" stroke-width="0.5"/>
            <rect x="32" y="13" width="15" height="74" rx="2" fill="url(#tars-edge-light)"/>
            <rect x="32.5" y="13.5" width="14" height="2" rx="0.5" fill="rgba(255,255,255,0.06)"/>
            <rect x="32.5" y="84.5" width="14" height="1" rx="0.5" fill="rgba(0,0,0,0.3)"/>
            <line x1="32" y1="33" x2="47" y2="33" stroke="rgba(0,0,0,0.5)" stroke-width="0.6"/>
            <line x1="32" y1="33.6" x2="47" y2="33.6" stroke="rgba(255,255,255,0.06)" stroke-width="0.3"/>
            <line x1="32" y1="50" x2="47" y2="50" stroke="rgba(0,0,0,0.4)" stroke-width="0.5"/>
            <line x1="32" y1="50.5" x2="47" y2="50.5" stroke="rgba(255,255,255,0.05)" stroke-width="0.3"/>
            <line x1="32" y1="67" x2="47" y2="67" stroke="rgba(0,0,0,0.5)" stroke-width="0.6"/>
            <line x1="32" y1="67.6" x2="47" y2="67.6" stroke="rgba(255,255,255,0.06)" stroke-width="0.3"/>
            <circle cx="36" cy="17" r="1.3" fill="#1a1a1a" stroke="#444" stroke-width="0.4"/>
            <circle cx="43" cy="17" r="1.3" fill="#1a1a1a" stroke="#444" stroke-width="0.4"/>
            <circle cx="36" cy="83" r="1.3" fill="#1a1a1a" stroke="#444" stroke-width="0.4"/>
            <circle cx="43" cy="83" r="1.3" fill="#1a1a1a" stroke="#444" stroke-width="0.4"/>
            <!-- Circuit trace detail -->
            <path d="M35 56 L38 56 L40 58 L44 58" stroke="#00d2ff" stroke-width="0.4" opacity="0.2" fill="none"/>
            <circle cx="44" cy="58" r="0.8" fill="#00d2ff" opacity="0.15"/>
          </g>

          <!-- Gap shadow 2-3 -->
          <rect x="47" y="16" width="2" height="68" fill="url(#tars-gap-shadow)" opacity="0.4"/>

          <!-- SEGMENT 3 -->
          <g class="tars-seg tars-seg-3" style="transform-origin: 56.5px 50px;" filter="url(#tars-shadow)">
            <rect x="49" y="13" width="15" height="74" rx="2" fill="url(#tars-metal-3)" stroke="#555" stroke-width="0.5"/>
            <rect x="49" y="13" width="15" height="74" rx="2" fill="url(#tars-edge-light)"/>
            <rect x="49.5" y="13.5" width="14" height="2" rx="0.5" fill="rgba(255,255,255,0.06)"/>
            <rect x="49.5" y="84.5" width="14" height="1" rx="0.5" fill="rgba(0,0,0,0.3)"/>
            <line x1="49" y1="33" x2="64" y2="33" stroke="rgba(0,0,0,0.5)" stroke-width="0.6"/>
            <line x1="49" y1="33.6" x2="64" y2="33.6" stroke="rgba(255,255,255,0.06)" stroke-width="0.3"/>
            <line x1="49" y1="50" x2="64" y2="50" stroke="rgba(0,0,0,0.4)" stroke-width="0.5"/>
            <line x1="49" y1="50.5" x2="64" y2="50.5" stroke="rgba(255,255,255,0.05)" stroke-width="0.3"/>
            <line x1="49" y1="67" x2="64" y2="67" stroke="rgba(0,0,0,0.5)" stroke-width="0.6"/>
            <line x1="49" y1="67.6" x2="64" y2="67.6" stroke="rgba(255,255,255,0.06)" stroke-width="0.3"/>
            <circle cx="53" cy="17" r="1.3" fill="#1a1a1a" stroke="#444" stroke-width="0.4"/>
            <circle cx="60" cy="17" r="1.3" fill="#1a1a1a" stroke="#444" stroke-width="0.4"/>
            <circle cx="53" cy="83" r="1.3" fill="#1a1a1a" stroke="#444" stroke-width="0.4"/>
            <circle cx="60" cy="83" r="1.3" fill="#1a1a1a" stroke="#444" stroke-width="0.4"/>
            <!-- Circuit trace detail -->
            <path d="M52 62 L55 62 L57 60 L61 60" stroke="#00d2ff" stroke-width="0.4" opacity="0.2" fill="none"/>
            <circle cx="52" cy="62" r="0.8" fill="#00d2ff" opacity="0.15"/>
          </g>

          <!-- Gap shadow 3-4 -->
          <rect x="64" y="16" width="2" height="68" fill="url(#tars-gap-shadow)" opacity="0.4"/>

          <!-- SEGMENT 4 (Rightmost) -->
          <g class="tars-seg tars-seg-4" style="transform-origin: 73.5px 50px;" filter="url(#tars-shadow)">
            <rect x="66" y="13" width="15" height="74" rx="2" fill="url(#tars-metal-4)" stroke="#555" stroke-width="0.5"/>
            <rect x="66" y="13" width="15" height="74" rx="2" fill="url(#tars-edge-light)"/>
            <rect x="66.5" y="13.5" width="14" height="2" rx="0.5" fill="rgba(255,255,255,0.06)"/>
            <rect x="66.5" y="84.5" width="14" height="1" rx="0.5" fill="rgba(0,0,0,0.3)"/>
            <line x1="66" y1="33" x2="81" y2="33" stroke="rgba(0,0,0,0.5)" stroke-width="0.6"/>
            <line x1="66" y1="33.6" x2="81" y2="33.6" stroke="rgba(255,255,255,0.06)" stroke-width="0.3"/>
            <line x1="66" y1="50" x2="81" y2="50" stroke="rgba(0,0,0,0.4)" stroke-width="0.5"/>
            <line x1="66" y1="50.5" x2="81" y2="50.5" stroke="rgba(255,255,255,0.05)" stroke-width="0.3"/>
            <line x1="66" y1="67" x2="81" y2="67" stroke="rgba(0,0,0,0.5)" stroke-width="0.6"/>
            <line x1="66" y1="67.6" x2="81" y2="67.6" stroke="rgba(255,255,255,0.06)" stroke-width="0.3"/>
            <circle cx="70" cy="17" r="1.3" fill="#1a1a1a" stroke="#444" stroke-width="0.4"/>
            <circle cx="77" cy="17" r="1.3" fill="#1a1a1a" stroke="#444" stroke-width="0.4"/>
            <circle cx="70" cy="83" r="1.3" fill="#1a1a1a" stroke="#444" stroke-width="0.4"/>
            <circle cx="77" cy="83" r="1.3" fill="#1a1a1a" stroke="#444" stroke-width="0.4"/>
            <!-- Micro data port -->
            <rect x="71" y="40" width="5" height="2" rx="0.5" fill="#0d0d0d" stroke="#333" stroke-width="0.3"/>
            <!-- Ambient side LED -->
            <rect x="80.2" y="46" width="0.8" height="6" rx="0.4" fill="#00d2ff" opacity="0.3" class="tars-side-led"/>
          </g>

          <!-- ===== PRIMARY SENSOR LIGHT (cinematic glow) ===== -->
          <g class="tars-sensor-group">
            <!-- Wide bloom behind sensor -->
            <rect x="36" y="21" width="26" height="8" rx="2" fill="#00d2ff" opacity="0.08" filter="url(#tars-sensor-bloom)"/>
            <!-- Sensor housing (recessed dark slot) -->
            <rect x="39" y="23" width="20" height="5" rx="1" fill="#050505" stroke="#333" stroke-width="0.4"/>
            <!-- Inner sensor strip (the bright light) -->
            <rect x="40" y="24" width="18" height="3" rx="0.8" fill="#00d2ff" opacity="0.95" class="tars-sensor-light"/>
            <!-- Sensor specular glint -->
            <rect x="41" y="24.2" width="8" height="1" rx="0.5" fill="rgba(255,255,255,0.5)"/>
            <!-- Sensor sweep animation overlay -->
            <rect x="40" y="24" width="18" height="3" rx="0.8" fill="url(#tars-edge-light)" class="tars-sensor-sweep" opacity="0.6"/>
          </g>

          <!-- Secondary status indicator -->
          <circle cx="22.5" cy="75" r="1.2" fill="#00ff88" opacity="0.6" class="tars-status-led"/>
          <circle cx="73.5" cy="75" r="1.2" fill="#ff4444" opacity="0.3"/>
        </svg>
        <!-- Notification ping -->
        <span class="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#00d2ff] rounded-full border-2 border-[#060608] animate-ping"></span>
        <span class="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#00d2ff] rounded-full border-2 border-[#060608]"></span>
        <!-- TARS label -->
        <span class="tars-label absolute -bottom-5 left-1/2 -translate-x-1/2 font-tech text-[7px] text-[#00d2ff]/60 tracking-[0.2em] uppercase whitespace-nowrap pointer-events-none select-none">TARS</span>
      </button>

      <!-- Chat Window -->
      <div class="chat-window fixed bottom-24 right-6 w-[380px] h-[520px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-120px)] bg-[#050505]/95 border border-[#2a2a2a] rounded-2xl flex flex-col overflow-hidden backdrop-blur-xl shadow-[0_10px_35px_rgba(0,210,255,0.15)] transition-all duration-300" data-lenis-prevent>
        <!-- Header -->
        <div class="chat-header px-4 py-3 bg-[#0a0a0a]/60 border-b border-[#2a2a2a]/40 flex items-center justify-between relative overflow-hidden">
          <!-- Subtle animated scanline in header -->
          <div class="tars-header-scanline"></div>
          <div class="flex items-center gap-2.5 relative z-10">
            <!-- TARS Miniature Header Icon (upgraded) -->
            <div class="relative w-9 h-9 rounded-lg bg-[#00d2ff]/5 border border-[#00d2ff]/25 flex items-center justify-center overflow-hidden">
              <div class="tars-header-glow"></div>
              <svg class="w-6 h-6 text-[#00d2ff] relative z-10" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g class="tars-seg tars-seg-1" style="transform-origin: 26px 50px;">
                  <rect x="18" y="18" width="14" height="64" rx="1.5" fill="currentColor" fill-opacity="0.15" stroke="currentColor" stroke-width="1.2" />
                  <line x1="18" y1="35" x2="32" y2="35" stroke="currentColor" stroke-width="0.4" opacity="0.3"/>
                  <line x1="18" y1="65" x2="32" y2="65" stroke="currentColor" stroke-width="0.4" opacity="0.3"/>
                  <circle cx="22" cy="22" r="1" fill="currentColor" opacity="0.3"/>
                  <circle cx="28" cy="22" r="1" fill="currentColor" opacity="0.3"/>
                </g>
                <g class="tars-seg tars-seg-2" style="transform-origin: 40px 50px;">
                  <rect x="34" y="18" width="12" height="64" rx="1.5" fill="currentColor" fill-opacity="0.15" stroke="currentColor" stroke-width="1.2" />
                  <line x1="34" y1="35" x2="46" y2="35" stroke="currentColor" stroke-width="0.4" opacity="0.3"/>
                  <line x1="34" y1="65" x2="46" y2="65" stroke="currentColor" stroke-width="0.4" opacity="0.3"/>
                </g>
                <g class="tars-seg tars-seg-3" style="transform-origin: 54px 50px;">
                  <rect x="48" y="18" width="12" height="64" rx="1.5" fill="currentColor" fill-opacity="0.15" stroke="currentColor" stroke-width="1.2" />
                  <line x1="48" y1="35" x2="60" y2="35" stroke="currentColor" stroke-width="0.4" opacity="0.3"/>
                  <line x1="48" y1="65" x2="60" y2="65" stroke="currentColor" stroke-width="0.4" opacity="0.3"/>
                </g>
                <g class="tars-seg tars-seg-4" style="transform-origin: 68px 50px;">
                  <rect x="62" y="18" width="14" height="64" rx="1.5" fill="currentColor" fill-opacity="0.15" stroke="currentColor" stroke-width="1.2" />
                  <line x1="62" y1="35" x2="76" y2="35" stroke="currentColor" stroke-width="0.4" opacity="0.3"/>
                  <line x1="62" y1="65" x2="76" y2="65" stroke="currentColor" stroke-width="0.4" opacity="0.3"/>
                  <circle cx="66" cy="78" r="1" fill="currentColor" opacity="0.3"/>
                  <circle cx="72" cy="78" r="1" fill="currentColor" opacity="0.3"/>
                </g>
                <!-- Sensor light -->
                <rect x="38" y="25" width="20" height="4" rx="1" fill="#00d2ff" opacity="0.9" filter="drop-shadow(0 0 3px #00d2ff)"/>
                <rect x="39" y="25.5" width="9" height="1.2" rx="0.5" fill="rgba(255,255,255,0.4)"/>
              </svg>
              <span class="absolute bottom-0.5 right-0.5 w-2 h-2 bg-[#00d2ff] rounded-full border border-[#0a0a0a] shadow-[0_0_4px_#00d2ff]"></span>
            </div>
            <div>
              <h3 class="font-tech text-[10px] font-bold text-white tracking-widest uppercase">TARS // TACTICAL_AI</h3>
              <p class="text-[8px] font-mono text-[#00d2ff]/70 uppercase flex items-center gap-1.5">
                <span class="inline-block w-1.5 h-1.5 bg-[#00ff88] rounded-full shadow-[0_0_4px_#00ff88] animate-pulse"></span>
                MITHUN.ASSIST.v2.0 // ONLINE
              </p>
            </div>
          </div>
          <div class="flex items-center gap-3.5 relative z-10">
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
        <div class="chat-messages-container flex-1 overflow-y-auto p-4 space-y-4 flex flex-col" data-lenis-prevent>
          <!-- Dynamically populated -->
        </div>

        <!-- Suggested Questions -->
        <div class="chat-suggestions-container px-4 py-2 border-t border-[#2a2a2a]/20 flex flex-wrap gap-1.5 overflow-x-auto whitespace-nowrap bg-black/20" data-lenis-prevent>
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

    const button = document.querySelector('.chat-widget-button');
    const header = document.querySelector('.chat-header');
    if (button) button.classList.add('thinking');
    if (header) header.classList.add('thinking');

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
    const button = document.querySelector('.chat-widget-button');
    const header = document.querySelector('.chat-header');
    if (button) button.classList.remove('thinking');
    if (header) header.classList.remove('thinking');
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
