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
const SCROLL_SPEED = { desktop: 210, mobile: 165 };
const TYPING_STEPS = 18;

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
    const guide = svgElement('path', 'swarm-rebuild__guide');
    const readout = svgElement('text', 'swarm-rebuild__readout');
    for (const node of [outline, trail, guide, readout]) node.style.setProperty('--swarm-ink', color);
    outline.setAttribute('pathLength', '1');
    traces.append(outline, trail, guide, readout);

    const cursor = document.createElement('div');
    cursor.className = 'swarm-rebuild__cursor';
    cursor.style.setProperty('--swarm-ink', color);
    const ship = sourceCursor.cloneNode(true);
    effects.append(cursor);
    cursor.append(ship);
    return { ...origin, index, cursor, trail, outline, guide, readout, job: null };
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
      const bounds = actors.map(actor => actor.job && this.getBounds(actor.job.target.element));
      const work = actors.filter(actor => actor.job?.target.kind === 'panel' && bounds[actor.index]);
      for (const actor of actors) {
        if (actor.job) this.build(actor, bounds[actor.index], now);
        else this.assist(actor, work.length ? work[actor.index % work.length] : null, bounds, elapsed, delta);
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
      actor.assisting = null;
      actor.guide.style.strokeDasharray = '';
      this.hideGuides(actor);
    }
    this.hasQueuedWork = visible.length > 0;
  }

  getBounds(element) {
    const rect = element.getBoundingClientRect();
    const left = Math.max(4, rect.left - this.viewLeft);
    const top = Math.max(4, rect.top - this.viewTop);
    const right = Math.min(this.viewWidth - 5, rect.right - this.viewLeft);
    const bottom = Math.min(this.viewHeight - 5, rect.bottom - this.viewTop);
    if (right <= left || bottom <= top) return null;
    return { left, top, right, bottom, width: rect.width, height: rect.height };
  }

  build(actor, bounds, now) {
    const { job } = actor;
    if (!bounds) {
      this.release(actor);
      return;
    }
    const { left, top, bottom } = bounds;
    const travel = this.reduceMotion ? 70 : 235 + actor.index * 25;
    const elapsed = now - job.startedAt;
    const isText = job.target.kind === 'text';
    if (elapsed < travel) {
      const progress = easeOut(elapsed / travel);
      this.moveActor(actor, mix(job.x, left, progress), mix(job.y, isText ? bottom : top, progress));
      return;
    }
    const workingTime = elapsed - travel;
    const finished = isText ? this.typeLine(actor, bounds, workingTime) : this.buildPanel(actor, bounds, workingTime);
    if (finished) this.release(actor);
  }

  typeLine(actor, { left, top, right, bottom }, elapsed) {
    const duration = this.reduceMotion ? 100 : 720;
    const progress = Math.min(1, elapsed / duration);
    this.beginReveal(actor.job, duration);
    const caret = mix(left, right, Math.floor(progress * TYPING_STEPS) / TYPING_STEPS);
    this.trace(actor, `M ${left} ${bottom} H ${right}`, progress, 0.65);
    this.guide(actor, `M ${caret} ${Math.max(top, bottom - 17)} V ${bottom + 2}`, 0.9);
    this.moveActor(actor, caret, bottom, false);
    return progress === 1;
  }

  buildPanel(actor, { left, top, right, bottom, width, height }, elapsed) {
    const measure = this.reduceMotion ? 0 : 360;
    const draw = this.reduceMotion ? 0 : 690;
    const setup = this.reduceMotion ? 0 : 185;
    const sweep = this.reduceMotion ? 100 : 650;

    if (elapsed < measure) {
      const progress = easeOut(elapsed / measure);
      const x = mix(left, right, progress);
      const y = mix(top, bottom, progress);
      this.guide(actor, `M ${left} ${y} H ${x} V ${top} M ${x - 5} ${y} H ${x + 5} M ${x} ${y - 5} V ${y + 5}`, 0.74);
      const alignLeft = x > this.viewWidth - 112;
      actor.readout.setAttribute('x', alignLeft ? x - 8 : x + 28);
      actor.readout.setAttribute('y', y > this.viewHeight - 23 ? y - 8 : y + 16);
      actor.readout.setAttribute('text-anchor', alignLeft ? 'end' : 'start');
      actor.readout.textContent = `${Math.round(width * progress)} × ${Math.round(height * progress)}`;
      actor.readout.style.opacity = '1';
      this.moveActor(actor, x, y);
      return false;
    }

    actor.readout.style.opacity = '0';
    const perimeter = `M ${right} ${bottom} H ${left} V ${top} H ${right} Z`;
    if (elapsed < measure + draw) {
      const progress = (elapsed - measure) / draw;
      const w = right - left;
      const h = bottom - top;
      const distance = progress * 2 * (w + h);
      this.trace(actor, perimeter, progress, 0.95);
      this.guide(actor, '', 0);
      if (distance < w) this.moveActor(actor, right - distance, bottom);
      else if (distance < w + h) this.moveActor(actor, left, bottom - (distance - w));
      else if (distance < 2 * w + h) this.moveActor(actor, left + (distance - w - h), top);
      else this.moveActor(actor, right, top + (distance - 2 * w - h));
      return false;
    }

    const scanTime = elapsed - measure - draw;
    if (scanTime < setup) {
      this.trace(actor, perimeter, 1, 0.8);
      this.moveActor(actor, right, mix(bottom, top, easeOut(scanTime / setup)));
      return false;
    }

    this.beginReveal(actor.job, sweep);
    const progress = Math.min(1, (scanTime - setup) / sweep);
    const y = mix(top, bottom, progress);
    this.trace(actor, perimeter, 1, (1 - progress) * 0.66);
    this.guide(actor, `M ${left} ${y} H ${right}`, 0.88);
    this.moveActor(actor, mix(right, left, progress), y);
    return progress === 1;
  }

  trace(actor, path, progress, opacity) {
    actor.outline.setAttribute('d', path);
    actor.outline.style.strokeDashoffset = 1 - progress;
    actor.outline.style.opacity = opacity;
  }

  guide(actor, path, opacity) {
    actor.guide.setAttribute('d', path);
    actor.guide.style.opacity = opacity;
  }

  hideGuides(actor) {
    actor.guide.style.opacity = '0';
    actor.readout.style.opacity = '0';
  }

  beginReveal(job, duration) {
    if (job.revealed) return;
    job.revealed = true;
    const { element, kind } = job.target;
    element.dataset.swarmState = 'revealing';
    // The real portfolio markup stays in place during the reveal.
    const animation = element.animate(kind === 'text'
      ? [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0)' }]
      : [{ opacity: 0.72, clipPath: 'inset(0 0 100% 0)' }, { opacity: 1, clipPath: 'inset(0)' }], {
      duration,
      easing: kind === 'text' && !this.reduceMotion ? `steps(${TYPING_STEPS}, end)` : 'linear'
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
    this.complete(actor.job.target);
    actor.outline.style.opacity = '0';
    this.hideGuides(actor);
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

  assist(actor, builder, bounds, elapsed, delta) {
    const panel = builder?.job && bounds[builder.index];
    if (!panel || this.reduceMotion) {
      if (actor.assisting) this.hideGuides(actor);
      actor.assisting = null;
      this.drift(actor, elapsed, delta);
      return;
    }

    if (actor.assisting !== builder.job) {
      actor.assisting = builder.job;
      actor.assistStarted = elapsed;
      actor.guide.style.strokeDasharray = '3 5';
    }
    const { left, right, top, bottom } = panel;
    const progress = easeOut(Math.min(1, (elapsed - actor.assistStarted) / 640));
    const side = actor.index % 4;
    const lane = actor.index < 4 ? 11 : 21;
    const damping = 1 - Math.exp(-delta / 105);
    if (actor.index % 2) {
      const rightEdge = Math.min(this.viewWidth - 5, right + lane);
      const x = side === 1 && left > lane ? left - lane : rightEdge;
      const startY = side === 1 ? top : bottom;
      const y = mix(startY, side === 1 ? bottom : top, progress);
      this.guide(actor, `M ${x} ${startY} V ${y} H ${x < left ? left : right}`, 0.42);
      this.moveActor(actor, mix(actor.x, x, damping), mix(actor.y, y, damping));
    } else {
      const bottomEdge = Math.min(this.viewHeight - 5, bottom + lane);
      const y = side === 0 && top > lane ? top - lane : bottomEdge;
      const startX = side === 0 ? left : right;
      const x = mix(startX, side === 0 ? right : left, progress);
      this.guide(actor, `M ${startX} ${y} H ${x} V ${y < top ? top : bottom}`, 0.42);
      this.moveActor(actor, mix(actor.x, x, damping), mix(actor.y, y, damping));
    }
  }

  scroll(now, delta, position, end) {
    if (position < end - 2) {
      this.bottomSince = null;
      if (!this.paused && now >= this.manualUntil) {
        const speed = this.mobile.matches ? SCROLL_SPEED.mobile : SCROLL_SPEED.desktop;
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
      this.hideGuides(actor);
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
