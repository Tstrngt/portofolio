const root = document.documentElement;
const toggle = document.querySelector<HTMLButtonElement>('[data-theme-toggle]');
const label = document.querySelector<HTMLElement>('[data-theme-label]');
const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');

function applyTheme(theme: 'light' | 'night') {
  const night = theme === 'night';
  root.dataset.theme = theme;
  toggle?.setAttribute('aria-pressed', String(night));
  toggle?.setAttribute('aria-label', night ? 'Dagwerk inschakelen' : 'Nachtwerk inschakelen');
  if (label) label.textContent = night ? 'Dagwerk' : 'Nachtwerk';
  themeColor?.setAttribute('content', night ? '#12161c' : '#e9e5db');
}

if (toggle) {
  applyTheme(root.dataset.theme === 'night' ? 'night' : 'light');
  toggle.addEventListener('click', () => {
    const theme = root.dataset.theme === 'night' ? 'light' : 'night';
    localStorage.setItem('theme', theme);
    applyTheme(theme);
  });
}

const links = [...document.querySelectorAll<HTMLAnchorElement>('.section-rail a[href^="#"]')];
const reference = document.querySelector<HTMLElement>('[data-sheet-reference]');
const sections = links
  .map((link, index) => {
    const target = document.querySelector<HTMLElement>(link.hash);
    return target ? { index, link, target } : undefined;
  })
  .filter((entry): entry is NonNullable<typeof entry> => entry !== undefined);

const observer = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    const active = sections.find(({ target }) => target === visible.target);
    if (!active) return;
    for (const { link } of sections) link.removeAttribute('aria-current');
    active.link.setAttribute('aria-current', 'location');
    if (reference) {
      const number = String(active.index).padStart(2, '0');
      reference.textContent = `${number} / ${active.target.dataset.sheet ?? ''}`;
    }
  },
  { rootMargin: '-30% 0px -55%', threshold: [0, 0.25, 0.5] },
);

for (const { target } of sections) observer.observe(target);
