// qu/et C kararı (16 Ekim): logo girişi oturumdaki ilk ana sayfa ziyaretinde tam oynar,
// dönüşte animasyonsuz son haliyle gelir. Head'de senkron yüklenir (ilk boyamadan önce).
// Depolama yoksa (gizli pencere, file://) her seferinde tam giriş oynar.
(() => {
  try {
    if (sessionStorage.getItem('quet-intro-seen')) document.documentElement.classList.add('intro-seen');
    else sessionStorage.setItem('quet-intro-seen', '1');
  } catch { /* storage unavailable: play the intro */ }
})();
