// ── 1. BADGE OUVERT / FERMÉ ──────────────────
// S'exécute immédiatement au chargement
// Vérifie l'heure locale et affiche le statut
(function() {
var badge  = document.getElementById('statusBadge');
var now    = new Date();        // heure actuelle
var h      = now.getHours();   // ex: 14 pour 14h00
var isOpen = h >= 7 && h < 23.9; // ouvert entre 09h et 22h

if (isOpen) {
    // Vert avec point clignotant
    badge.innerHTML = '<span style="width:8px;height:8px;border-radius:50%;background:#4CAF50;display:inline-block;animation:blink 1.5s infinite;"></span> Service disponible';
    badge.style.background = 'rgba(76,175,80,0.18)';
    badge.style.color      = '#A5D6A7';
    badge.style.border     = '1px solid rgba(76,175,80,0.4)';
} else {
    // Rouge sans animation
    badge.innerHTML = '<span style="width:8px;height:8px;border-radius:50%;background:#EF5350;display:inline-block;"></span> Service Indisponible';
    badge.style.background = 'rgba(239,83,80,0.18)';
    badge.style.color      = '#EF9A9A';
    badge.style.border     = '1px solid rgba(239,83,80,0.35)';
}
})(); // () à la fin → s'exécute immédiatement (IIFE)


// ── 2. MENU HAMBURGER ────────────────────────
// Gère l'ouverture/fermeture du menu mobile
var _menuOpen = false; // état : true = ouvert, false = fermé

// Bascule entre ouvert et fermé
function toggleMenu() {
_menuOpen ? closeMenu() : openMenu();
}

// Ouvre le menu + anime les barres en ✕
function openMenu() {
_menuOpen = true;
document.getElementById('mobileMenu').style.display = 'flex';
// Barre 1 : descend + pivote 45°
document.getElementById('bar1').style.transform = 'translateY(7px) rotate(45deg)';
// Barre 2 : disparaît
document.getElementById('bar2').style.opacity  = '0';
// Barre 3 : monte + pivote -45°
document.getElementById('bar3').style.transform = 'translateY(-7px) rotate(-45deg)';
}

// Ferme le menu + remet les barres à leur position initiale
function closeMenu() {
_menuOpen = false;
document.getElementById('mobileMenu').style.display = 'none';
document.getElementById('bar1').style.transform = 'none';
document.getElementById('bar2').style.opacity  = '1';
document.getElementById('bar3').style.transform = 'none';
}

// Ferme le menu si l'utilisateur clique en dehors
document.addEventListener('click', function(e) {
if (!_menuOpen) return; // rien à faire si déjà fermé
var menu = document.getElementById('mobileMenu');
var btn  = document.getElementById('menuBtn');
// contains() → vérifie si le clic est DANS le menu ou le bouton
if (!menu.contains(e.target) && !btn.contains(e.target)) {
    closeMenu();
}
});


// ── 3. SMOOTH SCROLL ─────────────────────────
// Tous les liens commençant par "#" scrollent en douceur
// au lieu de sauter directement à la section
document.querySelectorAll('a[href^="#"]').forEach(a => {
a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
    e.preventDefault();                         // annule le saut brusque
    target.scrollIntoView({ behavior: 'smooth' }); // scroll animé
    }
});
});


// ── 4. HEADER EFFET SCROLL ───────────────────
// Quand on scrolle plus de 50px, le header devient
// semi-transparent avec flou (glassmorphism)
window.addEventListener('scroll', () => {
const h = document.getElementById('header');
if (window.scrollY > 50) {
    // Après 50px de scroll : fond semi-transparent + flou
    h.style.background      = 'rgba(139,0,0,0.97)';
    h.style.backdropFilter  = 'blur(10px)';
} else {
    // En haut de page : fond plein original
    h.style.background      = 'var(--red-dark)';
    h.style.backdropFilter  = 'none';
}
});


// ── 5. ANIMATIONS AU SCROLL ──────────────────
// IntersectionObserver : détecte quand un élément
// entre dans le champ de vision de l'utilisateur
// → déclenche l'animation d'apparition
// ── 5. ANIMATIONS AU SCROLL ──────────────────
const observer = new IntersectionObserver((entries) => {
entries.forEach(e => {
if (e.isIntersecting) {
    e.target.style.opacity = '1';
    e.target.style.transform = 'translateY(0)';
}
});
}, { threshold: 0.1 });

