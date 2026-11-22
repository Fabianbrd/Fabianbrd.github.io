/* Portafolio · Edgar Fabián Cabrera Bardales — JS sin dependencias */
(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(pointer: fine)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Aviso flotante ---------- */
  var toastEl = $('#toast'), toastT;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.classList.remove('is-on'); }, 2200);
  }

  /* ---------- Tema ---------- */
  var themeBtn = $('#themeBtn');
  function syncTheme() {
    var dark = root.dataset.theme !== 'light';
    themeBtn.setAttribute('aria-label', dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
    themeBtn.title = themeBtn.getAttribute('aria-label');
  }
  function toggleTheme() {
    root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
    try { localStorage.setItem('tema', root.dataset.theme); } catch (e) {}
    syncTheme();
  }
  themeBtn.addEventListener('click', toggleTheme);
  syncTheme();

  /* ---------- Menú móvil ---------- */
  var menuBtn = $('#menuBtn'), nav = $('#nav');
  function closeMenu() { nav.classList.remove('is-open'); menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.setAttribute('aria-label', 'Abrir menú'); }
  menuBtn.addEventListener('click', function () {
    var open = !nav.classList.contains('is-open');
    nav.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  });
  $$('.nav a').forEach(function (a) { a.addEventListener('click', closeMenu); });
  document.addEventListener('click', function (e) { if (!e.target.closest('.topbar')) closeMenu(); });

  /* ---------- Año, reloj de Madrid ---------- */
  $('#year').textContent = new Date().getFullYear();
  var clock = $('#clock');
  function tick() {
    try {
      clock.textContent = new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid' }).format(new Date());
    } catch (e) { clock.parentNode.hidden = true; }
  }
  tick(); setInterval(tick, 15000);

  /* ---------- Rol que se escribe solo ---------- */
  var roles = ['Data Analyst', 'Business Intelligence', 'Análisis Financiero', 'SQL · Power BI · Python'];
  var roleEl = $('#roleText');
  if (!reduce && roleEl) {
    var ri = 0, ci = roles[0].length, del = false;
    (function loop() {
      var word = roles[ri];
      ci += del ? -1 : 1;
      roleEl.textContent = word.slice(0, ci);
      var wait = del ? 35 : 70;
      if (!del && ci === word.length) { del = true; wait = 2200; }
      else if (del && ci === 0) { del = false; ri = (ri + 1) % roles.length; wait = 300; }
      setTimeout(loop, wait);
    })();
  }

  /* ---------- Barra de progreso + barra superior ---------- */
  var prog = $('#progress');
  function onScroll() {
    var h = document.documentElement.scrollHeight - innerHeight;
    prog.style.transform = 'scaleX(' + (h > 0 ? scrollY / h : 0) + ')';
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Luz que sigue al ratón + inclinación 3D + botones magnéticos ---------- */
  if (finePointer && !reduce) {
    document.addEventListener('pointermove', function (e) {
      var el = e.target.closest('.spot');
      if (el) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        el.style.setProperty('--my', (e.clientY - r.top) + 'px');
      }
    }, { passive: true });

    $$('.tilt').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        el.style.transform = 'perspective(800px) rotateX(' + (-y * 6) + 'deg) rotateY(' + (x * 6) + 'deg) translateY(-3px)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });

    $$('.magnetic').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * .18) + 'px,' + ((e.clientY - r.top - r.height / 2) * .3) + 'px)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
  }

  /* ---------- Herramientas: tooltip ---------- */
  var tip = $('#toolTip');
  $$('.tools li').forEach(function (li) {
    function show() {
      $$('.tools li').forEach(function (o) { o.classList.toggle('is-on', o === li); });
      tip.textContent = '> ' + li.dataset.tip;
    }
    li.addEventListener('mouseenter', show);
    li.addEventListener('focus', show);
    li.addEventListener('click', show);
  });

  /* ---------- Contadores ---------- */
  function countUp(el) {
    var end = +el.dataset.count;
    if (reduce) { el.textContent = end; return; }
    var t0 = null, dur = 1100;
    requestAnimationFrame(function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    });
  }

  /* ---------- Duración de cada puesto + Gantt ---------- */
  function toMonths(s) { var p = s.split('-'); return (+p[0]) * 12 + (+p[1] - 1); }
  function durText(m) {
    var y = Math.floor(m / 12), mm = m % 12, out = [];
    if (y) out.push(y + (y === 1 ? ' año' : ' años'));
    if (mm) out.push(mm + (mm === 1 ? ' mes' : ' meses'));
    return out.join(' y ');
  }
  var items = $$('.tl[data-start]');
  var rows = $('#gantt'), axis = $('#ganttAxis');
  var minY = 2013, maxY = 2027, min = minY * 12, span = maxY * 12 - min;
  items.forEach(function (el, i) {
    var a = toMonths(el.dataset.start), b = toMonths(el.dataset.end);
    $('.tl__dur', el).textContent = durText(b - a);
    el.id = el.id || 'puesto-' + i;
    var row = document.createElement('div');
    row.className = 'gantt__row';
    row.dataset.sector = el.dataset.sector;
    row.innerHTML = '<span class="gantt__name"></span><span class="gantt__lane"><button type="button" class="gantt__bar"></button></span>';
    $('.gantt__name', row).textContent = el.dataset.short;
    var bar = $('.gantt__bar', row);
    bar.style.left = ((a - min) / span * 100) + '%';
    bar.style.width = (Math.max(b - a, 1) / span * 100) + '%';
    bar.style.setProperty('--c', 'var(--c-' + el.dataset.sector + ')');
    bar.style.transitionDelay = (i * 90) + 'ms';
    bar.setAttribute('aria-label', 'Ir a ' + $('h3', el).textContent + ', ' + $('.tl__org', el).textContent);
    bar.title = el.dataset.short + ' · ' + durText(b - a);
    bar.addEventListener('click', function () {
      el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
      el.classList.remove('is-flash'); void el.offsetWidth; el.classList.add('is-flash');
    });
    rows.appendChild(row);
  });
  for (var y = minY; y <= maxY; y += 2) {
    var t = document.createElement('span');
    t.textContent = y;
    t.style.left = ((y * 12 - min) / span * 100) + '%';
    axis.appendChild(t);
  }

  /* ---------- Segmentadores (filtro por sector) ---------- */
  var countEl = $('#slicerCount');
  function applySlicer(sector) {
    var n = 0, months = 0;
    $$('.slicer').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.sector === sector)); });
    items.forEach(function (el) {
      var on = sector === 'todo' || el.dataset.sector === sector;
      el.classList.toggle('is-hidden', !on);
      if (on) { n++; months += toMonths(el.dataset.end) - toMonths(el.dataset.start); }
    });
    $$('.gantt__row').forEach(function (r) { r.classList.toggle('is-dim', !(sector === 'todo' || r.dataset.sector === sector)); });
    countEl.textContent = n + (n === 1 ? ' puesto' : ' puestos') + ' · ' + durText(months);
  }
  $$('.slicer').forEach(function (b) { b.addEventListener('click', function () { applySlicer(b.dataset.sector); }); });
  applySlicer('todo');

  /* ---------- Gráfico del proyecto: ordenar ---------- */
  var barsList = $('#bars');
  var original = $$('li', barsList);
  $$('.seg button').forEach(function (b) {
    b.addEventListener('click', function () {
      $$('.seg button').forEach(function (o) { o.setAttribute('aria-pressed', String(o === b)); });
      var list = original.slice();
      if (b.dataset.sort === 'desc') list.sort(function (x, y) { return y.dataset.v - x.dataset.v; });
      var first = list.map(function (li) { return li.getBoundingClientRect().top; });
      var before = {};
      original.forEach(function (li) { before[li.dataset.v] = li.getBoundingClientRect().top; });
      list.forEach(function (li) { barsList.appendChild(li); });
      if (!reduce) list.forEach(function (li) {
        var d = before[li.dataset.v] - li.getBoundingClientRect().top;
        li.animate([{ transform: 'translateY(' + d + 'px)' }, { transform: 'none' }], { duration: 450, easing: 'cubic-bezier(.2,.8,.2,1)' });
      });
    });
  });

  /* ---------- Aparición al hacer scroll ---------- */
  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-visible');
        $$('[data-count]', e.target).forEach(countUp);
        io.unobserve(e.target);
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el, i) {
      if (el.closest('.bento')) el.style.transitionDelay = (i * 70) + 'ms';
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Menú: sección activa ---------- */
  var links = $$('.nav a');
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) {
          var on = a.getAttribute('href') === '#' + e.target.id;
          a.classList.toggle('is-active', on);
          if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main section[id]').forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Consola SQL ---------- */
  var QUERIES = {
    experiencia: {
      sql: "SELECT puesto, empresa, inicio, fin\nFROM experiencia\nORDER BY inicio DESC\nLIMIT 4;",
      cols: ['puesto', 'empresa', 'inicio', 'fin'],
      rows: [
        ['Prácticas Financiación y Admin.', 'Banco Santander', '2025-10', '2026-03'],
        ['Data & Operations Analyst', 'S.I.H', '2024-10', '2025-10'],
        ['Resp. Compras y Almacenes', 'Party Lux', '2019-10', '2024-04'],
        ['Subgerente de Agencia', 'Banco Ficohsa', '2019-01', '2019-10']
      ]
    },
    competencias: {
      sql: "SELECT area, herramientas\nFROM competencias\nWHERE area IN ('BI', 'SQL', 'Python', 'Excel');",
      cols: ['area', 'herramientas'],
      rows: [
        ['BI', 'Power BI, DAX, Power Query, modelo en estrella'],
        ['SQL', 'Oracle SQL, SQLite, JOINs, agregaciones, PL/SQL básico'],
        ['Python', 'pandas, NumPy, Matplotlib, Seaborn, Jupyter'],
        ['Excel', 'Tablas dinámicas, fórmulas avanzadas, informes']
      ]
    },
    proyecto: {
      sql: "SELECT factor, efecto_ventas\nFROM ventas_ecuador_resumen\nORDER BY efecto_ventas DESC;",
      cols: ['factor', 'efecto_ventas'],
      rows: [
        ['Navidad (feriado)', '+35 %'],
        ['Diciembre (estacionalidad)', '+30 %'],
        ['Promociones', '+24 %'],
        ['Precio del petróleo', 'correlación espuria (descartada)']
      ]
    },
    idiomas: {
      sql: "SELECT idioma, nivel, estado\nFROM idiomas;",
      cols: ['idioma', 'nivel', 'estado'],
      rows: [
        ['Español', 'Nativo', '—'],
        ['Inglés', 'B1', 'en curso · English Connection']
      ]
    }
  };
  var codeEl = $('#sqlCode'), outEl = $('#sqlOut'), tabs = $$('.sql__tab'), typing = null, current = 'experiencia';

  function esc(s) { return s.replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function highlight(s) {
    return esc(s)
      .replace(/'[^']*'/g, function (m) { return '<span class="s">' + m + '</span>'; })
      .replace(/\b(SELECT|FROM|WHERE|IN|ORDER BY|DESC|LIMIT)\b/g, '<span class="k">$1</span>')
      .replace(/\b(\d+);/g, '<span class="n">$1</span>;');
  }
  function renderTable(q) {
    var t = document.createElement('table');
    t.innerHTML = '<caption class="sr">Resultado de la consulta</caption><thead><tr>' +
      q.cols.map(function (c) { return '<th scope="col">' + esc(c) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      q.rows.map(function (r) { return '<tr>' + r.map(function (v) { return '<td>' + esc(v) + '</td>'; }).join('') + '</tr>'; }).join('') +
      '</tbody>';
    outEl.innerHTML = '';
    outEl.appendChild(t);
    $$('tbody tr', t).forEach(function (tr, i) { tr.style.transitionDelay = (i * 70) + 'ms'; });
    var meta = document.createElement('p');
    meta.className = 'sql__meta';
    meta.textContent = q.rows.length + (q.rows.length === 1 ? ' fila' : ' filas') + ' · consulta ejecutada';
    outEl.appendChild(meta);
    requestAnimationFrame(function () { requestAnimationFrame(function () { outEl.classList.add('is-ready'); }); });
  }
  function run(name) {
    var q = QUERIES[name];
    if (!q) return;
    current = name;
    tabs.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.q === name)); });
    clearInterval(typing);
    outEl.classList.remove('is-ready');
    outEl.innerHTML = '';
    if (reduce) { codeEl.innerHTML = highlight(q.sql); renderTable(q); return; }
    var i = 0;
    typing = setInterval(function () {
      i += 2;
      codeEl.innerHTML = highlight(q.sql.slice(0, i));
      if (i >= q.sql.length) { clearInterval(typing); setTimeout(function () { renderTable(q); }, 200); }
    }, 20);
  }
  tabs.forEach(function (b) { b.addEventListener('click', function () { run(b.dataset.q); }); });
  $('#sqlRun').addEventListener('click', function () { run(current); });
  $('#sqlCopy').addEventListener('click', function () {
    var txt = QUERIES[current].sql;
    if (navigator.clipboard) navigator.clipboard.writeText(txt).then(function () { toast('Consulta copiada'); }, function () { toast('No se pudo copiar'); });
  });
  var sqlTile = $('.tile--sql');
  if ('IntersectionObserver' in window) {
    var once = new IntersectionObserver(function (en) {
      if (en[0].isIntersecting) { run('experiencia'); once.disconnect(); }
    }, { threshold: 0.3 });
    once.observe(sqlTile);
  } else { run('experiencia'); }

  /* ---------- Paleta de comandos (Ctrl + K) ---------- */
  var dlg = $('#cmd'), input = $('#cmdInput'), list = $('#cmdList'), sel = 0, shown = [];
  function go(id) { return function () { var el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); }; }
  function open(url) { return function () { window.open(url, '_blank', 'noopener'); }; }
  var ACTIONS = [
    { t: 'Ir a Proyectos', k: 'proyecto ecuador ventas', i: 'i-chart', f: go('proyectos') },
    { t: 'Ir a Stack técnico', k: 'stack herramientas sql power bi python excel', i: 'i-code', f: go('stack') },
    { t: 'Ir a Experiencia', k: 'experiencia trabajo santander banco', i: 'i-target', f: go('experiencia') },
    { t: 'Ir a Formación e idiomas', k: 'formacion estudios ingles idiomas', i: 'i-cap', f: go('formacion') },
    { t: 'Ir a Contacto', k: 'contacto hablar', i: 'i-chat', f: go('contacto') },
    { t: 'Ejecutar consulta SQL', k: 'sql consola query', i: 'i-db', f: function () { go('inicio')(); setTimeout(function () { sqlTile.scrollIntoView({ behavior: 'smooth', block: 'center' }); run(current); }, 50); } },
    { t: 'Descargar CV en PDF', k: 'cv pdf curriculum descargar', i: 'i-down', f: function () { var a = document.createElement('a'); a.href = 'cv/CV_Edgar_Cabrera_ES.pdf'; a.download = ''; document.body.appendChild(a); a.click(); a.remove(); } },
    { t: 'Abrir LinkedIn', k: 'linkedin perfil contacto', i: 'i-in', f: open('https://www.linkedin.com/in/edgar-fabian-cabrera-bardales-305a50143') },
    { t: 'Abrir GitHub', k: 'github repositorios codigo', i: 'i-gh', f: open('https://github.com/Fabianbrd') },
    { t: 'Cambiar tema claro / oscuro', k: 'tema modo oscuro claro dark light', i: 'i-moon', f: toggleTheme }
  ];
  function norm(s) { return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  function draw() {
    var q = norm(input.value.trim());
    shown = ACTIONS.filter(function (a) { return !q || norm(a.t + ' ' + a.k).indexOf(q) > -1; });
    if (sel >= shown.length) sel = 0;
    list.innerHTML = '';
    if (!shown.length) { list.innerHTML = '<li class="cmd__empty">Sin resultados</li>'; return; }
    shown.forEach(function (a, i) {
      var li = document.createElement('li');
      li.className = 'cmd__item'; li.id = 'cmd-' + i;
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', String(i === sel));
      li.innerHTML = '<svg class="ico" aria-hidden="true"><use href="#' + a.i + '"/></svg><span></span>' + (i === sel ? '<small>Enter ↵</small>' : '');
      $('span', li).textContent = a.t;
      li.addEventListener('mousemove', function () { if (sel !== i) { sel = i; draw(); } });
      li.addEventListener('click', function () { exec(a); });
      list.appendChild(li);
    });
    input.setAttribute('aria-activedescendant', 'cmd-' + sel);
  }
  function exec(a) { dlg.close(); a.f(); }
  function openCmd() {
    if (dlg.open) return;
    input.value = ''; sel = 0; draw();
    dlg.showModal(); input.focus();
  }
  $('#cmdBtn').addEventListener('click', openCmd);
  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); dlg.open ? dlg.close() : openCmd(); }
  });
  input.addEventListener('input', function () { sel = 0; draw(); });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); sel = (sel + 1) % Math.max(shown.length, 1); draw(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); sel = (sel - 1 + shown.length) % Math.max(shown.length, 1); draw(); }
    else if (e.key === 'Enter') { e.preventDefault(); if (shown[sel]) exec(shown[sel]); }
  });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });

  /* ---------- Repos públicos de GitHub ---------- */
  var USER = 'Fabianbrd', FEATURED = 'analisis-ventas-supermercado-ecuador';
  var wrap = $('#repos'), grid = $('#repoGrid');
  if (window.fetch) {
    fetch('https://api.github.com/users/' + USER + '/repos?sort=updated&per_page=30')
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (repos) {
        var lu = USER.toLowerCase();
        var items = repos.filter(function (r) {
          var n = r.name.toLowerCase();
          return !r.fork && !r.archived && n !== FEATURED && n !== lu && n !== lu + '.github.io';
        }).slice(0, 6);
        if (!items.length) return;
        items.forEach(function (r) {
          var li = document.createElement('li');
          var a = document.createElement('a');
          a.className = 'card repo spot';
          a.href = r.html_url; a.target = '_blank'; a.rel = 'noopener';
          a.innerHTML = '<span class="repo__name"><svg class="ico" aria-hidden="true"><use href="#i-gh"/></svg><span></span></span><span class="repo__desc"></span><span class="repo__meta"></span>';
          $('.repo__name span', a).textContent = r.name;
          $('.repo__desc', a).textContent = r.description || 'Repositorio público en GitHub.';
          var upd = new Date(r.pushed_at).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
          $('.repo__meta', a).textContent = (r.language ? r.language + ' · ' : '') + 'actualizado ' + upd;
          li.appendChild(a);
          grid.appendChild(li);
        });
        wrap.hidden = false;
      })
      .catch(function () {});
  }
})();
