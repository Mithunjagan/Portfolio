// -------------------------------------------------------------
// CYBERNETIC CHRONICLES - INTERACTIVE APPLICATION CODE
// -------------------------------------------------------------

// Global Mouse Tracking (runs immediately to capture user pointer before app loading finishes)
let globalMouseX = window.innerWidth / 2;
let globalMouseY = window.innerHeight / 2;
window.addEventListener('mousemove', (e) => {
  globalMouseX = e.clientX;
  globalMouseY = e.clientY;
}, { passive: true });

// Core Variables
const totalFrames = 154;
const frameIndexStart = 10;
const images = [];
const imageSequenceObj = { frame: 0 };

// DOM Selectors
const canvas = document.getElementById('cyborg-canvas');
const context = canvas.getContext('2d');
const loaderBar = document.getElementById('loader-bar');
const loaderPercentage = document.getElementById('loader-percentage');
const loaderStatusText = document.getElementById('loader-status-text');
const preloader = document.getElementById('preloader');
const loaderConsole = document.getElementById('loader-console');

// Telemetry console logs for immersive loading screen
const consoleMsgs = [
  "CONNECTING TO AEGIS CORE NETWORK...",
  "RESOLVING FRAME DECOMPRESSION BUFFER...",
  "INITIALIZING NEURAL RECEPTOR CALIBRATION...",
  "CACHING HIGH-FIDELITY IMAGE TELEMETRY...",
  "VERIFYING INTEGRITY OF QUANTUM CHASSIS MESH...",
  "HARDWARE ACCELERATION: COMPATIBLE.",
  "INTEGRATING BIOPORT BIO-SIGNALS...",
  "CALIBRATING OCULAR SENSORS..."
];

// Log random statuses to the preloader console
function updateConsole() {
  const randomMsg = consoleMsgs[Math.floor(Math.random() * consoleMsgs.length)];
  loaderConsole.innerHTML += `<br>&gt; ${randomMsg}`;
  loaderConsole.scrollTop = loaderConsole.scrollHeight;
}
const consoleInterval = setInterval(updateConsole, 350);

// =============================================================
// HIGH-TECH TEXT SCRAMBLER DECRYPTOR
// =============================================================
class TextScrambler {
  constructor(el) {
    this.el = el;
    this.chars = '!<>-_\\/[]{}—=+*^?#________';
    this.update = this.update.bind(this);
    this.isScrambling = false;
  }
  scramble(duration = 800) {
    if (!this.el) return Promise.resolve();
    
    // Protect original text content from corruption if triggered during a running scramble
    if (!this.isScrambling) {
      this.originalHTML = this.el.innerHTML;
      this.newText = this.el.textContent.trim();
    }
    
    const length = this.newText.length;
    if (length === 0) return Promise.resolve();
    const promise = new Promise((resolve) => this.resolve = resolve);
    this.queue = [];
    this.isScrambling = true;
    
    const maxFrames = Math.floor(duration / 16.7);
    
    for (let i = 0; i < length; i++) {
      const char = this.newText[i];
      if (char === ' ') {
        this.queue.push({ from: ' ', to: ' ', start: 0, end: 0 });
        continue;
      }
      const start = Math.floor(Math.random() * (maxFrames * 0.4));
      const end = start + Math.floor(Math.random() * (maxFrames * 0.6)) + 5;
      this.queue.push({ from: char, to: char, start, end });
    }
    
    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();
    return promise;
  }
  update() {
    let output = '';
    let complete = 0;
    for (let i = 0, n = this.queue.length; i < n; i++) {
      let { from, to, start, end, char } = this.queue[i];
      if (from === ' ') {
        output += ' ';
        complete++;
        continue;
      }
      if (this.frame >= end) {
        complete++;
        output += to;
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.randomChar();
          this.queue[i].char = char;
        }
        output += `<span class="text-brand-neon font-mono">${char}</span>`;
      } else {
        output += from;
      }
    }
    this.el.innerHTML = output;
    if (complete === this.queue.length) {
      this.el.innerHTML = this.originalHTML;
      this.isScrambling = false;
      if (this.resolve) this.resolve();
    } else {
      this.frameRequest = requestAnimationFrame(this.update);
      this.frame++;
    }
  }
  randomChar() {
    return this.chars[Math.floor(Math.random() * this.chars.length)];
  }
}

function triggerScramble(el, duration = 800) {
  if (!el) return;
  if (!el.scrambler) {
    el.scrambler = new TextScrambler(el);
  }
  el.scrambler.scramble(duration);
}

// Get the correct frame path based on relative sequence indices
function getFramePath(index) {
  const frameNum = index + frameIndexStart;
  const paddedNum = String(frameNum).padStart(3, '0');
  return `ezgif-frame-${paddedNum}.jpg`;
}

