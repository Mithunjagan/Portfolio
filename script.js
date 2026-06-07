// -------------------------------------------------------------
// PORTFOLIO - INTERACTIVE APPLICATION CODE
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
const canvas = document.getElementById('scroll-canvas');
const context = canvas.getContext('2d');
const loaderBar = document.getElementById('loader-bar');
const loaderPercentage = document.getElementById('loader-percentage');
const loaderStatusText = document.getElementById('loader-status-text');
const preloader = document.getElementById('preloader');
const loaderConsole = document.getElementById('loader-console');

// Telemetry console logs for immersive loading screen
const consoleMsgs = [
  "LOADING FRAME SEQUENCE...",
  "RESOLVING FRAME DECOMPRESSION BUFFER...",
  "INITIALIZING SCROLL ANIMATION ENGINE...",
  "CACHING HIGH-FIDELITY IMAGE TELEMETRY...",
  "VERIFYING ASSET INTEGRITY...",
  "HARDWARE ACCELERATION: COMPATIBLE.",
  "PREPARING INTERACTIVE COMPONENTS...",
  "CALIBRATING DISPLAY PIPELINE..."
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
  return `/ezgif-frame-${paddedNum}.jpg`;
}

// Track image load progress
let loadedImagesCount = 0;
const initialFramesToPreload = 12;
let isInitialPreloadComplete = false;

