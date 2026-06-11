# BI Viário SEAT · Natal/RN

Dashboard interativo de análise de sinistros de trânsito da cidade de Natal/RN, desenvolvido para o **Setor de Estatística de Sinistro de Trânsito (SEAT · STTTU)**.

---

## ✨ Funcionalidades

- **Filtros cruzados**: clique em qualquer barra ou fatia de pizza para filtrar todos os demais gráficos simultaneamente
- **20+ gráficos** cobrindo dimensões temporais, geográficas, de perfil e de infraestrutura
- **3 mapas geoespaciais** (total, feridos, óbitos) com modos calor e pontos
- **Fullscreen** para cada mapa, com troca de modo funcional
- **Tema claro / escuro** com troca dinâmica inclusive nos mapas
- Leitura de CSV **ISO-8859-1 com separador ponto-e-vírgula**, sem upload para servidor (100% client-side)

---

## 📁 Estrutura do projeto

```
bi-viario/
├── index.html          # Entrada principal (HTML semântico)
├── css/
│   └── style.css       # Todos os estilos + variáveis de tema
├── js/
│   ├── data.js         # Leitura, parse do CSV e estado global
│   ├── filters.js      # Lógica de filtros e helpers
│   ├── charts.js       # Engine de gráficos (Chart.js)
│   ├── maps.js         # Mapas Leaflet (3 cards + fullscreen)
│   └── theme.js        # Alternância claro / escuro
└── assets/
    └── logo.js         # Logo SEAT em base64 (gerado automaticamente)
```

---

## 🚀 Como usar

### Localmente (sem servidor)
Basta abrir `index.html` no navegador — não requer instalação nem servidor.

> **Atenção**: alguns navegadores bloqueiam `file://` para múltiplos scripts. Nesse caso, use um servidor local simples:

```bash
# Python 3
python -m http.server 8080

# Node.js (npx)
npx serve .
```

Depois acesse `http://localhost:8080`.

### No GitHub Pages
1. Faça push do repositório para o GitHub
2. Vá em **Settings → Pages**
3. Selecione a branch `main` e pasta `/root`
4. O dashboard estará disponível em `https://<usuario>.github.io/<repo>`

---

## 📊 Formato do CSV esperado

| Campo | Descrição |
|-------|-----------|
| `NÚMERO BOAT` | Identificador único do acidente |
| `ANO`, `MÊS`, `DIA DA SEMANA`, `HORA ACIDENTE` | Dimensões temporais |
| `PERÍODO DO DIA` | MADRUGADA / MANHÃ / TARDE / NOITE |
| `BAIRRO`, `VIA`, `VIA ZONA` | Localização |
| `LOCALIZAÇÃO` | Coordenadas no formato `lat,lng` |
| `NATUREZA` | Tipo do acidente |
| `TIPO VEÍCULO`, `MARCA`, `CATEGORIA` | Perfil do veículo |
| `SEXO`, `FAIXA ETÁRIA`, `ESTADO FÍSICO` | Perfil do envolvido |
| `CONDIÇÃO TEMPO`, `CONDIÇÃO PISTA`, `TIPO PISTA` | Condições da via |
| `FORMATO PISTA`, `CONDIÇÃO LUMINOSIDADE`, `TIPO LUMINOSIDADE` | Infraestrutura |
| `SINALIZAÇÃO` | Tipos de sinalização (lista separada por vírgula) |

**Encoding**: ISO-8859-1 · **Separador**: ponto-e-vírgula (`;`)

---

## 🛠 Tecnologias

| Biblioteca | Versão | Uso |
|-----------|--------|-----|
| [Chart.js](https://www.chartjs.org/) | 4.4.1 | Gráficos interativos |
| [Leaflet](https://leafletjs.com/) | 1.9.4 | Mapas interativos |
| [Leaflet.heat](https://github.com/Leaflet/Leaflet.heat) | 0.2.0 | Mapa de calor |
| [CartoCDN](https://carto.com/basemaps/) | — | Tiles de mapa (dark/light) |
| [Google Fonts](https://fonts.google.com/) | — | Syne + DM Sans |

Nenhum framework JS, nenhum bundler, nenhuma dependência de build.

---

## 📝 Licença

Uso interno — STTTU · Prefeitura Municipal de Natal/RN.