// Track image load progress
let loadedImagesCount = 0;
function imageLoaded() {
  loadedImagesCount++;
  const progressPercent = Math.floor((loadedImagesCount / totalFrames) * 100);
  
  // Update UI linear progress bar
  if (loaderBar) {
    loaderBar.style.width = `${progressPercent}%`;
  }
  
  // Update UI percentage text
  if (loaderPercentage) {
    loaderPercentage.textContent = `${progressPercent}%`;
  }
  
  // Update SVG ring stroke-dashoffset
  const ringCircle = document.getElementById('ring-progress-circle');
  if (ringCircle) {
    const circumference = 282.74; // Circumference for r=45
    const offset = circumference - (progressPercent / 100) * circumference;
    ringCircle.style.strokeDashoffset = offset;
  }
  
  if (loadedImagesCount === totalFrames) {
    clearInterval(consoleInterval);
    if (loaderStatusText) {
      loaderStatusText.textContent = "SYNAPSE SYNC SECURE. READY TO DEPLOY.";
    }
    
    // Animate loader out using sci-fi split shutter panels
    setTimeout(() => {
      // 1. Fade out preloader content elements
      gsap.to('.preloader-content', {
        opacity: 0,
        scale: 0.95,
        duration: 0.55,
        ease: "power2.inOut",
        onComplete: () => {
          // 2. Optic sensor wakeup blinking sequence
          const shutterTL = gsap.timeline({
            delay: 1.0,
            onComplete: () => {
              if (preloader) {
                preloader.style.display = 'none';
              }
            }
          });
          
          // Set initial slumped head state and heavy blur/dim state on #app-container and header
          gsap.set(['#app-container', 'header'], {
            '--wake-blur': '25px',
            '--wake-brightness': 0.1,
            opacity: 0,
            y: 45,
            x: -18,
            rotation: -2.2,
            scale: 0.95
          });

          // ==========================================
          // 1. FIRST TRY: Open eyes, vision is blurry
          // ==========================================
          shutterTL.to('.preloader-bg-top', { yPercent: -30, duration: 0.3, ease: "power1.out" }, 0)
                   .to('.preloader-bg-bottom', { yPercent: 30, duration: 0.3, ease: "power1.out" }, 0)
                   .to(['#app-container', 'header'], { 
                     '--wake-blur': '24px', 
                     '--wake-brightness': 0.8, 
                     opacity: 0.3,
                     y: 35,
                     x: -14,
                     rotation: -1.8,
                     scale: 0.96,
                     duration: 0.3, 
                     ease: "power1.out" 
                   }, 0)
                   
                   // Hold open slightly, vision remains blurry
                   .to(['#app-container', 'header'], {
                     y: 30,
                     x: -11,
                     rotation: -1.4,
                     scale: 0.97,
                     duration: 0.35,
                     ease: "none"
                   })
                   
                   // Close the eyes
                   .to('.preloader-bg-top', { yPercent: 0, duration: 0.15, ease: "power1.in" }, ">")
                   .to('.preloader-bg-bottom', { yPercent: 0, duration: 0.15, ease: "power1.in" }, "<")
                   .to(['#app-container', 'header'], { 
                     '--wake-blur': '25px', 
                     '--wake-brightness': 0.1, 
                     opacity: 0,
                     duration: 0.15, 
                     ease: "power1.in" 
                   }, "<")
                   
          // ==========================================
          // 2. PAUSE: Eyes closed, head drifts
          // ==========================================
                   .to(['#app-container', 'header'], {
                     y: 25,
                     x: -8,
                     rotation: -1.0,
                     scale: 0.98,
                     duration: 0.3,
                     ease: "power1.inOut"
                   }, ">")

          // ==========================================
          // 3. OPEN AGAIN AND BLINKS TWO TIMES (FAST FLUTTER)
          // ==========================================
                   // Open again (to 60%)
                   .to('.preloader-bg-top', { yPercent: -60, duration: 0.2, ease: "power1.out" }, ">")
                   .to('.preloader-bg-bottom', { yPercent: 60, duration: 0.2, ease: "power1.out" }, "<")
                   .to(['#app-container', 'header'], { 
                     '--wake-blur': '14px', 
                     '--wake-brightness': 1.5, 
                     opacity: 0.6,
                     y: 18,
                     x: -5,
                     rotation: -0.5,
                     duration: 0.2, 
                     ease: "power1.out" 
                   }, "<")
                   
                   // Blink 1: Close quickly
                   .to('.preloader-bg-top', { yPercent: 0, duration: 0.05, ease: "power1.in" }, "+=0.08")
                   .to('.preloader-bg-bottom', { yPercent: 0, duration: 0.05, ease: "power1.in" }, "<")
                   .to(['#app-container', 'header'], { '--wake-brightness': 0.15, opacity: 0.1, duration: 0.05, ease: "power1.in" }, "<")
                   
                   // Reopen to 75%
                   .to('.preloader-bg-top', { yPercent: -75, duration: 0.08, ease: "power1.out" })
                   .to('.preloader-bg-bottom', { yPercent: 75, duration: 0.08, ease: "power1.out" }, "<")
                   .to(['#app-container', 'header'], { 
                     '--wake-blur': '8px', 
                     '--wake-brightness': 1.9, 
                     opacity: 0.75,
                     y: 10,
                     x: -3,
                     rotation: -0.2,
                     duration: 0.08, 
                     ease: "power1.out" 
                   }, "<")
                   
                   // Blink 2: Close quickly
                   .to('.preloader-bg-top', { yPercent: 0, duration: 0.05, ease: "power1.in" }, "+=0.06")
                   .to('.preloader-bg-bottom', { yPercent: 0, duration: 0.05, ease: "power1.in" }, "<")
                   .to(['#app-container', 'header'], { '--wake-brightness': 0.15, opacity: 0.1, duration: 0.05, ease: "power1.in" }, "<")
                   
                   // Open fully to 100% (Final wake)
                   .to('.preloader-bg-top', { yPercent: -100, duration: 0.9, ease: "power2.out" })
                   .to('.preloader-bg-bottom', { yPercent: 100, duration: 0.9, ease: "power2.out" }, "<")
                   
                   // Restore pointer events and initialize application scrolling/interactions immediately as eyelids open
                   .call(() => {
                     if (preloader) {
                       preloader.style.pointerEvents = 'none';
                     }
                     gsap.set(['#app-container', 'header'], { pointerEvents: 'auto' });
                     initializeApplication();
                   }, null, "<")
                   
                   // Head lifts and straightens fully, resolving smoothly
                   .to(['#app-container', 'header'], { 
                     y: 0, 
                     x: 0, 
                     rotation: 0, 
                     scale: 1.0, 
                     opacity: 1.0,
                     duration: 1.5, 
                     ease: "power2.out" 
                   }, "<")
                   
                   // Blinding light flash peaks softly
                   .to(['#app-container', 'header'], { 
                     '--wake-blur': '6px', 
                     '--wake-brightness': 2.2, 
                     duration: 0.5, 
                     ease: "power1.out" 
                   }, "<")
                   
                   // Focus resolves and brightness stabilizes smoothly ("recovered vision")
                   .to(['#app-container', 'header'], { 
                     '--wake-blur': '0px', 
                     '--wake-brightness': 1.0, 
                     duration: 2.0, 
                     ease: "power3.out",
                     onComplete: () => {
                       // Add class to disable CSS filter selectors and clear all GSAP inline styles
                       const container = document.getElementById('app-container');
                       if (container) {
                         container.classList.add('woke');
                       }
                       const headerEl = document.querySelector('header');
                       if (headerEl) {
                         headerEl.classList.add('woke');
                       }
                       gsap.set(['#app-container', 'header'], { 
                         clearProps: "all" 
                       });
                     }
                   }, "-=0.1");
        }
      });
    }, 800);
  }
}

