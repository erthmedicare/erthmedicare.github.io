// شاشة الفتح: شعار إرث يتركب قطعة قطعة من أجزائه الأصلية (نفس حركة الموقع الأول):
// فقرات الشعار تنزل من فوق وحدة وحدة وهي تلف وتستقر، بعدها الخط، ثم الاسم العربي، ثم الإنجليزي.
// لما يجهز الموقع، الشعار يطير لمكانه في أعلى الصفحة والعمود ثلاثي الأبعاد يبدأ يتركب.
// هذا الملف صغير ومستقل، فيشتغل قبل ما تتحمل باقي ملفات الموقع الثقيلة.
const loader = document.getElementById('loader');
const api = (window.__logoIntro = { ready: Promise.resolve(), leave: null });
const el = (cls) => { const d = document.createElement('div'); d.className = cls; return d; };

if (!loader || matchMedia('(prefers-reduced-motion: reduce)').matches || !Element.prototype.animate) { loader && loader.classList.add('static'); }
else api.ready = run().catch((e) => { console.warn('logo intro', e); loader.classList.remove('li'); loader.classList.add('static'); api.leave = null; });

async function run() {
  const P = await fetch('assets/logo-parts.json').then((r) => { if (!r.ok) throw new Error('logo parts'); return r.json(); });
  const NS = 'http://www.w3.org/2000/svg', FW = P.viewBox[2], FH = P.viewBox[3], PAD = 1.2, TEAL = P.colors.teal, PURPLE = P.colors.purple;
  const svg = (vb, parts, fill) => {
    const s = document.createElementNS(NS, 'svg'); s.setAttribute('viewBox', vb.join(' ')); s.setAttribute('aria-hidden', 'true');
    for (const x of parts) { const p = document.createElementNS(NS, 'path'); p.setAttribute('fill', fill); if (x.rule) p.setAttribute('fill-rule', x.rule); p.setAttribute('transform', `matrix(${x.m.join(',')})`); p.setAttribute('d', x.d); s.append(p); }
    return s;
  };
  const layer = (parts, fill, cls = '') => { const d = el('li-layer ' + cls); d.append(svg([0, 0, FW, FH], parts, fill)); return d; };
  const veil = el('li-veil'), box = el('li-box'), spine = el('li-spine'); box.style.aspectRatio = `${FW} / ${FH}`;
  box.setAttribute('role', 'img'); box.setAttribute('aria-label', 'مركز إرث الرعاية الطبية');

  // التوقيت بالثواني
  const V = 0.068, V_END = P.vertebrae.length * V + 0.45, C0 = V_END - 0.1, CS = 0.07, AR = C0 + P.calligraphy.length * CS + 0.25, EN = AR + 0.28, END = EN + 0.6;
  const anims = [], drop = Math.round(innerHeight * 0.62);
  // الخط: كل قطعة تنزلق من اليمين وتظهر، وحدة ورا الثانية
  P.calligraphy.forEach((p, i) => { const d = layer([p], PURPLE); box.append(d); anims.push(d.animate([{ opacity: 0, transform: 'translateX(16px)' }, { opacity: 1, transform: 'none' }], { duration: 600, delay: (C0 + i * CS) * 1000, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'both' })); });
  // الفقرات: كل فقرة طبقة لحالها في مكانها بالضبط، تنزل من فوق وهي تلف وتستقر بنطّة خفيفة
  P.vertebrae.forEach((p, i) => {
    const x = p.box[0] - PAD, y = p.box[1] - PAD, w = p.box[2] + PAD * 2, h = p.box[3] + PAD * 2, d = el('li-v');
    d.style.cssText = `left:${(x / FW) * 100}%;top:${(y / FH) * 100}%;width:${(w / FW) * 100}%;height:${(h / FH) * 100}%`; d.append(svg([x, y, w, h], [p], TEAL)); spine.append(d);
    anims.push(d.animate([{ transform: `translateY(${-drop}px) rotateX(260deg) rotateY(${i % 2 ? 140 : -140}deg) rotateZ(${i % 2 ? -18 : 18}deg) scale(1.25)`, opacity: 0 }, { opacity: 1, offset: 0.28 }, { transform: 'none', opacity: 1 }], { duration: 900, delay: i * V * 1000, easing: 'cubic-bezier(.22,1.28,.36,1)', fill: 'both' }));
  });
  box.append(spine);
  // الاسم العربي ثم الإنجليزي
  const texts = [[P.arabic, AR], [P.english, EN]].map(([parts, t]) => { const d = layer(parts, PURPLE, 'li-text'); box.append(d); anims.push(d.animate([{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }], { duration: 550, delay: t * 1000, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'both' })); return d; });
  loader.classList.add('li'); loader.append(veil, box);

  // مكان الشعار (الفقرات والخط بدون الأسماء) داخل الشعار الكامل، عشان يطير لشعار أعلى الصفحة بنفس المقاس
  const mk = [...P.vertebrae, ...P.calligraphy], x0 = Math.min(...mk.map((p) => p.box[0])) - PAD, y0 = Math.min(...mk.map((p) => p.box[1])) - PAD, x1 = Math.max(...mk.map((p) => p.box[0] + p.box[2])) + PAD, y1 = Math.max(...mk.map((p) => p.box[1] + p.box[3])) + PAD;
  api.leave = () => new Promise((res) => {
    let ended = false; const end = () => { if (ended) return; ended = true; nav && (nav.style.visibility = ''); loader.classList.add('done'); loader.style.display = 'none'; res(); };
    loader.style.pointerEvents = 'none';
    const nav = document.querySelector('#top .brand img'), L = box.getBoundingClientRect(), N = nav ? nav.getBoundingClientRect() : null;
    veil.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 750, delay: 200, easing: 'cubic-bezier(.33,1,.68,1)', fill: 'forwards' });
    texts.forEach((t) => t.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(10px)' }], { duration: 300, fill: 'forwards' }));
    if (!N || !N.height || !L.height) { box.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 500, fill: 'forwards' }).onfinish = end; setTimeout(end, 900); return; }
    const cxr = (x0 + (x1 - x0) / 2) / FW, cyr = (y0 + (y1 - y0) / 2) / FH, cx = L.left + cxr * L.width, cy = L.top + cyr * L.height, s = N.height / (((y1 - y0) / FH) * L.height);
    box.style.transformOrigin = `${cxr * 100}% ${cyr * 100}%`; nav.style.visibility = 'hidden';
    box.animate([{ transform: 'none' }, { transform: `translate(${N.left + N.width / 2 - cx}px, ${N.top + N.height / 2 - cy}px) scale(${s})` }], { duration: 850, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'forwards' }).onfinish = end;
    setTimeout(end, 1400); // لو الصفحة في الخلفية والحركة ما كملت
  });

  // تخلص الحركة لحالها، أو بضغطة أو أي زر (تخطي)
  await new Promise((res) => {
    const t = setTimeout(res, END * 1000), skip = () => { clearTimeout(t); anims.forEach((a) => { try { a.finish(); } catch (e) { /* خلصت */ } }); res(); };
    loader.addEventListener('pointerdown', skip, { once: true }); addEventListener('keydown', skip, { once: true });
  });
}
