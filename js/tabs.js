// ═══════════════════════════════════════════════════════════════════════
//  TAB SWITCHING
// ═══════════════════════════════════════════════════════════════════════
function switchTab(tab){
  activeTab=tab;
  document.querySelectorAll('.top-tab').forEach(t=>t.classList.toggle('active',t.dataset.tab===tab));
  document.querySelectorAll('.tab-content').forEach(c=>c.classList.toggle('active',c.dataset.tabContent===tab));
  document.querySelectorAll('.sidebar-tab-section').forEach(s=>s.classList.toggle('active',s.dataset.sidebar===tab));
}

