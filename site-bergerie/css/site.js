/* =========================================================
   La Bergerie de la Sille — script commun
   Aucune dépendance externe. Aucun appel réseau tiers.
   ========================================================= */
(function () {
  'use strict';

  /* ---------- En-tête figée au défilement ---------- */
  var entete = document.querySelector('.entete');
  function majEntete() {
    if (!entete) return;
    entete.classList.toggle('figee', window.scrollY > 20);
  }
  window.addEventListener('scroll', majEntete, { passive: true });
  majEntete();

  /* ---------- Menu mobile ---------- */
  var burger = document.querySelector('.burger');
  var nav = document.querySelector('.nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var ouvert = nav.classList.toggle('ouvert');
      burger.classList.toggle('ouvert', ouvert);
      burger.setAttribute('aria-expanded', ouvert ? 'true' : 'false');
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('ouvert');
        burger.classList.remove('ouvert');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Apparition au défilement ---------- */
  var cibles = document.querySelectorAll('.reveal');
  if (cibles.length) {
    if ('IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function (entrees) {
        entrees.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add('vu');
            obs.unobserve(e.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
      cibles.forEach(function (c) { obs.observe(c); });
    } else {
      cibles.forEach(function (c) { c.classList.add('vu'); });
    }
  }

  /* ---------- Bandeau cookies (RGPD, consentement préalable) ---------- */
  var bandeau = document.querySelector('.cookies');
  if (bandeau) {
    var CLE = 'bds-cookies';
    var choix = null;
    try { choix = localStorage.getItem(CLE); } catch (e) { /* mode privé */ }

    if (!choix) {
      setTimeout(function () { bandeau.classList.add('visible'); }, 900);
    } else if (choix === 'ok') {
      chargerMesure();
    }

    bandeau.querySelectorAll('[data-cookies]').forEach(function (b) {
      b.addEventListener('click', function () {
        var v = b.getAttribute('data-cookies');
        try { localStorage.setItem(CLE, v); } catch (e) { /* ignore */ }
        bandeau.classList.remove('visible');
        if (v === 'ok') chargerMesure();
      });
    });
  }

  /* Placeholder : aucune mesure d'audience n'est chargée aujourd'hui.
     Si un jour tu ajoutes une statistique, mets-la ICI — elle ne se
     déclenchera qu'après consentement explicite. */
  function chargerMesure() { /* volontairement vide */ }

  /* ---------- Carte : chargement uniquement au clic ---------- */
  document.querySelectorAll('[data-carte]').forEach(function (zone) {
    zone.addEventListener('click', function () {
      var src = zone.getAttribute('data-carte');
      if (!src) return;
      var f = document.createElement('iframe');
      f.src = src;
      f.width = '100%';
      f.height = '420';
      f.style.border = '0';
      f.loading = 'lazy';
      f.referrerPolicy = 'no-referrer-when-downgrade';
      f.title = 'Carte de localisation';
      zone.innerHTML = '';
      zone.appendChild(f);
      zone.style.cursor = 'default';
    });
  });

  /* ---------- Visionneuse d'images ---------- */
  var lb = document.querySelector('.lb');
  if (lb) {
    var lbImg = lb.querySelector('img');
    var lbLeg = lb.querySelector('.lb-legende');
    var serie = [];
    var idx = 0;

    function afficher() {
      if (!serie.length) return;
      lbImg.src = serie[idx].src;
      lbImg.alt = serie[idx].alt || '';
      if (lbLeg) lbLeg.textContent = (serie[idx].alt || '') + '  ·  ' + (idx + 1) + ' / ' + serie.length;
    }
    function ouvrir(liste, depart) {
      serie = liste; idx = depart;
      afficher();
      lb.classList.add('on');
      document.body.style.overflow = 'hidden';
    }
    function fermer() {
      lb.classList.remove('on');
      document.body.style.overflow = '';
      lbImg.src = '';
    }
    function deplacer(n) {
      if (!serie.length) return;
      idx = (idx + n + serie.length) % serie.length;
      afficher();
    }

    document.querySelectorAll('.galerie').forEach(function (g) {
      var imgs = Array.prototype.slice.call(g.querySelectorAll('img'));
      imgs.forEach(function (im, i) {
        im.parentElement.addEventListener('click', function () {
          ouvrir(imgs.map(function (x) {
            return { src: x.getAttribute('data-grand') || x.src, alt: x.alt };
          }), i);
        });
      });
    });

    lb.querySelector('.lb-fermer').addEventListener('click', fermer);
    lb.querySelector('.lb-prec').addEventListener('click', function (e) { e.stopPropagation(); deplacer(-1); });
    lb.querySelector('.lb-suiv').addEventListener('click', function (e) { e.stopPropagation(); deplacer(1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) fermer(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('on')) return;
      if (e.key === 'Escape') fermer();
      if (e.key === 'ArrowLeft') deplacer(-1);
      if (e.key === 'ArrowRight') deplacer(1);
    });
  }

  /* ---------- Année automatique dans le pied de page ---------- */
  document.querySelectorAll('[data-annee]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