// Preload all 154 image frames into the images array
function preloadImages() {
  for (let i = 0; i < totalFrames; i++) {
    const img = new Image();
    img.src = getFramePath(i);
    img.onload = imageLoaded;
    img.onerror = () => {
      console.warn(`Failed to cache frame at ${img.src}. Continuing loading sequence.`);
      imageLoaded(); // Ensure we don't hang the preloader
    };
    images.push(img);
  }
}

// Draw a frame centered on the canvas using 'cover' aspect ratio logic to fill the frame
function drawFrame(index) {
  const img = images[index];
  if (!img) return;
  
  const scale = window.devicePixelRatio || 1;
  const cw = canvas.width / scale;
  const ch = canvas.height / scale;

  // 1. Clear canvas to transparent
  context.clearRect(0, 0, cw, ch);
  
  const imgWidth = img.naturalWidth || img.width;
  const imgHeight = img.naturalHeight || img.height;
  const imgRatio = imgWidth / imgHeight;
  const canvasRatio = cw / ch;
  
  let drawWidth, drawHeight;
  let offsetX, offsetY;
  
  // Cover logic: scale image to fully cover the screen area
  if (imgRatio > canvasRatio) {
    // Canvas is taller than the image aspect ratio (e.g. phone screen). Match height, crop width.
    drawHeight = ch;
    drawWidth = ch * imgRatio;
    offsetX = (cw - drawWidth) / 2;
    offsetY = 0;
  } else {
    // Canvas is wider than the image aspect ratio. Match width, crop height.
    drawWidth = cw;
    drawHeight = cw / imgRatio;
    offsetX = 0;
    offsetY = (ch - drawHeight) / 2;
  }
  
  // 2. Draw matching vertical background gradient inside the image area
  const grad = context.createLinearGradient(offsetX, offsetY, offsetX, offsetY + drawHeight);
  grad.addColorStop(0.0, 'rgb(157, 149, 146)');
  grad.addColorStop(0.15, 'rgb(178, 173, 169)');
  grad.addColorStop(0.31, 'rgb(195, 190, 186)');
  grad.addColorStop(0.46, 'rgb(209, 204, 200)');
  grad.addColorStop(0.67, 'rgb(215, 212, 207)');
  grad.addColorStop(1.0, 'rgb(215, 212, 207)');
  
  context.fillStyle = grad;
  context.fillRect(offsetX - 1, offsetY - 1, drawWidth + 2, drawHeight + 2);
  
  // 3. Draw the character image
  context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

  // 4. Apply horizontal transparency mask (destination-in composite operation)
  const hMask = context.createLinearGradient(offsetX, 0, offsetX + drawWidth, 0);
  hMask.addColorStop(0.0, 'rgba(0, 0, 0, 0)');
  hMask.addColorStop(0.10, 'rgba(0, 0, 0, 1)');
  hMask.addColorStop(0.90, 'rgba(0, 0, 0, 1)');
  hMask.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
  
  context.globalCompositeOperation = 'destination-in';
  context.fillStyle = hMask;
  context.fillRect(offsetX, 0, drawWidth, ch);
  
  // 5. Apply vertical transparency mask (destination-in)
  const vMask = context.createLinearGradient(0, offsetY, 0, offsetY + drawHeight);
  vMask.addColorStop(0.0, 'rgba(0, 0, 0, 0)');
  vMask.addColorStop(0.05, 'rgba(0, 0, 0, 1)');
  vMask.addColorStop(0.95, 'rgba(0, 0, 0, 1)');
  vMask.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
  
  context.fillStyle = vMask;
  context.fillRect(0, offsetY, cw, drawHeight);
  
  // Restore default composition operation
  context.globalCompositeOperation = 'source-over';
}

