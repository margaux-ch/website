'use strict';
const app = document.querySelector('#app');
let data = { home: [], photos: [], videos: [], projects: [], pretty: [], memory: [], about: '', instagram: '' };
let currentSlide = 0, currentItems = [], ctx = {}, gridScroll = 0, lastRoute = '';

/* Tailwind class recipes. Spacing is always Tailwind's 4px scale; colours and text
   styles are the tokens defined in src/input.css (text-ink, type-meta, ...). */
const C = {
  stage: 'mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col',
  frame: 'frame relative flex min-h-0 flex-1 items-center justify-center',
  fitBox: 'fit-box relative max-h-full max-w-full',
  fitImg: 'block h-full w-full object-contain',
  fitLink: 'group/link block h-full w-full',
  hoverLabel: 'type-meta pointer-events-none absolute bottom-3 left-3 bg-paper/90 px-2 py-1 text-ink opacity-0 transition-opacity group-hover/link:opacity-100 group-focus-visible/link:opacity-100',
  meta: 'type-meta flex max-h-28 flex-none items-start justify-between gap-6 overflow-auto pt-2 pb-3',
  name: 'text-ink',
  counter: 'counter flex-none text-ink-3 tabular-nums',
  credit: 'text-ink-3',
  creditLink: 'underline underline-offset-2',
  arrow: 'arrow group absolute inset-y-0 z-10 flex w-1/4 items-center border-0 bg-transparent px-2 text-xl text-ink-3 hover:text-ink md:w-24 md:px-6 md:text-2xl lg:w-32',
  arrowGlyph: 'grid size-10 place-items-center rounded-full bg-paper/85 text-ink transition-transform md:size-auto md:rounded-none md:bg-transparent md:text-ink-3 md:group-hover:text-ink',
  close: 'close type-ui absolute top-0 right-0 z-20 pt-1 pr-0 pb-2 pl-3 text-ink-2 hover:text-ink',
  title: 'type-title mb-3',
  copy: 'type-body mb-6 max-w-prose',
  empty: 'type-body mx-auto my-24 max-w-xl text-center text-ink-3',
  gallery: 'grid grid-cols-2 gap-x-2 gap-y-4 md:grid-cols-3 md:gap-x-4 md:gap-y-6',
  tileImg: 'block aspect-4/3 w-full bg-neutral-200 object-cover',
  tileLabel: 'mt-2 text-sm text-ink',
  /* project grid: rows of equal height, images keep their proportions (--ar = width / height) */
  pgrid: "pgrid flex flex-wrap items-start gap-x-1 gap-y-3 [--row-h:148px] after:grow-[1000000] after:content-[''] md:gap-x-2 md:gap-y-4 md:[--row-h:232px]",
  pitem: 'pitem m-0 max-w-[calc(var(--ar)*var(--row-h)*1.7)] min-w-0 shrink grow-[calc(var(--ar)*100)] basis-[calc(var(--ar)*var(--row-h))]',
  pitemLink: 'group block bg-neutral-200',
  pitemImg: 'block h-auto w-full transition-opacity group-hover:opacity-90',
  pitemCaption: 'type-meta mt-1',
};

