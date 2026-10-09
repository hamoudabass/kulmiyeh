// ═══════════════════════════════════════════
// BARA+ — restaurants.js
// ═══════════════════════════════════════════



// ─── ÉTAT DU PANIER ───
let cart        = [];
let currentResto = null;
let deliveryFee  = 150;
let paymentMode  = 'Waffi';
let currentCat   = 'all';

// Heure de travail service BARA+
const BARA_SERVICE = { open: 0, close: 23.9 }; // Bara+ travaille de 07h à 23h


// 🔁 Charger la session au démarrage
const savedSession = localStorage.getItem('baraPlus_session');

if (savedSession) {
  const data = JSON.parse(savedSession);
  cart = data.cart || [];
  deliveryFee = data.deliveryFee || 150;

  // On attend que le DOM soit chargé pour remplir les inputs
  document.addEventListener('DOMContentLoaded', () => {
    if (data.customerName) {
      document.getElementById('customerName').value = data.customerName;
    }
    if (data.selectedZoneValue) {
      document.getElementById('zoneSelect').value = data.selectedZoneValue;
    }
    updateCart(); // On lance un premier calcul
  });
}

// ─── POSITION UTILISATEUR ───
let userPosition = {
  lat: null,
  lng: null
};

function autoDetectLocation() {
  try {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      function(position) {
        localStorage.setItem('userLat', position.coords.latitude);
        localStorage.setItem('userLng', position.coords.longitude);
      },
      function() {
        console.log("GPS refusé");
      }
    );
  } catch (e) {
    console.log("Erreur GPS ignorée", e);
  }
}



