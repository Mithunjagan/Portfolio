(()=>{var f=class{containerId="chat-widget-container";isOpen=!1;isMaximized=!1;chatHistory=[];typingIndicatorEl=null;messagesContainerEl=null;inputEl=null;sendBtnEl=null;windowEl=null;toggleBtnEl=null;constructor(){this.loadHistory(),this.init()}loadHistory(){this.chatHistory=[{role:"assistant",content:"Hello! I am **TARS**, Mithun's tactical AI assistant. **Honesty parameter set to 90%. Humor parameter set to 65%.** Ask me anything about Mithun's projects, technical skills, experience, or how to contact him!"}]}saveHistory(){}init(){if(document.getElementById(this.containerId))return;let e=document.createElement("div");e.id=this.containerId,e.className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end font-sans",e.innerHTML=this.renderHTML(),document.body.appendChild(e),this.windowEl=e.querySelector(".chat-window"),this.toggleBtnEl=e.querySelector(".chat-widget-button"),this.messagesContainerEl=e.querySelector(".chat-messages-container"),this.inputEl=e.querySelector(".chat-input"),this.sendBtnEl=e.querySelector(".chat-send-btn"),this.registerEvents(e),this.renderMessages(),this.initParticles(e)}initParticles(e){let s=e.querySelector(".tars-particle-canvas");if(!s)return;let t=s.getContext("2d");if(!t)return;let o=window.devicePixelRatio||1,a=120,i=120;s.width=a*o,s.height=i*o,t.scale(o,o);let l=[],h=[],u,d=!1;this.toggleBtnEl?.addEventListener("mouseenter",()=>{d=!0}),this.toggleBtnEl?.addEventListener("mouseleave",()=>{d=!1});let y=()=>{let n=Math.random()*Math.PI*2,r=d?.8+Math.random()*1.2:.3+Math.random()*.5,c=20+Math.random()*10;l.push({x:a/2+Math.cos(n)*c,y:i/2+Math.sin(n)*c,vx:Math.cos(n)*r,vy:Math.sin(n)*r-(.1+Math.random()*.2),size:1+Math.random()*2,alpha:.3+Math.random()*.5,decay:.005+Math.random()*.01,color:Math.random()>.3?"0, 210, 255":"138, 138, 138"})},m=()=>{h.push({r:15,maxR:45+Math.random()*15,speed:d?1.5:.6,alpha:.4})},g=0,x=()=>{t.clearRect(0,0,a,i),g++,g%(d?8:20)===0&&l.length<40&&y(),g%(d?40:120)===0&&h.length<3&&m();for(let n=h.length-1;n>=0;n--){let r=h[n];if(r.r+=r.speed,r.alpha-=r.speed/r.maxR,r.alpha<=0){h.splice(n,1);continue}t.strokeStyle=`rgba(0, 210, 255, ${r.alpha*.45})`,t.lineWidth=1,t.beginPath(),t.arc(a/2,i/2,r.r,0,Math.PI*2),t.stroke(),d&&(t.strokeStyle=`rgba(0, 210, 255, ${r.alpha*.25})`,t.beginPath(),t.moveTo(a/2,i/2-r.r-2),t.lineTo(a/2,i/2-r.r+2),t.moveTo(a/2+r.r-2,i/2),t.lineTo(a/2+r.r+2,i/2),t.stroke())}for(let n=l.length-1;n>=0;n--){let r=l[n];if(r.x+=r.vx,r.y+=r.vy,r.alpha-=r.decay,r.alpha<=0){l.splice(n,1);continue}if(t.fillStyle=`rgba(${r.color}, ${r.alpha})`,r.size>2&&r.color==="0, 210, 255"?t.fillRect(r.x-r.size/2,r.y-r.size/2,r.size,r.size):(t.beginPath(),t.arc(r.x,r.y,r.size,0,Math.PI*2),t.fill()),d)for(let c=n-1;c>=0;c--){let p=l[c];Math.hypot(r.x-p.x,r.y-p.y)<22&&(t.strokeStyle=`rgba(0, 210, 255, ${Math.min(r.alpha,p.alpha)*.15})`,t.lineWidth=.5,t.beginPath(),t.moveTo(r.x,r.y),t.lineTo(p.x,p.y),t.stroke())}}d&&(t.strokeStyle="rgba(0, 210, 255, 0.05)",t.lineWidth=.5,t.beginPath(),t.moveTo(a/2-35,i/2),t.lineTo(a/2+35,i/2),t.moveTo(a/2,i/2-35),t.lineTo(a/2,i/2+35),t.stroke(),t.beginPath(),t.arc(a/2,i/2,30,0,Math.PI*2),t.stroke()),u=requestAnimationFrame(x)};x()}renderHTML(){return`
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
    `}registerEvents(e){let s=e.querySelector(".chat-minimize-btn"),t=e.querySelector(".chat-maximize-btn"),o=e.querySelector(".chat-input-form"),a=e.querySelectorAll(".suggested-question-btn");this.toggleBtnEl?.addEventListener("click",()=>{this.toggleWindow()}),s?.addEventListener("click",i=>{i.stopPropagation(),this.closeWindow()}),t?.addEventListener("click",i=>{i.stopPropagation(),this.toggleMaximize()}),o?.addEventListener("submit",i=>{i.preventDefault(),this.handleUserSubmit()}),a.forEach(i=>{i.addEventListener("click",()=>{let l=i.textContent||"";l&&this.inputEl&&(this.inputEl.value=l,this.handleUserSubmit())})}),window.addEventListener("keydown",i=>{i.key==="Escape"&&this.isOpen&&this.closeWindow()})}toggleWindow(){this.isOpen?this.closeWindow():this.openWindow()}openWindow(){this.isOpen=!0,this.windowEl?.classList.add("open"),this.toggleBtnEl?.classList.add("hidden"),this.scrollToBottom(),this.inputEl?.focus()}closeWindow(){this.isOpen=!1,this.windowEl?.classList.remove("open"),this.toggleBtnEl?.classList.remove("hidden")}toggleMaximize(){this.isMaximized=!this.isMaximized;let e=this.windowEl?.querySelector(".max-icon");this.isMaximized?(this.windowEl?.classList.add("w-[550px]","h-[700px]"),this.windowEl?.classList.remove("w-[380px]","h-[520px]"),e&&(e.innerHTML='<path stroke-linecap="round" stroke-linejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3 3m12 6V4.5m0 4.5h4.5m-4.5 0l6-6M9 15v4.5M9 15H4.5m4.5 0l-6 6m6-6v4.5m0-4.5h4.5m-4.5 0l6 6" />')):(this.windowEl?.classList.remove("w-[550px]","h-[700px]"),this.windowEl?.classList.add("w-[380px]","h-[520px]"),e&&(e.innerHTML='<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75v4.5m0-4.5h-4.5m4.5 0L15 9m5.25 11.25v-4.5m0 4.5h-4.5m4.5 0L15 15" />')),this.scrollToBottom()}scrollToBottom(){this.messagesContainerEl&&setTimeout(()=>{this.messagesContainerEl.scrollTop=this.messagesContainerEl.scrollHeight},50)}renderMessages(){this.messagesContainerEl&&(this.messagesContainerEl.innerHTML="",this.chatHistory.forEach(e=>{this.appendMessageHTML(e.role,e.content)}),this.scrollToBottom())}appendMessageHTML(e,s){if(!this.messagesContainerEl)return;let t=document.createElement("div");t.className=`flex w-full ${e==="user"?"justify-end":"justify-start"} animate-fade-in`;let o=document.createElement("div");e==="user"?(o.className="message-bubble-user max-w-[80%] px-3 py-2 text-xs font-mono leading-relaxed text-left border border-[#00d2ff]/30 text-white rounded-2xl",o.textContent=`> ${s}`):(o.className="message-bubble-assistant max-w-[85%] px-3 py-2 text-xs font-sans leading-relaxed text-left border border-white/5 text-[#8a8a8a] rounded-2xl",o.innerHTML=this.parseMarkdown(s)),t.appendChild(o),this.messagesContainerEl.appendChild(t)}parseMarkdown(e){let s=e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");return s=s.replace(/```([\s\S]+?)```/g,(t,o)=>`<pre class="bg-[#050505]/80 border border-[#2a2a2a] p-2 rounded my-1.5 overflow-x-auto font-mono text-[10px] text-[#00d2ff] leading-normal"><code>${o.trim()}</code></pre>`),s=s.replace(/`([^`]+)`/g,'<code class="bg-[#1e1e1e] text-[#00d2ff] border border-[#2a2a2a]/40 px-1 py-0.5 rounded font-mono text-[10px]">$1</code>'),s=s.replace(/\*\*([^*]+)\*\*/g,'<strong class="text-white font-bold">$1</strong>'),s=s.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,'<a href="$2" target="_blank" rel="noopener noreferrer" class="text-[#00d2ff] hover:underline">$1</a>'),s=s.replace(/(?<!href=")(?<!">)\b(https?:\/\/[^\s<)]*?[^\s<).,;:?!])/g,'<a href="$1" target="_blank" rel="noopener noreferrer" class="text-[#00d2ff] hover:underline">$1</a>'),s=s.replace(/(?<!href="mailto:)(?<!">)\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/g,'<a href="mailto:$1" class="text-[#00d2ff] hover:underline">$1</a>'),s=s.replace(/\n/g,"<br>"),s}showTypingIndicator(){if(this.typingIndicatorEl||!this.messagesContainerEl)return;let e=document.querySelector(".chat-widget-button"),s=document.querySelector(".chat-header");e&&e.classList.add("thinking"),s&&s.classList.add("thinking"),this.typingIndicatorEl=document.createElement("div"),this.typingIndicatorEl.className="flex w-full justify-start typing-indicator-wrapper",this.typingIndicatorEl.innerHTML=`
      <div class="max-w-[80%] bg-[#2a2a2a]/10 border border-[#2a2a2a]/40 text-[#8a8a8a] rounded-2xl px-3 py-2.5 text-xs flex items-center gap-1.5">
        <span class="text-[10px] font-mono mr-1 uppercase text-[#8a8a8a]/60">AI processing</span>
        <div class="typing-dots flex items-center gap-1">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    `,this.messagesContainerEl.appendChild(this.typingIndicatorEl),this.scrollToBottom()}hideTypingIndicator(){this.typingIndicatorEl&&this.messagesContainerEl&&(this.messagesContainerEl.removeChild(this.typingIndicatorEl),this.typingIndicatorEl=null);let e=document.querySelector(".chat-widget-button"),s=document.querySelector(".chat-header");e&&e.classList.remove("thinking"),s&&s.classList.remove("thinking")}async handleUserSubmit(){if(!this.inputEl)return;let e=this.inputEl.value.trim();if(e){this.inputEl.value="",this.chatHistory.push({role:"user",content:e}),this.saveHistory(),this.appendMessageHTML("user",e),this.scrollToBottom(),this.inputEl&&(this.inputEl.disabled=!0),this.sendBtnEl&&(this.sendBtnEl.disabled=!0),this.showTypingIndicator();try{let s=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:e,history:this.chatHistory.slice(0,-1)})});this.hideTypingIndicator();let t;try{t=await s.json()}catch{}if(!s.ok){let o=t&&t.error?t.error:`Server returned code ${s.status}`;throw new Error(o)}if(t&&t.response){let o=t.response;this.chatHistory.push({role:"assistant",content:o}),this.saveHistory(),this.appendMessageHTML("assistant",o)}else throw new Error("Empty response payload")}catch(s){this.hideTypingIndicator(),console.error("Chat error:",s),this.appendMessageHTML("assistant",`\u26A0\uFE0F **System Error**: ${s.message||"Unable to contact the AI assistant system. Please ensure the backend server is running."}`)}finally{this.inputEl&&(this.inputEl.disabled=!1,this.inputEl.focus()),this.sendBtnEl&&(this.sendBtnEl.disabled=!1),this.scrollToBottom()}}}};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>new f):new f;})();