const escapeHTML = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const safeImage = s => typeof s === 'string' && /^(https:\/\/|\.\/|\/)/.test(s) ? s : '';
const path = () => decodeURIComponent(location.hash.replace(/^#\/?/, '').split('?')[0] || '');
const preload = item => { if (item && safeImage(item.src)) new Image().src = item.src; };

/* Responsive <img>: Are.na resized versions (medium 1200px, large 1800px, thumb 400px). */
function image(item, cls = '', mode = '') {
  const src = safeImage(mode === 'thumb' ? (item.thumb || item.src) : item.src);
  if (!src) return '';
  const dims = item.w && item.h ? ` width="${+item.w}" height="${+item.h}"` : '';
  let set = '';
  if (mode === 'thumb' && safeImage(item.thumb_2x)) {
    set = ` srcset="${escapeHTML(src)} 400w, ${escapeHTML(item.thumb_2x)} 800w" sizes="(max-width:768px) 50vw, 33vw"`;
  } else if (mode !== 'thumb' && safeImage(item.src_large)) {
    set = ` srcset="${escapeHTML(src)} ${+item.w || 1200}w, ${escapeHTML(item.src_large)} ${+item.w_large || 1800}w" sizes="(max-width:768px) 100vw, 1280px"`;
  }
  const load = mode === 'hero' ? 'fetchpriority="high" decoding="async"' : 'loading="lazy" decoding="async"';
  return `<img class="${cls}" src="${escapeHTML(src)}"${set}${dims} ${load} alt="${escapeHTML(item.alt || item.caption || '')}">`;
}

function credit(c) {
  if (!c || !c.by) return '';
  const by = `<a class="${C.creditLink}" href="${escapeHTML(c.by_url || '#')}" target="_blank" rel="noopener">${escapeHTML(c.by)}</a>`;
  const src = /^https:\/\//.test(c.source_url || '')
    ? ` · <a class="${C.creditLink}" href="${escapeHTML(c.source_url)}" target="_blank" rel="noopener">${escapeHTML(c.source || 'source')} ↗</a>` : '';
  return `<span class="${C.credit}">via ${by}${src}</span>`;
}

function info(item) {
  const name = item.title ? `<div class="${C.name}">${escapeHTML(item.title)}</div>` : '';
  const text = item.caption ? `<div>${escapeHTML(item.caption)}</div>` : '';
  const cr = credit(item.credit);
  return name + text + (cr ? `<div>${cr}</div>` : '');
}

function caption(item, extra = '') {
  const body = info(item);
  return body || extra ? `<figcaption class="${C.meta}"><div class="min-w-0">${body}</div>${extra}</figcaption>` : '';
}

function randomItem(arr) {
  if (!arr.length) return null;
  const prev = sessionStorage.getItem('last-home');
  const options = arr.filter(x => x.src !== prev);
  const pool = options.length ? options : arr;
  const choice = pool[Math.floor(Math.random() * pool.length)];
  sessionStorage.setItem('last-home', choice.src);
  return choice;
}

const empty = message => { app.innerHTML = `<div class="${C.empty}">${escapeHTML(message)}</div>`; };

function home() {
  const item = randomItem(data.home);
  if (!item) return empty('The homepage image collection is not connected yet.');
  const img = image(item, C.fitImg, 'hero') + (item.project ? `<span class="${C.hoverLabel}">view project ↗</span>` : '');
  const inner = item.project
    ? `<a class="${C.fitLink}" href="#/project/${encodeURIComponent(item.project)}" aria-label="View project">${img}</a>` : img;
  app.innerHTML = `<section class="${C.stage}"><div class="${C.frame}"><div class="${C.fitBox}">${inner}</div></div>${caption(item)}</section>`;
  fitStage();
}

function grid(category) {
  const items = data[category] || [];
  if (!items.length) return empty(`No ${category} have been published yet.`);
  app.innerHTML = `<h1 class="${C.title}">${escapeHTML(category)}</h1><div class="${C.gallery}">${items.map(x =>
    `<a href="#/project/${encodeURIComponent(x.slug || '')}">${image(x.cover || x, C.tileImg, 'thumb')}<div class="${C.tileLabel}">${escapeHTML(x.title)}</div></a>`).join('')}</div>`;
}

const findProject = slug => [...data.photos, ...data.videos, ...data.projects].find(x => x.slug === slug);

function project(slug) {
  const item = findProject(slug);
  if (!item) return empty('This project has not been published yet.');
  const imgs = (item.images || []).filter(x => safeImage(x.src));
  const figure = (x, i) => `<figure class="${C.pitem}" style="--ar:${x.w && x.h ? (x.w / x.h).toFixed(4) : 1.5}">
    <a class="${C.pitemLink}" href="#/project/${encodeURIComponent(slug)}/${i + 1}" aria-label="Open image ${i + 1}">${image(x, C.pitemImg, 'thumb')}</a>
    ${x.title || x.caption ? `<figcaption class="${C.pitemCaption}">${x.title ? `<div class="${C.name}">${escapeHTML(x.title)}</div>` : ''}${escapeHTML(x.caption || '')}</figcaption>` : ''}</figure>`;
  app.innerHTML = `<h1 class="${C.title}">${escapeHTML(item.title)}</h1>${item.description ? `<p class="${C.copy}">${escapeHTML(item.description)}</p>` : ''}<div class="${C.pgrid}">${imgs.map(figure).join('')}</div>`;
}

function lightbox(slug, index) {
  const item = findProject(slug);
  currentItems = ((item && item.images) || []).filter(x => safeImage(x.src));
  if (!currentItems.length) return empty('This project has not been published yet.');
  ctx = { kind: 'project', slug };
  currentSlide = Math.min(Math.max(index, 0), currentItems.length - 1);
  renderViewer();
}

function viewer(kind) {
  currentItems = (data[kind] || []).filter(x => safeImage(x.src));
  if (!currentItems.length) return empty('This Are.na collection is not connected yet.');
  ctx = { kind };
  currentSlide = Math.floor(Math.random() * currentItems.length);
  renderViewer();
}

function renderViewer() {
  const item = currentItems[currentSlide];
  const count = `<div class="${C.counter}">${currentSlide + 1} / ${currentItems.length}</div>`;
  const close = ctx.slug ? `<a class="${C.close}" href="#/project/${encodeURIComponent(ctx.slug)}" aria-label="Back to project">close ×</a>` : '';
  const arrow = (id, dir, glyph, label) => `<button class="${C.arrow} ${dir === 'prev' ? 'left-0 justify-start' : 'right-0 justify-end'}" id="${id}" aria-label="${label}"><span class="${C.arrowGlyph} ${dir === 'prev' ? 'md:group-hover:-translate-x-1' : 'md:group-hover:translate-x-1'}">${glyph}</span></button>`;
  app.innerHTML = `<section class="${C.stage}"><div class="${C.frame}">${close}${arrow('previous', 'prev', '←', 'Previous image')}<div class="${C.fitBox}">${image(item, C.fitImg, 'hero')}</div>${arrow('next', 'next', '→', 'Next image')}</div>${caption(item, count) || `<div class="${C.meta}">${count}</div>`}</section>`;
  document.querySelector('#previous').onclick = () => step(-1);
  document.querySelector('#next').onclick = () => step(1);
  const frame = document.querySelector('.frame');
  let x0 = null;
  frame.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
  frame.addEventListener('touchend', e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    x0 = null;
    if (Math.abs(dx) > 48) step(dx < 0 ? 1 : -1);
  });
  fitStage();
  preload(currentItems[(currentSlide + 1) % currentItems.length]);
  preload(currentItems[(currentSlide - 1 + currentItems.length) % currentItems.length]);
}

function step(delta) {
  if (!currentItems.length) return;
  currentSlide = (currentSlide + delta + currentItems.length) % currentItems.length;
  if (ctx.slug) history.replaceState(null, '', `#/project/${encodeURIComponent(ctx.slug)}/${currentSlide + 1}`);
  renderViewer();
}

/* Size the image box to the largest rectangle with the image's ratio that fits the free space. */
function fitStage() {
  document.querySelectorAll('.fit-box').forEach(box => {
    const frame = box.parentElement, img = box.querySelector('img');
    if (!img) return;
    const size = () => {
      const r = (+img.getAttribute('width') / +img.getAttribute('height')) || (img.naturalWidth / img.naturalHeight);
      if (!r || !isFinite(r)) return;
      const fw = frame.clientWidth, fh = frame.clientHeight;
      let w = fw, h = w / r;
      if (h > fh) { h = fh; w = h * r; }
      box.style.width = w + 'px';
      box.style.height = h + 'px';
    };
    size();
    img.addEventListener('load', size);
  });
}
window.addEventListener('resize', fitStage);

function route() {
  const p = path();
  const [kind, slug, n] = p.split('/');
  const isBox = kind === 'project' && n;
  const now = isBox ? 'box:' + slug : kind === 'project' ? 'grid:' + slug : p;
  if (lastRoute.startsWith('grid:') && now.startsWith('box:')) gridScroll = window.scrollY;
  const back = lastRoute.startsWith('box:') && now === 'grid:' + lastRoute.slice(4);
  lastRoute = now;

  document.body.dataset.fit = String(!p || p === 'pretty' || p === 'memory' || !!isBox);
  document.body.dataset.page = p ? 'inner' : 'home';
  window.scrollTo(0, back ? gridScroll : 0);

  const section = kind === 'project'
    ? ['photos', 'videos', 'projects'].find(k => (data[k] || []).some(x => x.slug === slug)) || '' : p;
  document.querySelectorAll('nav a').forEach(a => a.setAttribute('aria-current', a.getAttribute('href') === '#/' + section ? 'page' : 'false'));
  document.querySelector('nav').dataset.open = 'false';
  document.querySelector('.menu-toggle').setAttribute('aria-expanded', 'false');

  if (!p) home();
  else if (['photos', 'videos', 'projects'].includes(p)) grid(p);
  else if (kind === 'project' && n) lightbox(slug, (parseInt(n, 10) || 1) - 1);
  else if (kind === 'project') project(slug);
  else if (p === 'pretty' || p === 'memory') viewer(p);
  else if (p === 'about') app.innerHTML = `<h1 class="${C.title}">about me</h1><p class="${C.copy}">${escapeHTML(data.about || 'Biography coming soon.')}</p>`;
  else empty('Page not found.');
  if (back) window.scrollTo(0, gridScroll);
}

window.addEventListener('hashchange', route);
document.addEventListener('keydown', e => {
  if (!document.querySelector('.arrow')) return;
  if (e.key === 'ArrowLeft') step(-1);
  if (e.key === 'ArrowRight') step(1);
  if (e.key === 'Escape' && ctx.slug) location.hash = '#/project/' + encodeURIComponent(ctx.slug);
});
document.querySelector('.menu-toggle').onclick = () => {
  const nav = document.querySelector('nav');
  nav.dataset.open = String(nav.dataset.open !== 'true');
  document.querySelector('.menu-toggle').setAttribute('aria-expanded', nav.dataset.open);
};
document.querySelector('#year').textContent = new Date().getFullYear();
fetch('./data/content.json')
  .then(r => { if (!r.ok) throw Error('No data'); return r.json(); })
  .then(json => { data = { ...data, ...json }; if (data.instagram) document.querySelector('#instagram').href = data.instagram; route(); })
  .catch(() => route());
