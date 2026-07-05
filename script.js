// =========================================================
// ONE DAY LAUNDRY — script.js
// =========================================================
document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Loader ---------- */
  const loader = document.getElementById('loader');
  window.addEventListener('load', () => {
    setTimeout(() => loader.classList.add('hide'), 400);
  });
  // fallback in case 'load' already fired
  setTimeout(() => loader.classList.add('hide'), 2000);

  /* ---------- Year ---------- */
  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------- Sticky Navbar ---------- */
  const navbar = document.getElementById('navbar');
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
    backToTop.classList.toggle('show', window.scrollY > 600);
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Mobile Nav Toggle ---------- */
  const navToggle = document.getElementById('navToggle');
  navToggle.addEventListener('click', () => {
    navbar.classList.toggle('menu-open');
  });
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.addEventListener('click', () => navbar.classList.remove('menu-open'));
  });

  /* ---------- Back to top ---------- */
  const backToTop = document.getElementById('backToTop');
  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---------- Scroll Reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => io.observe(el));

  /* ---------- Animated Counters ---------- */
  const counters = document.querySelectorAll('[data-count]');
  const counterIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseFloat(el.dataset.count);
      const isDecimal = String(target).includes('.');
      let cur = 0;
      const step = target / 60;
      const tick = () => {
        cur += step;
        if (cur >= target) { cur = target; }
        el.textContent = isDecimal ? cur.toFixed(1) : Math.round(cur).toLocaleString();
        if (cur < target) requestAnimationFrame(tick);
      };
      tick();
      counterIO.unobserve(el);
    });
  }, { threshold: 0.6 });
  counters.forEach(c => counterIO.observe(c));

  /* ---------- Button ripple micro-interaction ---------- */
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('pointermove', (e) => {
      const rect = btn.getBoundingClientRect();
      btn.style.setProperty('--x', `${e.clientX - rect.left}px`);
      btn.style.setProperty('--y', `${e.clientY - rect.top}px`);
    });
  });

  /* =========================================================
     PRICING DATA
     ========================================================= */
  // NOTE: Only the regular price is stored per item. The "1st order" price
  // shown to customers is always calculated as 20% off this regular price —
  // this guarantees the "20% OFF First Order" badge is never mathematically
  // wrong, and means updating a price only ever requires changing ONE number.
  const FIRST_ORDER_DISCOUNT = 0.20;

  const PRICING = {
    'dry-men': [
      ['T-Shirt', 50], ['Jeans', 50], ['Trouser', 50],
      ['Coat', 150], ['Suit 2 Pcs', 220], ['Shirt', 50],
      ['Suit 3 Pcs', 300], ['Kurta', 70], ['Pyjama', 70]
    ],
    'dry-women': [
      ['Kurti', 60], ['Lehenga', 190], ['Salwar', 60],
      ['Saree', 150], ['Dress', 150], ['Dupatta', 50],
      ['Blouse', 40], ['Skirt', 80]
    ],
    'dry-woollen': [
      ['Sweater (Half Sleeves)', 130], ['Sweater (Full Sleeves)', 180],
      ['Sweatshirt', 150], ['Jacket (Half Sleeves)', 200],
      ['Jacket (Full Sleeves)', 250], ['Long Coat', 280], ['Shawl', 170]
    ],
    'dry-household': [
      ['Blanket (Double)', 300], ['Blanket (Single 2 Ply)', 200],
      ['Blanket (Double 2 Ply)', 400], ['Quilt (Single)', 200],
      ['Quilt (Double)', 350], ['Duvet (Single)', 150],
      ['Duvet (Double)', 200], ['Curtain Door (Normal)', 80],
      ['Blanket (Single)', 150], ['Curtain Door (With Lining)', 150],
      ['Curtain Window (Normal)', 100], ['Curtain Window (With Lining)', 180],
      ['Carpet', 30]
    ],
    'iron-men': [
      ['T-Shirt', 15], ['Shirt', 15], ['Jeans', 20], ['Trouser', 20],
      ['Coat', 90], ['Over Coat', 110], ['Kurta', 40], ['Pyjama', 20]
    ],
    'iron-women': [
      ['Blouse', 25], ['Dupatta', 20], ['Saree', 80], ['Plazo', 20],
      ['Top', 15], ['Kurti', 20], ['Dress', 60]
    ]
  };

  function renderPriceGrid(key) {
    const panel = document.querySelector(`[data-sub-panel="${key}"] .price-grid`);
    if (!panel || panel.dataset.rendered) return;
    const items = PRICING[key];
    const hasDiscount = key.startsWith('dry-'); // steam ironing has no first-order discount
    panel.innerHTML = items.map(([name, price]) => {
      const firstOrder = Math.round(price * (1 - FIRST_ORDER_DISCOUNT));
      return `
      <div class="price-card">
        <h4>${name}</h4>
        ${hasDiscount ? `
          <div class="price-row">
            <span class="price-old">₹${price}+</span>
            <span class="price-new">₹${firstOrder}+</span>
          </div>
          <span class="price-badge">20% OFF First Order</span>
        ` : `
          <div class="price-row"><span class="price-plain">₹${price}+</span></div>
        `}
      </div>
    `;
    }).join('');
    panel.dataset.rendered = '1';
  }

  // Render default visible panels
  renderPriceGrid('dry-men');
  renderPriceGrid('iron-men');

  /* ---------- Pricing Tabs (Dry Cleaning / Steam Ironing) ---------- */
  document.querySelectorAll('.ptab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.ptab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.ptab-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(`panel-${tab.dataset.tab}`).classList.add('active');
    });
  });

  /* ---------- Pricing Sub-tabs (Men / Women / Woollen / Household) ---------- */
  document.querySelectorAll('.psub').forEach(sub => {
    sub.addEventListener('click', () => {
      const group = sub.dataset.sub; // 'dry' or 'iron'
      const target = sub.dataset.target; // 'men','women', etc.
      const key = `${group}-${target}`;

      document.querySelectorAll(`.psub[data-sub="${group}"]`).forEach(s => s.classList.remove('active'));
      sub.classList.add('active');

      const parentPanel = sub.closest('.ptab-panel');
      parentPanel.querySelectorAll('.psub-panel').forEach(p => p.classList.remove('active'));
      const targetPanel = parentPanel.querySelector(`[data-sub-panel="${key}"]`);
      targetPanel.classList.add('active');
      renderPriceGrid(key);
    });
  });

  /* =========================================================
     FAQ ACCORDION
     ========================================================= */
  document.querySelectorAll('.acc-head').forEach(head => {
    head.addEventListener('click', () => {
      const item = head.closest('.acc-item');
      const wasActive = item.classList.contains('active');
      document.querySelectorAll('.acc-item').forEach(i => i.classList.remove('active'));
      if (!wasActive) item.classList.add('active');
    });
  });

  /* =========================================================
     BOOKING FORM -> WHATSAPP
     ========================================================= */
  const WHATSAPP_NUMBER = '917066644476';
  const pickupForm = document.getElementById('pickupForm');

  pickupForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('f-name').value.trim();
    const phone = document.getElementById('f-phone').value.trim();
    const address = document.getElementById('f-address').value.trim();
    const landmark = document.getElementById('f-landmark').value.trim() || '—';
    const service = document.getElementById('f-service').value;
    const items = document.getElementById('f-items').value.trim();
    const qty = document.getElementById('f-qty').value.trim();
    const date = document.getElementById('f-date').value;
    const time = document.getElementById('f-time').value;
    const notes = document.getElementById('f-notes').value.trim() || '—';

    const formattedDate = date
      ? new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
      : '—';

    const message =
`🧺 *New Laundry Booking*

👤 Name: ${name}
📞 Phone: ${phone}
📍 Address: ${address}
🏠 Landmark: ${landmark}

🧼 Service: ${service}

👕 Items: ${items}
🔢 Quantity: ${qty}

📅 Pickup Date: ${formattedDate}
⏰ Pickup Time: ${time}

📝 Notes: ${notes}

Please confirm my pickup.`;

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  });

  /* ---------- Contact form -> WhatsApp ---------- */
  const contactForm = document.getElementById('contactForm');
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('c-name').value.trim();
    const phone = document.getElementById('c-phone').value.trim();
    const msg = document.getElementById('c-msg').value.trim();

    const message =
`💬 *New Contact Message*

👤 Name: ${name}
📞 Phone: ${phone}

📝 Message: ${msg}`;

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  });

  /* ---------- Set min date on pickup date input to today ---------- */
  const dateInput = document.getElementById('f-date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
  }

});
