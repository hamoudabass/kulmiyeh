// ═══════════════════════════════════════════
// KULMIYEH — gym.js
// Gestion des salles de sport + inscriptions
// ═══════════════════════════════════════════

// ─── CONFIGURATION DISPATCH ───
const KULMIYEH_DISPATCH = '25377784312'; // Ton numéro pour copie des inscriptions

// ─── DONNÉES DES SALLES ───
const GYMS = {
  'alpha': {
    name: 'Alpha Fitness',
    emoji: '💪',
    color: 'g1',
    zone: 'Centre-ville',
    address: 'Rue de la Mairie, près du marché central',
    phone: '25377111111',
    phoneDisplay: '77 11 11 11',
    hours: { open: 6, close: 22 },
    note: '4.8',
    desc: "La salle historique d'Ali Sabieh. Équipements modernes, coachs diplômés et une ambiance motivante du matin au soir. Idéal pour débutants comme confirmés.",
    equipment: ['Musculation', 'Cardio', 'CrossFit', 'Vestiaires'],
    coachs: ['Coach Youssouf (muscu)', 'Coach Ahmed (cardio)'],
    formules: [
      { id: 'jour',     name: 'Pass Journée',    price: 500,   duration: '1 jour',    featured: false },
      { id: 'semaine',  name: 'Pass Semaine',    price: 2500,  duration: '7 jours',   featured: false },
      { id: 'mois',     name: 'Mensuel',         price: 8000,  duration: '30 jours',  featured: true  },
      { id: 'trimestre',name: 'Trimestriel',     price: 20000, duration: '90 jours',  featured: false }
    ]
  },

  'ironhouse': {
    name: 'Iron House Gym',
    emoji: '🏋️',
    color: 'g2',
    zone: 'Garanouc',
    address: 'Face au Plateau, à côté de la pharmacie',
    phone: '25377222222',
    phoneDisplay: '77 22 22 22',
    hours: { open: 5, close: 23 },
    note: '4.9',
    desc: "La salle des gros bras. Matériel professionnel, zone CrossFit dédiée, coachs spécialisés en force et prise de masse. Ambiance warrior garantie.",
    equipment: ['Musculation', 'Powerlifting', 'CrossFit', 'Sauna'],
    coachs: ['Coach Ismaël (force)', 'Coach Houssein (nutrition)'],
    formules: [
      { id: 'jour',     name: 'Pass Journée',    price: 700,   duration: '1 jour',    featured: false },
      { id: 'semaine',  name: 'Pass Semaine',    price: 3000,  duration: '7 jours',   featured: false },
      { id: 'mois',     name: 'Mensuel',         price: 10000, duration: '30 jours',  featured: true  },
      { id: 'trimestre',name: 'Trimestriel',     price: 25000, duration: '90 jours',  featured: false }
    ]
  },

  'fitzone': {
    name: 'Fit Zone Ali Sabieh',
    emoji: '🧘',
    color: 'g3',
    zone: 'Quartier 7',
    address: 'À côté de la mosquée Al-Nour',
    phone: '25377333333',
    phoneDisplay: '77 33 33 33',
    hours: { open: 7, close: 21 },
    note: '4.6',
    desc: "Salle mixte orientée bien-être : yoga, fitness, cardio doux, cours collectifs. Parfait pour celles et ceux qui veulent prendre soin de leur corps en douceur.",
    equipment: ['Yoga', 'Fitness', 'Cardio', 'Cours collectifs'],
    coachs: ['Coach Amina (yoga)', 'Coach Fatouma (fitness)'],
    formules: [
      { id: 'seance',   name: 'Séance unique',   price: 400,   duration: '1 cours',   featured: false },
      { id: 'semaine',  name: 'Pass Semaine',    price: 2000,  duration: '7 jours',   featured: false },
      { id: 'mois',     name: 'Mensuel',         price: 7000,  duration: '30 jours',  featured: true  },
      { id: 'trimestre',name: 'Trimestriel',     price: 18000, duration: '90 jours',  featured: false }
    ]
  },

  'power': {
    name: 'Power Gym',
    emoji: '🥊',
    color: 'g4',
    zone: "Château d'eau",
    address: 'Rue principale, en face de la station Shell',
    phone: '25377444444',
    phoneDisplay: '77 44 44 44',
    hours: { open: 6, close: 22 },
    note: '4.7',
    desc: "Spécialiste boxe et sports de combat. Ring professionnel, sacs de frappe, coachs champions régionaux. Aussi musculation et cardio classiques.",
    equipment: ['Boxe', 'Musculation', 'Cardio', 'Ring'],
    coachs: ['Coach Bilal (boxe)', 'Coach Omar (cardio)'],
    formules: [
      { id: 'jour',     name: 'Pass Journée',    price: 500,   duration: '1 jour',    featured: false },
      { id: 'semaine',  name: 'Pass Semaine',    price: 2800,  duration: '7 jours',   featured: false },
      { id: 'mois',     name: 'Mensuel',         price: 9000,  duration: '30 jours',  featured: true  },
      { id: 'trimestre',name: 'Trimestriel',     price: 22000, duration: '90 jours',  featured: false }
    ]
  }
};

