/* ============================================================
   filters.js — Gerenciamento de filtros e helpers
   ============================================================ */

/* eslint-disable no-unused-vars */

/* ── Helpers ─────────────────────────────────────────────── */
function setStatus(t){ document.getElementById('status').textContent = t; }
function col(row, name){ return (row[name] || '').trim(); }

function dedup(rows){
  const s = new Set(), res = [];
  for(const r of rows){
    const b = col(r,'NÚMERO BOAT');
    if(b && !s.has(b)){ s.add(b); res.push(r); }
  }
  return res;
}

function countBy(rows, field){
  const m = {};
  for(const r of rows){ const v = col(r,field)||'N/I'; m[v] = (m[v]||0)+1; }
  return Object.entries(m).sort((a,b) => b[1]-a[1]);
}

/* ── Filtro principal ────────────────────────────────────── */
function getF(){
  let d = RAW;
  if(F.ano)    d = d.filter(r => col(r,'ANO') === F.ano);
  if(F.mes)    d = d.filter(r => col(r,'MÊS') === F.mes);
  if(F.per)    d = d.filter(r => col(r,'PERÍODO DO DIA') === F.per);
  if(F.bairro) d = d.filter(r => col(r,'BAIRRO') === F.bairro);
  if(F.via)    d = d.filter(r => col(r,'VIA') === F.via);
  if(F.zona)   d = d.filter(r => col(r,'VIA ZONA') === F.zona);
  if(F.nat)    d = d.filter(r => col(r,'NATUREZA') === F.nat);
  if(F.veic)   d = d.filter(r => col(r,'TIPO VEÍCULO') === F.veic);
  if(F.cat)    d = d.filter(r => col(r,'CATEGORIA') === F.cat);
  if(F.sexo)   d = d.filter(r => col(r,'SEXO') === F.sexo);
  if(F.ef)     d = d.filter(r => col(r,'ESTADO FÍSICO') === F.ef);
  if(F.dia)    d = d.filter(r => col(r,'DIA DA SEMANA') === F.dia);
  if(F.hora)   d = d.filter(r => (col(r,'HORA ACIDENTE')||'').slice(0,2) === F.hora);
  if(F.tempo)  d = d.filter(r => col(r,'CONDIÇÃO TEMPO') === F.tempo);
  if(F.pista)  d = d.filter(r => col(r,'CONDIÇÃO PISTA') === F.pista);
  if(F.tpista) d = d.filter(r => col(r,'TIPO PISTA') === F.tpista);
  if(F.fmt)    d = d.filter(r => col(r,'FORMATO PISTA') === F.fmt || col(r,'GEOMETRIA') === F.fmt);
  if(F.tlum)   d = d.filter(r => col(r,'TIPO ILUMINAÇÃO') === F.tlum || col(r,'TIPO ILUMINACAO') === F.tlum);
  if(F.sinal)  d = d.filter(r => (col(r,'SINALIZAÇÃO')||col(r,'SINALIZACAO')||'').includes(F.sinal));
  if(F.lum)    d = d.filter(r => col(r,'CONDIÇÃO LUMINOSIDADE').toUpperCase().trim() === F.lum);
  if(F.marca)  d = d.filter(r => col(r,'MARCA') === F.marca);
  if(F.faixa)  d = d.filter(r => col(r,'FAIXA ETÁRIA') === F.faixa);
  return d;
}

/* ── Mapa de filtros vinculados aos <select> da sidebar ──── */
const FMAP = {
  ano:'fano', mes:'fmes', per:'fper', bairro:'fbairro', via:'fvia',
  zona:'fzona', nat:'fnat', veic:'fveic', cat:'fcat', sexo:'fsexo', ef:'fef'
};

const FLBL = {
  ano:'Ano', mes:'Mês', per:'Período', bairro:'Bairro', via:'Via', zona:'Zona',
  nat:'Natureza', veic:'Veículo', cat:'Categoria', sexo:'Sexo', ef:'Estado Físico',
  dia:'Dia', hora:'Hora', tempo:'Tempo', pista:'Condição da pista',
  tpista:'Tipo de pista', fmt:'Geometria', tlum:'Tipo de iluminação',
  sinal:'Sinalização', lum:'Luminosidade', marca:'Marca', faixa:'Faixa Etária'
};

/* ── Ações de filtro ─────────────────────────────────────── */
function setF(k, v){
  if(F[k] === v) delete F[k]; else F[k] = v;
  syncSels(); updChips(); renderAll(); updMap();
}

function applyF(){
  F = {};
  Object.entries(FMAP).forEach(([k,id]) => {
    const v = document.getElementById(id).value;
    if(v) F[k] = v;
  });
  updChips(); renderAll(); updMap();
}

function resetAll(){ F = {}; syncSels(); updChips(); renderAll(); updMap(); }

function syncSels(){
  Object.entries(FMAP).forEach(([k,id]) => document.getElementById(id).value = F[k]||'');
}

function updChips(){
  document.getElementById('chips').innerHTML =
    Object.entries(F).map(([k,v]) =>
      `<div class="chip" onclick="setF('${k}','${v.replace(/'/g,"\\'")}')">
        <b>${FLBL[k]}:</b>&nbsp;${v.length>12?v.slice(0,11)+'…':v}&nbsp;✕</div>`
    ).join('');
}

/* ── Popula os <select> da sidebar ───────────────────────── */
function populateSels(){
  const acc = dedup(RAW);
  function fill(id, field, src, ord){
    const sel = document.getElementById(id);
    let vals = [...new Set(src.map(r => col(r,field)).filter(Boolean))];
    if(ord) vals = ord.filter(x => vals.includes(x));
    else vals.sort();
    vals.forEach(v => {
      const o = document.createElement('option');
      o.value = v; o.textContent = v; sel.appendChild(o);
    });
  }
  fill('fano',    'ANO',           acc);
  fill('fmes',    'MÊS',           acc, MESES);
  fill('fper',    'PERÍODO DO DIA',acc, ['MADRUGADA','MANHÃ','TARDE','NOITE','NÃO IDENTIFICADO']);
  fill('fbairro', 'BAIRRO',        acc);
  fill('fvia',    'VIA',           acc);
  fill('fzona',   'VIA ZONA',      acc);
  fill('fnat',    'NATUREZA',      acc);
  fill('fveic',   'TIPO VEÍCULO',  RAW);
  fill('fcat',    'CATEGORIA',     RAW);
  fill('fsexo',   'SEXO',          RAW);
  fill('fef',     'ESTADO FÍSICO', RAW, ['ILESO','FERIDO','ÓBITO','NÃO IDENTIFICADO']);
}
