import '../scripts/shell';

interface GsapLike {
  to: (target: unknown, vars: { [key: string]: unknown }) => unknown;
  set: (target: unknown, vars: { [key: string]: unknown }) => unknown;
}

interface HeroElements {
  control: HTMLElement;
  staticFallback: HTMLElement;
  aside: HTMLElement;
  roadGroup: SVGGElement;
  networkGroup: SVGGElement;
  input: HTMLInputElement;
}

function findElements(): HeroElements | undefined {
  const control = document.querySelector<HTMLElement>('[data-hero-control]');
  const staticFallback = document.querySelector<HTMLElement>('[data-hero-static]');
  const aside = document.querySelector<HTMLElement>('[data-hero-aside]');
  const roadGroup = document.querySelector<SVGGElement>('[data-layer="road"]');
  const networkGroup = document.querySelector<SVGGElement>('[data-layer="network"]');
  const input = document.querySelector<HTMLInputElement>('#hero-mode');

  if (!control || !staticFallback || !aside || !roadGroup || !networkGroup || !input)
    return undefined;
  return { control, staticFallback, aside, roadGroup, networkGroup, input };
}

function showStatic(el: HeroElements) {
  el.control.hidden = true;
  el.aside.hidden = false;
  el.aside.removeAttribute('hidden');
  el.staticFallback.hidden = false;
  el.staticFallback.removeAttribute('hidden');
  el.roadGroup.setAttribute('aria-hidden', 'false');
  el.networkGroup.setAttribute('aria-hidden', 'false');
  el.roadGroup.style.opacity = '1';
  el.networkGroup.style.opacity = '1';
}

function setupAnimation(el: HeroElements, gsap: GsapLike) {
  el.aside.hidden = true;
  el.staticFallback.hidden = true;
  el.roadGroup.setAttribute('aria-hidden', 'false');
  el.networkGroup.setAttribute('aria-hidden', 'true');
  gsap.set(el.roadGroup, { opacity: 1 });
  gsap.set(el.networkGroup, { opacity: 0 });

  function crossfade(value: number) {
    const clamped = Math.max(0, Math.min(1, value));
    gsap.to(el.roadGroup, { opacity: 1 - clamped, duration: 0.35, overwrite: true });
    gsap.to(el.networkGroup, { opacity: clamped, duration: 0.35, overwrite: true });
    el.roadGroup.setAttribute('aria-hidden', String(clamped > 0.5));
    el.networkGroup.setAttribute('aria-hidden', String(clamped <= 0.5));
  }

  el.input.addEventListener('input', () => crossfade(Number(el.input.value)));
  el.input.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    const step = event.key === 'ArrowRight' ? 0.1 : -0.1;
    const next = Math.max(0, Math.min(1, Number(el.input.value) + step));
    el.input.value = String(next);
    crossfade(next);
  });

  crossfade(0);
}

const el = findElements();
if (el) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    showStatic(el);
  } else {
    const observer = new IntersectionObserver(
      (entries, self) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        self.disconnect();
        void (async () => {
          try {
            const gsapModule = await import('gsap');
            const gsap = gsapModule.default as unknown as GsapLike;
            setupAnimation(el, gsap);
          } catch {
            showStatic(el);
          }
        })();
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0 },
    );
    observer.observe(el.control);
  }
}
