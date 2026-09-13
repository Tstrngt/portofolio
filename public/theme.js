(() => {
  const root = document.documentElement;
  const stored = localStorage.getItem('theme');
  const systemNight = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = stored === 'light' || stored === 'night' ? stored : systemNight ? 'night' : 'light';
  root.dataset.theme = theme;
  root.dataset.themeReady = 'true';
})();