// ─── DONNÉES RESTAURANTS ───
const RESTAURANTS = {
  'lados': {
    name:'Lados', emoji:'🍴', color:'c1',
    hours: { open: 7, close: 23.9 },
    note:'4.8', temps:'20-25 min', zone:'Centre ville',
    desc:"Restaurant familial spécialisé dans le shawarma et les grillades. Ingrédients frais.",
    menu:[
      {cat:'Shawarma', items:[
        {id:'ld1',emoji:'🥙',name:'Shawarma Poulet',desc:'Pain pita, poulet grillé, légumes',price:700},
        {id:'ld2',emoji:'🥙',name:'Shawarma ½ Poulet',desc:'Pain pita, poulet grillé, légumes',price:400},
        {id:'ld3',emoji:'🥙',name:'Shawarma Poisson',desc:'Pain pita, poisson grillé, légumes',price:700},
        {id:'ld4',emoji:'🥙',name:'Shawarma Viande',desc:'Pain pita, viande grillée, légumes',price:400},
        {id:'ld5',emoji:'🥙',name:'Shawarma Viande hachée',desc:'Pain pita, viande hachée, légumes',price:400},
      ]},
      {cat:'Tacos', items:[
        {id:'ld6',emoji:'🌮',name:'Tacos Poulet',desc:'Galette, poulet grillé, légumes, sauce',price:800},
      ]},
      {cat:'Fadira', items:[
        {id:'ld7',emoji:'🍝',name:'Fadira Normal',desc:'Farine hachée, sauce mayo, légumes',price:300},
        {id:'ld8',emoji:'🍝',name:'Fadira Poulet',desc:'Farine hachée, poulet, sauce mayo, légumes',price:300},
        {id:'ld9',emoji:'🍝',name:'Fadira Special',desc:'Farine hachée, viande, sauce mayo, légumes',price:300},
        {id:'ld10',emoji:'🍝',name:'Fadira Pakistanais',desc:'Farine hachée, épices, sauce mayo, légumes',price:300},
      ]},
      {cat:'Burger', items:[
        {id:'ld11',emoji:'🍔',name:'Burger Poulet',desc:'Pain burger, poulet, sauce',price:600},
      ]},
      {cat:'EECH', items:[
        {id:'ld12',emoji:'🌯',name:'EECH Poulet',desc:'Galette, poulet, légumes, sauce',price:700},
        {id:'ld13',emoji:'🌯',name:'EECH Viande',desc:'Galette, viande, légumes, sauce',price:700},
      ]},
      {cat:'Lados Spécialités', items:[
        {id:'ld14',emoji:'🍗',name:'Lados Poulet',desc:'Poulet frit, frites, sauce',price:800},
        {id:'ld15',emoji:'🍗',name:'Lados Poulet fromage',desc:'Poulet, fromage, frites, sauce',price:1000},
        {id:'ld16',emoji:'🥩',name:'Lados Viande',desc:'Viande, frites, sauce',price:800},
        {id:'ld17',emoji:'🥩',name:'Lados Viande Hachée',desc:'Viande hachée, frites, sauce',price:800},
        {id:'ld18',emoji:'🍗',name:'Lados Nugget',desc:'Nuggets, frites, sauce',price:900},
        {id:'ld19',emoji:'🐟',name:'Lados Poisson',desc:'Poisson frit, frites, sauce',price:800},
      ]},
      {cat:'Nugget', items:[
        {id:'ld20',emoji:'🍔',name:'Nugget',desc:'Nuggets, sauce',price:500},
      ]},
      {cat:'Brochette', items:[
        {id:'ld21',emoji:'🍖',name:'Brochette boeuf',desc:'Boeuf grillé en brochette',price:200},
        {id:'ld22',emoji:'🍗',name:'Brochette poulet',desc:'Poulet grillé en brochette',price:250},
      ]},
      {cat:'Hafteen', items:[
        {id:'ld23',emoji:'🍛',name:'Hafteen viande',desc:'Spaghetti, viande, sauce',price:600},
        {id:'ld24',emoji:'🍛',name:'Hafteen viande hachée',desc:'Spaghetti, viande hachée, sauce',price:600},
        {id:'ld25',emoji:'🍛',name:'Hafteen Poulet',desc:'Spaghetti, poulet, sauce',price:800},
        {id:'ld26',emoji:'🍛',name:'Hafteen Poisson',desc:'Spaghetti, poisson, sauce',price:800},
      ]},
      {cat:'Iskoulab', items:[
        {id:'ld27',emoji:'🥟',name:'Iskoulab viande hachée',desc:'Pâte farcie, viande hachée',price:500},
        {id:'ld28',emoji:'🥟',name:'Iskoulab viande',desc:'Pâte farcie, viande',price:600},
        {id:'ld29',emoji:'🥟',name:'Iskoulab viande poulet',desc:'Pâte farcie, viande et poulet',price:700},
      ]},
      {cat:'Frites', items:[
        {id:'ld30',emoji:'🍟',name:'Frites',desc:'Pommes de terre frites',price:200},
      ]},
      {cat:'🥃 Jus', items:[
        {id:'ld31',emoji:'🍊',name:'Jus Orange',desc:'Frais, pressé minute',price:200},
        {id:'ld32',emoji:'🍌',name:'Jus Banane',desc:'Frais, pressé minute',price:200},
        {id:'ld33',emoji:'🥭',name:'Jus Mangue',desc:'Frais, pressé minute',price:200},
        {id:'ld34',emoji:'🍈',name:'Jus Melon',desc:'Frais, pressé minute',price:200},
        {id:'ld35',emoji:'🥑',name:'Jus Avocado',desc:'Frais, pressé minute',price:200},
        {id:'ld36',emoji:'🏉',name:'Jus Papaye',desc:'Frais, pressé minute',price:200},
        {id:'ld37',emoji:'🍉',name:'Jus Pastèque',desc:'Frais, pressé minute',price:300},
        {id:'ld38',emoji:'🍋',name:'Jus Goyave',desc:'Frais, pressé minute',price:300},
        {id:'ld39',emoji:'🍸',name:'Jus Cocktail',desc:'Mélange de fruits frais',price:350},
      ]},
      {cat:'🥤 Boissons', items:[
        {id:'ld40',emoji:'☕',name:'Expresso',desc:'Café serré',price:250},
        {id:'ld41',emoji:'☕',name:'Buna',desc:'Café traditionnel',price:100},
        {id:'ld42',emoji:'🍵',name:'Thé',desc:'Thé chaud',price:50},
        {id:'ld43',emoji:'🍵',name:'Lipton',desc:'Thé en sachet',price:150},
        {id:'ld44',emoji:'🍵',name:'Thé vert',desc:'Thé vert chaud',price:100},
        {id:'ld45',emoji:'💧',name:'Eau 0.5l',desc:'Eau minérale',price:50},
        {id:'ld46',emoji:'💧',name:'Eau 1.5l',desc:'Eau minérale',price:100},
        {id:'ld47',emoji:'🥤',name:'Coca 400ml',desc:'Boisson gazeuse',price:100},
      ]}  
    ]
  },
  'soho': {
    name:'SOHO CAFÉ', emoji:'🍗', color:'c2',
    hours: { open: 9, close: 23.9 },
    note:'4.6', temps:'25-30 min', zone:'Soubane',
    desc:"L'espace détente par excellence. Venez pour l'air frais et le café, restez pour nos tacos et burgers gourmands. Le mix parfait entre break et plaisir.",
    menu:[
      {cat:'Burgers & Tacos', items:[
        {id:'sh1', emoji:'🍔', name:'Burger Soho', desc:'Steak boeuf, fromage, sauce maison', price:800},
        {id:'sh2', emoji:'🌮', name:'Tacos Poulet', desc:'Poulet mariné, frites, sauce fromagère', price:900},
        {id:'sh3', emoji:'🌮', name:'Tacos Mixte', desc:'Viande hachée et poulet croustillant', price:1200},
        {id:'sh4', emoji:'🌯', name:'Sandwich Club', desc:'Pain de mie grillé, œuf, poulet, crudités', price:600},
      ]},
      {cat:'Cafétéria & Boissons Chaudes', items:[
        {id:'sh5', emoji:'☕', name:'Café Noir', desc:'Café fraîchement moulu', price:150},
        {id:'sh6', emoji:'🥛', name:'Café au Lait', desc:'Onctueux et réconfortant', price:250},
        {id:'sh7', emoji:'🍵', name:'Thé à la Menthe', desc:'Thé traditionnel infusé', price:150},
        {id:'sh8', emoji:'🍫', name:'Chocolat Chaud', desc:'Pour les moments de douceur', price:400},
      ]},
      {cat:'Rafraîchissements', items:[
        {id:'sh9', emoji:'🥤', name:'Jus de Fruits Frais', desc:'Orange, Mangue ou Papaye (selon saison)', price:400},
        {id:'sh10', emoji:'🥤', name:'Milkshake Vanille/Choco', desc:'Frais et gourmand', price:600},
        {id:'sh11', emoji:'💧', name:'Eau Minérale', desc:'Bouteille 500ml', price:100},
        {id:'sh12', emoji:'🍹', name:'Soda (Coca/Fanta)', desc:'Canette fraîche', price:200},
      ]}
    ]
  },
  'iftin': {
    name:'Restaurant Iftin', emoji:'🍴', color:'c4',
    hours: { open: 8, close: 23 },
    note:'4.5', temps:'25-35 min', zone:'Centre-ville',
    desc:"Une institution historique au cœur d'Ali Sabieh. Une cuisine authentique et généreuse, aimée et validée par des générations d'Assajogs.",
    menu:[
      {cat:'Plats Traditionnels', items:[
        {id:'if1', emoji:'🥘', name:'Haricot Simple', desc:'Portion de haricots classiques', price:100},
        {id:'if2', emoji:'🔥', name:'Haricot Dawa', desc:'Haricots façon Dawa épicés', price:150},
        {id:'if3', emoji:'🍳', name:'Haricot Nalo (Oeuf)', desc:'Haricots accompagnés d’un œuf', price:200},
        {id:'if4', emoji:'🍲', name:'Petit Pois & Nalo', desc:'Petits pois savoureux avec œuf', price:250},
        {id:'if5', emoji:'🥚', name:'Nalo Simple', desc:'Plat d’œufs préparés à la locale', price:250},
        {id:'if6', emoji:'🫓', name:'3 Guessod', desc:'Trois galettes traditionnelles', price:350},
      ]},
      {cat:'Viandes & Grillades', items:[
        {id:'if7', emoji:'🥩', name:'Viande Hachée', desc:'Viande hachée cuisinée aux épices', price:300},
        {id:'if8', emoji:'🥘', name:'Souqaar', desc:'Petits morceaux de viande sautés', price:300},
        {id:'if9', emoji:'🍗', name:'Hafteen Poulet', desc:'Spécialité Iftin au poulet', price:500},
        {id:'if10', emoji:'🍖', name:'Hafteen Viande', desc:'Spécialité Iftin à la viande', price:400},
        {id:'if11', emoji:'🍛', name:'Iskulab', desc:'Mélange traditionnel riche', price:400},
      ]},
      {cat:'Boissons', items:[
        {id:'if12', emoji:'💧', name:'Eau Minérale (Petite)', desc:'Eau fraîche 500ml', price:100},
        {id:'if13', emoji:'🥤', name:'Coca-Cola / Fanta', desc:'Canette 33cl au choix', price:150},
        {id:'if14', emoji:'🧃', name:'Jus local', desc:'Jus de fruits frais du jour', price:200},
      ]}
  ]
  },
  'aska-tacos': {
    name:'Aska Tacos', emoji:'🍴', color:'c6',
    hours: { open: 9, close: 23 },
    note:'4.9', temps:'15-20 min', zone:'Centre',
    desc:"La nouvelle référence street-food qui fait vibrer Ali Sabieh. Des tacos ultra-généreux et des jus frais pressés qui ont déjà conquis le cœur (et l'estomac) des Assajogs.",
    menu:[
      {cat:'🥭 Jus Frais', items:[
        {id:'ju1',emoji:'🥭',name:'Jus Mangue',desc:'Mangue fraîche pressée',price:200},
        {id:'ju2',emoji:'🍋',name:'Citronnade',desc:'Citron, menthe, sucre canne',price:200},
        {id:'ju3',emoji:'🍊',name:'Jus Orange',desc:'Oranges fraîches pressées',price:200},
        {id:'ju4',emoji:'🍉',name:'Jus Pastèque',desc:'Pastèque fraîche, menthe',price:200},
      ]},
      {cat:'🥤 Smoothies', items:[
        {id:'ju5',emoji:'🫧',name:'Smoothie Tropical',desc:'Mangue + banane + lait coco',price:350},
        {id:'ju6',emoji:'🥛',name:'Lait de Coco',desc:'Noix de coco fraîche',price:250},
        {id:'ju7',emoji:'☕',name:'Café Djiboutien',desc:'Café épicé traditionnel',price:150},
      ]}
    ]
  }
};

