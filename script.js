// Utility: currency
const formatINR = (num) => `₹${num.toLocaleString('en-IN')}`;

// State
const state = {
  products: [
    { id: 'necklace-aurora', name: 'Aurora necklace', category: 'Ring', price: 150, img: 'l1.png' },
    { id: 'necklace-luna', name: 'Luna Necklace', category: 'Necklace', price: 150, img: 'l2.png' },
    { id: 'necklace-eden', name: 'Eden necklace', category: 'Ring', price: 150, img: 'l3.png' },
    { id: 'necklace-aria', name: 'Aria necklace', category: 'Bracelet', price: 150, img: 'l4.png' },
    { id: 'necklace-stella', name: 'Stella necklace', category: 'Earrings', price: 150, img: 'l5.png' },
    { id: 'necklace-nova', name: 'Nova necklace', category: 'Pendant', price: 150, img: 'l5.png' },
  ],
  cart: [],
};

// DOM
const productsGrid = document.getElementById('productsGrid');
const cartItemsEl = document.getElementById('cartItems');
const cartCountEl = document.getElementById('cartCount');
const cartSubtotalEl = document.getElementById('cartSubtotal');
const cartTotalEl = document.getElementById('cartTotal');
const buyWhatsappBtn = document.getElementById('buyWhatsapp');
const yearEl = document.getElementById('year');

// Navigation toggle
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    const open = navMenu.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
  });
}

// Render products
function renderProducts(){
  if(!productsGrid) return;
  productsGrid.innerHTML = state.products.map(p => `
    <article class="product-card" data-id="${p.id}">
      <div class="product-media">
        <img class="product-img" src="${p.img}" alt="${p.name}" loading="lazy" />
      </div>
      <div class="product-body">
        <h4 class="product-title">${p.name}</h4>
        <div class="product-meta"><span>${p.category}</span><span class="price">${formatINR(p.price)}</span></div>
        <div class="product-actions">
          <div class="qty" aria-label="Quantity selector">
            <button class="qty-dec" aria-label="Decrease">−</button>
            <input class="qty-input" type="number" min="1" value="1" aria-label="Quantity" />
            <button class="qty-inc" aria-label="Increase">+</button>
          </div>
          <button class="btn btn-gold add-btn">Add</button>
        </div>
      </div>
    </article>
  `).join('');

  // attach events per card
  productsGrid.querySelectorAll('.product-card').forEach(card => {
    const dec = card.querySelector('.qty-dec');
    const inc = card.querySelector('.qty-inc');
    const input = card.querySelector('.qty-input');
    const add = card.querySelector('.add-btn');
    const id = card.getAttribute('data-id');
    const product = state.products.find(p => p.id === id);
    dec.addEventListener('click', () => { input.value = Math.max(1, Number(input.value) - 1) });
    inc.addEventListener('click', () => { input.value = Number(input.value) + 1 });
    add.addEventListener('click', () => addToCart(product, Number(input.value)));

    // chroma-key processing for green background
    const img = card.querySelector('.product-img');
    if (img && img.complete) {
      tryChromaKey(img);
    } else if (img) {
      img.addEventListener('load', () => tryChromaKey(img), { once: true });
    }
  });
}

function addToCart(product, qty){
  const existing = state.cart.find(i => i.id === product.id);
  if(existing){ existing.qty += qty; }
  else{ state.cart.push({ id: product.id, name: product.name, price: product.price, img: product.img, qty }); }
  renderCart();
}

function removeFromCart(id){
  state.cart = state.cart.filter(i => i.id !== id);
  renderCart();
}

function updateQty(id, qty){
  const item = state.cart.find(i => i.id === id);
  if(!item) return;
  item.qty = Math.max(1, qty);
  renderCart();
}

