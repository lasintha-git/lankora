const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const stars = () => '<span class="stars" aria-label="5 stars">&#9733;&#9733;&#9733;&#9733;&#9733;</span>';

function guideCard(g, level = 3) {
  const avatar = g.photo
    ? `<img src="${esc(g.photo)}" alt="${esc(g.name)}" onerror="this.outerHTML='<div class=&quot;avatar&quot;>${esc(g.name[0])}</div>'">`
    : `<div class="avatar">${esc(g.name[0])}</div>`;
  return `<article class="guide-full" id="${esc(g.id)}">
    <div class="guide-head">${avatar}
      <div><h${level}>${esc(g.name)}</h${level}><p>${esc(g.role)} (${g.years}+ years)</p>
      <p>${stars()} ${g.rating} / 5 from ${g.count} reviews</p></div></div>
    <p>${esc(g.bio)}</p>
    <ul>
      <li><strong>Languages:</strong> ${esc(g.langs.join(', '))}</li>
      <li><strong>Covers:</strong> ${esc(g.places.join(', '))}</li>
      <li><strong>Phone:</strong> <a href="tel:${esc(g.phone.replace(/\s/g,''))}">${esc(g.phone)}</a></li>
      <li><strong>Email:</strong> <a href="mailto:${esc(g.email)}">${esc(g.email)}</a></li>
    </ul></article>`;
}

function renderPlace() {
  const q = new URLSearchParams(location.search);
  const name = q.get('place');
  const p = PLACES[name];
  const root = $('placePage');
  if (!p) { root.innerHTML = '<h2>Place not found</h2><p><a class="btn btn-green" href="index.html#places">Back to Popular Places</a></p>'; return; }
  document.title = name + ' - Lankora';
  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.content = name + ': ' + p.tagline;

  let trip = '';
  const nights = Math.round((new Date(q.get('end')) - new Date(q.get('start'))) / 86400000);
  if (q.get('start') && q.get('end') && nights >= 0) {
    const exp = q.get('exp') ? ' | Interests: ' + esc(q.get('exp').split(',').join(', ')) : '';
    trip = `<p class="trip-summary">Your trip: ${esc(q.get('start'))} to ${esc(q.get('end'))} (${nights} ${nights === 1 ? 'night' : 'nights'})${exp}</p>`;
  }

  const files = [p.img + '.jpg', p.img + '-2.jpg', p.img + '-3.jpg'];
  const guides = GUIDES.filter(g => g.places.includes(name));
  root.innerHTML = `
    <a href="index.html#places" class="back">&larr; Back</a>
    <h1>${esc(name)}</h1><p class="subtitle">${esc(p.tagline)}</p>${trip}
    <div class="slider" id="slider" aria-roledescription="carousel">
      <div class="slides">${files.map(f => `<img src="images/${f}" alt="${esc(name)}">`).join('')}</div>
      <button type="button" class="s-prev" aria-label="Previous photo">&#8249;</button>
      <button type="button" class="s-next" aria-label="Next photo">&#8250;</button>
    </div>
    <div class="detail-box">
      <h2>About ${esc(name)}</h2><p>${esc(p.about)}</p>
      <ul>
        <li><strong>District:</strong> ${esc(p.district)}</li>
        <li><strong>Best time to visit:</strong> ${esc(p.best)}</li>
        <li><strong>Getting there:</strong> ${esc(p.getting)}</li>
      </ul>
      <h2>Top things to do</h2>
      <ul>${p.highlights.map(h => `<li>${esc(h)}</li>`).join('')}</ul>
    </div>
    <h2 class="block-title">Map</h2>
    <iframe class="map" title="Map of ${esc(name)}" loading="lazy"
      src="https://www.google.com/maps?q=${encodeURIComponent(name + ', Sri Lanka')}&output=embed"></iframe>
    <h2 class="block-title">Guides for ${esc(name)}</h2>
    ${guides.length ? guides.map(g => guideCard(g, 3)).join('') : '<p>No guides listed for this place yet.</p>'}
    <p><a class="btn btn-green" href="guides.html">View all guides</a></p>`;
  setupSlider();
}

function setupSlider() {
  const box = $('slider'), track = box.querySelector('.slides');
  let i = 0;
  const show = () => {
    const n = track.children.length;
    if (!n) { box.style.display = 'none'; return; }
    i = (i + n) % n;
    track.style.transform = `translateX(-${i * 100}%)`;
    box.classList.toggle('single', n < 2);
  };
  track.querySelectorAll('img').forEach(img => img.addEventListener('error', () => { img.remove(); show(); }));
  box.querySelector('.s-prev').onclick = () => { i--; show(); };
  box.querySelector('.s-next').onclick = () => { i++; show(); };
  show();
}

if ($('placePage')) renderPlace();
if ($('guideList')) $('guideList').innerHTML = GUIDES.map(g => guideCard(g, 2)).join('');