// Vérifier si le service global tourne, ET si le resto spécifique est ouvert.

function getStatus(restoKey) {
  const now = new Date().getHours();
  const resto = RESTAURANTS[restoKey];

  // 1. Vérifier si BARA+ est en service
  if (now < BARA_SERVICE.open || now >= BARA_SERVICE.close) {
    return { status: 'service_off', msg: 'Service Bara+ fermé' };
  }

  // 2. Vérifier si le resto est ouvert
  if (now < resto.hours.open || now >= resto.hours.close) {
    return { status: 'resto_closed', msg: 'Restaurant fermé' };
  }

  return { status: 'open', msg: 'Ouvert' };
}

function displayRestos() {
  const container = document.getElementById('restosGrid');
  if (!container) return;

  container.innerHTML = Object.keys(RESTAURANTS).map(key => {
    const r = RESTAURANTS[key];
    const s = getStatus(key);
    const isClosed = s.status !== 'open';
    
    // Détermination des couleurs selon le statut
    let badgeStyle = "";
    let dotColor = "";
    
    if (s.status === 'open') {
      badgeStyle = "background:rgba(76,175,80,0.18); color:#A5D6A7; border:1px solid rgba(76,175,80,0.4);";
      dotColor = "#4CAF50; animation:blink 1.5s infinite;";
    } else {
      badgeStyle = "background:rgba(239,83,80,0.18); color:#EF9A9A; border:1px solid rgba(239,83,80,0.35);";
      dotColor = "#EF5350;";
    }

    return `
      <div class="resto-card ${isClosed ? 'closed-grayscale' : ''}" onclick="${isClosed ? '' : `openResto('${key}')`}">
        <div class="rc-top">
          <img src="${r.img || 'images/resto-placeholder.jpg'}" class="rc-img">
          <div class="rc-open" style="${badgeStyle}">
            <span style="width:8px;height:8px;border-radius:50%;background:${dotColor}display:inline-block;"></span> 
            ${s.msg}
          </div>
          ${isClosed ? '<div class="closed-overlay">Bientôt de retour</div>' : ''}
        </div>
        <div class="rc-body">
          <div class="rc-title">
            <span class="rc-name">${r.name}</span>
            <span class="rc-emoji">${r.emoji}</span>
          </div>
          <div class="rc-meta">⭐ ${r.note} • 🕒 ${r.temps}</div>
        </div>
      </div>
    `;
  }).join('');
}

