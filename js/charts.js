/* ============================================================
   charts.js — Engine de gráficos (Chart.js)
   ============================================================ */

/* eslint-disable no-unused-vars */

/* Registra o plugin de rótulos de dados globalmente (carregado via CDN no index.html) */
if(typeof Chart !== 'undefined' && typeof ChartDataLabels !== 'undefined'){
  Chart.register(ChartDataLabels);
  Chart.defaults.set('plugins.datalabels', { display: true });
}

/* ── Helpers de cor dinâmica (dark / light) ──────────────── */
function GR(){ return document.documentElement.classList.contains('light') ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.04)'; }
function TX(){ return document.documentElement.classList.contains('light') ? '#1a2e42' : '#c8d8e8'; }
function MU(){ return document.documentElement.classList.contains('light') ? '#5a7a96' : '#5a7a9a'; }

/* ── Criação / substituição de gráfico ───────────────────── */
function mk(id, cfg){
  if(CH[id]) CH[id].destroy();
  const c = document.getElementById(id);
  if(!c) return;
  CH[id] = new Chart(c, cfg);
}

/* ── Fábrica: gráfico de barras ──────────────────────────── */
function bar(labels, data, color, ck, h=false){
  return {
    type: 'bar',
    data: { labels, datasets: [{ data, backgroundColor: color+'99', hoverBackgroundColor: color, borderRadius: 3, borderSkipped: false }] },
    options: {
      indexAxis: h ? 'y' : 'x',
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: h ? {right:28} : {top:18} },
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: c => ' ' + c.raw.toLocaleString('pt-BR') } },
        datalabels: {
          color: TX(),
          font: { size: 9, weight: '600' },
          anchor: 'end',
          align: h ? 'right' : 'top',
          offset: 2,
          formatter: v => v ? v.toLocaleString('pt-BR') : ''
        }
      },
      scales: {
        x: { ticks: { color: h ? MU() : TX(), font: {size:10}, autoSkip: false, maxRotation: h ? 0 : 35 }, grid: { color: GR() }, border: { color: 'transparent' } },
        y: { ticks: { color: h ? TX() : MU(), font: {size:10} }, grid: { color: GR() }, border: { color: 'transparent' } }
      },
      onClick: ck ? (e,els) => { if(els.length) setF(ck, labels[els[0].index]); } : undefined
    }
  };
}

/* ── Fábrica: gráfico de rosca (doughnut) ────────────────── */
function donut(labels, data, colors, ck){
  return {
    type: 'doughnut',
    data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 0, hoverOffset: 6 }] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'right', labels: { color: TX(), boxWidth: 10, font: {size:10} } },
        datalabels: {
          color: '#fff',
          font: { size: 10, weight: '700' },
          formatter: (v, ctx) => {
            const total = ctx.dataset.data.reduce((a,b)=>a+b,0);
            const pct = total ? (v/total*100) : 0;
            return pct >= 5 ? pct.toFixed(0)+'%' : '';
          }
        }
      },
      onClick: ck ? (e,els) => { if(els.length) setF(ck, labels[els[0].index]); } : undefined
    }
  };
}