// ─── ÉTAT ───
let currentGymKey = null;
let currentFilter = 'all';
let selectedFormule = null;

// ═══════════════════════════════════════════
// STATUT OUVERT / FERMÉ
// ═══════════════════════════════════════════
function getGymStatus(gymKey) {
  const now = new Date().getHours();
  const g = GYMS[gymKey];
  const isOpen = now >= g.hours.open && now < g.hours.close;
  return isOpen
    ? { open: true,  msg: 'OUVERT' }
    : { open: false, msg: 'FERMÉ' };
}

// ═══════════════════════════════════════════
// AFFICHAGE DES CARTES
// ═══════════════════════════════════════════
function renderGyms() {
  const grid = document.getElementById('gymGrid');
  const empty = document.getElementById('emptyState');
  if (!grid) return;

  const search = (document.getElementById('searchInput')?.value || '').toLowerCase().trim();
  let visible = 0;

  // Construit le HTML
  const cardsHtml = Object.keys(GYMS).map(key => {
    const g = GYMS[key];
    const status = getGymStatus(key);

    // Filtre catégorie
    if (currentFilter !== 'all') {
      const hasCat = g.equipment.some(e =>
        e.toLowerCase().includes(currentFilter)
      );
      if (!hasCat) return '';
    }

    // Filtre recherche
    if (search) {
      const haystack = (
        g.name + ' ' + g.zone + ' ' + g.desc + ' ' + g.equipment.join(' ')
      ).toLowerCase();
      if (!haystack.includes(search)) return '';
    }

    visible++;
    const priceMin = Math.min(...g.formules.map(f => f.price));

    return `
      <div class="gym-card" onclick="openGymModal('${key}')">
        <div class="gym-hero ${g.color}">
          ${g.emoji}
          ${status.open
            ? `<div class="gym-badge-open"><span style="width:7px;height:7px;border-radius:50%;background:#fff;display:inline-block;animation:blink 1.5s infinite;"></span> ${status.msg}</div>`
            : `<div class="gym-badge-closed">🔒 ${status.msg}</div>`
          }
          <div class="gym-badge-promo">NOUVEAU</div>
        </div>
        <div class="gym-body">
          <div class="gym-name">${g.name}</div>
          <div class="gym-zone">📍 ${g.zone} · ⭐ ${g.note}</div>
          <div class="gym-equip">
            ${g.equipment.slice(0, 3).map(e => `<span class="gym-equip-tag">${e}</span>`).join('')}
          </div>
          <div class="gym-from">
            <div>
              <div class="gym-price-label">À partir de</div>
              <div class="gym-price-value">${priceMin.toLocaleString()} <small>FDJ</small></div>
            </div>
            <button class="gym-cta-btn">Voir les formules →</button>
          </div>
        </div>
      </div>`;
  }).join('');

  // Insère les cartes AVANT l'empty state
  grid.innerHTML = cardsHtml + `<div class="empty" id="emptyState" style="${visible === 0 ? 'display:block' : 'display:none'}">
    <div class="empty-icon">🔍</div>
    <h3>Aucun résultat</h3>
    <p>Essayez un autre mot-clé ou une autre catégorie.</p>
  </div>`;

  const countEl = document.getElementById('gymCount');
  if (countEl) countEl.textContent = visible;
}

