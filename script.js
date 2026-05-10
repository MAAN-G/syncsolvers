/* =========================================================
   SyncSolvers — Vanilla JS
   Handles: nav scroll state, mobile menu, smooth scrolling,
   scroll reveal animations, contact form, back-to-top, year.
   ========================================================= */

(function () {
  'use strict';

  // ---------- Cache DOM ----------
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  const toTop = document.getElementById('toTop');
  const form = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');
  const yearEl = document.getElementById('year');

  // ---------- Set current year in footer ----------
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---------- Page loader (hides initial flicker / FOUC) ----------
  const pageLoader = document.getElementById('pageLoader');
  const revealPage = () => {
    document.body.classList.add('is-ready');
    if (pageLoader) {
      pageLoader.classList.add('hidden');
      setTimeout(() => pageLoader.remove(), 500);
    }
  };
  if (document.readyState === 'complete') {
    setTimeout(revealPage, 250);
  } else {
    window.addEventListener('load', () => setTimeout(revealPage, 250));
  }
  // Hard fallback so the page can't get stuck behind the loader
  setTimeout(revealPage, 2500);

  // ---------- Navbar scroll state + back-to-top ----------
  // Subpages (those with a .page-hero) keep the navbar in its "scrolled"
  // styled state at all times to avoid a flicker on page load.
  const isSubpage = !!document.querySelector('.page-hero');
  const onScroll = () => {
    const y = window.scrollY;
    if (navbar) navbar.classList.toggle('scrolled', isSubpage || y > 20);
    if (toTop) toTop.classList.toggle('visible', y > 500);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------- Mobile menu toggle ----------
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      hamburger.classList.toggle('active', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });

    // Close menu when a link is clicked
    navLinks.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        navLinks.classList.remove('open');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ---------- Scroll reveal using IntersectionObserver ----------
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            // Slight stagger for grouped items
            setTimeout(() => entry.target.classList.add('visible'), i * 60);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -50px 0px' }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    // Fallback: show all
    revealEls.forEach((el) => el.classList.add('visible'));
  }

  // ---------- Portfolio filter tabs ----------
  const filterTabs = document.querySelectorAll('.filter-tab');
  const projectGrid = document.getElementById('projectGrid');
  const emptyState = document.getElementById('emptyState');

  if (filterTabs.length && projectGrid) {
    const cards = projectGrid.querySelectorAll('.project-card');

    filterTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const filter = tab.dataset.filter;

        // Toggle active tab state
        filterTabs.forEach((t) => {
          t.classList.toggle('active', t === tab);
          t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
        });

        // Filter cards
        let visibleCount = 0;
        cards.forEach((card) => {
          const matches = filter === 'all' || card.dataset.category === filter;
          card.classList.toggle('hide', !matches);
          if (matches) visibleCount++;
        });

        // Toggle empty state
        if (emptyState) emptyState.hidden = visibleCount > 0;
      });
    });
  }

  // ---------- Contact form (client-side UX only) ----------
  if (form) {
    // Prevent Enter key from submitting the form on input fields.
    // Allow new lines inside the textarea.
    form.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
      }
    });

    // Always block native form submission — only the button click triggers send.
    form.addEventListener('submit', (e) => e.preventDefault());

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name = (data.get('name') || '').toString().trim();
      const email = (data.get('email') || '').toString().trim();
      const subject = (data.get('subject') || '').toString().trim();
      const message = (data.get('message') || '').toString().trim();
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      formStatus.classList.remove('success', 'error');

      if (!name || !emailOk || !message) {
        formStatus.textContent = 'Please fill in your name, a valid email, and a message.';
        formStatus.classList.add('error');
        return;
      }

      // Compose email and open the user's default mail client
      const recipient = 'syncsolvers@gmail.com';
      const mailSubject = subject || `New inquiry from ${name}`;
      const mailBody =
        `Name: ${name}\n` +
        `Email: ${email}\n` +
        (subject ? `Subject: ${subject}\n` : '') +
        `\nMessage:\n${message}`;

      const mailto =
        `mailto:${recipient}` +
        `?subject=${encodeURIComponent(mailSubject)}` +
        `&body=${encodeURIComponent(mailBody)}`;

      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Opening mail…';

      // Trigger the user's mail client
      window.location.href = mailto;

      setTimeout(() => {
        btn.disabled = false;
        btn.textContent = originalText;
        formStatus.textContent = 'Your email client should now be open. If not, email us at syncsolvers@gmail.com.';
        formStatus.classList.add('success');
      }, 600);
    });
  }
})();