/* ── renderAll: reconstrói todos os gráficos ─────────────── */
function renderAll(){
  const all = getF(), acc = dedup(all);

  /* KPIs */
  document.getElementById('k1').textContent = acc.length.toLocaleString('pt-BR');
  document.getElementById('k2').textContent = all.length.toLocaleString('pt-BR');
  document.getElementById('k3').textContent = all.filter(r=>col(r,'ESTADO FÍSICO')==='FERIDO').length.toLocaleString('pt-BR');
  document.getElementById('k4').textContent = all.filter(r=>col(r,'ESTADO FÍSICO')==='ÓBITO').length.toLocaleString('pt-BR');

  /* ── TEMPORAL ────────────────────────────────────────── */
  const byYr = countBy(acc,'ANO'), anos = byYr.map(e=>e[0]).sort();
  mk('cano', bar(anos, anos.map(a=>byYr.find(e=>e[0]===a)[1]), '#00d4ff', 'ano'));

  const mesMap = Object.fromEntries(countBy(acc,'MÊS'));
  const mesL   = MESES.filter(m=>mesMap[m]);
  mk('cmes', bar(mesL, mesL.map(m=>mesMap[m]||0), '#06d6b0', 'mes'));

  const diaMap = Object.fromEntries(countBy(acc,'DIA DA SEMANA'));
  mk('cdia', bar(DIAS, DIAS.map(d=>diaMap[d]||0), '#a78bfa', 'dia'));

  const hMap = {};
  acc.forEach(r=>{ const h=col(r,'HORA ACIDENTE').slice(0,2); if(/^\d{2}$/.test(h)) hMap[h]=(hMap[h]||0)+1; });
  const hrs = Array.from({length:24},(_,i)=>String(i).padStart(2,'0'));
  mk('chora', bar(hrs, hrs.map(h=>hMap[h]||0), '#fbbf24', 'hora'));

  const perOrd = ['MADRUGADA','MANHÃ','TARDE','NOITE'];
  const perMap = Object.fromEntries(countBy(acc,'PERÍODO DO DIA'));
  const perL   = perOrd.filter(p=>perMap[p]);
  mk('cper', bar(perL, perL.map(p=>perMap[p]||0), '#fbbf24', 'per'));

  const lumRaw  = countBy(acc,'CONDIÇÃO LUMINOSIDADE');
  const lumNorm = {};
  lumRaw.forEach(([k,v])=>{ const kn=k.toUpperCase().trim(); lumNorm[kn]=(lumNorm[kn]||0)+v; });
  const lumD = Object.entries(lumNorm).filter(e=>e[0]!=='NÃO IDENTIFICADO').sort((a,b)=>b[1]-a[1]).slice(0,7);
  mk('clum', bar(lumD.map(e=>e[0].length>20?e[0].slice(0,18)+'…':e[0]), lumD.map(e=>e[1]), '#a78bfa', 'lum'));

  /* ── LOCALIZAÇÃO ─────────────────────────────────────── */
  const bdD = countBy(acc,'BAIRRO').filter(e=>e[0]&&e[0]!=='NÃO IDENTIFICADO').slice(0,10);
  mk('cbairro', bar(bdD.map(e=>e[0]), bdD.map(e=>e[1]), '#00d4ff', 'bairro', true));

  const vdD = countBy(acc,'VIA').filter(e=>e[0]&&e[0]!=='NÃO IDENTIFICADO').slice(0,10);
  mk('cvia', bar(vdD.map(e=>e[0]), vdD.map(e=>e[1]), '#22d3a5', 'via', true));

  const zonaD = countBy(acc,'VIA ZONA').filter(e=>e[0]&&e[0]!=='NÃO IDENTIFICADO');
  mk('czona', donut(zonaD.map(e=>e[0]), zonaD.map(e=>e[1]), ['#00d4ff','#22d3a5','#fbbf24','#f43f5e','#a78bfa'], 'zona'));

  const natD = countBy(acc,'NATUREZA').filter(e=>e[0]!=='NÃO IDENTIFICADO').slice(0,10);
  mk('cnat', bar(natD.map(e=>e[0].length>22?e[0].slice(0,20)+'…':e[0]), natD.map(e=>e[1]), '#fbbf24', 'nat'));

  /* ── TIPOLOGIA E PERFIL ──────────────────────────────── */
  const topV = countBy(all,'TIPO VEÍCULO').filter(e=>e[0]!=='NÃO IDENTIFICADO').slice(0,7).map(e=>e[0]);
  mk('cveicef', {
    type: 'bar',
    data: { labels: topV.map(v=>v.length>16?v.slice(0,14)+'…':v), datasets: [
      { label:'Ileso',  data: topV.map(t=>all.filter(r=>col(r,'TIPO VEÍCULO')===t&&col(r,'ESTADO FÍSICO')==='ILESO').length),  backgroundColor:'#2563eb88', borderRadius:2 },
      { label:'Ferido', data: topV.map(t=>all.filter(r=>col(r,'TIPO VEÍCULO')===t&&col(r,'ESTADO FÍSICO')==='FERIDO').length), backgroundColor:'#fbbf2488', borderRadius:2 },
      { label:'Óbito',  data: topV.map(t=>all.filter(r=>col(r,'TIPO VEÍCULO')===t&&col(r,'ESTADO FÍSICO')==='ÓBITO').length),  backgroundColor:'#f43f5e88', borderRadius:2 }
    ]},
    options: {
      responsive:true, maintainAspectRatio:false,
      plugins: {
        legend: { labels: { color:TX(), boxWidth:10, font:{size:10} } },
        datalabels: {
          color: '#fff',
          font: { size: 8, weight: '600' },
          formatter: v => v > 0 ? v.toLocaleString('pt-BR') : ''
        }
      },
      scales: {
        x: { stacked:true, ticks:{ color:TX(), font:{size:9} }, grid:{ color:GR() }, border:{ color:'transparent' } },
        y: { stacked:true, ticks:{ color:MU(), font:{size:10} }, grid:{ color:GR() }, border:{ color:'transparent' } }
      },
      onClick: (e,els) => { if(els.length) setF('veic', topV[els[0].index]); }
    }
  });

  const mD = countBy(all,'MARCA').filter(e=>e[0]&&e[0]!=='0'&&e[0]!=='NÃO IDENTIFICADO').slice(0,12);
  mk('cmarca', bar(mD.map(e=>e[0]), mD.map(e=>e[1]), '#06d6b0', 'marca', true));

  const sxD = countBy(all,'SEXO').filter(e=>e[0]!=='NÃO IDENTIFICADO');
  mk('csexo', donut(sxD.map(e=>e[0]), sxD.map(e=>e[1]), ['#00d4ff','#e879f9','#22d3a5'], 'sexo'));

  const fMap = Object.fromEntries(countBy(all,'FAIXA ETÁRIA'));
  const fL   = FAIXAS.filter(f=>fMap[f]);
  mk('cfaixa', {
    type: 'bar',
    data: { labels: fL.map(f=>f.replace('ATÉ ','<').replace(' ANOS','').replace('MAIORES DE 60','60+')),
            datasets: [{ data: fL.map(f=>fMap[f]||0), backgroundColor:'#06d6b099', hoverBackgroundColor:'#06d6b0', borderRadius:3, borderSkipped:false }] },
    options: {
      responsive:true, maintainAspectRatio:false,
      layout: { padding: {top:18} },
      plugins: {
        legend:{display:false},
        tooltip:{ callbacks:{ label:c=>' '+c.raw.toLocaleString('pt-BR') } },
        datalabels: { color: TX(), font:{size:9,weight:'600'}, anchor:'end', align:'top', offset:2, formatter: v => v ? v.toLocaleString('pt-BR') : '' }
      },
      scales: {
        x: { ticks:{ color:TX(), font:{size:10} }, grid:{ color:GR() }, border:{ color:'transparent' } },
        y: { ticks:{ color:MU(), font:{size:10} }, grid:{ color:GR() }, border:{ color:'transparent' } }
      },
      onClick: (e,els) => { if(els.length) setF('faixa', fL[els[0].index]); }
    }
  });

  const catD = countBy(all,'CATEGORIA').filter(e=>e[0]!=='NÃO IDENTIFICADO');
  mk('ccat', donut(catD.map(e=>e[0]), catD.map(e=>e[1]), ['#00d4ff','#22d3a5','#fbbf24','#f43f5e','#a78bfa','#06d6b0'], 'cat'));

  const efD = countBy(all,'ESTADO FÍSICO').filter(e=>e[0]!=='NÃO IDENTIFICADO');
  mk('cef', donut(efD.map(e=>e[0]), efD.map(e=>e[1]), ['#2563eb','#fbbf24','#f43f5e'], 'ef'));

  /* ── VIA E AMBIENTE ──────────────────────────────────── */
  const tmpD = countBy(acc,'CONDIÇÃO TEMPO').filter(e=>e[0]!=='NÃO IDENTIFICADO').slice(0,7);
  mk('ctempo', bar(tmpD.map(e=>e[0]), tmpD.map(e=>e[1]), '#38bdf8', 'tempo'));

  const pstD = countBy(acc,'CONDIÇÃO PISTA').filter(e=>e[0]!=='NÃO IDENTIFICADO').slice(0,8);
  mk('cpista', bar(pstD.map(e=>e[0].length>20?e[0].slice(0,18)+'…':e[0]), pstD.map(e=>e[1]), '#8b5cf6', 'pista'));

  const tpD = countBy(acc,'TIPO PISTA').filter(e=>e[0]&&!['NÃO IDENTIFICADO','BOM',' '].includes(e[0])).slice(0,6);
  mk('ctpista', bar(tpD.map(e=>e[0]), tpD.map(e=>e[1]), '#06d6b0', 'tpista'));

  function fmtCat(s){
    if(!s||s==='0') return null;
    const u = s.toUpperCase();
    for(const k of ['RETA','CRUZAMENTO','ROTATÓRIA','ENTRONCAMENTO','CURVA','DECLIVE SUAVE','ACLIVE SUAVE','BIFURCAÇÃO','RETORNO','OUTROS'])
      if(u.includes(k)) return k;
    return u.split(' ')[0];
  }
  const fmtMap = {};
  acc.forEach(r=>{ const v=fmtCat(col(r,'FORMATO PISTA')); if(v) fmtMap[v]=(fmtMap[v]||0)+1; });
  const fmtD = Object.entries(fmtMap).sort((a,b)=>b[1]-a[1]).slice(0,8);
  mk('cfmt', bar(fmtD.map(e=>e[0]), fmtD.map(e=>e[1]), '#fbbf24', 'fmt'));

  const tlRaw  = countBy(acc,'TIPO LUMINOSIDADE');
  const tlNorm = {};
  tlRaw.forEach(([k,v])=>{ const kn=k.toUpperCase().trim(); tlNorm[kn]=(tlNorm[kn]||0)+v; });
  const tlD = Object.entries(tlNorm).filter(e=>e[0]!=='NÃO IDENTIFICADO').sort((a,b)=>b[1]-a[1]);
  mk('ctlum', bar(tlD.map(e=>e[0].charAt(0)+e[0].slice(1).toLowerCase()), tlD.map(e=>e[1]), '#fbbf24', 'tlum'));

  const sigMap = {};
  acc.forEach(r=>{
    const s = col(r,'SINALIZAÇÃO'); if(!s) return;
    const k = s.split(',')[0].trim().replace('(S)','').trim();
    if(k) sigMap[k] = (sigMap[k]||0)+1;
  });
  const sigD = Object.entries(sigMap).sort((a,b)=>b[1]-a[1]).slice(0,8);
  mk('csinal', bar(sigD.map(e=>e[0].length>20?e[0].slice(0,18)+'…':e[0]), sigD.map(e=>e[1]), '#a78bfa', 'sinal', true));

  /* ── COMPARATIVO ACIDENTES × ENVOLVIDOS POR ANO ──────── */
  const allYrs = [...new Set(RAW.map(r=>col(r,'ANO')).filter(Boolean))].sort();
  const yrAcc  = allYrs.map(y=>dedup(getF().filter(r=>col(r,'ANO')===y)).length);
  const yrEnv  = allYrs.map(y=>getF().filter(r=>col(r,'ANO')===y).length);
  mk('ccomp', {
    type: 'bar',
    data: { labels: allYrs, datasets: [
      { label:'BOATs únicos', data:yrAcc, backgroundColor:'#0ea5e988', borderRadius:3 },
      { label:'Envolvidos',   data:yrEnv, backgroundColor:'#fbbf2466', borderRadius:3 }
    ]},
    options: {
      responsive:true, maintainAspectRatio:false,
      layout: { padding: {top:18} },
      plugins: {
        legend: { labels: { color:TX(), boxWidth:10, font:{size:10} } },
        datalabels: { color: TX(), font:{size:8,weight:'600'}, anchor:'end', align:'top', offset:1, formatter: v => v ? v.toLocaleString('pt-BR') : '' }
      },
      scales: {
        x: { ticks:{ color:TX(), font:{size:10} }, grid:{ color:GR() }, border:{ color:'transparent' } },
        y: { ticks:{ color:MU(), font:{size:10} }, grid:{ color:GR() }, border:{ color:'transparent' } }
      },
      onClick: (e,els) => { if(els.length) setF('ano', allYrs[els[0].index]); }
    }
  });

  /* Atualiza mapas com dados filtrados */
  updTripleMaps();
}