// Scale canvas for high-DPI displays to ensure clean vector lines and image crispness
function resizeCanvas() {
  const scale = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  
  canvas.width = rect.width * scale;
  canvas.height = rect.height * scale;
  context.scale(scale, scale);
  
  drawFrame(Math.floor(imageSequenceObj.frame));
}

// Initialize all GSAP, ScrollTrigger, and Lenis logic
function initializeApplication() {
  // 1. Initialize Lenis Smooth Scroll
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    smoothTouch: false
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Synchronize ScrollTrigger with Lenis
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  // 2. Play Hero Intro Entrance Animation
  const fadeElements = document.querySelectorAll('.fade-up');
  fadeElements.forEach(el => el.classList.add('visible'));

  // Trigger Scramble on Hero Section texts
  setTimeout(() => {
    triggerScramble(document.querySelector('.logo-text'), 1200);
    triggerScramble(document.querySelector('.hero-tag-text'), 1000);
    triggerScramble(document.querySelector('.text-gradient-metallic'), 1200);
    triggerScramble(document.querySelector('.hero-desc-text'), 1400);
  }, 100);

  // 3. Register ScrollTrigger and setup canvas resize handler
  gsap.registerPlugin(ScrollTrigger);
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  
  // Render the initial frame
  drawFrame(0);

  // 4. Setup ScrollTrigger Animation for the Canvas
  gsap.to(imageSequenceObj, {
    frame: totalFrames - 1,
    snap: 'frame',
    ease: 'none',
    scrollTrigger: {
      trigger: '.scrolly-container',
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        drawFrame(Math.floor(imageSequenceObj.frame));
      }
    }
  });

  // 4b. Setup Dynamic 3D Tilt, Glare, Spotlight, and Watermark animations for the phone frame on desktop
  if (window.innerWidth > 768) {
    gsap.timeline({
      scrollTrigger: {
        trigger: '.scrolly-container',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.2 /* Smooth scroll inertia feel */
      }
    })
    .fromTo('.phone-frame', {
      rotationY: -10,
      rotationX: 6,
      scale: 0.96
    }, {
      rotationY: 10,
      rotationX: -6,
      scale: 1,
      ease: 'power1.inOut'
    })
    .fromTo('.screen-glare', {
      xPercent: -15,
      yPercent: -15
    }, {
      xPercent: 15,
      yPercent: 15,
      ease: 'power1.inOut'
    }, 0)
    .fromTo('.phone-spotlight', {
      scale: 0.85,
      opacity: 0.6
    }, {
      scale: 1.15,
      opacity: 1,
      ease: 'power1.inOut'
    }, 0)
    .fromTo('.bg-watermark', {
      opacity: 0.4,
      scale: 0.95
    }, {
      opacity: 0.9,
      scale: 1.05,
      ease: 'power1.inOut'
    }, 0);
  }

  // 5. Setup ScrollTrigger activations for the HUD floating labels
  const hudConfigs = [
    { id: 'hud-panel-1', startPct: 10, endPct: 30 },
    { id: 'hud-panel-2', startPct: 32, endPct: 52 },
    { id: 'hud-panel-3', startPct: 54, endPct: 74 },
    { id: 'hud-panel-4', startPct: 76, endPct: 96 }
  ];

  hudConfigs.forEach(config => {
    ScrollTrigger.create({
      trigger: '.scrolly-container',
      start: `top+=${config.startPct}% top`,
      end: `top+=${config.endPct}% top`,
      onEnter: () => {
        const el = document.getElementById(config.id);
        if (el) {
          el.classList.add('active');
          triggerScramble(el.querySelector('.hud-title'), 800);
          triggerScramble(el.querySelector('.hud-id'), 800);
          triggerScramble(el.querySelector('.hud-status'), 800);
        }
      },
      onLeave: () => {
        const el = document.getElementById(config.id);
        if (el) el.classList.remove('active');
      },
      onEnterBack: () => {
        const el = document.getElementById(config.id);
        if (el) {
          el.classList.add('active');
          triggerScramble(el.querySelector('.hud-title'), 800);
          triggerScramble(el.querySelector('.hud-id'), 800);
          triggerScramble(el.querySelector('.hud-status'), 800);
        }
      },
      onLeaveBack: () => {
        const el = document.getElementById(config.id);
        if (el) el.classList.remove('active');
      }
    });
  });

  // 6. Smooth Scroll Navigation clicks
  document.querySelectorAll('header a').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = anchor.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        lenis.scrollTo(targetElement, { offset: -30 });
      }
    });
  });

  // 7. Interactive Liquid-Glass Navigation Bar
  const navContainer = document.getElementById('nav-container');
  const indicator = document.getElementById('nav-indicator');
  const links = document.querySelectorAll('.nav-link');
  let activeLink = document.querySelector('.nav-link.active') || links[0];

  let isNavbarHovered = false;

  function updateIndicator(targetLink) {
    if (!targetLink || !navContainer || !indicator) return;
    const linkRect = targetLink.getBoundingClientRect();
    const containerRect = navContainer.getBoundingClientRect();
    
    const leftOffset = linkRect.left - containerRect.left;
    const width = linkRect.width;
    
    // Determine current position to check if we are actually moving
    const currentLeft = parseFloat(indicator.style.left) || 0;
    const currentWidth = parseFloat(indicator.style.width) || 0;
    const isFirstRun = currentWidth === 0 || window.getComputedStyle(indicator).opacity === '0';
    
    gsap.killTweensOf(indicator);
    
    // Target scale: if hovered, keep zoomed in
    const targetScaleX = isNavbarHovered ? 1.18 : 1.0;
    const targetScaleY = isNavbarHovered ? 1.25 : 1.0;
    
    if (isFirstRun) {
      gsap.set(indicator, {
        left: leftOffset,
        width: width,
        opacity: 1,
        scaleX: targetScaleX,
        scaleY: targetScaleY
      });
      
      // Synchronize text scale
      links.forEach(l => {
        gsap.set(l, {
          scale: (l === targetLink && isNavbarHovered) ? 1.22 : 1.0,
          color: (l === targetLink) ? "#ffffff" : "rgba(255, 255, 255, 0.5)",
          textShadow: (l === targetLink && isNavbarHovered) ? "0 0 10px rgba(0, 210, 255, 0.6)" : "none"
        });
      });
    } else {
      const dist = Math.abs(leftOffset - currentLeft);
      const shouldZoom = dist > 8; // Only trigger traveling swell if moving a significant distance
      
      const tl = gsap.timeline();
      
      tl.to(indicator, {
        left: leftOffset,
        width: width,
        opacity: 1,
        duration: 0.5,
        ease: "power2.out"
      }, 0);
      
      if (isNavbarHovered) {
        if (shouldZoom) {
          // Extra stretch/swell during travel
          tl.to(indicator, {
            scaleX: 1.3,
            scaleY: 1.35,
            duration: 0.25,
            ease: "power1.out"
          }, 0)
          .to(indicator, {
            scaleX: 1.18,
            scaleY: 1.25,
            duration: 0.25,
            ease: "power2.inOut"
          }, 0.25);
        } else {
          // Stay in liquid zoom mode
          tl.to(indicator, {
            scaleX: 1.18,
            scaleY: 1.25,
            duration: 0.3,
            ease: "power2.out"
          }, 0);
        }
      } else {
        // Return to normal unhovered scale
        tl.to(indicator, {
          scaleX: 1.0,
          scaleY: 1.0,
          duration: 0.4,
          ease: "power2.out"
        }, 0);
      }
      
      // Magnify / scale the link texts through the glass
      links.forEach(l => {
        const isTarget = (l === targetLink);
        const targetTextScale = (isTarget && isNavbarHovered) ? 1.22 : 1.0;
        const targetColor = isTarget ? "#ffffff" : "rgba(255, 255, 255, 0.5)";
        const targetShadow = (isTarget && isNavbarHovered) ? "0 0 10px rgba(0, 210, 255, 0.6)" : "none";
        
        gsap.to(l, {
          scale: targetTextScale,
          color: targetColor,
          textShadow: targetShadow,
          duration: 0.4,
          ease: "power2.out"
        }, 0);
      });
    }
  }

  // Update position initially after a brief delay for rendering
  setTimeout(() => {
    if (activeLink) {
        updateIndicator(activeLink);
    }
  }, 300);

  // Hover state of the whole navbar capsule container
  if (navContainer) {
    navContainer.addEventListener('mouseenter', () => {
      isNavbarHovered = true;
    });
    navContainer.addEventListener('mouseleave', () => {
      isNavbarHovered = false;
      updateIndicator(activeLink);
    });
  }

  links.forEach(link => {
    link.addEventListener('mouseenter', (e) => {
      updateIndicator(e.target);
    });
    link.addEventListener('click', (e) => {
      links.forEach(l => l.classList.remove('active'));
      e.target.classList.add('active');
      activeLink = e.target;
      updateIndicator(activeLink);
    });
  });

  window.addEventListener('resize', () => {
    if (activeLink) {
      updateIndicator(activeLink);
    }
  });

  // 8. Sync Navigation active states with Scroll position
  const sections = [
    { id: 'hero-section', index: 0 },
    { id: 'skills-section', index: 1 },
    { id: 'scrolly-section', index: 2 },
    { id: 'specs-section', index: 3 }
  ];

  sections.forEach(sec => {
    ScrollTrigger.create({
      trigger: `#${sec.id}`,
      start: 'top 50%',
      end: 'bottom 50%',
      onEnter: () => activateLinkByIndex(sec.index),
      onEnterBack: () => activateLinkByIndex(sec.index)
    });
  });

  function activateLinkByIndex(index) {
    links.forEach((l, idx) => {
      if (idx === index) {
        l.classList.add('active');
        activeLink = l;
        if (!isNavbarHovered) {
          updateIndicator(activeLink);
        }
      } else {
        l.classList.remove('active');
      }
    });
  }

  // 10. Letter-by-Letter Signature Handwriting Reveal
  const sig = document.querySelector('.signature-text');
  if (sig) {
    const text = sig.textContent.trim();
    sig.innerHTML = '';
    
    // Split text into letters and wrap in spans
    const letters = [...text].map(char => {
      const span = document.createElement('span');
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.display = 'inline-block';
      span.style.overflow = 'hidden';
      span.style.whiteSpace = 'nowrap';
      span.style.width = '0';
      span.style.opacity = '0';
      span.style.transform = 'translateY(4px)';
      span.style.verticalAlign = 'bottom';
      sig.appendChild(span);
      return span;
    });
    
    // Temporarily lay out naturally to measure widths
    const targetWidths = letters.map(span => {
      span.style.width = 'auto';
      span.style.opacity = '1';
      const w = span.offsetWidth;
      // Reset back to zero for animation start
      span.style.width = '0';
      span.style.opacity = '0';
      return w;
    });
    
    // Animate letters one by one using a GSAP timeline
    const sigTL = gsap.timeline({ delay: 0.6 });
    letters.forEach((span, i) => {
      sigTL.to(span, {
        width: targetWidths[i],
        opacity: 1,
        y: 0,
        duration: 0.22,
        ease: 'power1.out'
      }, i * 0.12);
    });
  }
  
  // 11. Initialize Twinkling Starfield Background
  initStars();

  // 12. Register ScrollTrigger and Hover Event listeners for Text Scrambling
  // ScrollTrigger scramble for all section tags and headers
  document.querySelectorAll('.section-header h2, .section-tag, .specs-section .section-tag, .specs-section h2, .endcard-section h2, .endcard-section .section-tag').forEach(el => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      onEnter: () => triggerScramble(el, 1000)
    });
  });

  // ScrollTrigger scramble for work experience spec cards
  document.querySelectorAll('.spec-card').forEach(card => {
    // Only target cards outside the capability matrix or endcard
    if (!card.closest('.skills-section') && !card.closest('.endcard-section')) {
      ScrollTrigger.create({
        trigger: card,
        start: 'top 85%',
        onEnter: () => {
          card.querySelectorAll('.spec-title').forEach(title => {
            triggerScramble(title, 800);
          });
        },
        once: true
      });
    }
  });

  // Hover scramble for all headers, titles, category tags, and logos
  const titlesToHoverScramble = document.querySelectorAll(
    '.text-gradient-metallic, ' +             // Hero title "PORTFOLIO"
    '.section-header h2, ' +                  // Section titles (Skillset, Projects, Journey)
    '.section-tag, ' +                        // Section tags/category headers
    '.skills-section h3, ' +                  // Capability Matrix card titles
    '.hud-title, ' +                          // HUD panel titles
    '.spec-title, ' +                         // Experience card titles
    '.logo-text, ' +                          // Logo title "Mithun"
    '.hero-tag-text, ' +                      // Hero ECE researcher tag
    '.endcard-section h2, ' +                 // Endcard title "THE END"
    '.endcard-section .section-tag'           // Endcard status tag
  );
  
  titlesToHoverScramble.forEach(el => {
    el.addEventListener('mouseenter', () => {
      triggerScramble(el, 800);
    });
  });

  // Hover scrambles for navigation capsule links
  links.forEach(link => {
    link.addEventListener('mouseenter', () => {
      triggerScramble(link, 600);
    });
  });

  // Hover scrambles for CTA buttons (Launch Console)
  document.querySelectorAll('.btn-glow').forEach(btn => {
    const textEl = btn.querySelector('.cta-text');
    if (textEl) {
      btn.addEventListener('mouseenter', () => {
        triggerScramble(textEl, 600);
      });
    }
  });

  // Hover scrambles for social media icon button tooltips
  document.querySelectorAll('.social-btn').forEach(btn => {
    const tooltip = btn.querySelector('.social-tooltip');
    if (tooltip) {
      btn.addEventListener('mouseenter', () => {
        triggerScramble(tooltip, 500);
      });
    }
  });

  // Hover scrambles for main resume download button text
  const resumeBtn = document.querySelector('.resume-btn');
  if (resumeBtn) {
    const btnText = resumeBtn.querySelector('.btn-text');
    if (btnText) {
      resumeBtn.addEventListener('mouseenter', () => {
        triggerScramble(btnText, 500);
      });
    }
  }

}

