/* ===================== STATIC DATA ===================== */
const CATEGORIES = [
  {id:'white', name:'Makrana White', color:['#EDEAE1','#B9AF9C']},
  {id:'beige', name:'Kishangarh Beige', color:['#DCC9A6','#9C7B4B']},
  {id:'black', name:'Indian Black', color:['#2B2926','#B08D57']},
  {id:'onyx', name:'Green Onyx', color:['#3B5C4A','#8FB89A']},
  {id:'granite', name:'Rajasthan Granite', color:['#4A4642','#8A8478']},
  {id:'sandstone', name:'Red Sandstone', color:['#8C3A2B','#C98F72']},
];

const DEFAULT_PRODUCTS = [
  {id:1, name:'Makrana Statuario White', cat:'white', origin:'Makrana, Rajasthan', price:340, thickness:'18mm / 20mm', finish:'Polished', desc:'The same white marble quarried for the Taj Mahal — fine, tight grain with soft grey veining, prized for flooring and cladding in high-end residences.'},
  {id:2, name:'Makrana Albeta White', cat:'white', origin:'Makrana, Rajasthan', price:260, thickness:'18mm', finish:'Polished', desc:'A more accessible grade of Makrana white with visible veining, ideal for larger residential projects on a budget.'},
  {id:3, name:'Makrana Dungri White', cat:'white', origin:'Makrana, Rajasthan', price:225, thickness:'18mm', finish:'Polished / Honed', desc:'A cooler, brighter white with tighter veining than Albeta — a common choice for temple flooring and inlay work.'},
  {id:4, name:'Ambaji White Marble', cat:'white', origin:'Ambaji, near Rajasthan border', price:195, thickness:'18mm / 20mm', finish:'Polished', desc:'A budget-friendly white marble sourced just across the Rajasthan–Gujarat belt, widely used for residential flooring.'},
  {id:5, name:'Kishangarh Ivory Beige', cat:'beige', origin:'Kishangarh, Rajasthan', price:180, thickness:'18mm', finish:'Polished / Honed', desc:'A warm, consistent beige marble processed at Asia\'s largest marble market. Popular for large-format flooring where a uniform tone is needed.'},
  {id:6, name:'Kishangarh Sangemarmar', cat:'beige', origin:'Kishangarh, Rajasthan', price:210, thickness:'18mm / 20mm', finish:'Polished', desc:'Fine-grained beige-white marble with subtle striations — a mid-range staple across Rajasthan\'s marble trade.'},
  {id:7, name:'Bidasar Beige Marble', cat:'beige', origin:'Bidasar, Rajasthan', price:165, thickness:'18mm', finish:'Polished', desc:'A softer, sandy beige tone with faint cream veining — commonly used in villa flooring across Jaipur and Jodhpur.'},
  {id:8, name:'Rajnagar Black Marble', cat:'black', origin:'Rajnagar, Rajasthan', price:410, thickness:'20mm', finish:'Polished', desc:'Deep black stone with fine gold-brass veining, finished to a high gloss. Used for feature walls, reception counters and inlay borders.'},
  {id:9, name:'Kotputli Black Marble', cat:'black', origin:'Kotputli, Rajasthan', price:365, thickness:'20mm', finish:'Polished', desc:'A denser, matte-leaning black marble that holds a sharper edge — often chosen for staircases and skirting.'},
  {id:10, name:'Udaipur Green Onyx', cat:'onyx', origin:'Udaipur, Rajasthan', price:520, thickness:'20mm', finish:'Polished, backlit-ready', desc:'Translucent green onyx cut thin enough for backlighting — a striking choice for bar counters and feature panels.'},
  {id:11, name:'Rajsamand Honey Onyx', cat:'onyx', origin:'Rajsamand, Rajasthan', price:485, thickness:'20mm', finish:'Polished, backlit-ready', desc:'Warm amber-honey onyx with dramatic banding — a signature piece for hospitality lobbies and feature niches.'},
  {id:12, name:'Jalore Granite Grey', cat:'granite', origin:'Jalore, Rajasthan', price:150, thickness:'18mm', finish:'Flamed / Polished', desc:'Hard-wearing grey granite suited to kitchen counters, staircases and high-traffic flooring.'},
  {id:13, name:'Jhansi Red Granite', cat:'granite', origin:'Jalore belt, Rajasthan', price:170, thickness:'18mm', finish:'Polished', desc:'A speckled red-black granite popular for kitchen platforms and monument work.'},
  {id:14, name:'Rajasthan Black Galaxy', cat:'granite', origin:'Jalore, Rajasthan', price:395, thickness:'18mm / 20mm', finish:'Polished', desc:'Black granite flecked with fine gold particles — a premium counter-top stone exported worldwide from this belt.'},
  {id:15, name:'Dholpur Red Sandstone', cat:'sandstone', origin:'Dholpur, Rajasthan', price:95, thickness:'25mm', finish:'Natural / Chiseled', desc:'Classic red sandstone used across Rajasthan\'s forts and havelis — a warm, textured stone for facades and pathways.'},
  {id:16, name:'Jodhpur Chocolate Sandstone', cat:'sandstone', origin:'Jodhpur, Rajasthan', price:110, thickness:'25mm', finish:'Natural / Sawn', desc:'A rich brown-toned sandstone with a coarser grain, popular for boundary cladding and courtyard paving.'},
  {id:17, name:'Bansi Pink Sandstone', cat:'sandstone', origin:'Bharatpur, Rajasthan', price:88, thickness:'25mm', finish:'Natural / Chiseled', desc:'The soft pink-beige sandstone seen across Jaipur\'s old city facades, quarried near Bharatpur.'},
];

