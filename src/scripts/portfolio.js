(() => {
  const root = document.getElementById('tim-motion');
  if (!root) return;
  root.classList.add('is-enhanced');
  const scroller = document.scrollingElement;
  const navbar = root.querySelector('.tm-nav');
  const journey = root.querySelector('.tm-journey');
  const stage = root.querySelector('.tm-stage');
  const canvas = root.querySelector('canvas');
  const context = canvas.getContext('2d');
  const stories = [...root.querySelectorAll('[data-story]')];
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const settings = { accent: '#c7ed76', strength: 1 };
  let width = 1,
    height = 1,
    queued = false,
    progress = 0;
  let endColor = getComputedStyle(root).getPropertyValue('--motion-end').trim();
  const clamp = (n) => Math.max(0, Math.min(1, n));
  const smooth = (n) => {
    n = clamp(n);
    return n * n * (3 - 2 * n);
  };
  const mix = (a, b, t) => a + (b - a) * t;
  const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const blend = (a, b, t) =>
    'rgb(' +
    rgb(a)
      .map((v, i) => Math.round(mix(v, rgb(b)[i], t)))
      .join(',') +
    ')';
  const luminance = (values) =>
    values
      .map((value) => {
        const n = value / 255;
        return n <= 0.04045 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4);
      })
      .reduce((sum, n, i) => sum + n * [0.2126, 0.7152, 0.0722][i], 0);
  const circuits = [
    [
      [0.56, 0.05],
      [0.56, 0.26],
      [0.72, 0.26],
      [0.72, 0.47],
      [0.93, 0.47],
      [0.93, 0.88],
    ],
    [
      [0.68, 0.02],
      [0.68, 0.18],
      [0.85, 0.18],
      [0.85, 0.59],
      [0.72, 0.59],
      [0.72, 0.98],
    ],
    [
      [0.98, 0.12],
      [0.89, 0.12],
      [0.89, 0.35],
      [0.61, 0.35],
      [0.61, 0.78],
      [0.83, 0.78],
    ],
    [
      [0.51, 0.96],
      [0.51, 0.67],
      [0.79, 0.67],
      [0.79, 0.09],
      [0.97, 0.09],
      [0.97, 0.02],
    ],
  ];
  const roads = [
    [
      [0.55, -0.08],
      [0.65, 0.25],
      [0.67, 0.58],
      [1.06, 1.08],
    ],
    [
      [0.63, -0.08],
      [0.71, 0.24],
      [0.73, 0.56],
      [1.14, 1.08],
    ],
    [
      [1.1, 0.1],
      [0.78, 0.36],
      [0.5, 0.7],
      [0.53, 1.1],
    ],
    [
      [1.1, 0.17],
      [0.83, 0.41],
      [0.57, 0.73],
      [0.6, 1.1],
    ],
  ];
  function along(points, t) {
    const lengths = [];
    let total = 0;
    for (let i = 1; i < points.length; i++) {
      const len = Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]);
      lengths.push(len);
      total += len;
    }
    let distance = t * total;
    for (let i = 0; i < lengths.length; i++) {
      if (distance <= lengths[i] || i === lengths.length - 1) {
        const f = distance / lengths[i];
        return [mix(points[i][0], points[i + 1][0], f), mix(points[i][1], points[i + 1][1], f)];
      }
      distance -= lengths[i];
    }
    return points[points.length - 1];
  }
  function curve(points, t) {
    const s = 1 - t;
    return [0, 1].map(
      (i) =>
        s * s * s * points[0][i] +
        3 * s * s * t * points[1][i] +
        3 * s * t * t * points[2][i] +
        t * t * t * points[3][i],
    );
  }
  const samples = circuits.map((points, i) =>
    Array.from({ length: 90 }, (_, j) => ({
      digital: along(points, j / 89),
      civil: curve(roads[i], j / 89),
    })),
  );
  function line(points, morph) {
    context.beginPath();
    points.forEach((point, i) => {
      let x = mix(point.digital[0], point.civil[0], morph),
        y = mix(point.digital[1], point.civil[1], morph);
      if (width < 650) {
        x = 0.42 + (x - 0.42) * 0.92;
        y = 0.76 + y * 0.22;
      }
      const px = x * width,
        py = y * height;
      if (i === 0) context.moveTo(px, py);
      else context.lineTo(px, py);
    });
  }
  function paint(p) {
    if (!context) return;
    const morph = reduce.matches ? (p > 0.55 ? 1 : 0) : smooth((p - 0.22) / 0.57);
    const background = blend('#102022', endColor, morph);
    const backgroundValues = rgb('#102022').map((v, i) => mix(v, rgb(endColor)[i], morph));
    const lightContrast = 1.05 / (luminance(backgroundValues) + 0.05);
    const darkContrast = (luminance(backgroundValues) + 0.05) / (luminance(rgb('#081211')) + 0.05);
    const ink = lightContrast > darkContrast ? '#ffffff' : '#081211';
    stage.style.background = background;
    stage.style.color = ink;
    stage.style.setProperty('--tm-veil', '0');
    stage.style.setProperty('--tm-progress', (p * 100).toFixed(2) + '%');
    context.clearRect(0, 0, width, height);
    context.save();
    context.strokeStyle = blend('#263936', '#d5dccd', morph);
    context.lineWidth = 0.7;
    const spacing = width < 650 ? 36 : 48;
    const offset = reduce.matches ? 0 : p * 32 * settings.strength;
    for (let x = width * 0.5; x < width + spacing; x += spacing) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x - offset, height);
      context.stroke();
    }
    for (let y = -spacing; y < height + spacing; y += spacing) {
      context.beginPath();
      context.moveTo(width * 0.46, y + offset);
      context.lineTo(width, y + offset);
      context.stroke();
    }
    context.restore();
    const scale = width < 650 ? 0.58 : 1;
    samples.forEach((points, i) => {
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.setLineDash([]);
      line(points, morph);
      context.strokeStyle = blend('#476046', '#c7d0bc', morph);
      context.lineWidth = mix(3, 34 * scale, morph);
      context.stroke();
      line(points, morph);
      context.strokeStyle = blend(settings.accent, '#788573', morph);
      context.lineWidth = mix(1.3, 27 * scale, morph);
      context.stroke();
      if (morph > 0.05) {
        line(points, morph);
        context.globalAlpha = morph;
        context.strokeStyle = '#eef0e7';
        context.lineWidth = 1;
        context.setLineDash([9 * scale, 12 * scale]);
        context.lineDashOffset = -p * 95;
        context.stroke();
        context.setLineDash([]);
        context.globalAlpha = 1;
      }
      if (morph < 0.94) {
        [0, 0.28, 0.61, 1].forEach((t) => {
          const index = Math.round(t * (points.length - 1));
          const point = points[index];
          let x = mix(point.digital[0], point.civil[0], morph),
            y = mix(point.digital[1], point.civil[1], morph);
          if (width < 650) {
            x = 0.42 + (x - 0.42) * 0.92;
            y = 0.76 + y * 0.22;
          }
          context.globalAlpha = 1 - morph;
          context.fillStyle = settings.accent;
          context.fillRect(x * width - 3, y * height - 3, 6, 6);
          context.globalAlpha = 1;
        });
        const t = (0.12 + p * 1.35 + i * 0.17) % 1;
        const point = points[Math.floor(t * (points.length - 1))];
        let x = mix(point.digital[0], point.civil[0], morph),
          y = mix(point.digital[1], point.civil[1], morph);
        if (width < 650) {
          x = 0.42 + (x - 0.42) * 0.92;
          y = 0.76 + y * 0.22;
        }
        context.globalAlpha = 1 - morph;
        context.fillStyle = '#eef0e7';
        context.beginPath();
        context.arc(x * width, y * height, 3.2, 0, Math.PI * 2);
        context.fill();
        context.globalAlpha = 1;
      }
    });
    const selected = p < 0.34 ? 'digital' : p < 0.65 ? 'bridge' : 'infra';
    const digitalOut = smooth((p - 0.27) / 0.1);
    const infraIn = smooth((p - 0.59) / 0.11);
    const weights = { digital: 1 - digitalOut, bridge: digitalOut * (1 - infraIn), infra: infraIn };
    stories.forEach((story) => {
      const kind = story.dataset.story;
      const weight = reduce.matches ? (kind === selected ? 1 : 0) : weights[kind];
      story.hidden = weight < 0.015;
      story.inert = kind !== selected;
      story.setAttribute('aria-hidden', String(kind !== selected));
      if (!story.hidden) {
        const direction = kind === 'digital' || (kind === 'bridge' && p > 0.45) ? -1 : 1;
        story.style.transform = reduce.matches
          ? 'none'
          : 'translateY(' + (direction * (1 - weight) * 26 * settings.strength).toFixed(1) + 'px)';
        story.style.opacity = String(weight);
        story.style.color = ink;
        story.querySelector('.tm-description').style.color = ink;
      }
    });
    root.querySelector('[data-scene-label]').textContent =
      selected === 'digital'
        ? 'NETWERK / HOSTING / WEB'
        : selected === 'bridge'
          ? 'VERBINDINGEN WORDEN WEGEN'
          : 'PLANNING / TECHNIEK / UITVOERING';
    root.querySelector('[data-chapter-label]').textContent =
      selected === 'digital'
        ? '01 — DIGITALE INFRASTRUCTUUR'
        : selected === 'bridge'
          ? '01 → 02 — DE VERBINDING'
          : '02 — CIVIELE TECHNIEK';
    root.querySelector('[data-jump="next"]').textContent =
      selected === 'infra' ? 'Bekijk de projecten ↓' : 'Scroll om te ontdekken ↓';
    const visibleArea =
      scroller.scrollTop >= root.querySelector('.tm-bio').offsetTop - navbar.offsetHeight - 40
        ? 'bio'
        : scroller.scrollTop >= root.querySelector('.tm-work').offsetTop - navbar.offsetHeight - 40
          ? 'work'
          : selected === 'infra'
            ? 'infra'
            : 'digital';
    navbar.querySelectorAll('[data-jump]').forEach((button) => {
      if (button.dataset.jump === visibleArea) button.setAttribute('aria-current', 'location');
      else button.removeAttribute('aria-current');
    });
  }
  function update() {
    queued = false;
    progress = clamp(
      (scroller.scrollTop - journey.offsetTop) /
        Math.max(1, journey.offsetHeight - stage.offsetHeight),
    );
    paint(progress);
  }
  function schedule() {
    if (!queued) {
      queued = true;
      requestAnimationFrame(update);
    }
  }
  function resize() {
    width = document.documentElement.clientWidth;
    height = Math.max(window.innerHeight, width < 650 ? 650 : 600);
    stage.style.height = height + 'px';
    journey.style.height =
      Math.round(height * (reduce.matches ? 1.85 : width < 650 ? 2.65 : 3)) + 'px';
    stage.style.setProperty(
      '--tm-story-top',
      Math.max(132, navbar.offsetTop + navbar.offsetHeight + 32) + 'px',
    );
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    if (context) context.setTransform(ratio, 0, 0, ratio, 0, 0);
    schedule();
  }
  root.querySelectorAll('[data-jump]').forEach((button) =>
    button.addEventListener('click', (event) => {
      event.preventDefault();
      if (button instanceof HTMLAnchorElement) history.pushState(null, '', button.hash);
      const target = button.dataset.jump;
      const distance = journey.offsetHeight - stage.offsetHeight;
      let top = journey.offsetTop;
      const sectionOffset = navbar.offsetTop + navbar.offsetHeight + 24;
      const workTarget = root.querySelector('.tm-work-head').offsetTop - sectionOffset;
      if (target === 'infra') top += distance * 0.85;
      if (target === 'next')
        top = progress > 0.65 ? workTarget : top + distance * (progress < 0.34 ? 0.48 : 0.85);
      if (target === 'work') top = workTarget;
      if (target === 'bio') top = root.querySelector('.tm-bio').offsetTop - sectionOffset;
      window.scrollTo({ top: Math.max(0, top), behavior: reduce.matches ? 'instant' : 'smooth' });
    }),
  );
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', resize);
  const observer = new ResizeObserver(resize);
  observer.observe(navbar);
  new MutationObserver(() => {
    endColor = getComputedStyle(root).getPropertyValue('--motion-end').trim();
    schedule();
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  reduce.addEventListener('change', resize);
  resize();
  const photoInput = root.querySelector('#tm-photo-file');
  const portrait = root.querySelector('[data-portrait]');
  const photoPlaceholder = root.querySelector('.tm-portrait-placeholder');
  const photoMessage = root.querySelector('.tm-photo-message');
  const photoEditor = root.querySelector('[data-photo-editor]');
  if (new URLSearchParams(location.search).get('preview') === '1') photoEditor.hidden = false;
  photoInput.addEventListener('change', () => {
    const file = photoInput.files?.[0];
    if (!file) return;
    photoMessage.hidden = false;
    if (!file.type.startsWith('image/') || file.size > 8 * 1024 * 1024) {
      photoMessage.textContent = 'Kies een afbeelding van maximaal 8 MB.';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      portrait.onload = () => {
        portrait.hidden = false;
        photoPlaceholder.hidden = true;
        photoMessage.textContent = 'Foto toegevoegd aan de voorvertoning.';
      };
      portrait.onerror = () => {
        portrait.hidden = true;
        photoPlaceholder.hidden = false;
        photoMessage.textContent =
          'Deze afbeelding kan niet worden weergegeven. Kies een andere foto.';
      };
      portrait.src = String(reader.result);
    };
    reader.onerror = () => {
      photoMessage.textContent = 'De foto kon niet worden ingelezen. Probeer opnieuw.';
    };
    reader.readAsDataURL(file);
  });
})();