// Applique l'état initial aux éléments qui doivent apparaître
document.querySelectorAll('.step, .pass-card, .review-card, .zone-item, .service-card, .sc, .fi').forEach(el => {
el.style.opacity = '0';
el.style.transform = 'translateY(30px)';
el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
observer.observe(el);
});



// ═══════════════════════════════════════════
// PWA KULMIYEH — Enregistrement SW + Install prompt
// ═══════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {

  let deferredPrompt = null;
  let installBtn = null;

  // ── Toast helper (réutilisable) ──
  function showToast(msg) {
    const t = document.createElement('div');
    t.textContent = msg;
    t.style.cssText = `
      position:fixed;bottom:80px;left:50%;transform:translateX(-50%);
      background:#333;color:#fff;padding:10px 18px;border-radius:8px;
      z-index:9999;font-size:14px;box-shadow:0 4px 20px rgba(0,0,0,0.3);
      opacity:0;transition:opacity .3s;`;
    document.body.appendChild(t);
    requestAnimationFrame(() => t.style.opacity = '1');
    setTimeout(() => {
      t.style.opacity = '0';
      setTimeout(() => t.remove(), 300);
    }, 3200);
  }

  // ── 1. Vérifie si déjà installé ──
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

  if (isStandalone) {
    console.log('[PWA] Déjà installée');
    return;
  }

  // ── 2. Création du bouton d'installation ──
  installBtn = document.createElement('button');
  installBtn.innerHTML = "📲 Installer Kulmiyeh";
  installBtn.setAttribute('aria-label', "Installer l'application Kulmiyeh");
  installBtn.style.cssText = `
    position:fixed;bottom:20px;right:20px;z-index:9999;
    padding:15px 22px;background:#8B0000;color:white;border:none;
    border-radius:50px;display:none;cursor:pointer;
    font-family:'Poppins',sans-serif;font-weight:700;font-size:14px;
    box-shadow:0 10px 25px rgba(139,0,0,0.35);
    transition:transform .2s;`;
  installBtn.addEventListener('mouseenter', () => installBtn.style.transform = 'translateY(-2px)');
  installBtn.addEventListener('mouseleave', () => installBtn.style.transform = 'translateY(0)');
  document.body.appendChild(installBtn);

  // ── 3. Détection iOS ──
  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  if (isIOS) {
    installBtn.innerHTML = "📲 Ajouter à l'écran d'accueil";
    installBtn.style.display = 'block';
    installBtn.onclick = () => {
      alert("Sur iOS : appuyez sur l'icône Partager (⬆️) puis sur « Sur l'écran d'accueil ».");
    };
  } else {
    // ── 4. Android / Desktop : beforeinstallprompt ──
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      setTimeout(() => { installBtn.style.display = 'block'; }, 2500);
    });

    installBtn.addEventListener('click', async () => {
      if (!deferredPrompt) {
        showToast("Installation non disponible pour le moment.");
        return;
      }
      installBtn.style.display = 'none';
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log('[PWA] Choix utilisateur :', outcome);
      deferredPrompt = null;
    });
  }

  // ── 5. Confirmation d'installation ──
  window.addEventListener('appinstalled', () => {
    if (installBtn) installBtn.style.display = 'none';
    showToast("✅ Kulmiyeh a été installée avec succès !");
  });
});


// ═══════════════════════════════════════════
// Enregistrement du Service Worker
// ═══════════════════════════════════════════
window.addEventListener('load', () => {
  if (!('serviceWorker' in navigator)) {
    console.warn('[PWA] Service Worker non supporté');
    return;
  }

  navigator.serviceWorker.register('/sw.js', { scope: '/' })
    .then(reg => {
      console.log('[PWA] SW enregistré — scope :', reg.scope);

      // Détecte les mises à jour
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('[PWA] Nouvelle version disponible');
            if (confirm("Une nouvelle version de Kulmiyeh est disponible. Recharger maintenant ?")) {
              newWorker.postMessage({ type: 'SKIP_WAITING' });
              window.location.reload();
            }
          }
        });
      });
    })
    .catch(err => console.error('[PWA] Erreur SW :', err));
});