function appelerResto() {
  window.location.href = `tel:+25377222819`;
}

function updateAllRestoStatuses() {
  const restoCards = document.querySelectorAll('.rc.fi');

  restoCards.forEach(card => {
    const restoId = card.getAttribute('data-id');
    // On cherche l'élément qui doit recevoir le statut (ton rc-open ou rc-status-badge)
    const badge = card.querySelector('.rc-open') || card.querySelector('.rc-status-badge');
    
    if (restoId && badge && RESTAURANTS[restoId]) {
      const s = getStatus(restoId);
      const isClosed = s.status !== 'open';

      if (s.status === 'open') {
        // Ajout d'une div "dot" explicite
        badge.innerHTML = '<span class="dot green-dot"></span> OUVERT';
        // On applique la classe du fond vert
        badge.className = 'rc-open status-open'; 
        card.classList.remove('closed-grayscale');
      } else {
        // Pour les restos fermés
        badge.innerHTML = `<span class="dot white-dot"></span> ${s.msg.toUpperCase()}`;
        
        // On applique la classe du fond rouge ou gris
        badge.className = `rc-open ${s.status}`;
        card.classList.add('closed-grayscale');
      }
    }
  });
}

// Lancer au chargement
document.addEventListener("DOMContentLoaded", updateAllRestoStatuses);


// ─── STATUT OUVERT/FERMÉ ───
document.addEventListener("DOMContentLoaded", function () {

    var badges = document.querySelectorAll('.rc-open');

    // On lance l'affichage dynamique basé sur les horaires de chaque resto
    displayRestos();
    
    // Optionnel : On rafraîchit toutes les minutes pour les changements d'heure
    setInterval(displayRestos, 60000);

});

// ─── FILTRES ───
function filter(el, cat) {
  document.querySelectorAll('.fp').forEach(p => p.classList.remove('on'));
  el.classList.add('on');
  currentCat = cat;
  applyFilters();
}

function applyFilters() {
  const q = document.getElementById('searchInput').value.toLowerCase();
  let v = 0;
  document.querySelectorAll('.rc').forEach(card => {
    const ok = (currentCat === 'all' || card.dataset.cat === currentCat) &&
               (card.dataset.name.includes(q) ||
                card.querySelector('.rc-tags').textContent.toLowerCase().includes(q));
    card.style.display = ok ? 'block' : 'none';
    if (ok) v++;
  });
  document.getElementById('restoCount').textContent = v;
  document.getElementById('emptyState').classList.toggle('show', v === 0);
}

