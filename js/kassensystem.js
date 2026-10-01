const fmt = n => n.toFixed(2).replace('.', ',') + ' €';
const todayKey = () => new Date().toISOString().slice(0, 10);

const defaultProducts = [
  { name: 'Cappuccino', price: 3.5 },
  { name: 'Latte Macchiato', price: 3.8 },
  { name: 'Croissant', price: 2.2 },
  { name: 'Belegtes Brötchen', price: 4.5 },
  { name: 'Wasser 0,5l', price: 2.0 },
  { name: 'Cola 0,33l', price: 2.8 },
];

let products = JSON.parse(localStorage.getItem('eltech_products') || 'null') || defaultProducts;
let cart = [];
let history = JSON.parse(localStorage.getItem('eltech_history_' + todayKey()) || '[]');

const productGrid = document.getElementById('productGrid');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const historyList = document.getElementById('historyList');
const dayTotal = document.getElementById('dayTotal');
const dayCount = document.getElementById('dayCount');

function saveProducts() {
  localStorage.setItem('eltech_products', JSON.stringify(products));
}

function saveHistory() {
  localStorage.setItem('eltech_history_' + todayKey(), JSON.stringify(history));
}

function renderProducts() {
  productGrid.innerHTML = '';
  products.forEach((p, i) => {
    const tile = document.createElement('button');
    tile.className = 'product-tile';
    tile.innerHTML = `<span class="pname">${p.name}</span><span class="pprice">${fmt(p.price)}</span>`;
    tile.addEventListener('click', () => addToCart(i));
    productGrid.appendChild(tile);
  });
}

function addToCart(index) {
  const product = products[index];
  const existing = cart.find(c => c.name === product.name);
  if (existing) existing.qty += 1;
  else cart.push({ name: product.name, price: product.price, qty: 1 });
  renderCart();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  renderCart();
}

function cartSum() {
  return cart.reduce((sum, c) => sum + c.price * c.qty, 0);
}

function renderCart() {
  cartItems.innerHTML = '';
  if (cart.length === 0) {
    cartItems.innerHTML = '<div class="empty-hint">Noch keine Artikel im Bon.<br>Produkt anklicken zum Hinzufügen.</div>';
  } else {
    cart.forEach((c, i) => {
      const row = document.createElement('div');
      row.className = 'cart-row';
      row.innerHTML = `
        <span class="cname">${c.name}</span>
        <span class="cqty">x${c.qty}</span>
        <span class="cprice">${fmt(c.price * c.qty)}</span>
        <span class="cremove" data-i="${i}">✕</span>
      `;
      row.querySelector('.cremove').addEventListener('click', () => removeFromCart(i));
      cartItems.appendChild(row);
    });
  }
  cartTotal.textContent = fmt(cartSum());
}

function renderHistory() {
  historyList.innerHTML = '';
  if (history.length === 0) {
    historyList.innerHTML = '<div class="empty-hint">Noch keine Verkäufe heute.</div>';
  } else {
    history.slice().reverse().forEach(h => {
      const row = document.createElement('div');
      row.className = 'history-row';
      row.innerHTML = `<span>${h.time} · ${h.items} Artikel</span><b>${fmt(h.total)}</b>`;
      historyList.appendChild(row);
    });
  }
  const total = history.reduce((s, h) => s + h.total, 0);
  dayTotal.textContent = fmt(total);
  dayCount.textContent = history.length;
}

document.getElementById('clearCartBtn').addEventListener('click', () => {
  cart = [];
  renderCart();
});

document.getElementById('checkoutBtn').addEventListener('click', () => {
  if (cart.length === 0) return;
  const total = cartSum();
  const itemsCount = cart.reduce((s, c) => s + c.qty, 0);
  const time = new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

  showReceipt(time, total);

  history.push({ time, items: itemsCount, total });
  saveHistory();
  renderHistory();

  cart = [];
  renderCart();
});

function showReceipt(time, total) {
  const content = document.getElementById('receiptContent');
  let lines = '';
  const lastCart = cart.map(c => c);
  lastCart.forEach(c => {
    lines += `<div class="receipt-line"><span>${c.name} x${c.qty}</span><b>${fmt(c.price * c.qty)}</b></div>`;
  });
  content.innerHTML = `
    <div class="receipt-line"><span>Datum/Zeit</span><b>${time} Uhr</b></div>
    <div class="receipt-divider"></div>
    ${lines}
    <div class="receipt-divider"></div>
    <div class="receipt-total"><span>Gesamt</span><span>${fmt(total)}</span></div>
  `;
  document.getElementById('receiptModal').classList.remove('hidden');
}

document.getElementById('closeReceiptBtn').addEventListener('click', () => {
  document.getElementById('receiptModal').classList.add('hidden');
});

document.getElementById('resetDayBtn').addEventListener('click', () => {
  if (!confirm('Tagesumsatz wirklich zurücksetzen?')) return;
  history = [];
  saveHistory();
  renderHistory();
});

const productModal = document.getElementById('productModal');
document.getElementById('addProductBtn').addEventListener('click', () => {
  document.getElementById('prodName').value = '';
  document.getElementById('prodPrice').value = '';
  productModal.classList.remove('hidden');
});
document.getElementById('cancelProdBtn').addEventListener('click', () => productModal.classList.add('hidden'));
document.getElementById('saveProdBtn').addEventListener('click', () => {
  const name = document.getElementById('prodName').value.trim();
  const price = parseFloat(document.getElementById('prodPrice').value);
  if (!name || isNaN(price)) return;
  products.push({ name, price });
  saveProducts();
  renderProducts();
  productModal.classList.add('hidden');
});

renderProducts();
renderCart();
renderHistory();
