document.querySelectorAll('.contact-form').forEach(form => {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const original = btn.textContent;
    btn.textContent = 'Danke! Wir melden uns ✓';
    btn.style.opacity = '0.8';
    setTimeout(() => { btn.textContent = original; btn.style.opacity = '1'; form.reset(); }, 2500);
  });
});

const header = document.querySelector('header');
window.addEventListener('scroll', () => {
  header.style.boxShadow = window.scrollY > 10 ? '0 8px 24px rgba(0,0,0,0.3)' : 'none';
});

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.card, .price-card, .step').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(16px)';
  el.style.transition = 'opacity .5s ease, transform .5s ease';
  observer.observe(el);
});
