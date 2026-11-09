// contratitular.es — sonido de la portada, petición que se escribe sola, pestañas de casos de uso, ejemplos (bucles que
// solo se reproducen a la vista; al pulsar, el vídeo completo con sonido) y aparición al hacer scroll.
// Respeta «reducir movimiento».
(function () {
  'use strict';
  var quieto = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cuenta = function (path, title) { if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: path, title: title, event: true }); };

  // Portada: activar o silenciar el sonido
  var v = document.getElementById('portada-video'), b = document.getElementById('portada-sonido');
  if (v && b) {
    if (quieto) { v.removeAttribute('autoplay'); v.pause(); }
    b.addEventListener('click', function () {
      v.muted = !v.muted;
      if (!v.muted) { v.currentTime = 0; v.play(); pararClips(); cuenta('sonido-portada', 'Activa el sonido de la portada'); }
      var ondas = b.querySelector('.ondas');
      if (ondas) ondas.setAttribute('d', v.muted ? 'M23 9l-6 6M17 9l6 6' : 'M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14');
      b.setAttribute('aria-label', v.muted ? b.dataset.off : b.dataset.on);
    });
  }

  // Petición de ejemplo que se escribe y se borra sola
  var p = document.getElementById('peticion');
  if (p && !quieto) {
    var frases = []; try { frases = JSON.parse(p.dataset.frases); } catch (e) {}
    var f = 0, c = frases.length ? frases[0].length : 0, borrando = true;
    var paso = function () {
      var fr = frases[f];
      if (borrando) {
        c -= 2; p.textContent = fr.slice(0, Math.max(c, 0));
        if (c <= 0) { borrando = false; f = (f + 1) % frases.length; c = 0; return setTimeout(paso, 350); }
        return setTimeout(paso, 18);
      }
      c += 1; p.textContent = frases[f].slice(0, c);
      if (c >= frases[f].length) { borrando = true; return setTimeout(paso, 2600); }
      setTimeout(paso, 34);
    };
    if (frases.length > 1) setTimeout(paso, 2600);
  }

  // Pestañas de casos de uso (teclado: flechas, Inicio, Fin)
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.pestana'));
  var elegir = function (t, foco) {
    tabs.forEach(function (o) {
      var sel = o === t;
      o.setAttribute('aria-selected', sel); o.tabIndex = sel ? 0 : -1;
      document.getElementById(o.getAttribute('aria-controls')).hidden = !sel;
    });
    if (foco) t.focus();
  };
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { elegir(t); cuenta('uso-' + i, 'Caso de uso: ' + t.textContent.trim()); });
    t.addEventListener('keydown', function (e) {
      var n = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
      if (n === undefined) return;
      e.preventDefault(); elegir(tabs[(n + tabs.length) % tabs.length], true);
    });
  });

  // Ejemplos: los bucles se reproducen solo cuando se ven
  var clips = Array.prototype.slice.call(document.querySelectorAll('.clip'));
  function pararClips(salvo) { clips.forEach(function (o) { if (o !== salvo && o.classList.contains('reproduciendo')) o.querySelector('video').pause(); }); }
  if ('IntersectionObserver' in window && !quieto) {
    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        var vid = e.target.querySelector('video');
        if (e.target.classList.contains('reproduciendo')) return;
        if (e.isIntersecting) { vid.play().catch(function () {}); } else { vid.pause(); }
      });
    }, { threshold: 0.4 });
    clips.forEach(function (c) { io.observe(c); });
  }
  // Al pulsar: el vídeo completo, con sonido y controles (y se paran los demás y la portada)
  clips.forEach(function (c) {
    var btn = c.querySelector('.clip-play');
    if (!btn) return;
    btn.addEventListener('click', function () {
      pararClips(c);
      if (v && b && !v.muted) b.click();
      var vid = c.querySelector('video');
      c.classList.add('reproduciendo');
      vid.src = c.getAttribute('data-completo');
      vid.loop = false; vid.muted = false; vid.controls = true;
      vid.play().catch(function () {});
      cuenta('ejemplo-' + (c.getAttribute('data-completo') || '').split('/').pop(), 'Ve un ejemplo completo');
    });
  });

  // Aparición suave al hacer scroll
  var aparecen = document.querySelectorAll('.aparece');
  if ('IntersectionObserver' in window && !quieto) {
    var io2 = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('ve'); io2.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    aparecen.forEach(function (el) { io2.observe(el); });
  } else { aparecen.forEach(function (el) { el.classList.add('ve'); }); }
})();