// Interactive Starfield Background Creation & Animation
function initStars() {
  const starsCanvas = document.createElement('canvas');
  starsCanvas.id = 'stars-canvas';
  const appContainer = document.getElementById('app-container');
  if (appContainer) {
    appContainer.appendChild(starsCanvas);
  } else {
    document.body.appendChild(starsCanvas);
  }
  
  // Styling starfield canvas to float fixed in background
  starsCanvas.style.position = 'fixed';
  starsCanvas.style.top = '0';
  starsCanvas.style.left = '0';
  starsCanvas.style.width = '100vw';
  starsCanvas.style.height = '100vh';
  starsCanvas.style.zIndex = '1';
  starsCanvas.style.pointerEvents = 'none';
  
  const ctx = starsCanvas.getContext('2d');
  const stars = [];
  const maxStars = 140; // Dense but light star density
  
  function resizeStarsCanvas() {
    starsCanvas.width = window.innerWidth;
    starsCanvas.height = window.innerHeight;
    
    // Repopulate stars on resize to distribute evenly
    stars.length = 0;
    for (let i = 0; i < maxStars; i++) {
      stars.push({
        x: Math.random() * starsCanvas.width,
        y: Math.random() * starsCanvas.height,
        radius: Math.random() * 1.1 + 0.3,
        alpha: Math.random(),
        twinkleSpeed: Math.random() * 0.015 + 0.003,
        direction: Math.random() > 0.5 ? 1 : -1
      });
    }
  }
  
  window.addEventListener('resize', resizeStarsCanvas);
  resizeStarsCanvas();
  
  // Monitor mouse movements for soft parallax offsets
  let targetMouseX = window.innerWidth / 2;
  let targetMouseY = window.innerHeight / 2;
  window.addEventListener('mousemove', (e) => {
    targetMouseX = e.clientX;
    targetMouseY = e.clientY;
  });
  
  let currentOffsetX = 0;
  let currentOffsetY = 0;
  
  function drawStars() {
    ctx.clearRect(0, 0, starsCanvas.width, starsCanvas.height);
    
    // Slow parallax inertia calculation
    const targetOffsetX = (window.innerWidth / 2 - targetMouseX) * 0.015;
    const targetOffsetY = (window.innerHeight / 2 - targetMouseY) * 0.015;
    
    currentOffsetX += (targetOffsetX - currentOffsetX) * 0.05;
    currentOffsetY += (targetOffsetY - currentOffsetY) * 0.05;
    
    stars.forEach(star => {
      ctx.beginPath();
      
      // Offset positions
      const px = star.x + currentOffsetX;
      const py = star.y + currentOffsetY;
      
      // Calculate twinkling alpha oscillation
      star.alpha += star.twinkleSpeed * star.direction;
      if (star.alpha >= 0.95) {
        star.alpha = 0.95;
        star.direction = -1;
      } else if (star.alpha <= 0.1) {
        star.alpha = 0.1;
        star.direction = 1;
      }
      
      // Render star glow
      ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
      ctx.arc(px, py, star.radius, 0, Math.PI * 2);
      ctx.fill();
    });
    
    requestAnimationFrame(drawStars);
  }
  
  drawStars();
}



