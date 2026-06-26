/* ============================================================
   data.js — Leitura, parse e carregamento do CSV
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

/* ── Fonte da planilha Google Sheets (publicada como CSV) ── */
/* Para trocar a planilha, basta alterar esta URL.
   Formato esperado: .../export?format=csv (export direto da aba 1) */
const SHEETS_CSV_URL = 'https://docs.google.com/spreadsheets/d/1dYwyb90r-Bzf5eRxu0n8JAxYqCPiM44880bCyllZObI/export?format=csv';

/* ── Estado global ───────────────────────────────────────── */
let RAW = [], CH = {}, F = {}, lmap = null, hLayers = {}, curMap = 'all';

/* ── Boot comum após RAW estar populado ──────────────────── */
function bootData(originLabel){
  if(!RAW || RAW.length < 2){ setStatus('Erro: base inválida ou vazia'); return false; }
  document.getElementById('land').style.display = 'none';
  document.getElementById('app').style.display  = 'flex';
  const boats = dedup(RAW).length;
  setStatus(RAW.length.toLocaleString('pt-BR') + ' reg · ' + boats.toLocaleString('pt-BR') + ' BOATs' + (originLabel ? ' · ' + originLabel : ''));
  populateSels();
  renderAll();
  initMap();
  // Força re-render dos mapas após tudo estar visível
  setTimeout(()=>{ ['all','ferido','obito'].forEach(t=>{ if(MAP_STATE[t].map) MAP_STATE[t].map.invalidateSize(); }); }, 500);
  setTimeout(()=>{ ['all','ferido','obito'].forEach(t=>{ if(MAP_STATE[t].map) MAP_STATE[t].map.invalidateSize(); }); }, 1200);
  return true;
}

/* ── Carregamento via upload manual ──────────────────────── */
function loadFile(f){
  if(!f) return;
  setStatus('Carregando arquivo...');
  const r = new FileReader();
  r.onload = e => {
    RAW = parseCSV(e.target.result);
    bootData('arquivo local');
  };
  r.readAsText(f, 'ISO-8859-1');
}

/* ── Carregamento automático via Google Sheets ───────────── */
/* Chamado automaticamente ao abrir o dashboard. Em caso de falha
   (CORS, planilha não publicada, sem internet, execução via file://)
   o usuário cai de volta na tela de upload manual, sem travar a aplicação. */

/* Proxy público usado apenas como contingência de CORS quando o fetch
   direto ao Google Sheets é bloqueado pelo navegador. Não envia nem
   armazena credenciais — apenas repassa a resposta CSV pública. */
const CORS_PROXY = 'https://corsproxy.io/?url=';

function isFileProtocol(){
  return location.protocol === 'file:';
}

async function fetchSheetCSV(){
  // 1ª tentativa: fetch direto
  try{
    const resp = await fetch(SHEETS_CSV_URL, { cache: 'no-store' });
    if(resp.ok) return await resp.text();
    throw new Error('HTTP ' + resp.status);
  } catch(directErr){
    // 2ª tentativa: via proxy CORS (só faz sentido se não estivermos em file://,
    // mas ainda assim tentamos pois alguns navegadores liberam fetch para https
    // a partir de file:// dependendo de flags/extensões)
    try{
      const proxyUrl = CORS_PROXY + encodeURIComponent(SHEETS_CSV_URL);
      const resp2 = await fetch(proxyUrl, { cache: 'no-store' });
      if(resp2.ok) return await resp2.text();
      throw new Error('Proxy HTTP ' + resp2.status);
    } catch(proxyErr){
      // Propaga o erro original (mais relevante para diagnóstico)
      throw directErr;
    }
  }
}

async function loadFromSheets(){
  const landStatus = document.getElementById('land-status');

  if(isFileProtocol()){
    // Sem servidor HTTP não há como o navegador buscar a planilha:
    // toda página aberta via file:// tem origin "null" e é sempre bloqueada.
    if(landStatus){
      landStatus.innerHTML =
        '⚠️ O dashboard foi aberto direto do disco (<code>file://</code>), então o navegador bloqueia '
        + 'o acesso à planilha por segurança.<br><br>'
        + 'Para carregar automaticamente, sirva a pasta por um servidor local — '
        + 'veja as instruções no <b>README.md</b> (seção "Como usar") — ou selecione um CSV manualmente abaixo.';
      landStatus.style.color = 'var(--amber)';
    }
    return;
  }

  if(landStatus) landStatus.textContent = 'Conectando à planilha do Google Sheets...';

  try{
    const text = await fetchSheetCSV();
    const parsed = parseCSV(text);
    if(parsed.length < 2) throw new Error('Planilha vazia ou em formato inesperado');

    RAW = parsed;
    bootData('Google Sheets');
  } catch(err){
    console.warn('Falha ao carregar do Google Sheets:', err);
    if(landStatus){
      landStatus.innerHTML = '⚠️ Não foi possível carregar a planilha automaticamente '
        + '(verifique se ela está compartilhada como "Qualquer pessoa com o link").<br>'
        + 'Selecione um arquivo CSV manualmente abaixo.';
      landStatus.style.color = 'var(--amber)';
    }
  }
}

/* ── Recarrega a planilha estando já dentro do dashboard ── */
async function reloadFromSheets(){
  if(isFileProtocol()){
    setStatus('Não é possível atualizar via file:// — sirva por http(s) ou use upload manual');
    return;
  }
  setStatus('Atualizando da planilha...');
  try{
    const text = await fetchSheetCSV();
    const parsed = parseCSV(text);
    if(parsed.length < 2) throw new Error('Planilha vazia ou em formato inesperado');
    RAW = parsed;
    F = {}; syncSels(); updChips();
    bootData('Google Sheets · atualizado');
  } catch(err){
    console.warn('Falha ao atualizar da planilha:', err);
    setStatus('Erro ao atualizar da planilha — mantendo dados atuais');
  }
}

/* ── Parser CSV (suporte a ";" e ",", aspas, BOM, CRLF/CR) ── */
function parseCSV(txt){
  // Remove BOM (comum em exports do Google Sheets / Excel)
  if(txt.charCodeAt(0) === 0xFEFF) txt = txt.slice(1);
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
