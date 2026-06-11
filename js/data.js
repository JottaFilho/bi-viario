/* ============================================================
   data.js — Leitura e parse do CSV
   ============================================================ */

/* eslint-disable no-unused-vars */

/* ── Logo inline ─────────────────────────────────────────── */
/* A constante LOGO_B64 é definida em logo.js (gerada automaticamente).
   Se preferir hospedar a imagem, substitua por: const LOGO_B64 = 'assets/logo.png'; */

/* ── Constantes de ordenação ─────────────────────────────── */
const MESES  = ['JANEIRO','FEVEREIRO','MARÇO','ABRIL','MAIO','JUNHO',
                'JULHO','AGOSTO','SETEMBRO','OUTUBRO','NOVEMBRO','DEZEMBRO'];
const DIAS   = ['SEGUNDA-FEIRA','TERÇA-FEIRA','QUARTA-FEIRA',
                'QUINTA-FEIRA','SEXTA-FEIRA','SÁBADO','DOMINGO'];
const FAIXAS = ['ATÉ 10 ANOS','11 A 19 ANOS','20 A 29 ANOS','30 A 39 ANOS',
                '40 A 49 ANOS','50 A 59 ANOS','MAIORES DE 60 ANOS'];

/* ── Estado global ───────────────────────────────────────── */
let RAW = [], CH = {}, F = {}, lmap = null, hLayers = {}, curMap = 'all';

/* ── Carregamento do arquivo ─────────────────────────────── */
function loadFile(f){
  if(!f) return;
  setStatus('Carregando...');
  const r = new FileReader();
  r.onload = e => {
    RAW = parseCSV(e.target.result);
    if(RAW.length < 2){ setStatus('Erro: CSV inválido'); return; }
    document.getElementById('land').style.display = 'none';
    document.getElementById('app').style.display  = 'flex';
    const boats = dedup(RAW).length;
    setStatus(RAW.length.toLocaleString('pt-BR') + ' reg · ' + boats.toLocaleString('pt-BR') + ' BOATs');
    populateSels();
    renderAll();
    initMap();
    // Força re-render dos mapas após tudo estar visível
    setTimeout(()=>{ ['all','ferido','obito'].forEach(t=>{ if(MAP_STATE[t].map) MAP_STATE[t].map.invalidateSize(); }); }, 500);
    setTimeout(()=>{ ['all','ferido','obito'].forEach(t=>{ if(MAP_STATE[t].map) MAP_STATE[t].map.invalidateSize(); }); }, 1200);
  };
  r.readAsText(f, 'ISO-8859-1');
}

/* ── Parser CSV (suporte a ";" e ",", aspas) ─────────────── */
function parseCSV(txt){
  const lines = txt.replace(/\r/g,'').split('\n').filter(l=>l.trim());
  if(!lines.length) return [];
  const sep = lines[0].split(';').length > lines[0].split(',').length ? ';' : ',';
  const hdrs = splitL(lines[0], sep);
  return lines.slice(1).map(line => {
    const v = splitL(line, sep), row = {};
    hdrs.forEach((h,i) => row[h] = (v[i]||'').trim());
    return row;
  });
}

function splitL(line, sep){
  const p = []; let cur = '', inQ = false;
  for(let i = 0; i < line.length; i++){
    const c = line[i];
    if(c === '"'){ inQ = !inQ; }
    else if(c === sep && !inQ){ p.push(cur.replace(/^"|"$/g,'')); cur = ''; }
    else cur += c;
  }
  p.push(cur.replace(/^"|"$/g,''));
  return p;
}