// Start preloading images immediately
preloadImages();

// -------------------------------------------------------------
// INTERACTIVE CUSTOM CYBERNETIC CURSOR SYSTEM
// -------------------------------------------------------------
const cursorGlow = document.getElementById('cursor-glow');
const cursorDot = document.querySelector('.custom-cursor-dot');
const cursorRing = document.querySelector('.custom-cursor-ring');

let liveMouseX = globalMouseX;
let liveMouseY = globalMouseY;
let currentX = globalMouseX;
let currentY = globalMouseY;

if (cursorDot && cursorRing) {
  // Align cursor offsets and position them immediately at the last tracked mouse location
  gsap.set(cursorDot, { xPercent: 0, yPercent: 0, x: liveMouseX, y: liveMouseY });
  gsap.set(cursorRing, { xPercent: -50, yPercent: -50, x: liveMouseX, y: liveMouseY });

  // Smoothly fade in the custom cursor immediately so it's visible on the preloader screen
  gsap.to([cursorDot, cursorRing], { opacity: 1, duration: 0.5, ease: "power1.out" });
}

window.addEventListener('mousemove', (e) => {
  liveMouseX = e.clientX;
  liveMouseY = e.clientY;
  
  // Smooth custom cursor glow on movement
  if (cursorGlow) {
      cursorGlow.style.opacity = '1';
  }

  // Instantly track custom cursor vectors
  gsap.to(cursorDot, { x: e.clientX, y: e.clientY, duration: 0, overwrite: 'auto' });
  gsap.to(cursorRing, { x: e.clientX, y: e.clientY, duration: 0.35, ease: 'power2.out', overwrite: 'auto' });
});