function renderCart(){
  const count = state.cart.reduce((a, i) => a + i.qty, 0);
  cartCountEl.textContent = String(count);
  if(state.cart.length === 0){
    cartItemsEl.innerHTML = '<p style="opacity:.8">Your cart is empty.</p>';
    cartSubtotalEl.textContent = formatINR(0);
    cartTotalEl.textContent = formatINR(0);
    buyWhatsappBtn.disabled = true;
    return;
  }
  cartItemsEl.innerHTML = state.cart.map(i => `
    <div class="cart-item" data-id="${i.id}">
      <img src="${i.img}" alt="${i.name}">
      <div>
        <div style="font-weight:600">${i.name}</div>
        <div class="cart-row" style="gap:10px">
          <span>${formatINR(i.price)}</span>
          <div class="qty">
            <button class="c-dec" aria-label="Decrease">−</button>
            <input class="c-input" type="number" min="1" value="${i.qty}" aria-label="Quantity" />
            <button class="c-inc" aria-label="Increase">+</button>
          </div>
          <button class="btn" data-remove>Remove</button>
        </div>
      </div>
      <div style="font-weight:600">${formatINR(i.price * i.qty)}</div>
    </div>
  `).join('');

  // summary
  const subtotal = state.cart.reduce((a, i) => a + i.price * i.qty, 0);
  cartSubtotalEl.textContent = formatINR(subtotal);
  cartTotalEl.textContent = formatINR(subtotal);
  buyWhatsappBtn.disabled = false;

  // events
  cartItemsEl.querySelectorAll('.cart-item').forEach(row => {
    const id = row.getAttribute('data-id');
    const dec = row.querySelector('.c-dec');
    const inc = row.querySelector('.c-inc');
    const input = row.querySelector('.c-input');
    const removeBtn = row.querySelector('[data-remove]');
    dec.addEventListener('click', () => updateQty(id, Number(input.value) - 1));
    inc.addEventListener('click', () => updateQty(id, Number(input.value) + 1));
    input.addEventListener('input', () => updateQty(id, Number(input.value)));
    removeBtn.addEventListener('click', () => removeFromCart(id));
  });
}

// WhatsApp buy
const WHATSAPP_NUMBER = '7012530025'; // Business number
function buildWhatsappMessage(){
  const lines = [
    'Hello Lachu Jewellery, I would like to place an order:',
    ...state.cart.map(i => `• ${i.name} x ${i.qty} — ${formatINR(i.price * i.qty)}`),
    `Total: ${cartTotalEl.textContent}`,
  ];
  return encodeURIComponent(lines.join('\n'));
}
if (buyWhatsappBtn){
  buyWhatsappBtn.addEventListener('click', () => {
    const msg = buildWhatsappMessage();
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
    window.open(url, '_blank');
  });
}

// Contact form (client-side simulation)
const contactForm = document.getElementById('contactForm');
const contactStatus = document.getElementById('contactStatus');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(contactForm);
    const name = String(formData.get('name')||'').trim();
    const email = String(formData.get('email')||'').trim();
    const message = String(formData.get('message')||'').trim();
    if(!name || !email || !message){
      contactStatus.textContent = 'Please fill in all fields.';
      return;
    }
    const to = 'rxhit2005@gmail.com';
    const subject = `New enquiry from ${name}`;
    const body = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;
    const mailto = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    // Open default mail client with prefilled message
    window.location.href = mailto;
    contactStatus.textContent = 'Opening your email client...';
  });
}

// Year
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

// Chroma-key: Remove green backgrounds from product images using a simple tolerance-based key
function tryChromaKey(imgEl){
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const w = imgEl.naturalWidth;
  const h = imgEl.naturalHeight;
  if(!w || !h || !ctx) return;
  canvas.width = w; canvas.height = h;
  ctx.drawImage(imgEl, 0, 0, w, h);
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;
  // Key parameters tuned for typical studio green
  const greenMin = 60;   // minimum G value to be considered green
  const redMax = 120;    // maximum R in green areas
  const blueMax = 120;   // maximum B in green areas
  const softness = 40;   // feather edge
  for (let i = 0; i < data.length; i += 4){
    const r = data[i];
    const g = data[i+1];
    const b = data[i+2];
    // Detect green dominance
    const isGreenish = g > greenMin && g > r + 10 && g > b + 10 && r < redMax && b < blueMax;
    if (isGreenish){
      // feather alpha based on how green it is
      const strength = Math.min(255, Math.max(0, (g - Math.max(r, b)) * 3));
      const alpha = Math.max(0, 255 - (strength + softness));
      data[i+3] = alpha;
    }
  }
  ctx.putImageData(imageData, 0, 0);
  // Replace src with processed image
  try{
    const url = canvas.toDataURL('image/png');
    imgEl.src = url;
  }catch(err){
    // If conversion fails (e.g., CORS), keep original
  }
}

// Init
renderProducts();
renderCart();




