/* ============================================================
   theme.js — Alternância de tema claro / escuro
   ============================================================ */

/* eslint-disable no-unused-vars */

let DARK_MODE = true;

function toggleTheme(){
  DARK_MODE = !DARK_MODE;
  const html = document.documentElement;
  const btn  = document.getElementById('theme-toggle');

  if(DARK_MODE){
    html.classList.remove('light');
    btn.textContent = '🌙 Escuro';
  } else {
    html.classList.add('light');
    btn.textContent = '☀️ Claro';
  }

  /* Troca tile layer de todos os mapas abertos */
  const newUrl    = getTileUrl();
  const allStates = [MAP_STATE.all, MAP_STATE.ferido, MAP_STATE.obito, FS_STATE];
  allStates.forEach(st=>{
    if(st.map && st.tileLayer){
      st.map.removeLayer(st.tileLayer);
      st.tileLayer = L.tileLayer(newUrl, { attribution:'© OSM © CARTO', maxZoom:19 }).addTo(st.map);
    }
  });

  /* Re-renderiza gráficos com as novas cores do tema */
  if(typeof renderAll === 'function' && CH && Object.keys(CH).length) renderAll();
}