function imageLoaded() {
  if (isInitialPreloadComplete) return;
  loadedImagesCount++;
  const progressPercent = Math.min(100, Math.floor((loadedImagesCount / initialFramesToPreload) * 100));

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

  if (loadedImagesCount === initialFramesToPreload) {
    isInitialPreloadComplete = true;
    clearInterval(consoleInterval);
    if (loaderStatusText) {
      loaderStatusText.textContent = "ALL ASSETS LOADED. READY TO DEPLOY.";
    }

    // Start background loading of remaining frames
    loadRemainingImages();

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

// Preload only the initial frames to speed up initial page load
function preloadImages() {
  // Initialize the images array with null placeholders
  for (let i = 0; i < totalFrames; i++) {
    images.push(null);
  }

  for (let i = 0; i < initialFramesToPreload; i++) {
    const img = new Image();
    img.src = getFramePath(i);
    img.onload = () => {
      images[i] = img;
      imageLoaded();
    };
    img.onerror = () => {
      console.warn(`Failed to cache initial frame at ${img.src}. Continuing.`);
      imageLoaded();
    };
  }
}

// Load remaining frames asynchronously in the background using requestIdleCallback/setTimeout
function loadRemainingImages() {
  // Delay background loading by 2.5 seconds to let page entrance animations complete smoothly
  setTimeout(() => {
    let currentIndex = initialFramesToPreload;

    function loadNext() {
      if (currentIndex >= totalFrames) {
        console.log("All background frames loaded.");
        return;
      }

      const img = new Image();
      img.src = getFramePath(currentIndex);
      
      const handleLoad = () => {
        if (img.decode) {
          img.decode().then(() => {
            images[currentIndex] = img;
            currentIndex++;
            scheduleNext();
          }).catch(() => {
            images[currentIndex] = img;
            currentIndex++;
            scheduleNext();
          });
        } else {
          images[currentIndex] = img;
          currentIndex++;
          scheduleNext();
        }
      };

      img.onload = handleLoad;
      img.onerror = () => {
        console.warn(`Failed to cache background frame ${currentIndex}.`);
        currentIndex++;
        scheduleNext();
      };
    }

    function scheduleNext() {
      if (window.requestIdleCallback) {
        window.requestIdleCallback(loadNext);
      } else {
        setTimeout(loadNext, 40);
      }
    }

    scheduleNext();
  }, 2500);
}

// Draw a frame centered on the canvas using 'cover' aspect ratio logic to fill the frame
function drawFrame(index) {
  let img = images[index];
  if (!img) {
    // Search outwards from target index to find the nearest loaded frame
    for (let offset = 1; offset < totalFrames; offset++) {
      if (index - offset >= 0 && images[index - offset]) {
        img = images[index - offset];
        break;
      }
      if (index + offset < totalFrames && images[index + offset]) {
        img = images[index + offset];
        break;
      }
    }
  }
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

  // 6.5. Mobile Navigation Menu Toggle
  const menuToggle = document.getElementById('mobile-menu-toggle');
  const menuDropdown = document.getElementById('mobile-nav-dropdown');
  if (menuToggle && menuDropdown) {
    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      menuDropdown.classList.toggle('hidden');
    });

    menuDropdown.querySelectorAll('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', () => {
        menuDropdown.classList.add('hidden');
      });
    });

    document.addEventListener('click', () => {
      menuDropdown.classList.add('hidden');
    });
  }

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

  // 13. Enable Constant Space Roaming/Floating for the Chatbot Button
  const chatBtn = document.querySelector('.chat-widget-button');
  if (chatBtn) {
    let isChatBtnHovered = false;
    let chatFloatTween = null;

    const startChatFloating = () => {
      if (chatFloatTween) return;
      chatFloatTween = gsap.to(chatBtn, {
        y: "-=3",
        x: "-=2",
        rotation: "-=1.5",
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    };

    // Start chat button drifting immediately
    startChatFloating();

    chatBtn.addEventListener('mouseenter', () => {
      isChatBtnHovered = true;
      if (chatFloatTween) {
        chatFloatTween.kill();
        chatFloatTween = null;
      }
    });

    chatBtn.addEventListener('mousemove', (e) => {
      if (!isChatBtnHovered) return;
      const rect = chatBtn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;

      const tiltX = (dy / (rect.height / 2)) * -6;
      const tiltY = (dx / (rect.width / 2)) * 6;

      gsap.to(chatBtn, {
        rotationX: tiltX,
        rotationY: tiltY,
        x: dx * 0.1,
        y: dy * 0.1,
        rotation: 0,
        duration: 0.35,
        ease: "power2.out",
        overwrite: "auto"
      });
    });

    chatBtn.addEventListener('mouseleave', () => {
      isChatBtnHovered = false;

      // Return to center, then resume floating
      gsap.to(chatBtn, {
        rotationX: 0,
        rotationY: 0,
        x: 0,
        y: 0,
        rotation: 0,
        duration: 0.6,
        ease: "power2.out",
        overwrite: "auto",
        onComplete: () => {
          if (!isChatBtnHovered) {
            startChatFloating();
          }
        }
      });
    });
  }

  // Initialize Gravitational Floating Buttons
  initGravityButtons();
}

// Initialize Gravitational Floating / Magnetic Buttons
function initGravityButtons() {
  const wrappers = document.querySelectorAll('.gravity-btn-wrapper');
  if (wrappers.length === 0) return;

  const buttonData = [];

  wrappers.forEach(wrapper => {
    const button = wrapper.querySelector('a');
    if (!button) return;

    // Determine max travel limits based on button type
    const isResume = button.classList.contains('resume-btn');
    const maxLimit = isResume ? 30 : 22;
    const attractionRadius = isResume ? 100 : 80;
    const floatSpeedMultiplier = isResume ? 0.75 : 1.0;

    buttonData.push({
      wrapper: wrapper,
      button: button,
      // Target offsets
      targetX: 0,
      targetY: 0,
      // Current offsets
      currentX: 0,
      currentY: 0,
      // Floating/Orbit offset time variables
      timeOffset: Math.random() * 100, // random phase offset
      floatSpeed: (0.006 + Math.random() * 0.005) * floatSpeedMultiplier,
      floatAmp: isResume ? 3.5 : 3,
      // Mouse interaction config
      maxLimit: maxLimit,
      attractionRadius: attractionRadius,
      isHovered: false
    });

    // Bind standard hover flags
    button.addEventListener('mouseenter', () => {
      buttonData.forEach(d => {
        if (d.button === button) d.isHovered = true;
      });
    });

    button.addEventListener('mouseleave', () => {
      buttonData.forEach(d => {
        if (d.button === button) d.isHovered = false;
      });
    });
  });

  function update() {
    const time = Date.now();

    buttonData.forEach(data => {
      // 1. Get original center position of the button relative to the viewport.
      // To get the untranslated center, we compute its current viewport rect
      // and subtract the current translation offset.
      const rect = data.wrapper.getBoundingClientRect();
      const origCenterX = rect.left + rect.width / 2 - data.currentX;
      const origCenterY = rect.top + rect.height / 2 - data.currentY;

      // 2. Compute vector from original center to global mouse pointer (which is updated live)
      const dx = globalMouseX - origCenterX;
      const dy = globalMouseY - origCenterY;
      const dist = Math.hypot(dx, dy);

      // Check if cursor is in range of the button
      if (dist < data.attractionRadius) {
        // Gravitational attraction: pull towards mouse cursor
        // Scale attraction strength based on proximity
        const force = 1 - (dist / data.attractionRadius); // 0 at edge, 1 at center
        let tx = dx * 0.4 * force;
        let ty = dy * 0.4 * force;

        // Apply a slow zero-gravity orbital sweep around the cursor
        // This adds a sci-fi space gravity orbital movement
        const orbitSpeed = 0.002;
        const orbitX = Math.cos(time * orbitSpeed + data.timeOffset) * 5;
        const orbitY = Math.sin(time * orbitSpeed * 0.8 + data.timeOffset) * 5;

        tx += orbitX;
        ty += orbitY;

        // Bounded clamp so it stays accessible and doesn't fly off page
        const offsetDist = Math.hypot(tx, ty);
        if (offsetDist > data.maxLimit) {
          data.targetX = (tx / offsetDist) * data.maxLimit;
          data.targetY = (ty / offsetDist) * data.maxLimit;
        } else {
          data.targetX = tx;
          data.targetY = ty;
        }
      } else {
        // Zero-gravity idle float around original center (slow, drift-like, low-frequency)
        const floatX = Math.cos(time * data.floatSpeed + data.timeOffset) * data.floatAmp;
        const floatY = Math.sin(time * data.floatSpeed * 0.85 + data.timeOffset) * data.floatAmp;

        data.targetX = floatX;
        data.targetY = floatY;
      }

      // 3. Smooth translation using linear interpolation (lerp)
      // When hovered, react faster; when returning to idle, damp slowly
      const speed = data.isHovered ? 0.12 : 0.06;
      data.currentX += (data.targetX - data.currentX) * speed;
      data.currentY += (data.targetY - data.currentY) * speed;

      // 4. Apply 3D translation
      data.wrapper.style.transform = `translate3d(${data.currentX.toFixed(2)}px, ${data.currentY.toFixed(2)}px, 0)`;
    });

    requestAnimationFrame(update);
  }

  // Start gravity animation loop
  requestAnimationFrame(update);
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
// INTERACTIVE CUSTOM CURSOR SYSTEM
// -------------------------------------------------------------
const cursorGlow = document.getElementById('cursor-glow');
const cursorDot = document.querySelector('.custom-cursor-dot');
const cursorRing = document.querySelector('.custom-cursor-ring');

let liveMouseX = globalMouseX;
let liveMouseY = globalMouseY;
let currentX = globalMouseX;
let currentY = globalMouseY;
let ringX = globalMouseX;
let ringY = globalMouseY;

if (cursorDot && cursorRing) {
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
}, { passive: true });

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

  // Bypass click rocket animation on interactive elements, links, inputs, and chatbot widgets
  let target = e.target;
  if (target && target.nodeType === 3) {
    target = target.parentElement;
  }
  while (target && target !== document.body) {
    if (target.nodeType === 1) {
      const tagName = target.tagName.toLowerCase();
      if (tagName === 'button' || tagName === 'a' || tagName === 'input' || tagName === 'textarea' || tagName === 'select' || tagName === 'option') {
        return;
      }
      const role = target.getAttribute('role');
      if (role === 'button' || role === 'link' || role === 'checkbox' || role === 'radio') {
        return;
      }
      if (target.classList.contains('nav-link') || 
          target.classList.contains('resume-btn') || 
          target.classList.contains('social-btn') || 
          target.classList.contains('audio-toggle-btn') ||
          target.id === 'audio-capsule' ||
          target.closest('#chat-widget-container') ||
          target.closest('.chat-window') ||
          target.closest('.chat-widget-button') ||
          window.getComputedStyle(target).cursor === 'pointer') {
        return;
      }
    }
    target = target.parentElement;
  }

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

  // 11. Lazy-load & Optimize Skills Section Background Videos on Hover
  if ('IntersectionObserver' in window) {
    const lazyVideos = document.querySelectorAll('.lazy-video');
    
    const setupVideoAttributes = (video) => {
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      video.setAttribute('muted', '');
      video.setAttribute('playsinline', '');
    };

    const videoObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const video = entry.target;
          const source = video.querySelector('source');
          if (source && source.dataset.src) {
            setupVideoAttributes(video);
            if (!video.src || !video.src.includes('.mp4')) {
              video.src = source.dataset.src;
              video.load();
            }
            observer.unobserve(video);
          }
        }
      });
    }, {
      rootMargin: '200px'
    });

    lazyVideos.forEach(video => {
      videoObserver.observe(video);
      
      // Control play/pause on hover/touch of the parent card
      const parentCard = video.closest('.spec-card');
      if (parentCard) {
        const playVideo = () => {
          // Pause all other videos first to ensure only 1 decoder thread runs
          lazyVideos.forEach(v => {
            if (v !== video) v.pause();
          });

          setupVideoAttributes(video);
          if (!video.src || !video.src.includes('.mp4')) {
            const source = video.querySelector('source');
            if (source && source.dataset.src) {
              video.src = source.dataset.src;
              video.load();
            }
          }
          video.play().catch(err => {
            console.warn("Muted video play failed:", err);
          });
        };

        const pauseVideo = () => {
          video.pause();
        };

        parentCard.addEventListener('mouseenter', playVideo);
        parentCard.addEventListener('touchstart', playVideo, { passive: true });
        parentCard.addEventListener('mouseleave', pauseVideo);
        parentCard.addEventListener('touchend', pauseVideo, { passive: true });
      }
    });
  } else {
    // Fallback for older browsers
    const lazyVideos = document.querySelectorAll('.lazy-video');
    lazyVideos.forEach(video => {
      const source = video.querySelector('source');
      if (source && source.dataset.src) {
        video.muted = true;
        video.defaultMuted = true;
        video.playsInline = true;
        video.setAttribute('muted', '');
        video.setAttribute('playsinline', '');
        video.src = source.dataset.src;
        video.load();
      }
    });
  }
});

