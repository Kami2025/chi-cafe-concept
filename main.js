(() => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const params = new URLSearchParams(location.search);

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* storage unavailable */ } },
    sget(k) { try { return sessionStorage.getItem(k); } catch { return null; } },
    sset(k, v) { try { sessionStorage.setItem(k, v); } catch { /* storage unavailable */ } },
  };

  /* ---------- products ---------- */
  const IMG = 'https://chi-cafe.de/wp-content/uploads/sites/11/';
  const PRODUCTS = {
    reichi:    { name: 'ReiChi Cafe', img: '2024/07/13331460_ReiChi_400g_240213_Hauptbild.jpg',
                 char: ['Der Exotische', 'The exotic one'],
                 desc: ['Espresso, extra viel Reishi und cremige Kokosmilch. Mit Magnesium.¹', 'Espresso, extra reishi and creamy coconut milk. With magnesium.¹'] },
    balance:   { name: 'Chi-Cafe balance', img: '2024/07/09332927_Chi-Cafe_Balance_450g_240209_Hauptbild.jpg',
                 char: ['Der Harmonische', 'The harmonious one'],
                 desc: ['Besonders mild und cremig, mit einer Nuance Kakao. Reich an Ballaststoffen.', 'Especially mild and creamy, with a hint of cocoa. Rich in fibre.'] },
    zen:       { name: 'ReiChi Zen', img: '2024/08/19059912_ReiChi_Zen_240619.jpg',
                 char: ['70 % Vitalpilze', '70 % functional mushrooms'],
                 desc: ['Ganz ohne Kaffee: Reishi, Lion’s Mane, Cordyceps und Chaga – mit Zimt und wärmendem Kakao.', 'No coffee at all: reishi, lion’s mane, cordyceps and chaga – with cinnamon and warming cocoa.'] },
    classic:   { name: 'Chi-Cafe classic', img: '2024/07/Chi-Cafe_Classic_240209_Hauptbild.jpg',
                 char: ['Unser Klassiker', 'Our classic'],
                 desc: ['Der Chi-Cafe, wie ihn viele seit Jahren lieben.', 'The Chi-Cafe many have loved for years.'] },
    proactive: { name: 'Chi-Cafe proactive', img: '2024/07/Chi-Cafe_proactive_360g_240209_Hauptbild.jpg',
                 char: ['Der Orientalische', 'The oriental one'],
                 desc: ['Würzig und warm – für alle, die es orientalisch mögen.', 'Spiced and warm – for those who love oriental notes.'] },
    flavochino:{ name: 'Flavochino', img: '2024/02/Flavochino_230911_Hauptbild.jpg',
                 char: ['Der Schokoladige', 'The chocolatey one'],
                 desc: ['Für Momente, die nach Schokolade verlangen.', 'For moments that call for chocolate.'] },
    bio:       { name: 'Chi-Cafe bio', img: '2024/07/11002404_Chi-Cafe_bio_Hauptbild_240209.jpg',
                 char: ['Der Bio-Liebling', 'The organic favourite'],
                 desc: ['Chi-Cafe in Bio-Qualität.', 'Chi-Cafe in organic quality.'] },
    free:      { name: 'Chi-Cafe free', img: '2024/07/Chi-Cafe_free_230911_Hauptbild.jpg',
                 char: ['Der Sanfte · entkoffeiniert', 'The gentle one · decaf'],
                 desc: ['Entkoffeiniert – für den Chi-Moment am Abend.', 'Decaffeinated – for your evening Chi moment.'] },
  };
  const RAIL_ORDER = ['reichi', 'balance', 'zen', 'classic', 'proactive', 'flavochino', 'bio', 'free'];

  /* ---------- language ---------- */
  let lang = params.get('lang') || store.get('chi-lang') || 'de';
  const i18nNodes = [...document.querySelectorAll('[data-en]')];
  i18nNodes.forEach(el => { el.dataset.de = el.innerHTML; });

  function setLang(next) {
    lang = next === 'en' ? 'en' : 'de';
    root.lang = lang;
    i18nNodes.forEach(el => { el.innerHTML = lang === 'en' ? el.dataset.en : el.dataset.de; });
    document.querySelectorAll('.lang button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
    store.set('chi-lang', lang);
    renderRail();
    if (finderState.result) showResult(finderState.result);
  }
  const t = pair => pair[lang === 'en' ? 1 : 0];

  /* ---------- product rail ---------- */
  const rail = document.getElementById('rail');
  function renderRail() {
    rail.innerHTML = RAIL_ORDER.map(key => {
      const p = PRODUCTS[key];
      return `<a class="card" href="#probieren">
        <img class="card__img" src="${IMG + p.img}" alt="${p.name}" loading="lazy">
        <span class="card__char">${t(p.char)}</span>
        <span class="card__name">${p.name}</span>
        <p class="card__desc">${t(p.desc)}</p>
        <span class="card__more">${lang === 'en' ? 'Discover' : 'Entdecken'}</span>
      </a>`;
    }).join('');
  }
  document.querySelectorAll('.arrow').forEach(btn => btn.addEventListener('click', () => {
    rail.scrollBy({ left: Number(btn.dataset.dir) * rail.clientWidth * 0.8, behavior: reduceMotion ? 'auto' : 'smooth' });
  }));

  /* ---------- character finder ---------- */
  const finder = document.getElementById('finder');
  const finderState = { moment: null, result: null };
  const step1 = finder.querySelector('[data-step="1"]');
  const step2 = finder.querySelector('[data-step="2"]');
  const result = finder.querySelector('.finder__result');

  function pick(moment, taste) {
    if (taste === 'nocoffee') return 'zen';
    if (moment === 'evening') return 'free';
    return { exotic: 'reichi', mild: 'balance', spiced: 'proactive', chocolate: 'flavochino' }[taste] || 'balance';
  }
  function showResult(key) {
    const p = PRODUCTS[key];
    finderState.result = key;
    result.querySelector('.finder__img').src = IMG + p.img;
    result.querySelector('.finder__img').alt = p.name;
    result.querySelector('.finder__char').textContent = t(p.char);
    result.querySelector('.finder__name').textContent = p.name;
    result.querySelector('.finder__desc').textContent = t(p.desc);
  }
  step1.addEventListener('click', e => {
    const chip = e.target.closest('.chip'); if (!chip) return;
    finderState.moment = chip.dataset.moment;
    step1.hidden = true; step2.hidden = false;
  });
  step2.addEventListener('click', e => {
    const chip = e.target.closest('.chip'); if (!chip) return;
    showResult(pick(finderState.moment, chip.dataset.taste));
    step2.hidden = true; result.hidden = false;
  });
  finder.querySelector('.finder__reset').addEventListener('click', () => {
    finderState.moment = finderState.result = null;
    result.hidden = true; step1.hidden = false;
  });

  /* ---------- nav ---------- */
  const nav = document.getElementById('nav');
  const hero = document.querySelector('.hero');
  const toggle = nav.querySelector('.nav__toggle');
  const menu = document.getElementById('menu');
  new IntersectionObserver(([entry]) => {
    nav.classList.toggle('is-solid', !entry.isIntersecting || toggle.getAttribute('aria-expanded') === 'true');
  }, { rootMargin: '-80px 0px 0px 0px' }).observe(hero);
  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    menu.hidden = !open;
    if (open) nav.classList.add('is-solid');
    else if (window.scrollY < hero.offsetHeight - 80) nav.classList.remove('is-solid');
  }
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  document.querySelectorAll('.lang button').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));

  /* ---------- reveal on scroll ---------- */
  const revealer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      revealer.unobserve(entry.target);
      if (entry.target.classList.contains('counter')) countUp();
    });
  }, { threshold: 0.18 });
  // ?static shows everything at once, ?only=<class> isolates one section (used for proposal screenshots)
  const only = params.get('only');
  if (only) {
    document.querySelectorAll('main > section, .footer, .concept-bar').forEach(el => { el.hidden = !el.classList.contains(only); });
  }
  if (params.has('static')) {
    document.querySelectorAll('.reveal, .curve').forEach(el => el.classList.add('is-in'));
    const c = document.getElementById('counter');
    c.textContent = Number(c.dataset.target).toLocaleString('de-DE');
  } else {
    document.querySelectorAll('.reveal').forEach(el => revealer.observe(el));
  }

  /* ---------- ingredients: sticky image follows the text ---------- */
  const ingImgs = [...document.querySelectorAll('.ingredients__frame img')];
  const ingItems = [...document.querySelectorAll('.ing')];
  const ingObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const i = entry.target.dataset.ing;
      ingItems.forEach(li => li.classList.toggle('is-active', li === entry.target));
      ingImgs.forEach(img => img.classList.toggle('is-active', img.dataset.ing === i));
    });
  }, { rootMargin: '-45% 0px -45% 0px' });
  ingItems.forEach(li => ingObserver.observe(li));

  /* ---------- counter ---------- */
  const counter = document.getElementById('counter');
  let counted = false;
  function countUp() {
    if (counted) return; counted = true;
    const target = Number(counter.dataset.target);
    const fmt = n => n.toLocaleString(lang === 'en' ? 'en-GB' : 'de-DE');
    if (reduceMotion) { counter.textContent = fmt(target); return; }
    const dur = 2600, start = performance.now();
    const step = now => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 4);
      counter.textContent = fmt(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ---------- quotes ---------- */
  const quotes = [...document.querySelectorAll('.quote')];
  const dots = document.querySelector('.quotes__dots');
  let qi = 0, qTimer;
  quotes.forEach((_, i) => {
    const b = document.createElement('button');
    b.type = 'button'; b.setAttribute('role', 'tab'); b.setAttribute('aria-label', `${i + 1}`);
    b.addEventListener('click', () => { showQuote(i); restartQuotes(); });
    dots.appendChild(b);
  });
  function showQuote(i) {
    qi = i;
    quotes.forEach((q, j) => q.classList.toggle('is-active', j === i));
    [...dots.children].forEach((d, j) => d.setAttribute('aria-selected', String(j === i)));
  }
  function restartQuotes() {
    clearInterval(qTimer);
    if (!reduceMotion) qTimer = setInterval(() => showQuote((qi + 1) % quotes.length), 7000);
  }
  showQuote(0); restartQuotes();

  /* ---------- breathing moment ---------- */
  const orb = document.getElementById('orb');
  const orbLabel = document.getElementById('orbLabel');
  const breathBtn = document.getElementById('breathBtn');
  let breathing = false;
  const words = () => lang === 'en'
    ? { in: 'Breathe in …', out: 'Breathe out …', done: 'Welcome back.' }
    : { in: 'Einatmen …', out: 'Ausatmen …', done: 'Schön, dass Sie da sind.' };
  const wait = ms => new Promise(r => setTimeout(r, ms));
  breathBtn.addEventListener('click', async () => {
    if (breathing) return; breathing = true; breathBtn.disabled = true;
    for (let i = 0; i < 2; i++) {
      orbLabel.textContent = words().in; orb.classList.remove('is-out'); orb.classList.add('is-in');
      await wait(4000);
      orbLabel.textContent = words().out; orb.classList.remove('is-in'); orb.classList.add('is-out');
      await wait(6000);
    }
    orbLabel.textContent = words().done;
    breathing = false; breathBtn.disabled = false;
  });

  /* ---------- intro: steam condenses into 氣 ---------- */
  const intro = document.getElementById('intro');
  const skipIntro = reduceMotion || params.has('nointro') || store.sget('chi-intro');
  function ready() { root.classList.add('is-ready'); }

  if (skipIntro) {
    root.classList.add('no-intro');
    ready();
  } else {
    store.sset('chi-intro', '1');
    const map = document.getElementById('steamMap');
    const blur = document.getElementById('steamBlur');
    const noise = document.getElementById('steamNoise');
    const glyph = intro.querySelector('.intro__glyph');
    const finish = () => { intro.classList.add('is-done'); ready(); };
    intro.addEventListener('click', finish);
    const run = () => {
      const dur = 2600, start = performance.now();
      const frame = now => {
        const p = Math.min(1, (now - start) / dur);
        const e = 1 - Math.pow(1 - p, 3);
        map.setAttribute('scale', String(90 * (1 - e)));
        blur.setAttribute('stdDeviation', String(10 * (1 - e)));
        noise.setAttribute('baseFrequency', `${0.012} ${0.035 + 0.02 * p}`);
        glyph.style.opacity = String(Math.min(1, e * 1.4));
        if (p < 1) requestAnimationFrame(frame);
        else {
          intro.classList.add('is-caption');
          setTimeout(finish, 1300);
        }
      };
      glyph.style.opacity = '0';
      requestAnimationFrame(frame);
    };
    (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(run);
    setTimeout(finish, 6000); // never trap the visitor
  }

  setLang(lang);
})();