window.addEventListener('mouseleave', () => {
  if (cursorGlow) {
      cursorGlow.style.opacity = '0';
  }
  liveMouseX = window.innerWidth / 2;
  liveMouseY = window.innerHeight / 2;
});

// Attach hover styles for clickable links
document.querySelectorAll('a, button, .spec-card, .hud-panel').forEach(item => {
  item.addEventListener('mouseenter', () => {
    gsap.to(cursorDot, { 
      rotation: -18, 
      scale: 1.15, 
      transformOrigin: '0% 0%',
      duration: 0.3,
      ease: 'power1.out'
    });
    gsap.to(cursorRing, { 
      scale: 1.4, 
      borderColor: 'var(--accent-cyan)', 
      backgroundColor: 'rgba(0, 210, 255, 0.08)', 
      duration: 0.3 
    });
  });
  
  item.addEventListener('mouseleave', () => {
    gsap.to(cursorDot, { 
      rotation: 0, 
      scale: 1, 
      transformOrigin: '0% 0%',
      duration: 0.3,
      ease: 'power1.inOut'
    });
    gsap.to(cursorRing, { 
      scale: 1, 
      borderColor: 'var(--accent-cyan)', 
      backgroundColor: 'transparent', 
      duration: 0.3 
    });
  });
});

