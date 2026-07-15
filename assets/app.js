/* ===================== HEADER WISH COUNT ===================== */
function refreshWishBadge(){
  const el = document.getElementById('wishCount');
  if(el) el.textContent = getWishlist().size;
}
document.addEventListener('DOMContentLoaded', refreshWishBadge);

/* ===================== PRODUCT CARD ===================== */
function productCard(p){
  const wished = getWishlist().has(p.id);
  return `<a class="card" href="product.html?id=${p.id}">
    <div class="thumb">
      ${productThumb(p)}
      <div class="heart ${wished?'active':''}" onclick="event.preventDefault(); event.stopPropagation(); toggleWishlist(${p.id}, this);">
        <svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.6-10-9.2C0.3 8 2 4 6 4c2.2 0 3.7 1.2 6 3.6C14.3 5.2 15.8 4 18 4c4 0 5.7 4 4 7.8-2.5 4.6-10 9.2-10 9.2z"/></svg>
      </div>
    </div>
    <div class="body">
      <div class="origin">${p.origin}</div>
      <h4>${p.name}</h4>
      <div class="spec-strip"><span>${p.thickness}</span><span>${p.finish}</span></div>
      <div class="price-row">
        <div class="price">₹${p.price}<span> /sq.ft</span></div>
        <button class="btn btn-outline" style="padding:8px 14px; font-size:12px;" onclick="event.preventDefault(); event.stopPropagation(); openQuote(${p.id});">Get quote</button>
      </div>
    </div>
  </a>`;
}

/* ===================== WISHLIST ===================== */
function toggleWishlist(id, heartEl){
  const set = getWishlist();
  if(set.has(id)) set.delete(id); else set.add(id);
  setWishlist(set);
  refreshWishBadge();
  if(heartEl) heartEl.classList.toggle('active', set.has(id));
  if(typeof onWishlistChanged === 'function') onWishlistChanged();
}

/* ===================== QUOTE MODAL (present on every page) ===================== */
function ensureQuoteModal(){
  if(document.getElementById('quoteOverlay')) return;
  const div = document.createElement('div');
  div.innerHTML = `
  <div id="quoteOverlay" class="overlay hidden">
    <div class="modal">
      <button class="close" onclick="closeQuote()">&times;</button>
      <div id="quoteFormWrap">
        <h3>Request a quote</h3>
        <p class="sub" id="quoteProdName">For this product</p>
        <form id="quoteForm">
          <div class="field"><label>Full name</label><input required name="name" type="text"></div>
          <div class="field"><label>Phone</label><input required name="phone" type="tel"></div>
          <div class="field"><label>Quantity (sq. ft)</label><input required name="qty" type="number" min="1" value="100"></div>
          <div class="field"><label>Message (optional)</label><textarea name="message" placeholder="Delivery city, timeline, finish preference…"></textarea></div>
          <button class="btn btn-brass" style="width:100%;" type="submit">Submit request</button>
        </form>
      </div>
      <div id="quoteConfirm" class="confirm hidden">
        <div class="checkmark"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#221F1C" stroke-width="2.4"><path d="M4 12l5 5L20 6"/></svg></div>
        <h3>Request sent</h3>
        <p style="color:var(--stone-grey); font-size:14px; margin-top:8px;">We'll get back to you with pricing within 24 hours.</p>
        <button class="btn btn-outline" style="margin-top:20px;" onclick="closeQuote()">Close</button>
      </div>
    </div>
  </div>`;
  document.body.appendChild(div.firstElementChild);
  document.getElementById('quoteForm').addEventListener('submit', submitQuote);
}
let currentQuoteProduct = null;
function openQuote(id){
  ensureQuoteModal();
  const products = getProducts();
  currentQuoteProduct = products.find(p=>p.id===id);
  document.getElementById('quoteProdName').textContent = `For ${currentQuoteProduct.name}`;
  document.getElementById('quoteFormWrap').classList.remove('hidden');
  document.getElementById('quoteConfirm').classList.add('hidden');
  document.getElementById('quoteOverlay').classList.remove('hidden');
}
function closeQuote(){
  const o = document.getElementById('quoteOverlay');
  if(o) o.classList.add('hidden');
}
function submitQuote(e){
  e.preventDefault();
  const f = e.target;
  addInquiry({
    product: currentQuoteProduct.name,
    name: f.name.value,
    phone: f.phone.value,
    qty: f.qty.value,
    message: f.message.value || '—'
  });
  document.getElementById('quoteFormWrap').classList.add('hidden');
  document.getElementById('quoteConfirm').classList.remove('hidden');
  f.reset();
}

/* ===================== HERO SEARCH → CATALOG ===================== */
function goSearch(){
  const input = document.getElementById('heroSearch');
  const q = input ? input.value : '';
  window.location.href = 'catalog.html' + (q ? ('?q=' + encodeURIComponent(q)) : '');
}
