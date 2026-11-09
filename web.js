// contratitular.es — sonido del vídeo de portada y ejemplos (bucles que solo se reproducen a la vista; al pulsar,
// el vídeo completo con sonido). Respeta «reducir movimiento».
(function () {
  'use strict';
  var quieto = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Portada: activar o silenciar el sonido
  var v = document.getElementById('portada-video'), b = document.getElementById('portada-sonido');
  if (v && b) {
    if (quieto) { v.removeAttribute('autoplay'); v.pause(); }
    b.addEventListener('click', function () {
      v.muted = !v.muted;
      if (!v.muted) { v.currentTime = 0; v.play(); }
      var ondas = b.querySelector('.ondas');
      if (ondas) ondas.setAttribute('d', v.muted ? 'M23 9l-6 6M17 9l6 6' : 'M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14');
      b.setAttribute('aria-label', v.muted ? b.dataset.off : b.dataset.on);
      if (!v.muted && window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: 'sonido-portada', title: 'Activa el sonido de la portada', event: true });
    });
  }

  // Ejemplos: los bucles se reproducen solo cuando se ven
  var clips = Array.prototype.slice.call(document.querySelectorAll('.clip'));
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
  // Al pulsar: el vídeo completo, con sonido y controles (y se paran los demás)
  clips.forEach(function (c) {
    var btn = c.querySelector('.clip-play');
    if (!btn) return;
    btn.addEventListener('click', function () {
      clips.forEach(function (o) { var ov = o.querySelector('video'); if (o !== c && o.classList.contains('reproduciendo')) { ov.pause(); } });
      var vid = c.querySelector('video');
      c.classList.add('reproduciendo');
      vid.src = c.getAttribute('data-completo');
      vid.loop = false; vid.muted = false; vid.controls = true;
      vid.play().catch(function () {});
      if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: 'ejemplo-' + (c.getAttribute('data-completo') || '').split('/').pop(), title: 'Ve un ejemplo completo', event: true });
    });
  });
})();
