/* ============================================================
   data.js — Versão com todas as variáveis globais restauradas
   ============================================================ */

// Variáveis essenciais que estavam faltando no erro (MESES, FAIXAS, etc)
const MESES  = ['JANEIRO','FEVEREIRO','MARÇO','ABRIL','MAIO','JUNHO',
                'JULHO','AGOSTO','SETEMBRO','OUTUBRO','NOVEMBRO','DEZEMBRO'];
const DIAS   = ['SEGUNDA-FEIRA','TERÇA-FEIRA','QUARTA-FEIRA',
                'QUINTA-FEIRA','SEXTA-FEIRA','SÁBADO','DOMINGO'];
const FAIXAS = ['ATÉ 10 ANOS','11 A 19 ANOS','20 A 29 ANOS','30 A 39 ANOS',
                '40 A 49 ANOS','50 A 59 ANOS','MAIORES DE 60 ANOS'];

let RAW = [], CH = {}, F = {}, lmap = null, hLayers = {}, curMap = 'all';

async function carregarAutomaticamente() {
    console.log("Iniciando carregamento...");
    try {
        const response = await fetch('base_de_dados_natal.csv');
        if (!response.ok) throw new Error("Arquivo não encontrado!");
        
        const buffer = await response.arrayBuffer();
        const decoder = new TextDecoder('iso-8859-1');
        const texto = decoder.decode(buffer);/* ============================================================
   data.js — Versão Organizada com URL Definida
   ============================================================ */

const MESES  = ['JANEIRO','FEVEREIRO','MARÇO','ABRIL','MAIO','JUNHO',
                'JULHO','AGOSTO','SETEMBRO','OUTUBRO','NOVEMBRO','DEZEMBRO'];
const DIAS   = ['SEGUNDA-FEIRA','TERÇA-FEIRA','QUARTA-FEIRA',
                'QUINTA-FEIRA','SEXTA-FEIRA','SÁBADO','DOMINGO'];
const FAIXAS = ['ATÉ 10 ANOS','11 A 19 ANOS','20 A 29 ANOS','30 A 39 ANOS',
                '40 A 49 ANOS','50 A 59 ANOS','MAIORES DE 60 ANOS'];

let RAW = [], CH = {}, F = {}, lmap = null, hLayers = {}, curMap = 'all';

async function carregarAutomaticamente() {
    // Definindo a URL de forma explícita
    const url = 'base_de_dados_natal.csv'; 
    
    console.log("Iniciando carregamento de:", url);
    
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Arquivo não encontrado!");
        
        const buffer = await response.arrayBuffer();
        const decoder = new TextDecoder('iso-8859-1');
        const texto = decoder.decode(buffer);
        
        RAW = parseCSV(texto);
        console.log("Arquivo carregado com sucesso. Total de linhas:", RAW.length);
        
        processarDados(texto);
    } catch (e) {
        console.error("Erro no carregamento automático:", e);
    }
}

function processarDados(textoCSV) {
    const land = document.getElementById('land');
    const app = document.getElementById('app');
    if(land) land.style.display = 'none';
    if(app) app.style.display = 'flex';
    
    // Verificando existência antes de chamar
    if(typeof populateSels === 'function') populateSels();
    if(typeof renderAll === 'function') renderAll();
    if(typeof initMap === 'function') initMap();
}

function loadFile(f){
    if(!f) return;
    const r = new FileReader();
    r.onload = e => {
        RAW = parseCSV(e.target.result);
        processarDados(e.target.result);
    };
    r.readAsText(f, 'ISO-8859-1');
}

function parseCSV(txt) {
    if (!txt) return [];
    const lines = txt.replace(/\r/g,'').split('\n').filter(l=>l.trim());
    if (lines.length < 2) return [];
    const sep = lines[0].split(';').length > lines[0].split(',').length ? ';' : ',';
    const hdrs = splitL(lines[0], sep);
    return lines.slice(1).map(line => {
        const v = splitL(line, sep), row = {};
        hdrs.forEach((h,i) => row[h] = (v[i]||'').trim());
        return row;
    });
}

function splitL(line, sep) {
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

// Inicialização garantida após carregamento da página
document.addEventListener('DOMContentLoaded', carregarAutomaticamente);
        
        RAW = parseCSV(texto);
        processarDados(texto);
    } catch (e) {
        console.error("Erro no carregamento:", e);
    }
}

function processarDados(textoCSV) {
    // Esconde tela de carga
    const land = document.getElementById('land');
    const app = document.getElementById('app');
    if(land) land.style.display = 'none';
    if(app) app.style.display = 'flex';
    
    // Chama as funções do seu projeto
    if(typeof populateSels === 'function') populateSels();
    if(typeof renderAll === 'function') renderAll();
    if(typeof initMap === 'function') initMap();
}

function loadFile(f){
    if(!f) return;
    const r = new FileReader();
    r.onload = e => {
        RAW = parseCSV(e.target.result);
        processarDados(e.target.result);
    };
    r.readAsText(f, 'ISO-8859-1');
}

function parseCSV(txt) {
    if (!txt) return [];
    const lines = txt.replace(/\r/g,'').split('\n').filter(l=>l.trim());
    if (lines.length < 2) return [];
    const sep = lines[0].split(';').length > lines[0].split(',').length ? ';' : ',';
    const hdrs = splitL(lines[0], sep);
    return lines.slice(1).map(line => {
        const v = splitL(line, sep), row = {};
        hdrs.forEach((h,i) => row[h] = (v[i]||'').trim());
        return row;
    });
}

function splitL(line, sep) {
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

document.addEventListener('DOMContentLoaded', carregarAutomaticamente);