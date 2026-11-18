const SVG = 'http://www.w3.org/2000/svg';
const CREW_COLORS = ['#00e5ff', '#73c8ff', '#ffae58', '#7ef7df', '#b7a8ff', '#45a9ff'];
const TEXT_TARGETS = [
  '#hero-section p:has(.hero-tag-text)', '#hero-section h1', '.hero-desc-text', '.signature-text',
  '.section-header .section-tag', '.section-header h2', '#more-projects > h3'
].join(', ');
const PANEL_TARGETS = [
  'header .nav-pill', '#audio-capsule', '.chat-widget-button', '.chat-window.open',
  '#hero-section .gravity-btn-wrapper', '.skills-section .spec-card', '.phone-frame', '.hud-panel',
  '#more-projects .spec-card', '#specs-section .spec-card', '#review-section-mount', '.endcard-section .spec-card'
].join(', ');
const STEERING_KEYS = new Set(['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' ']);

let activeRebuild;

export function toggleSwarmRebuild(lenis, origin) {
  if (activeRebuild) {
    activeRebuild.exit();
    return;
  }
  const rebuild = new SwarmRebuild(lenis, origin);
  activeRebuild = rebuild;
  try {
    rebuild.start();
  } catch (error) {
    if (rebuild.overlay) rebuild.exit();
    else activeRebuild = null;
    throw error;
  }
}

function svgElement(name, className) {
  const element = document.createElementNS(SVG, name);
  element.setAttribute('class', className);
  return element;
}

function easeOut(progress) {
  return 1 - (1 - progress) ** 3;
}

function mix(from, to, progress) {
  return from + (to - from) * progress;
}

function makeOverlay(sourceCursor, origin) {
  const root = document.createElement('div');
  root.className = 'swarm-rebuild';
  root.innerHTML = `
    <div class="swarm-rebuild__controls" role="group" aria-label="Portfolio rebuild">
      <div class="swarm-rebuild__meter">
        <span>Portfolio rebuild</span>
        <progress value="0" max="100" aria-label="Rebuild progress"></progress>
      </div>
      <button type="button" data-swarm-action="pause">Pause</button>
      <button type="button" data-swarm-action="exit">Exit <kbd>Esc</kbd></button>
    </div>
  `;
  const effects = document.createElement('div');
  effects.className = 'swarm-rebuild__effects';
  effects.setAttribute('aria-hidden', 'true');
  const traces = svgElement('svg', 'swarm-rebuild__traces');
  effects.append(traces);
  root.prepend(effects);

  const actors = CREW_COLORS.map((color, index) => {
    const outline = svgElement('path', 'swarm-rebuild__outline');
    const trail = svgElement('line', 'swarm-rebuild__trail');
    for (const path of [outline, trail]) path.style.setProperty('--swarm-ink', color);
    outline.setAttribute('pathLength', '1');
    traces.append(outline, trail);

    const cursor = document.createElement('div');
    cursor.className = 'swarm-rebuild__cursor';
    cursor.style.setProperty('--swarm-ink', color);
    const ship = sourceCursor.cloneNode(true);
    effects.append(cursor);
    cursor.append(ship);
    return { ...origin, index, cursor, trail, outline, job: null };
  });
  return {
    root,
    actors,
    meter: root.querySelector('progress'),
    pause: root.querySelector('[data-swarm-action="pause"]'),
    exit: root.querySelector('[data-swarm-action="exit"]')
  };
}

class SwarmRebuild {
  constructor(lenis, origin) {
    this.lenis = lenis;
    this.origin = origin;
    this.pointer = origin;
    this.originalScroll = window.scrollY;
    this.originalFocus = document.activeElement;
    this.reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.mobile = matchMedia('(max-width: 768px)');
    this.paused = this.reduceMotion;
    this.introDuration = this.reduceMotion ? 80 : 680;
    this.activeAnimations = new Set();
    this.events = new AbortController();
    this.completed = 0;
    this.dispatchAt = 0;
    this.manualUntil = 0;
    this.bottomSince = null;
    this.tick = this.tick.bind(this);
  }

  start() {
    const sourceCursor = document.querySelector('.custom-cursor-dot svg');
    if (!sourceCursor) {
      activeRebuild = null;
      return;
    }
    this.targets = [...document.querySelectorAll(`${TEXT_TARGETS}, ${PANEL_TARGETS}`)]
      .filter(element => element.getClientRects().length)
      .map(element => ({
        element,
        kind: element.matches(TEXT_TARGETS) ? 'text' : 'panel',
        sticky: element.matches('.hud-panel'),
        state: 'pending'
      }));
    if (!this.targets.length) {
      activeRebuild = null;
      return;
    }

    this.overlay = makeOverlay(sourceCursor, this.origin);
    const { root, actors, pause, exit } = this.overlay;
    this.lenis.scrollTo(0, { immediate: true, force: true });
    for (const target of this.targets) target.element.dataset.swarmState = 'pending';
    document.documentElement.classList.add('swarm-rebuilding');
    document.body.append(root);
    const { signal } = this.events;
    const syncViewport = () => this.resizeOverlay();
    syncViewport();
    window.addEventListener('resize', syncViewport, { passive: true, signal });
    window.visualViewport?.addEventListener('resize', syncViewport, { passive: true, signal });
    window.visualViewport?.addEventListener('scroll', syncViewport, { passive: true, signal });
    for (const actor of actors) {
      this.moveActor(actor, this.origin.x - this.viewLeft, this.origin.y - this.viewTop, false);
    }
    this.updatePauseButton();
    pause.focus({ preventScroll: true });

    const manualScroll = () => { this.manualUntil = performance.now() + 1400; };
    window.addEventListener('wheel', manualScroll, { passive: true, signal });
    window.addEventListener('touchmove', manualScroll, { passive: true, signal });
    window.addEventListener('pointermove', event => {
      this.pointer = { x: event.clientX, y: event.clientY };
    }, { passive: true, signal });
    window.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        this.exit();
      } else if (STEERING_KEYS.has(event.key) && !root.contains(event.target)) {
        manualScroll();
      }
    }, { capture: true, signal });
    pause.addEventListener('click', () => {
      this.paused = !this.paused;
      this.updatePauseButton();
    }, { signal });
    exit.addEventListener('click', () => this.exit(), { signal });

    this.startedAt = performance.now();
    this.lastTick = this.startedAt;
    this.frame = requestAnimationFrame(this.tick);
  }

  resizeOverlay() {
    // Keep the controls inside the visible screen, including on zoomed mobile pages.
    const viewport = window.visualViewport;
    this.viewWidth = viewport?.width ?? innerWidth;
    this.viewHeight = viewport?.height ?? innerHeight;
    this.viewLeft = viewport?.offsetLeft ?? 0;
    this.viewTop = viewport?.offsetTop ?? 0;
    const { style } = this.overlay.root;
    style.width = `${this.viewWidth}px`;
    style.height = `${this.viewHeight}px`;
    style.left = `${this.viewLeft}px`;
    style.top = `${this.viewTop}px`;
  }

  updatePauseButton() {
    this.overlay.pause.textContent = this.paused ? 'Play' : 'Pause';
    this.overlay.pause.setAttribute('aria-label', this.paused ? 'Play auto-scroll' : 'Pause auto-scroll');
  }

  tick(now) {
    const delta = Math.min(48, now - this.lastTick);
    this.lastTick = now;
    const elapsed = now - this.startedAt;
    const { actors } = this.overlay;

    if (this.merging) {
      const progress = Math.min(1, (now - this.merging) / (this.reduceMotion ? 80 : 560));
      for (const actor of actors) {
        this.moveActor(actor, mix(actor.mergeX, this.pointer.x - this.viewLeft, easeOut(progress)),
          mix(actor.mergeY, this.pointer.y - this.viewTop, easeOut(progress)), false);
      }
      if (progress === 1) {
        this.exit(false);
        return;
      }
    } else if (elapsed < this.introDuration) {
      for (const actor of actors) {
        const angle = actor.index * Math.PI / 3 + elapsed * 0.004;
        const radius = easeOut(elapsed / this.introDuration) * Math.min(92, this.viewWidth * 0.18);
        this.moveActor(actor, this.origin.x - this.viewLeft + Math.cos(angle) * radius,
          this.origin.y - this.viewTop + Math.sin(angle) * radius * 0.8, elapsed > 160);
      }
    } else {
      const scrollY = window.scrollY;
      const end = this.lenis.limit;
      if (now >= this.dispatchAt && actors.some(actor => !actor.job)) this.dispatch(now);
      const activeRects = actors.map(actor => actor.job?.target.element.getBoundingClientRect());
      for (const actor of actors) {
        const rect = activeRects[actor.index];
        if (actor.job && rect) this.build(actor, rect, now);
        else this.drift(actor, elapsed, delta);
      }
      this.scroll(now, delta, scrollY, end);
    }
    this.frame = requestAnimationFrame(this.tick);
  }

  dispatch(now) {
    this.dispatchAt = now + 92;
    const freeActors = this.overlay.actors.filter(actor => !actor.job);
    const visible = [];
    const skipped = [];

    for (const target of this.targets) {
      if (target.state !== 'pending') continue;
      if (target.sticky && !this.mobile.matches && !target.element.classList.contains('active')) continue;
      const rect = target.element.getBoundingClientRect();
      if (rect.bottom <= this.viewTop) skipped.push(target);
      else if (rect.width && rect.height && rect.top < this.viewTop + this.viewHeight - 38 &&
          rect.right > this.viewLeft && rect.left < this.viewLeft + this.viewWidth) visible.push(target);
    }
    for (const target of skipped) this.complete(target);
    for (const actor of freeActors) {
      const target = visible.shift();
      if (!target) break;
      target.state = 'building';
      actor.job = { target, startedAt: now, x: actor.x, y: actor.y, revealed: false };
    }
    this.hasQueuedWork = visible.length > 0;
  }

  build(actor, rect, now) {
    const { job, outline } = actor;
    const travel = this.reduceMotion ? 70 : 215 + actor.index * 28;
    const isText = job.target.kind === 'text';
    const draw = this.reduceMotion ? 100 : isText ? 430 : 480;
    const elapsed = now - job.startedAt;
    const left = Math.max(4, rect.left - this.viewLeft);
    const top = Math.max(4, rect.top - this.viewTop);
    const right = Math.min(this.viewWidth - 5, rect.right - this.viewLeft);
    const bottom = Math.min(this.viewHeight - 5, rect.bottom - this.viewTop);

    if (right <= left || bottom <= top) {
      this.complete(job.target);
      this.release(actor);
      return;
    }
    const y = isText ? bottom : top;
    if (elapsed < travel) {
      const progress = easeOut(elapsed / travel);
      this.moveActor(actor, mix(job.x, left, progress), mix(job.y, y, progress));
      return;
    }

    const progress = Math.min(1, (elapsed - travel) / draw);
    outline.setAttribute('d', isText
      ? `M ${left} ${y} H ${right}`
      : `M ${left} ${top} H ${right} V ${bottom} H ${left} Z`);
    outline.style.strokeDashoffset = 1 - progress;
    outline.style.opacity = progress < 0.82 ? '0.92' : (1 - progress) * 5;

    if (isText) {
      this.moveActor(actor, mix(left, right, progress), y);
    } else {
      const width = right - left;
      const height = bottom - top;
      const distance = progress * 2 * (width + height);
      if (distance < width) this.moveActor(actor, left + distance, top);
      else if (distance < width + height) this.moveActor(actor, right, top + distance - width);
      else if (distance < 2 * width + height) this.moveActor(actor, right - (distance - width - height), bottom);
      else this.moveActor(actor, left, bottom - (distance - 2 * width - height));
    }
    if (!job.revealed && progress >= 0.2) {
      job.revealed = true;
      this.reveal(job.target, draw * 0.78);
    }
    if (progress === 1) {
      this.complete(job.target);
      this.release(actor);
    }
  }

  reveal(target, duration) {
    const { element, kind } = target;
    element.dataset.swarmState = 'revealing';
    // The real portfolio markup stays in place during the reveal.
    const animation = element.animate(kind === 'text'
      ? [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0)' }]
      : [{ opacity: 0, clipPath: 'inset(0 0 85% 0)' }, { opacity: 1, clipPath: 'inset(0)' }], {
      duration,
      easing: kind === 'text' && !this.reduceMotion ? 'steps(15, end)' : 'ease-out'
    });
    this.activeAnimations.add(animation);
    animation.addEventListener('finish', () => this.activeAnimations.delete(animation), { once: true });
  }

  complete(target) {
    if (target.state === 'done') return;
    delete target.element.dataset.swarmState;
    target.state = 'done';
    this.completed++;
    this.overlay.meter.value = Math.round(100 * this.completed / this.targets.length);
  }

  release(actor) {
    actor.outline.style.opacity = '0';
    actor.job = null;
  }

  moveActor(actor, x, y, leavingTrail = true) {
    const fromX = actor.x;
    const fromY = actor.y;
    actor.x = Math.max(4, Math.min(this.viewWidth - 10, x));
    actor.y = Math.max(4, Math.min(this.viewHeight - 13, y));
    const tilt = Math.max(-22, Math.min(22, (actor.x - fromX) * 1.5));
    actor.cursor.style.transform = `translate3d(${actor.x}px, ${actor.y}px, 0) rotate(${tilt}deg)`;
    actor.trail.style.opacity = leavingTrail ? '0.5' : '0';
    actor.trail.setAttribute('x1', mix(actor.x, fromX, 0.85));
    actor.trail.setAttribute('y1', mix(actor.y, fromY, 0.85));
    actor.trail.setAttribute('x2', actor.x);
    actor.trail.setAttribute('y2', actor.y);
  }

  drift(actor, elapsed, delta) {
    const angle = elapsed * 0.001 + actor.index * Math.PI / 3;
    const x = this.viewWidth * (actor.index % 2 ? 0.86 : 0.14) + Math.cos(angle) * 25;
    const y = this.viewHeight * (0.3 + Math.floor(actor.index / 2) * 0.18) + Math.sin(angle) * 18;
    const damping = 1 - Math.exp(-delta / 250);
    this.moveActor(actor, mix(actor.x, x, damping), mix(actor.y, y, damping));
  }

  scroll(now, delta, position, end) {
    if (position < end - 2) {
      this.bottomSince = null;
      if (!this.paused && now >= this.manualUntil) {
        const speed = this.mobile.matches ? 290 : 360;
        const previous = this.scrollY ?? position;
        const synchronized = Math.abs(previous - position) > 1 ? position : previous;
        this.scrollY = Math.min(end, synchronized + delta * speed / 1000);
        this.lenis.scrollTo(this.scrollY, { immediate: true, force: true });
      } else {
        this.scrollY = position;
      }
    } else if (!this.hasQueuedWork && this.overlay.actors.every(actor => !actor.job)) {
      this.bottomSince ??= now;
      if (now - this.bottomSince > 380) this.merge(now);
    } else {
      this.bottomSince = null;
    }
  }

  merge(now) {
    for (const target of this.targets) this.complete(target);
    for (const actor of this.overlay.actors) {
      actor.mergeX = actor.x;
      actor.mergeY = actor.y;
    }
    this.merging = now;
  }

  exit(restoreScroll = true) {
    this.events.abort();
    cancelAnimationFrame(this.frame);
    for (const animation of this.activeAnimations) animation.cancel();
    for (const { element } of this.targets) delete element.dataset.swarmState;
    document.documentElement.classList.remove('swarm-rebuilding');
    const focusWasInOverlay = this.overlay.root.contains(document.activeElement);
    this.overlay.root.remove();
    activeRebuild = null;
    if (restoreScroll) this.lenis.scrollTo(this.originalScroll, { immediate: true, force: true });
    if (focusWasInOverlay) this.originalFocus?.focus({ preventScroll: true });
  }
}