// ─── MODAL ───
function openModal(id) {
  const r = RESTAURANTS[id];
  if (!r) return;
  currentResto = id;

  const hero = document.getElementById('modalHero');
  hero.className = 'modal-hero ' + r.color;
  hero.innerHTML = r.emoji + '<button class="modal-close" onclick="closeModal()">✕</button>';

  let html = `
    <div class="modal-name">${r.name}</div>
    <div class="modal-meta">
      <span>⭐ ${r.note}</span>
      <span>⏱️ ${r.temps}</span>
      <span>📍 ${r.zone}</span>
      <span>🛵 150 FDJ livraison</span>
    </div>
    <p class="modal-desc">${r.desc}</p>`;

  r.menu.forEach(section => {
    html += `<div class="menu-section">
               <div class="menu-section-title">${section.cat}</div>
               <div class="menu-items">`;
    section.items.forEach(item => {
      const inCart = cart.find(c => c.id === item.id);
      const qty    = inCart ? inCart.qty : 0;
      html += `
        <div class="mi" id="mi-${item.id}">
          <div class="mi-emoji">${item.emoji}</div>
          <div class="mi-info">
            <div class="mi-name">${item.name}</div>
            <div class="mi-desc">${item.desc}</div>
          </div>
          <div class="mi-right">
            <div class="mi-price">${item.price} FDJ</div>
            ${qty > 0
              ? `<div class="mi-qty-ctrl">
                   <button class="qty-btn" onclick="changeQtyModal('${item.id}','${r.name}','${item.emoji}','${item.name}',${item.price},-1)">−</button>
                   <span class="qty-num" id="mqty-${item.id}">${qty}</span>
                   <button class="qty-btn" onclick="changeQtyModal('${item.id}','${r.name}','${item.emoji}','${item.name}',${item.price},1)">+</button>
                 </div>`
              : `<button class="add-btn" id="add-${item.id}"
                   onclick="addToCartFromModal('${item.id}','${r.name}','${item.emoji}','${item.name}',${item.price})">+</button>`
            }
          </div>
        </div>`;
    });
    html += '</div></div>';
  });
  html += '<div style="text-align:center;"><a href="#cartSidebar" onclick="closeModal(),toggleCartMobile()" style="display: inline-block; background:red; color: white; border:none; border-radius:50px; padding:8px 18px; font-family:Nunito,sans-serif; font-weight:700; font-size:13px; cursor:pointer; transition:all .2s; text-decoration: none;">Voir Panier !</a></div>'
  document.getElementById('modalBody').innerHTML = html;
  document.getElementById('modalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

function handleOverlayClick(e) {
  if (e.target === document.getElementById('modalOverlay')) closeModal();
}

// ─── PANIER — AJOUTER ───
function addToCartFromModal(id, restoName, emoji, name, price) {
  // 1. ON SUPPRIME LE VERROU (on ne bloque plus si le resto est différent)
  
  const existing = cart.find(c => c.id === id);
  if (existing) {
    existing.qty++;
  } else {
    // On ajoute l'item. Note: on utilise restoName pour identifier la provenance
    cart.push({ 
      id, 
      restoId: currentResto, // ID du resto actuel
      restoName,             // Nom du resto
      emoji, 
      name, 
      price, 
      qty: 1 
    });
  }

  // 2. RECALCULER LA LIVRAISON (Multi-Restos)
  const uniqueRestos = [...new Set(cart.map(item => item.restoName))];
  const nbRestos = uniqueRestos.length;
  const zonePrice = parseInt(document.getElementById('zoneSelect').value) || 150;
  
  deliveryFee = zonePrice * nbRestos;

  // 3. MISE À JOUR VISUELLE (ton code existant)
  const mi = document.getElementById('mi-' + id);
  const qty = cart.find(c => c.id === id).qty;
  if (mi) {
    mi.querySelector('.mi-right').innerHTML = `
      <div class="mi-price">${(price * qty).toLocaleString()} FDJ</div>
      <div class="mi-qty-ctrl">
        <button class="qty-btn" onclick="changeQtyModal('${id}','${restoName}','${emoji}','${name}',${price},-1)">−</button>
        <span class="qty-num" id="mqty-${id}">${qty}</span>
        <button class="qty-btn" onclick="changeQtyModal('${id}','${restoName}','${emoji}','${name}',${price},1)">+</button>
      </div>`;
  }

  updateCart();
  
  // Petit message personnalisé si c'est un nouveau resto
  if (nbRestos > 1 && !existing) {
    showToast(`🛍️ Ajouté ! (Total: ${nbRestos} restaurants)`, 'orange');
  } else {
    showToast('✅ ' + name + ' ajouté', 'green');
  }
}

function changeQtyModal(id, restoName, emoji, name, price, delta) {
  const item = cart.find(c => c.id === id);
  if (!item) {
    if (delta > 0) addToCartFromModal(id, restoName, emoji, name, price);
    return;
  }
  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter(c => c.id !== id);
    const mi = document.getElementById('mi-' + id);
    if (mi) mi.querySelector('.mi-right').innerHTML =
      `<div class="mi-price">${price} FDJ</div>
       <button class="add-btn" id="add-${id}"
         onclick="addToCartFromModal('${id}','${restoName}','${emoji}','${name}',${price})">+</button>`;
  } else {
    const qtyEl = document.getElementById('mqty-' + id);
    if (qtyEl) qtyEl.textContent = item.qty;
  }
  updateCart();
}

function changeCartQty(id, delta) {
  const item = cart.find(c => c.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(c => c.id !== id);
  const mQty = document.getElementById('mqty-' + id);
  if (mQty && cart.find(c => c.id === id)) mQty.textContent = item.qty;
  updateCart();
}

function clearCart() {
    // 1. Vider le tableau en mémoire
    cart = [];
    deliveryFee = 150; // On remet le tarif de base

    // 2. Supprimer la sauvegarde ou la mettre à jour à vide
    // On garde le nom du client mais on vide le panier
    const emptyData = {
        cart: [],
        deliveryFee: 150,
        customerName: document.getElementById('customerName')?.value || '',
        selectedZoneValue: document.getElementById('zoneSelect')?.value || '150'
    };
    localStorage.setItem('baraPlus_session', JSON.stringify(emptyData));

    // 3. Mettre à jour l'interface (UI)
    updateCart();
    
    console.log("🧹 Panier nettoyé en mémoire et sur le disque.");
}

// ─── PANIER — AFFICHAGE ───
function updateCart() {
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const count = cart.reduce((s, i) => s + i.qty, 0);
  const grand = total + deliveryFee;

  // Badge nav
  const badge = document.getElementById('cartBadge');
  badge.textContent = count;
  badge.classList.toggle('show', count > 0);
  document.getElementById('cartNavBtn').classList.toggle('has-items', count > 0);

  // --- Gestion du Bouton Mobile ---
  const mob = document.getElementById('cartMobileToggle');
  const sidebar = document.getElementById('cartSidebar');
  
  // VARIABLE CRITIQUE : On vérifie si le panier est déjà ouvert
  const isPanierOuvert = sidebar.classList.contains('mobile-open');

  if (count > 0 && !isPanierOuvert) {
    // On ne l'affiche QUE s'il y a des articles ET que le panier est fermé
    mob.style.display = 'flex';
    document.getElementById('cartMobileBadge').textContent = 
      count + ' article' + (count > 1 ? 's' : '');
    
    mob.onclick = () => {
      toggleCartMobile();
    };
  } else {
    // Si le panier est vide OU s'il est déjà ouvert, on cache le bouton
    mob.style.display = 'none';
  }

  // Compteur
  document.getElementById('cartCount').textContent = count > 0 ? '(' + count + ')' : '';

  // États panier
  const isEmpty = cart.length === 0;
  document.getElementById('cartEmptyState').style.display = isEmpty ? 'flex' : 'none';
  document.getElementById('cartItems').style.display     = isEmpty ? 'none' : 'block';
  document.getElementById('cartFooter').style.display    = isEmpty ? 'none' : 'block';

  // Info restaurant
  const restoInfo = document.getElementById('cartRestoInfo');
  if (!isEmpty) {
    const restos = [...new Set(cart.map(item => item.restoName))];
    restoInfo.classList.add('show');
    
    if (restos.length > 1) {
      document.getElementById('cartRestoEmoji').textContent = "🛍️";
      document.getElementById('cartRestoName').textContent = "Commande Multi-Restos";
      // On affiche le détail sous le nom
      const sub = document.getElementById('cartRestoSub');
      if (sub) sub.textContent = restos.join(' + ');
    } else {
      document.getElementById('cartRestoEmoji').textContent = cart[0].restoEmoji || '🍴';
      document.getElementById('cartRestoName').textContent = cart[0].restoName;
    } 
    
  } else {
    // 🔥 C'EST ICI QUE ÇA SE PASSE : On nettoie tout quand le panier est VIDE
    if (restoInfo) restoInfo.classList.remove('show');
    if (restoNameEl) restoNameEl.textContent = "";
    if (restoEmojiEl) restoEmojiEl.textContent = "";
    if (restoSubEl) {
      restoSubEl.textContent = "";
      restoSubEl.style.display = 'none';
    }
  }

  // Liste des items
  document.getElementById('cartItems').innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="ci-emoji">${item.emoji}</div>
      <div class="ci-info">
        <div class="ci-name">${item.name}</div>
        <div class="ci-price">${(item.price * item.qty).toLocaleString()} FDJ</div>
      </div>
      <div class="ci-qty">
        <button class="qty-btn" onclick="changeCartQty('${item.id}',-1)">−</button>
        <span class="qty-num">${item.qty}</span>
        <button class="qty-btn" onclick="changeCartQty('${item.id}',1)">+</button>
      </div>
    </div>`).join('');

  // Totaux
  document.getElementById('cartSubtotal').textContent = total.toLocaleString() + ' FDJ';
  // NOUVEAU : Met à jour la ligne "Livraison" visuellement
  const deliveryAmountEl = document.getElementById('cartDeliveryAmount');
  if (deliveryAmountEl) {
    deliveryAmountEl.textContent = deliveryFee + ' FDJ';
    deliveryAmountEl.style.color = deliveryFee > 150 ? 'var(--accent)' : 'var(--green)';
  }  
  document.getElementById('cartTotal').textContent    = grand.toLocaleString() + ' FDJ';

 
// 🔥 Sauvegarde complète (Panier + Zone + Nom)
  const saveData = {
    cart: cart,
    deliveryFee: deliveryFee,
    customerName: document.getElementById('customerName')?.value || '',
    selectedZoneValue: document.getElementById('zoneSelect')?.value || '150'
  };
  localStorage.setItem('baraPlus_session', JSON.stringify(saveData));
}

function updateDelivery() {
  // 1. On cible les bons éléments HTML (et pas le tableau 'cart')
  const sidebar = document.getElementById('cartSidebar');
  const mobBtn = document.getElementById('cartMobileToggle');

  // 🔥 cacher bouton quand ouvert
  if (sidebar && sidebar.classList.contains('mobile-open')) {
    if (mobBtn) mobBtn.style.display = 'none';
  }
    else {
    if (cart.length > 0) btn.style.display = 'flex';
  }

  // 2. On met à jour la variable globale du prix de livraison
  deliveryFee = parseInt(document.getElementById('zoneSelect').value);
  
  // 3. On met à jour le texte du sous-titre du restaurant (en haut du panier)
  const cartRestoSub = document.getElementById('cartRestoSub');
  if (cartRestoSub) {
    cartRestoSub.textContent = 'Livraison ' + deliveryFee + ' FDJ';
    // Optionnel : on met en orange si c'est cher, vert si c'est normal
    // cartRestoSub.style.color = deliveryFee > 150 ? 'var(--orange)' : 'var(--green)';
  }
  calculateMultiRestoDelivery(); // Recalcule selon le nombre de restos
 
  // 4. On recalcule tout le panier
  updateCart();
}

function calculateMultiRestoDelivery() {
  if (cart.length === 0) {
    deliveryFee = 0;
    return;
  }

  // 1. On identifie les restaurants uniques présents dans le panier
  const uniqueRestos = [...new Set(cart.map(item => item.restoName))];
  const nbRestos = uniqueRestos.length;

  // 2. On récupère le prix de la zone (150 ou 250) depuis le select
  const zonePrice = parseInt(document.getElementById('zoneSelect').value) || 150;

  // 3. Frais total = Prix de la zone x Nombre de restos
  deliveryFee = zonePrice * nbRestos;
}

function selectPay(el, mode) {
  document.querySelectorAll('.pay-opt').forEach(o => o.classList.remove('on'));
  el.classList.add('on');
  paymentMode = mode;
}

// ─── ENVOYER COMMANDE ───
function sendOrder() {
  if (cart.length === 0) return;

  const userName = document.getElementById('customerName').value.trim();
  const zoneEl  = document.getElementById('zoneSelect');
  const zone    = zoneEl.options[zoneEl.selectedIndex].text;
  //const address = document.getElementById('addressNote').value;
  const total   = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const grand   = total + deliveryFee;
 
  // 📍 Ajouter position GPS
  const lat = localStorage.getItem('userLat');
  const lng = localStorage.getItem('userLng');


  // Vérification de sécurité : le nom est-il rempli ?
  if (!userName) {
    showToast('⚠️ Veuillez entrer votre nom pour la livraison', 'orange');
    document.getElementById('customerName').focus();
    return;
  }

  // --- LOGIQUE DE GROUPEMENT PAR RESTO ---
  const restosDansPanier = [...new Set(cart.map(i => i.restoName))];
  const totalArticles = cart.reduce((s, i) => s + (i.price * i.qty), 0);
  const grandTotal = totalArticles + deliveryFee;

  let msg = `🛵 *NOUVELLE COMMANDE BARA+*\n\n`;
  msg += `👤 *Client :* ${userName}\n`;
  msg += `\n📍 *Zone :* ${zone}\n\n`;

  //msg += `🏪 *Restaurant :* ${cart[0].restoName}\n`;

  // Boucle sur chaque restaurant pour lister ses articles
  restosDansPanier.forEach(resto => {
    msg += `🏠 *${resto.toUpperCase()}*\n`; // Titre du resto
    const itemsDuResto = cart.filter(i => i.restoName === resto);
    
    itemsDuResto.forEach(item => {
      msg += `  • ${item.qty}x ${item.name}\n`;
    });
    msg += `\n`;
  });


  msg += `💰 Sous-total : ${totalArticles.toLocaleString()} FDJ\n`;
  msg += `\n🛵 Livraison : ${deliveryFee} FDJ`;
  msg += `\n✅ *TOTAL : ${grand.toLocaleString()} FDJ*`;
  msg += `\n💳 *Paiement :* ${paymentMode}`;
  if (lat && lng) {
  msg += `\n\n📌 Position du client :\n`;
  msg += `https://www.google.com/maps?q=${lat},${lng}`;
}

  window.open('https://wa.me/25377222819?text=' + encodeURIComponent(msg), '_blank');

  // 🔥 ACTION CRITIQUE : Vider le panier après l'envoi
    setTimeout(() => {
        clearCart();
        // Optionnel : Rediriger ou fermer le panier mobile
        if(typeof toggleCartMobile === 'function') toggleCartMobile(); 
        alert("Commande envoyée ! Votre panier a été réinitialisé.");
    }, 1000);
}

// ─── GÉOLOCALISATION ───
function getLocation() {
  const btn = document.getElementById('locBtn');
  if (!navigator.geolocation) {
    showToast('❌ GPS non disponible sur cet appareil');
    return;
  }
  btn.innerHTML = '⏳ Localisation en cours...';
  btn.disabled  = true;

  navigator.geolocation.getCurrentPosition(
    async function(position) {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      try {
        const url  = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=fr`;
        const data = await (await fetch(url)).json();

        const quartier = data.address.quarter
                      || data.address.suburb
                      || data.address.neighbourhood
                      || data.address.hamlet
                      || data.address.village
                      || data.address.town
                      || data.address.city
                      || 'Ali Sabieh';

        const zone = determinerZone(quartier);

        document.getElementById('locQuartier').textContent  = '📍 ' + quartier;
        document.getElementById('locZoneLabel').textContent = zone.nom + ' — Livraison ' + zone.prix + ' FDJ';
        document.getElementById('locResult').style.display  = 'block';

        if (zone.confirmed) {
          document.getElementById('manualZone').style.display = 'none';
        } else {
          document.getElementById('manualZone').style.display = 'block';
          document.getElementById('locZoneLabel').innerHTML =
            '⚠️ Zone non reconnue — <b>Choisissez ci-dessous :</b>';
        }

        document.getElementById('cartRestoSub').textContent  = 'Livraison ' + zone.prix + ' FDJ';
        document.getElementById('cartRestoSub').style.color  =
          zone.prix > 150 ? 'var(--orange)' : 'var(--green)';
        document.getElementById('cartDeliveryAmount').textContent = zone.prix + ' FDJ';
        document.getElementById('addressNote').value = quartier + ', Ali Sabieh';

        deliveryFee = zone.prix;
        updateCart();
        btn.style.display = 'none';
        showToast('✅ Position trouvée : ' + quartier, 'green');

      } catch(e) {
        afficherErreurGPS('Erreur réseau — Sélectionnez manuellement.');
      }
    },
    function(error) {
      const msgs = {
        1: '🚫 Permission refusée',
        2: '📡 GPS indisponible',
        3: '⏱️ Délai dépassé'
      };
      afficherErreurGPS((msgs[error.code] || '❌ Erreur GPS') + ' — Sélectionnez votre zone manuellement');
    },
    { timeout: 10000, maximumAge: 60000, enableHighAccuracy: true }
  );
}

function afficherErreurGPS(message) {
  const btn = document.getElementById('locBtn');
  btn.innerHTML = '📍 Trouver ma position automatiquement';
  btn.disabled  = false;
  document.getElementById('manualZone').style.display = 'block';
  showToast(message);
}

function resetLocation() {
  document.getElementById('locResult').style.display   = 'none';
  document.getElementById('manualZone').style.display  = 'block';
  document.getElementById('locBtn').style.display      = 'flex';
  document.getElementById('locBtn').innerHTML          = '📍 Trouver ma position automatiquement';
  document.getElementById('locBtn').disabled           = false;
  document.getElementById('cartRestoSub').textContent  = 'Livraison 150 FDJ';
  document.getElementById('cartRestoSub').style.color  = '';
  deliveryFee = 150;
  updateCart();
}

// ─── DÉTERMINER LA ZONE ───
function determinerZone(quartier) {
  const q = quartier.toLowerCase()
             .normalize("NFD")
             .replace(/[\u0300-\u036f]/g, "");

  const normale = [
    'chateau','eau','shell','arabta',
    'q.ali','qali','quartier ali',
    'place','feraad','ferad',
    'sept frere','plateau','garanoucou','garanouco',
    'centre','ali sabieh','mairie','hopital',
  ];

  const eloignee = [
    'gohara','arta','cite','barwaqo',
    'main de lion','main lion','iljano','jena',
    'industrielle','piste','route nationale',
    'peripherie','extension','aeroport',
    'holhol','ali adde',
  ];

  if (eloignee.some(z => q.includes(z)))
    return { nom: '🟡 Zone Éloignée', prix: 250, confirmed: true };
  if (normale.some(z => q.includes(z)))
    return { nom: '🟢 Zone Normale',  prix: 150, confirmed: true };
  if (/quartier\s*\d/.test(q))
    return { nom: '🟢 Zone Normale',  prix: 150, confirmed: true };

  return { nom: '⚪ Zone à confirmer', prix: 150, confirmed: false };
}

// ─── TOAST ───
function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className   = 'toast' + (type ? ' ' + type : '') + ' show';
  setTimeout(() => t.classList.remove('show'), 2500);
}

// ─── MOBILE CART TOGGLE ───
function toggleCartMobile() {
  const cart = document.getElementById('cartSidebar');
  const btn  = document.getElementById('cartMobileToggle');

  cart.classList.toggle('mobile-open');
  
  // 🔥 cacher bouton quand ouvert
  if (cart.classList.contains('mobile-open')) {
    btn.style.display = 'none';
  } else {
    if (cart.length > 0) btn.style.display = 'flex';
  }
  updateCart();
}

// ─── INITIALISATION ───
document.addEventListener('DOMContentLoaded', function() {

  // Recherche
  document.getElementById('searchInput').addEventListener('input', applyFilters);

  // AUTO GPS au chargement
  autoDetectLocation();

  // Favoris
  document.querySelectorAll('.rc-fav').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      btn.textContent = btn.textContent === '🤍' ? '❤️' : '🤍';
    });
  });

  // Animations scroll
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting)
        setTimeout(() => e.target.classList.add('vis'), i * 80);
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.fi').forEach(el => obs.observe(el));

  // Init panier
  updateCart();
});