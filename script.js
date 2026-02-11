/* ==========================================================================
   KHair — Script
   Vanilla JS for: sticky nav, mobile menu, FAQ accordion, scroll spy,
   contact form, reveal-on-scroll.
   ========================================================================== */

(function () {
  'use strict';

  /* ---------- DOM References ---------- */
  const header        = document.getElementById('site-header');
  const hamburgerBtn  = document.getElementById('hamburger-btn');
  const mobileMenu    = document.getElementById('mobile-menu');
  const navLinks      = document.querySelectorAll('.site-nav__link');
  const mobileLinks   = document.querySelectorAll('.mobile-menu__link');
  const accordionBtns = document.querySelectorAll('.accordion__trigger');
  const contactForm   = document.getElementById('contact-form');
  const toast         = document.getElementById('toast');
  const sections      = document.querySelectorAll('section[id]');

  /* ======================== STICKY NAV SCROLL EFFECT ======================== */
  function handleHeaderScroll() {
    if (window.scrollY > 10) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', handleHeaderScroll, { passive: true });

  /* ======================== MOBILE MENU ======================== */
  let focusableElements = [];
  let firstFocusable    = null;
  let lastFocusable     = null;

  function openMobileMenu() {
    mobileMenu.hidden = false;
    // Allow reflow before adding class for animation
    requestAnimationFrame(function () {
      mobileMenu.classList.add('is-open');
    });
    hamburgerBtn.setAttribute('aria-expanded', 'true');
    hamburgerBtn.setAttribute('aria-label', 'Chiudi menu di navigazione');
    document.body.style.overflow = 'hidden';

    // Focus trap setup
    focusableElements = mobileMenu.querySelectorAll(
      'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );
    if (focusableElements.length) {
      firstFocusable = focusableElements[0];
      lastFocusable  = focusableElements[focusableElements.length - 1];
      firstFocusable.focus();
    }

    document.addEventListener('keydown', trapFocus);
  }

  function closeMobileMenu() {
    mobileMenu.classList.remove('is-open');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    hamburgerBtn.setAttribute('aria-label', 'Apri menu di navigazione');
    document.body.style.overflow = '';
    document.removeEventListener('keydown', trapFocus);
    hamburgerBtn.focus();

    // Wait for transition to finish before hiding
    setTimeout(function () {
      if (!mobileMenu.classList.contains('is-open')) {
        mobileMenu.hidden = true;
      }
    }, 350);
  }

  function trapFocus(e) {
    if (e.key === 'Escape') {
      closeMobileMenu();
      return;
    }
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      }
    }
  }

  hamburgerBtn.addEventListener('click', function () {
    var isOpen = hamburgerBtn.getAttribute('aria-expanded') === 'true';
    if (isOpen) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });

  // Close mobile menu when a link is clicked
  mobileLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      closeMobileMenu();
    });
  });

  /* ======================== SCROLL SPY ======================== */
  function updateActiveNav() {
    var scrollPos = window.scrollY + 150;

    sections.forEach(function (section) {
      var top    = section.offsetTop;
      var height = section.offsetHeight;
      var id     = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(function (link) {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + id) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });

  /* ======================== FAQ ACCORDION ======================== */
  accordionBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      var panelId  = btn.getAttribute('aria-controls');
      var panel    = document.getElementById(panelId);

      // Close all other panels
      accordionBtns.forEach(function (otherBtn) {
        if (otherBtn !== btn) {
          otherBtn.setAttribute('aria-expanded', 'false');
          var otherPanelId = otherBtn.getAttribute('aria-controls');
          var otherPanel   = document.getElementById(otherPanelId);
          otherPanel.hidden = true;
        }
      });

      // Toggle current panel
      if (expanded) {
        btn.setAttribute('aria-expanded', 'false');
        panel.hidden = true;
      } else {
        btn.setAttribute('aria-expanded', 'true');
        panel.hidden = false;
      }
    });
  });

  /* ======================== CONTACT FORM ======================== */
  function validateField(input) {
    var name     = input.name;
    var value    = input.value.trim();
    var errorEl  = document.getElementById('error-' + name);

    if (!value) {
      input.classList.add('invalid');
      if (errorEl) errorEl.textContent = 'Questo campo è obbligatorio.';
      return false;
    }

    if (name === 'email') {
      var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        input.classList.add('invalid');
        if (errorEl) errorEl.textContent = 'Inserisci un indirizzo email valido.';
        return false;
      }
    }

    input.classList.remove('invalid');
    if (errorEl) errorEl.textContent = '';
    return true;
  }

  if (contactForm) {
    // Real-time validation on blur
    var inputs = contactForm.querySelectorAll('input, textarea');
    inputs.forEach(function (input) {
      input.addEventListener('blur', function () {
        validateField(input);
      });
    });

    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var allValid = true;
      inputs.forEach(function (input) {
        if (!validateField(input)) {
          allValid = false;
        }
      });

      if (!allValid) return;

      // Show success toast
      showToast();

      // Reset form
      contactForm.reset();
      inputs.forEach(function (input) {
        input.classList.remove('invalid');
      });
    });
  }

  function showToast() {
    if (!toast) return;
    toast.hidden = false;
    requestAnimationFrame(function () {
      toast.classList.add('is-visible');
    });

    setTimeout(function () {
      toast.classList.remove('is-visible');
      setTimeout(function () {
        toast.hidden = true;
      }, 500);
    }, 4000);
  }

  /* ======================== REVEAL ON SCROLL ======================== */
  if ('IntersectionObserver' in window) {
    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
      var revealObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
      );

      document.querySelectorAll('.reveal').forEach(function (el) {
        revealObserver.observe(el);
      });
    } else {
      // If reduced motion, make everything visible immediately
      document.querySelectorAll('.reveal').forEach(function (el) {
        el.classList.add('is-visible');
      });
    }
  } else {
    // Fallback: show everything
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

})();