// ═══════════════════════════════════════════
// FILTRES
// ═══════════════════════════════════════════
function filterGym(el, cat) {
  document.querySelectorAll('.fp').forEach(p => p.classList.remove('on'));
  el.classList.add('on');
  currentFilter = cat;
  renderGyms();
}

// ═══════════════════════════════════════════
// MODAL DÉTAILS + FORMULAIRE
// ═══════════════════════════════════════════
function openGymModal(key) {
  const g = GYMS[key];
  if (!g) return;

  currentGymKey = key;
  selectedFormule = null;

  const hero = document.getElementById('gymModalHero');
  hero.className = 'modal-hero gym-modal-hero ' + g.color;
  hero.innerHTML = g.emoji + '<button class="modal-close" onclick="closeGymModal()">✕</button>';

  const body = document.getElementById('gymModalBody');
  body.innerHTML = `
    <div class="gym-detail-name">${g.name}</div>
    <div class="gym-detail-meta">
      <span>⭐ ${g.note}</span>
      <span>📍 ${g.zone}</span>
      <span>🕐 ${g.hours.open}h – ${g.hours.close}h</span>
      <span>📞 ${g.phoneDisplay}</span>
    </div>
    <p class="gym-detail-desc">${g.desc}</p>

    <div class="gym-section-title">🏋️ Équipements</div>
    <div class="gym-equip">
      ${g.equipment.map(e => `<span class="gym-equip-tag">${e}</span>`).join('')}
    </div>

    <div class="gym-section-title">👨‍🏫 Coachs</div>
    <div style="font-size:13px;color:#555;line-height:1.7">
      ${g.coachs.map(c => `• ${c}`).join('<br>')}
    </div>

    <div class="gym-section-title">💳 Choisissez votre formule</div>
    <div class="formules-grid" id="formulesGrid">
      ${g.formules.map(f => `
        <div class="formule-card ${f.featured ? 'featured' : ''}"
             data-id="${f.id}"
             onclick="selectFormule(this, '${f.id}')">
          <div class="formule-name">${f.name}</div>
          <div class="formule-price">${f.price.toLocaleString()} <small>FDJ</small></div>
          <div class="formule-duration">${f.duration}</div>
        </div>
      `).join('')}
    </div>

    <div class="gym-section-title">📝 Vos informations</div>
    <form class="gym-form" id="gymForm" onsubmit="submitGymForm(event)">
      <label>👤 Nom complet *</label>
      <input type="text" id="gymName" placeholder="Ex: Hamoud Abass" required>

      <label>📱 Numéro WhatsApp *</label>
      <input type="tel" id="gymPhone" placeholder="Ex: 77 12 34 56" required>

      <label>🎯 Objectif (optionnel)</label>
      <select id="gymGoal">
        <option value="">— Choisir —</option>
        <option value="perte-poids">Perdre du poids</option>
        <option value="prise-masse">Prendre de la masse</option>
        <option value="forme">Rester en forme</option>
        <option value="sport-combat">Sport de combat</option>
        <option value="bien-etre">Bien-être / Détente</option>
      </select>

      <label>📅 Date de début souhaitée</label>
      <input type="date" id="gymStart" min="${new Date().toISOString().split('T')[0]}">

      <label>💬 Message au gérant (optionnel)</label>
      <textarea id="gymNote" placeholder="Ex: Je suis débutant, je voudrais un coach..."></textarea>

      <button type="submit" class="gym-submit" id="gymSubmitBtn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        Envoyer mon inscription
      </button>
      <div class="gym-form-note">
        📲 Votre demande sera envoyée directement au gérant via WhatsApp.<br>
        Aucun paiement en ligne — vous payez sur place.
      </div>
    </form>
  `;

  document.getElementById('gymOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeGymModal() {
  document.getElementById('gymOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

function handleOverlayClick(e) {
  if (e.target === document.getElementById('gymOverlay')) closeGymModal();
}

// ═══════════════════════════════════════════
// SÉLECTION DE FORMULE
// ═══════════════════════════════════════════
function selectFormule(el, formuleId) {
  document.querySelectorAll('.formule-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  selectedFormule = formuleId;
}

// ═══════════════════════════════════════════
// SOUMISSION FORMULAIRE
// ═══════════════════════════════════════════
function submitGymForm(e) {
  e.preventDefault();

  const gym = GYMS[currentGymKey];
  if (!gym) return;

  const name = document.getElementById('gymName').value.trim();
  const phone = document.getElementById('gymPhone').value.trim();
  const goal = document.getElementById('gymGoal').value;
  const start = document.getElementById('gymStart').value;
  const note = document.getElementById('gymNote').value.trim();

  // Validations
  if (!name) { showToast('⚠️ Entrez votre nom complet'); return; }
  if (!phone || phone.length < 6) { showToast('⚠️ Numéro de téléphone invalide'); return; }
  if (!selectedFormule) {
    showToast('⚠️ Choisissez une formule d\'abonnement');
    // Scroll vers les formules
    document.getElementById('formulesGrid')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  const formule = gym.formules.find(f => f.id === selectedFormule);
  const goalLabels = {
    'perte-poids': 'Perdre du poids',
    'prise-masse': 'Prendre de la masse',
    'forme': 'Rester en forme',
    'sport-combat': 'Sport de combat',
    'bien-etre': 'Bien-être / Détente'
  };

  // ── Construction du message WhatsApp ──
  let msg = `🏋️ *NOUVELLE INSCRIPTION GYM — KULMIYEH*\n\n`;
  msg += `🏢 *Salle :* ${gym.name}\n`;
  msg += `📦 *Formule :* ${formule.name} — ${formule.price.toLocaleString()} FDJ (${formule.duration})\n\n`;
  msg += `👤 *Nom :* ${name}\n`;
  msg += `📱 *Téléphone :* ${phone}\n`;
  if (goal) msg += `🎯 *Objectif :* ${goalLabels[goal] || goal}\n`;
  if (start) {
    const d = new Date(start).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
    msg += `📅 *Début souhaité :* ${d}\n`;
  }
  if (note) msg += `💬 *Message :* ${note}\n`;
  msg += `\n───────────────────\n`;
  msg += `📍 Via Kulmiyeh — Marketplace Ali Sabieh`;

  const url = `https://wa.me/${gym.phone}?text=${encodeURIComponent(msg)}`;

  // ── Feedback visuel ──
  const btn = document.getElementById('gymSubmitBtn');
  btn.disabled = true;
  btn.innerHTML = '⏳ Envoi en cours...';

  // ── Sauvegarde locale (pratique si le gérant veut recontacter) ──
  try {
    const history = JSON.parse(localStorage.getItem('kulmiyeh_gym_inscriptions') || '[]');
    history.push({
      gym: gym.name,
      gymKey: currentGymKey,
      formule: formule.name,
      price: formule.price,
      name, phone, goal, start, note,
      date: new Date().toISOString()
    });
    localStorage.setItem('kulmiyeh_gym_inscriptions', JSON.stringify(history));
  } catch(err) { /* ignore */ }

  // ── Ouvre WhatsApp ──
  setTimeout(() => {
    window.open(url, '_blank');

    // Affiche la confirmation
    document.getElementById('confirmGymName').textContent = gym.name;
    closeGymModal();
    document.getElementById('confirmOverlay').classList.add('open');

    // Reset du bouton
    btn.disabled = false;
    btn.innerHTML = '💬 Envoyer mon inscription';
  }, 500);
}

function closeConfirm() {
  document.getElementById('confirmOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

// ═══════════════════════════════════════════
// TOAST
// ═══════════════════════════════════════════
function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = 'toast' + (type ? ' ' + type : '') + ' show';
  setTimeout(() => t.classList.remove('show'), 2800);
}

// ═══════════════════════════════════════════
// INITIALISATION
// ═══════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  renderGyms();

  // Recherche
  document.getElementById('searchInput')?.addEventListener('input', renderGyms);

  // Escape ferme les modales
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeGymModal();
      closeConfirm();
    }
  });

  // Blink pour le point "ouvert"
  if (!document.getElementById('blinkStyle')) {
    const style = document.createElement('style');
    style.id = 'blinkStyle';
    style.textContent = '@keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }';
    document.head.appendChild(style);
  }
});