// Ellipse Sweep Click Animation
let isClickAnimating = false;
const cursorSvg = cursorDot ? cursorDot.querySelector('svg') : null;

window.addEventListener('mousedown', (e) => {
  if (!cursorSvg || isClickAnimating) return;
  isClickAnimating = true;

  const W = window.innerWidth;
  const H = window.innerHeight;
  const Cx = W / 2;
  const Cy = H / 2;
  const Rx = W * 0.42;
  const Ry = H * 0.42;
  const Mx = e.clientX;
  const My = e.clientY;
  const T_x = Mx - W * 0.15;
  const T_y = My - H * 0.15;
  const angleStartOrbit = Math.atan2(T_y - Cy, T_x - Cx);

  const flightData = { progress: 0 };
  let lastTargetX = Mx;
  let lastTargetY = My;

  const flameElement = cursorSvg.querySelector('.engine-flame');
  const flameTL = gsap.timeline();
  flameTL.to(flameElement, { opacity: 0.95, duration: 0.12 })
         .to(flameElement, {
           opacity: 0.45,
           repeat: 27,
           yoyo: true,
           duration: 0.06,
           ease: 'none'
         })
         .to(flameElement, { opacity: 0, duration: 0.2 });

  gsap.timeline({
    onComplete: () => {
      isClickAnimating = false;
      gsap.set(cursorSvg, { x: 0, y: 0, rotation: 0, scale: 1 });
    }
  })
  .to(cursorSvg, {
    scale: 0.75,
    duration: 0.12,
    ease: 'power2.in'
  })
  .to(flightData, {
    progress: 1,
    duration: 2.0,
    ease: 'power1.inOut',
    onUpdate: () => {
      const p = flightData.progress;
      
      let w;
      if (p < 0.25) {
        const ratio = p / 0.25;
        w = ratio * ratio * (3 - 2 * ratio);
      } else if (p < 0.75) {
        w = 1;
      } else {
        const ratio = (1.0 - p) / 0.25;
        w = ratio * ratio * (3 - 2 * ratio);
      }
      
      let localPathX, localPathY;
      if (p < 0.25) {
        const takeoffRatio = p / 0.25;
        localPathX = Mx - (W * 0.15) * takeoffRatio;
        localPathY = My - (H * 0.15) * takeoffRatio;
      } else {
        localPathX = liveMouseX;
        localPathY = liveMouseY;
      }
      
      const angle = angleStartOrbit - 2.2 * Math.PI * (p - 0.25);
      const orbitX = Cx + Rx * Math.cos(angle);
      const orbitY = Cy + Ry * Math.sin(angle);
      
      const targetX = (1 - w) * localPathX + w * orbitX;
      const targetY = (1 - w) * localPathY + w * orbitY;
      
      const localX = targetX - liveMouseX;
      const localY = targetY - liveMouseY;
      
      const dx = targetX - lastTargetX;
      const dy = targetY - lastTargetY;
      
      let scaleVal = 1.25;
      if (p < 0.2) {
        scaleVal = 0.75 + (1.25 - 0.75) * (p / 0.2);
      } else if (p > 0.8) {
        scaleVal = 1.25 * (1 - (p - 0.8) / 0.2);
      }
      
      gsap.set(cursorSvg, { 
        x: localX, 
        y: localY, 
        scale: scaleVal 
      });

      if (p > 0.01 && (dx !== 0 || dy !== 0)) {
        const rawHeading = Math.atan2(dy, dx) * 180 / Math.PI + 135;
        let rotationVal = rawHeading;
        
        if (p > 0.85) {
          const blendRatio = (p - 0.85) / 0.15;
          let normHeading = rawHeading % 360;
          if (normHeading > 180) normHeading -= 360;
          if (normHeading < -180) normHeading += 360;
          rotationVal = normHeading * (1 - blendRatio);
        }
        
        gsap.set(cursorSvg, { rotation: rotationVal });
      }
      
      lastTargetX = targetX;
      lastTargetY = targetY;
    }
  });

  gsap.timeline()
  .to(cursorRing, {
    scale: 3.2,
    opacity: 0,
    borderWidth: '3px',
    borderColor: 'var(--accent-cyan)',
    duration: 0.5,
    ease: 'power2.out'
  })
  .to(cursorRing, {
    scale: 1,
    opacity: 1,
    borderWidth: '1px',
    borderColor: 'var(--accent-cyan)',
    duration: 0.2,
    ease: 'power2.in'
  });
});

// Parallax calculations loop
function animateParallax() {
  currentX += (liveMouseX - currentX) * 0.1;
  currentY += (liveMouseY - currentY) * 0.1;

  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  const offsetX = currentX - centerX;
  const offsetY = currentY - centerY;

  if (cursorGlow) {
      cursorGlow.style.left = `${currentX}px`;
      cursorGlow.style.top = `${currentY}px`;
  }

  requestAnimationFrame(animateParallax);
}

// Start cursor parallax immediately
animateParallax();
