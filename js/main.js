/* ============================================================
   main.js — Init, IntersectionObserver, scroll behavior,
   marquee generation, CountUp, navbar, mobile nav, segments.
   ============================================================ */

(function () {
  'use strict';

  // ── Navbar scroll effect ─────────────────────────
  var navbar = document.getElementById('navbar');
  window.addEventListener('scroll', function () {
    if (window.scrollY > 80) {
      navbar.classList.add('navbar--scrolled');
    } else {
      navbar.classList.remove('navbar--scrolled');
    }
  });

  // ── Mobile nav toggle ────────────────────────────
  var hamburger = document.getElementById('navHamburger');
  var mobileNav = document.getElementById('mobileNav');

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', function () {
      hamburger.classList.toggle('navbar__hamburger--active');
      mobileNav.classList.toggle('mobile-nav--open');
      document.body.style.overflow = mobileNav.classList.contains('mobile-nav--open') ? 'hidden' : '';
    });
    // Close on link click
    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        hamburger.classList.remove('navbar__hamburger--active');
        mobileNav.classList.remove('mobile-nav--open');
        document.body.style.overflow = '';
      });
    });
  }

  // ── Smooth scroll for anchor links ───────────────
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ── IntersectionObserver for scroll reveals ──────
  var animEls = document.querySelectorAll('.anim-hidden');
  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('anim-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    animEls.forEach(function (el) { obs.observe(el); });
  } else {
    animEls.forEach(function (el) { el.classList.add('anim-visible'); });
  }

  // ── CountUp for About stats ──────────────────────
  var statEls = document.querySelectorAll('[data-count]');
  if (statEls.length && 'IntersectionObserver' in window) {
    var countObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var val = parseInt(entry.target.getAttribute('data-count'), 10);
          if (typeof countUp !== 'undefined' && countUp.CountUp) {
            var cu = new countUp.CountUp(entry.target, val, { duration: 2.5, useGrouping: false });
            cu.start();
          } else {
            entry.target.textContent = val;
          }
          countObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    statEls.forEach(function (el) { countObs.observe(el); });
  }

  /* ── Formulaire de contact (Mailto) ─────────────── */
  var contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      
      var data = new FormData(contactForm);
      var nom = data.get('nom') || 'Client';
      var besoin = data.get('besoin') || 'Demande générale';
      var message = data.get('message') || '(Pas de message)';
      
      var subject = 'LAGUA SOLAIRE - ' + besoin + ' (' + nom + ')';
      
      var body = 'DEMANDE DE CONTACT - LAGUA SOLAIRE\n';
      body += '====================================\n\n';
      body += 'NOM : ' + nom + '\n';
      body += 'TYPE : ' + (data.get('type') || '/') + '\n';
      body += 'VILLE : ' + (data.get('ville') || '/') + '\n';
      body += 'TEL : ' + (data.get('telephone') || '/') + '\n';
      body += 'EMAIL : ' + (data.get('email') || '/') + '\n';
      body += 'BESOIN : ' + besoin + '\n\n';
      body += 'MESSAGE :\n' + message + '\n\n';
      body += '------------------------------------\n';
      body += 'Envoyé depuis le site web Lagua Solaire.';

      var mailtoUrl = 'mailto:info@laguasolair.com' +
                      '?subject=' + encodeURIComponent(subject) +
                      '&body=' + encodeURIComponent(body);

      // Ouvrir le client mail
      window.location.href = mailtoUrl;
    });
  }

  // Les segments sont désormais empilés verticalement par défaut (CSS)


  // ── Stagger service cards via delay ──────────────
  document.querySelectorAll('.services__grid .card-service').forEach(function (card, i) {
    card.style.transitionDelay = (i * 80) + 'ms';
  });

  document.querySelectorAll('.why__card').forEach(function (card, i) {
    card.style.transitionDelay = (i * 80) + 'ms';
  });

})();