/* ===================== LOCAL STORAGE STATE ===================== */
/* Every page includes this file, so state (products, wishlist, quote
   requests, contact messages, next product id) persists as you click
   between real pages — it resets only if you clear site data. */

function loadState(key, fallback){
  try{
    const raw = localStorage.getItem(key);
    if(raw === null) return fallback;
    return JSON.parse(raw);
  }catch(e){ return fallback; }
}
function saveState(key, value){
  try{ localStorage.setItem(key, JSON.stringify(value)); }catch(e){ /* storage unavailable, fail silently */ }
}

function getProducts(){ return loadState('mh_products', DEFAULT_PRODUCTS); }
function setProducts(list){ saveState('mh_products', list); }
function getNextProductId(){ return loadState('mh_next_id', 18); }
function setNextProductId(n){ saveState('mh_next_id', n); }

function getWishlist(){ return new Set(loadState('mh_wishlist', [])); }
function setWishlist(set){ saveState('mh_wishlist', Array.from(set)); }

function getInquiries(){ return loadState('mh_inquiries', []); }
function addInquiry(q){ const list = getInquiries(); list.push(q); saveState('mh_inquiries', list); }

function getMessages(){ return loadState('mh_messages', []); }
function addMessage(m){ const list = getMessages(); list.push(m); saveState('mh_messages', list); }

function isAdminLoggedIn(){ return sessionStorage.getItem('mh_admin') === '1'; }
function setAdminLoggedIn(v){ if(v) sessionStorage.setItem('mh_admin','1'); else sessionStorage.removeItem('mh_admin'); }

/* ===================== MARBLE SVG GENERATOR ===================== */
function marbleSVG(seed, base, vein){
  const bf1 = (0.008 + (seed % 5) * 0.003).toFixed(4);
  const bf2 = (0.04 + (seed % 7) * 0.01).toFixed(4);
  return `<svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="mrb${seed}" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="${bf1} ${bf2}" numOctaves="4" seed="${seed}" result="n"/>
        <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.6 0.6 0.6 0 -0.55" result="veins"/>
      </filter>
    </defs>
    <rect width="300" height="200" fill="${base}"/>
    <rect width="300" height="200" filter="url(#mrb${seed})" fill="${vein}" opacity="0.65"/>
  </svg>`;
}
function categoryOf(id){ return CATEGORIES.find(c=>c.id===id); }
function productThumb(p){ const cat = categoryOf(p.cat); return marbleSVG(p.id * 13 + 7, cat.color[0], cat.color[1]); }