// Parallax calculations loop
function animateParallax() {
  currentX += (liveMouseX - currentX) * 0.1;
  currentY += (liveMouseY - currentY) * 0.1;

  ringX += (liveMouseX - ringX) * 0.22;
  ringY += (liveMouseY - ringY) * 0.22;

  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  const offsetX = currentX - centerX;
  const offsetY = currentY - centerY;

  if (cursorGlow) {
    cursorGlow.style.left = `${currentX}px`;
    cursorGlow.style.top = `${currentY}px`;
  }

  if (cursorDot) {
    cursorDot.style.transform = `translate3d(${liveMouseX}px, ${liveMouseY}px, 0)`;
  }

  if (cursorRing) {
    cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate3d(-50%, -50%, 0)`;
  }

  requestAnimationFrame(animateParallax);
}

// Start cursor parallax immediately
animateParallax();

// -------------------------------------------------------------
// AMBIENT SOUNDTRACK AUDIO CONTROLLER
// -------------------------------------------------------------
function initAudioController() {
  const capsule = document.getElementById('audio-capsule');
  const bgMusic = document.getElementById('bg-music');
  const playIcon = document.getElementById('audio-play-icon');
  const pauseIcon = document.getElementById('audio-pause-icon');
  const bars = capsule ? capsule.querySelector('.audio-bars') : null;
  const statusLabel = capsule ? capsule.querySelector('.tars-audio-status') : null;

  if (!capsule || !bgMusic) return;

  // Set volume to a gentle background level
  bgMusic.volume = 0.35;

  let isPlaying = true;

  const playAudio = () => {
    bgMusic.play().then(() => {
      if (playIcon) playIcon.classList.add('hidden');
      if (pauseIcon) pauseIcon.classList.remove('hidden');
      if (bars) bars.classList.add('playing');
      if (statusLabel) statusLabel.textContent = "SYS.AUD // PLAYING";
      isPlaying = true;
    }).catch(err => {
      console.warn("Autoplay blocked: awaiting user interaction to trigger audio play.", err);

      const startOnInteraction = () => {
        bgMusic.play().then(() => {
          if (playIcon) playIcon.classList.add('hidden');
          if (pauseIcon) pauseIcon.classList.remove('hidden');
          if (bars) bars.classList.add('playing');
          if (statusLabel) statusLabel.textContent = "SYS.AUD // PLAYING";
          isPlaying = true;
          cleanupListeners();
        }).catch(e => console.error("Playback failed on interaction:", e));
      };

      const cleanupListeners = () => {
        document.removeEventListener('click', startOnInteraction);
        document.removeEventListener('keydown', startOnInteraction);
        document.removeEventListener('touchstart', startOnInteraction);
        document.removeEventListener('wheel', startOnInteraction);
      };

      document.addEventListener('click', startOnInteraction);
      document.addEventListener('keydown', startOnInteraction);
      document.addEventListener('touchstart', startOnInteraction);
      document.addEventListener('wheel', startOnInteraction);
    });
  };

  const togglePlay = () => {
    if (isPlaying) {
      bgMusic.pause();
      if (playIcon) playIcon.classList.remove('hidden');
      if (pauseIcon) pauseIcon.classList.add('hidden');
      if (bars) bars.classList.remove('playing');
      if (statusLabel) statusLabel.textContent = "SYS.AUD // STANDBY";
      isPlaying = false;
    } else {
      bgMusic.play().then(() => {
        if (playIcon) playIcon.classList.add('hidden');
        if (pauseIcon) pauseIcon.classList.remove('hidden');
        if (bars) bars.classList.add('playing');
        if (statusLabel) statusLabel.textContent = "SYS.AUD // PLAYING";
        isPlaying = true;
      }).catch(err => {
        console.error("Manual playback trigger failed:", err);
      });
    }
  };

  // Trigger autoplay attempt
  playAudio();

  capsule.addEventListener('click', (e) => {
    e.stopPropagation();
    togglePlay();
  });

  // Space floating, 3D tilt, and particle emitter logic on hover
  let isHovered = false;
  let floatTween = null;
  let particleInterval = null;

  const startSpaceFloating = () => {
    if (floatTween) return;
    floatTween = gsap.to(capsule, {
      y: "+=3",
      x: "+=2",
      rotation: "+=1.2",
      duration: 3.2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
  };

  const stopSpaceFloating = () => {
    if (floatTween) {
      floatTween.kill();
      floatTween = null;
    }
  };

  // Start floating immediately
  startSpaceFloating();

  const spawnParticle = () => {
    if (!isHovered) return;
    const rect = capsule.getBoundingClientRect();
    const p = document.createElement('span');
    p.className = 'audio-particle';

    // Position randomly along the capsule edge
    const startX = rect.left + Math.random() * rect.width;
    const startY = rect.top + Math.random() * rect.height;

    p.style.left = `${startX}px`;
    p.style.top = `${startY}px`;
    document.body.appendChild(p);

    const angle = Math.random() * Math.PI * 2;
    const distance = 35 + Math.random() * 50;
    const destX = Math.cos(angle) * distance;
    const destY = Math.sin(angle) * distance;

    gsap.to(p, {
      x: destX,
      y: destY,
      scale: 0.1,
      opacity: 0,
      duration: 1.0 + Math.random() * 0.6,
      ease: "power1.out",
      onComplete: () => p.remove()
    });
  };

  capsule.addEventListener('mousemove', (e) => {
    if (!isHovered) return;
    const rect = capsule.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;

    const tiltX = (dy / (rect.height / 2)) * -8;
    const tiltY = (dx / (rect.width / 2)) * 8;

    gsap.to(capsule, {
      rotationX: tiltX,
      rotationY: tiltY,
      x: dx * 0.12,
      y: dy * 0.12,
      duration: 0.35,
      ease: "power2.out",
      overwrite: "auto"
    });
  });

  capsule.addEventListener('mouseenter', () => {
    isHovered = true;
    stopSpaceFloating();
    particleInterval = setInterval(spawnParticle, 140);

    const cursorDot = document.querySelector('.custom-cursor-dot');
    const cursorRing = document.querySelector('.custom-cursor-ring');
    if (cursorDot && cursorRing) {
      gsap.to(cursorDot, { scale: 1.15, duration: 0.3 });
      gsap.to(cursorRing, { scale: 1.4, backgroundColor: 'rgba(0, 210, 255, 0.08)', duration: 0.3 });
    }
  });

  capsule.addEventListener('mouseleave', () => {
    isHovered = false;
    clearInterval(particleInterval);

    // Return to center and restart background drift
    gsap.to(capsule, {
      rotationX: 0,
      rotationY: 0,
      x: 0,
      y: 0,
      rotation: 0,
      duration: 0.6,
      ease: "power2.out",
      overwrite: "auto",
      onComplete: () => {
        if (!isHovered) {
          startSpaceFloating();
        }
      }
    });

    const cursorDot = document.querySelector('.custom-cursor-dot');
    const cursorRing = document.querySelector('.custom-cursor-ring');
    if (cursorDot && cursorRing) {
      gsap.to(cursorDot, { scale: 1, duration: 0.3 });
      gsap.to(cursorRing, { scale: 1, backgroundColor: 'transparent', duration: 0.3 });
    }
  });
}

// Start audio controller on wake
initAudioController();

// Initialize the 5-star review system
initReviewSystem();

// =============================================================
// ECE PORTFOLIO 5-STAR RATING & REVIEW SYSTEM
// =============================================================
function initReviewSystem() {
  const starRating = document.getElementById('star-rating');
  if (!starRating) return;

  const starBtns = starRating.querySelectorAll('.star-btn');
  const starLabel = document.getElementById('star-label');
  const reviewName = document.getElementById('review-name');
  const reviewComment = document.getElementById('review-comment');
  const charCount = document.getElementById('char-count');
  const reviewSubmit = document.getElementById('review-submit');
  const reviewToast = document.getElementById('review-toast');

  let selectedRating = 0;
  const ratingTexts = {
    1: "Terrible // Needs major revision",
    2: "Subpar // Potential is there",
    3: "Good // Decent execution",
    4: "Great // Highly professional",
    5: "Excellent // ECE Masterpiece!"
  };

  // Helper to get reviews from localStorage
  function getReviews() {
    const stored = localStorage.getItem('portfolio_reviews');
    if (!stored) return [];
    try {
      return JSON.parse(stored);
    } catch (e) {
      return [];
    }
  }

  // Helper to save reviews
  function saveReviews(reviews) {
    localStorage.setItem('portfolio_reviews', JSON.stringify(reviews));
  }

  // Update stars styling based on selected or hover rating
  function updateStars(rating, type = 'selected') {
    starBtns.forEach((btn, index) => {
      const starValue = index + 1;
      if (type === 'hover') {
        if (starValue <= rating) {
          btn.classList.add('hovered');
        } else {
          btn.classList.remove('hovered');
        }
      } else {
        btn.classList.remove('hovered');
        if (starValue <= rating) {
          btn.classList.add('selected');
        } else {
          btn.classList.remove('selected');
        }
      }
    });
  }

  // Stars Event Listeners
  starBtns.forEach(btn => {
    const val = parseInt(btn.getAttribute('data-value'));

    btn.addEventListener('mouseenter', () => {
      updateStars(val, 'hover');
      starLabel.textContent = ratingTexts[val];
      starLabel.style.color = 'var(--accent-blue-neon)';
      gsap.to(btn, { scale: 1.2, duration: 0.2, ease: "power1.out" });
    });

    btn.addEventListener('mouseleave', () => {
      updateStars(selectedRating, 'selected');
      if (selectedRating > 0) {
        starLabel.textContent = ratingTexts[selectedRating];
        starLabel.style.color = 'rgba(255, 255, 255, 0.7)';
      } else {
        starLabel.textContent = "";
      }
      gsap.to(btn, { scale: 1.0, duration: 0.2, ease: "power1.out" });
    });

    btn.addEventListener('click', () => {
      selectedRating = val;
      updateStars(selectedRating, 'selected');
      starLabel.textContent = ratingTexts[selectedRating];
      starLabel.style.color = '#ffffff';
      
      // Enable submit button and style it as active
      reviewSubmit.disabled = false;
      reviewSubmit.classList.remove(
        'bg-white/[0.02]', 'border-brand-border/40', 'text-brand-gray/50', 'cursor-not-allowed'
      );
      reviewSubmit.classList.add(
        'bg-brand-neon/10', 'border-brand-neon/40', 'text-brand-neon', 'cursor-pointer'
      );
      
      // Flash animation on click
      gsap.fromTo(btn, 
        { scale: 0.95 }, 
        { scale: 1.25, duration: 0.3, ease: "elastic.out(1, 0.3)", onComplete: () => {
          gsap.to(btn, { scale: 1.0, duration: 0.1 });
        }}
      );
    });
  });

  // Character counter for comment textarea
  reviewComment.addEventListener('input', () => {
    const len = reviewComment.value.length;
    charCount.textContent = len;
    if (len >= 270) {
      charCount.style.color = '#ff3366';
    } else {
      charCount.style.color = 'rgba(255, 255, 255, 0.4)';
    }
  });

  // Handle Form Submission
  reviewSubmit.addEventListener('click', (e) => {
    e.preventDefault();
    if (selectedRating === 0) return;

    const nameVal = reviewName.value.trim();
    const commentVal = reviewComment.value.trim();

    const newReview = {
      id: 'rev-' + Date.now(),
      name: nameVal || "Anonymous Reviewer",
      rating: selectedRating,
      comment: commentVal,
      date: new Date().toISOString()
    };

    // Store review locally
    const currentReviews = getReviews();
    currentReviews.push(newReview);
    saveReviews(currentReviews);

    // Send to server to save persistently
    fetch('/api/reviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: nameVal,
        rating: selectedRating,
        comment: commentVal
      })
    })
    .then(response => {
      if (!response.ok) {
        console.warn("Failed to send review to server. Local fallback will persist.");
      }
    })
    .catch(err => {
      console.error("Network error sending review to server:", err);
    });

    // Show success toast banner
    reviewToast.classList.remove('hidden');
    gsap.fromTo(reviewToast, 
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }
    );

    setTimeout(() => {
      gsap.to(reviewToast, {
        opacity: 0,
        y: -10,
        duration: 0.35,
        ease: "power2.in",
        onComplete: () => {
          reviewToast.classList.add('hidden');
        }
      });
    }, 3500);

    // Reset Form Input elements
    selectedRating = 0;
    reviewName.value = '';
    reviewComment.value = '';
    charCount.textContent = '0';
    updateStars(0);
    starLabel.textContent = '';
    
    // Deactivate submit button
    reviewSubmit.disabled = true;
    reviewSubmit.classList.add(
      'bg-white/[0.02]', 'border-brand-border/40', 'text-brand-gray/50', 'cursor-not-allowed'
    );
    reviewSubmit.classList.remove(
      'bg-brand-neon/10', 'border-brand-neon/40', 'text-brand-neon', 'cursor-pointer'
    );
  });
}

