document.addEventListener('DOMContentLoaded', () => {

  /* ---------- stagger delay indices ---------- */
  document.querySelectorAll('.stagger').forEach(group => {
    group.querySelectorAll('.reveal').forEach((el, i) => el.style.setProperty('--i', i));
  });

  /* ---------- reveal on scroll ---------- */
  const revealTargets = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealTargets.forEach(el => io.observe(el));
  /* Fallback: если IO не сработал (iframe, preview) — показать через 500ms */
  setTimeout(() => {
    document.querySelectorAll('.reveal:not(.is-visible)').forEach(el => el.classList.add('is-visible'));
  }, 500);

  /* ---------- единое облако пара — появляется, только когда начали листать ---------- */
  const heroSteam = document.getElementById('heroSteam');
  if (heroSteam) {
    window.addEventListener('scroll', () => {
      heroSteam.classList.toggle('is-active', window.scrollY > 12);
    }, { passive: true });
  }

  /* ---------- magnetic buttons ---------- */
  document.querySelectorAll('.btn--magnetic').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.22}px, ${y * 0.32}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0,0)';
    });
  });

  /* ---------- heat gauge — живой градусник (полная термошкала) ---------- */
  const heatGauge = document.getElementById('heatGauge');
  const heatFill = document.getElementById('heatFill');
  const heatBulb = document.getElementById('heatBulb');
  if (heatGauge && heatFill && heatBulb) {
    const thermoStops = [
      [0.00, 62, 168, 224],   // голубой
      [0.33, 37, 69, 184],    // синий
      [0.66, 242, 135, 44],   // оранжевый
      [1.00, 230, 64, 47]     // красный
    ];
    const colorAt = (t) => {
      for (let i = 0; i < thermoStops.length - 1; i++) {
        const a = thermoStops[i], b = thermoStops[i + 1];
        if (t >= a[0] && t <= b[0]) {
          const local = (t - a[0]) / (b[0] - a[0]);
          const r = Math.round(a[1] + (b[1] - a[1]) * local);
          const g = Math.round(a[2] + (b[2] - a[2]) * local);
          const bl = Math.round(a[3] + (b[3] - a[3]) * local);
          return `rgb(${r},${g},${bl})`;
        }
      }
      return `rgb(${thermoStops[thermoStops.length - 1].slice(1).join(',')})`;
    };
    const updateHeatGauge = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      heatFill.style.clipPath = `inset(${(1 - progress) * 100}% 0 0 0)`;
      heatBulb.style.background = colorAt(progress);
      heatGauge.classList.toggle('is-hot', progress > 0.92);
    };
    window.addEventListener('scroll', updateHeatGauge, { passive: true });
    updateHeatGauge();
  }

  /* ---------- густ пара при скролле — "подбавили воды на камни" ---------- */
  if (heroSteam) {
    let lastBurst = 0;
    const spawnBurstCloud = () => {
      const cloud = document.createElement('div');
      cloud.className = 'steam-mass--burst';
      cloud.style.left = (36 + Math.random() * 16) + '%';
      heroSteam.appendChild(cloud);
      setTimeout(() => cloud.remove(), 4200);
    };
    window.addEventListener('scroll', () => {
      if (window.scrollY <= 12 || window.scrollY > window.innerHeight * 1.4) return;
      const now = Date.now();
      if (now - lastBurst < 900) return;
      lastBurst = now;
      spawnBurstCloud();
    }, { passive: true });
  }

  /* ---------- hero bg parallax ---------- */
  const heroBgPhoto = document.querySelector('.hero__bg-photo');
  if (heroBgPhoto) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y < window.innerHeight * 1.5) {
        heroBgPhoto.style.transform = `translateY(${y * 0.28}px)`;
      }
    }, { passive: true });
  }

  /* ---------- scroll-driven marquee ---------- */
  const marqueeTrack = document.getElementById('marqueeTrack');
  if (marqueeTrack) {
    let offset = 0;
    let velocity = 0;
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
      const delta = window.scrollY - lastScrollY;
      lastScrollY = window.scrollY;
      velocity += delta * 0.55;
    }, { passive: true });

    const tickMarquee = () => {
      velocity *= 0.88;
      offset += 0.6 + velocity;
      const half = marqueeTrack.scrollWidth / 2;
      if (offset < 0) offset += half;
      if (offset >= half) offset -= half;
      marqueeTrack.style.transform = `translateX(-${offset}px)`;
      requestAnimationFrame(tickMarquee);
    };
    requestAnimationFrame(tickMarquee);
  }

  /* ---------- sticky header ---------- */
  const header = document.getElementById('header');
  const onScroll = () => {
    header.classList.toggle('header--stuck', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll);
  onScroll();

  /* ---------- side dot navigation ---------- */
  const sideDots = document.getElementById('sideDots');
  if (sideDots) {
    const dotItems = Array.from(sideDots.querySelectorAll('.side-dots__item'));
    const targets = dotItems.map(item => {
      const id = item.dataset.target;
      return { item, section: document.getElementById(id) };
    }).filter(t => t.section);

    targets.forEach(({ item, section }) => {
      item.querySelector('.side-dots__dot').addEventListener('click', () => {
        window.scrollTo({ top: section.offsetTop, behavior: 'smooth' });
      });
    });

    const setActiveDot = () => {
      const scrollPos = window.scrollY + window.innerHeight * 0.35;
      let current = targets[0];
      targets.forEach(t => {
        if (t.section.offsetTop <= scrollPos) current = t;
      });
      targets.forEach(t => t.item.classList.toggle('is-active', t === current));
    };
    window.addEventListener('scroll', setActiveDot);
    setActiveDot();
  }

  /* ---------- burger / mobile nav ---------- */
  const burger = document.getElementById('burger');
  const mobileNav = document.getElementById('mobileNav');
  const overlay = document.getElementById('overlay');

  const closeMobileNav = () => {
    mobileNav.classList.remove('is-open');
    overlay.classList.remove('is-visible');
  };
  burger.addEventListener('click', () => {
    mobileNav.classList.toggle('is-open');
    overlay.classList.toggle('is-visible');
  });
  overlay.addEventListener('click', closeMobileNav);
  mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobileNav));

  /* ---------- count-up numbers ---------- */
  const counters = document.querySelectorAll('.number__value:not(.number__value--placeholder)');
  const countIo = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const duration = 1200;
      const start = performance.now();
      const easeOut = t => 1 - Math.pow(1 - t, 3);

      const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        el.textContent = Math.round(easeOut(progress) * target);
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      countIo.unobserve(el);
    });
  }, { threshold: 0.4 });
  counters.forEach(el => countIo.observe(el));

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.accordion__item').forEach(item => {
    const head = item.querySelector('.accordion__head');
    const body = item.querySelector('.accordion__body');
    head.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');
      document.querySelectorAll('.accordion__item.is-open').forEach(other => {
        if (other !== item) {
          other.classList.remove('is-open');
          other.querySelector('.accordion__body').style.maxHeight = null;
        }
      });
      if (isOpen) {
        item.classList.remove('is-open');
        body.style.maxHeight = null;
      } else {
        item.classList.add('is-open');
        body.style.maxHeight = body.scrollHeight + 'px';
      }
    });
  });

  /* ---------- active state for service cards ---------- */
  document.querySelectorAll('.card--service').forEach(card => {
    card.addEventListener('click', () => card.classList.toggle('card--active'));
  });

  /* ---------- modal forms ---------- */
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modalTitle');
  const modalForm = document.getElementById('modalForm');
  const modalClose = document.getElementById('modalClose');
  const formSuccess = document.getElementById('formSuccess');
  const modalSubject = modalForm.querySelector('input[name="subject"]');

  const openModal = (title) => {
    modalTitle.textContent = title || 'Оставить заявку';
    modalForm.style.display = 'flex';
    modalForm.reset();
    if (modalSubject) modalSubject.value = 'LUMMINA — заявка: ' + (title || 'Оставить заявку');
    formSuccess.classList.remove('is-visible');
    modal.classList.add('is-open');
    overlay.classList.add('is-visible');
  };
  const closeModal = () => {
    modal.classList.remove('is-open');
    overlay.classList.remove('is-visible');
  };

  document.querySelectorAll('.js-open-modal').forEach(btn => {
    btn.addEventListener('click', () => openModal(btn.dataset.form));
  });
  modalClose.addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);

  /* ---------- Web3Forms submission (все формы сайта) ---------- */
  const submitToWeb3Forms = async (form) => {
    const data = new FormData(form);
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: data
    });
    return res.json();
  };

  modalForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = modalForm.querySelector('button[type="submit"]');
    const original = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Отправляем...';
    try {
      const result = await submitToWeb3Forms(modalForm);
      if (result.success) {
        modalForm.style.display = 'none';
        formSuccess.classList.add('is-visible');
        setTimeout(closeModal, 2500);
      } else {
        btn.textContent = 'Ошибка, попробуйте ещё раз';
      }
    } catch (err) {
      btn.textContent = 'Ошибка сети, попробуйте ещё раз';
    } finally {
      setTimeout(() => { btn.disabled = false; btn.textContent = original; }, 2500);
    }
  });

  document.querySelectorAll('form.form:not(#modalForm)').forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const original = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Отправляем...';
      try {
        const result = await submitToWeb3Forms(form);
        btn.textContent = result.success ? 'Отправлено ✓' : 'Ошибка, попробуйте ещё раз';
      } catch (err) {
        btn.textContent = 'Ошибка сети, попробуйте ещё раз';
      } finally {
        setTimeout(() => { btn.disabled = false; btn.textContent = original; form.reset(); }, 2500);
      }
    });
  });

  /* ---------- back to top ---------- */
  document.getElementById('toTop').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

});
