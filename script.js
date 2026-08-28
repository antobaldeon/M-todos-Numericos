// ============================================================
// MNLab · Métodos Numéricos · Sesión 3
// ============================================================

// 1. NAVEGACIÓN
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    if (link.classList.contains('locked')) {
      showLockedToast(link.querySelector('.nl-left').textContent.trim());
      return;
    }
    document.querySelectorAll('.nav-link').forEach(l => {
      l.classList.remove('active');
      l.setAttribute('aria-selected', 'false');
    });
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    link.classList.add('active');
    link.setAttribute('aria-selected', 'true');
    const panelId = link.dataset.tab;
    document.getElementById(panelId).classList.add('active');
  });
});

let lockedToastTimer = null;
function showLockedToast(name) {
  let toast = document.getElementById('locked-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'locked-toast';
    toast.className = 'locked-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = `🔒 "${name}" está bloqueado temporalmente.`;
  toast.classList.add('show');
  clearTimeout(lockedToastTimer);
  lockedToastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

// 2. TEMA
const themeToggle = document.getElementById('themeToggle');
const htmlElement = document.documentElement;
const savedTheme = localStorage.getItem('theme') || 'light';
htmlElement.setAttribute('data-theme', savedTheme);
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  });
}

// 3. CÓDIGO FUENTE
function toggleCode(id) {
  const el = document.getElementById(id);
  const btn = document.querySelector(`[aria-controls="${id}"]`);
  const isShown = el.classList.toggle('show');
  if (btn) btn.setAttribute('aria-expanded', String(isShown));
}

// 4. FUNCIONES DE LOS PROBLEMAS EXISTENTES
const funcs = {
  p1: (C) => 1 / (C - 8.5) - 0.35 * Math.log(C - 2),
  p2: (t) => 45 + 12 * t - 20 * Math.exp(0.4 * t),
  p3: (T) => T - (18 + 8 * Math.exp(-0.15 * T)),
  p4: (t) => t ** 3 - 7 * t - 5,
  p5: (x) => Math.exp(-x) - x ** 2 + 0.2
};

const fixedGs = {
  p3: (T) => 18 + 8 * Math.exp(-0.15 * T)
};

const derivatives = {
  p4: (t) => 3 * t ** 2 - 7
};

// 5. MÉTODOS NUMÉRICOS
function biseccion(f, a, b, tol, maxIter) {
  const rows = [];
  let xrAnt = null;
  for (let i = 1; i <= maxIter; i++) {
    const xr = (a + b) / 2;
    const fxr = f(xr);
    const err = xrAnt === null ? null : (xr !== 0 ? Math.abs((xr - xrAnt) / xr) * 100 : Math.abs(xr - xrAnt) * 100);
    rows.push({ i, a, b, xr, fxr, err });
    if (!isFinite(fxr)) break;
    if (fxr === 0 || (err !== null && err <= tol)) break;
    if (f(a) * fxr < 0) b = xr; else a = xr;
    xrAnt = xr;
  }
  return rows;
}

function falsaPosicion(f, a, b, tol, maxIter) {
  const rows = [];
  let xrAnt = null;
  for (let i = 1; i <= maxIter; i++) {
    const fa = f(a), fb = f(b);
    const den = fa - fb;
    if (den === 0) break;
    const xr = b - fb * (a - b) / den;
    const fxr = f(xr);
    const err = xrAnt === null ? null : (xr !== 0 ? Math.abs((xr - xrAnt) / xr) * 100 : Math.abs(xr - xrAnt) * 100);
    rows.push({ i, a, b, xr, fxr, err });
    if (!isFinite(fxr)) break;
    if (fxr === 0 || (err !== null && err <= tol)) break;
    if (fa * fxr < 0) b = xr; else a = xr;
    xrAnt = xr;
  }
  return rows;
}

function puntoFijo(g, f, x0, tol, maxIter) {
  const rows = [];
  let xPrev = x0;
  for (let i = 1; i <= maxIter; i++) {
    const x = g(xPrev);
    const fx = f(x);
    const err = i === 1 ? null : (x !== 0 ? Math.abs((x - xPrev) / x) * 100 : Math.abs(x - xPrev) * 100);
    rows.push({ i, xPrev, x, xr: x, fxr: fx, err });
    if (err !== null && err <= tol) break;
    if (!isFinite(x) || !isFinite(fx)) break;
    xPrev = x;
  }
  return rows;
}

function newtonRaphson(f, df, x0, tol, maxIter) {
  const rows = [];
  let xPrev = x0;
  for (let i = 1; i <= maxIter; i++) {
    const fx = f(xPrev);
    const dfx = df(xPrev);
    if (!isFinite(fx) || !isFinite(dfx) || Math.abs(dfx) < 1e-14) {
      rows.push({ i, xPrev, xr: xPrev, fxr: fx, dfx, err: null, invalid: true });
      break;
    }
    const x = xPrev - fx / dfx;
    const err = x !== 0 ? Math.abs((x - xPrev) / x) * 100 : Math.abs(x - xPrev) * 100;
    rows.push({ i, xPrev, xr: x, fxr: f(x), dfx, err });
    if (!isFinite(x) || !isFinite(f(x))) break;
    if (err <= tol) break;
    xPrev = x;
  }
  return rows;
}

function secante(f, x0, x1, tol, maxIter) {
  const rows = [];
  let prev = x0, curr = x1;
  for (let i = 1; i <= maxIter; i++) {
    const fPrev = f(prev), fCurr = f(curr);
    const den = fCurr - fPrev;
    if (!isFinite(den) || Math.abs(den) < 1e-14) {
      rows.push({ i, x0: prev, x1: curr, xr: curr, fxr: fCurr, err: null, invalid: true });
      break;
    }
    const x = curr - fCurr * (curr - prev) / den;
    const fx = f(x);
    const err = x !== 0 ? Math.abs((x - curr) / x) * 100 : Math.abs(x - curr) * 100;
    rows.push({ i, x0: prev, x1: curr, xr: x, fxr: fx, err });
    if (!isFinite(x) || !isFinite(fx)) break;
    if (err <= tol) break;
    prev = curr;
    curr = x;
  }
  return rows;
}

function fmt(n, d = 5) {
  if (n === null || n === undefined || !isFinite(n)) return '—';
  return n.toFixed(d);
}

// 6. GRÁFICO DE CONVERGENCIA
function smoothPath(pts) {
  if (pts.length < 3) {
    return pts.map((p, idx) => (idx === 0 ? 'M' : 'L') + p.x.toFixed(1) + ' ' + p.y.toFixed(1)).join(' ');
  }
  // Catmull-Rom -> Bézier cúbica: curva suave que pasa por cada punto real.
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

function buildChartSVG(rows, color) {
  const errs = rows.map(r => r.err).filter(e => e !== null && isFinite(e) && e > 0);
  if (errs.length === 0) return '';
  const w = 680, h = 210, pad = { l: 68, r: 16, t: 16, b: 34 };
  const maxErr = Math.max(...errs), minErr = Math.min(...errs);
  const logMax = Math.log10(maxErr);
  const logMin = Math.log10(Math.max(minErr, 1e-6));
  const span = (logMax - logMin) || 1;
  const inset = 22;
  const plotW = w - pad.l - pad.r - inset * 2, plotH = h - pad.t - pad.b;
  const gridColor = 'var(--border-color)', axisColor = 'var(--text-muted)';
  const textColor = 'var(--text-muted)', bgColor = 'var(--bg-card-alt)';
  const pts = rows.map((r, idx) => {
    const x = pad.l + inset + (idx / (rows.length - 1 || 1)) * plotW;
    const val = (r.err === null || r.err <= 0) ? logMin : Math.log10(r.err);
    const y = pad.t + (1 - (val - logMin) / span) * plotH;
    return { x, y, r };
  });
  const path = smoothPath(pts);
  const dots = pts.map(p => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3.5" fill="${color}" stroke="var(--bg-card)" stroke-width="1.5"><title>Iter ${p.r.i}: ${fmt(p.r.err,4)}%</title></circle>`).join('');
  const yTicks = Array.from({ length: 5 }, (_, i) => {
    const frac = i / 4, logVal = logMax - frac * span, val = Math.pow(10, logVal);
    const y = pad.t + frac * plotH;
    const label = val >= 10 ? val.toFixed(1) : (val >= 1 ? val.toFixed(2) : val.toFixed(4));
    return { y, label };
  });
  const gridY = yTicks.map(t => `<line x1="${pad.l}" y1="${t.y.toFixed(1)}" x2="${w-pad.r}" y2="${t.y.toFixed(1)}" stroke="${gridColor}" stroke-width="1"/><text x="${pad.l-8}" y="${(t.y+4).toFixed(1)}" fill="${textColor}" font-size="10" font-family="JetBrains Mono, monospace" text-anchor="end">${t.label}%</text>`).join('');
  const n = rows.length, step = n <= 10 ? 1 : Math.ceil(n / 10);
  const xTicks = rows.filter((r, idx) => idx % step === 0 || idx === n - 1).map(r => {
    const idx = r.i - 1, x = pad.l + inset + (idx / (n - 1 || 1)) * plotW;
    return `<line x1="${x.toFixed(1)}" y1="${pad.t}" x2="${x.toFixed(1)}" y2="${h-pad.b}" stroke="${gridColor}" stroke-width="1" stroke-dasharray="2 3"/><text x="${x.toFixed(1)}" y="${h-pad.b+16}" fill="${textColor}" font-size="10" font-family="JetBrains Mono, monospace" text-anchor="middle">${r.i}</text>`;
  }).join('');
  return `<svg viewBox="0 0 ${w} ${h}" style="width:100%;height:auto;background:${bgColor};border-radius:8px;">${gridY}${xTicks}<line x1="${pad.l}" y1="${pad.t}" x2="${pad.l}" y2="${h-pad.b}" stroke="${axisColor}" stroke-width="1.2"/><line x1="${pad.l}" y1="${h-pad.b}" x2="${w-pad.r}" y2="${h-pad.b}" stroke="${axisColor}" stroke-width="1.2"/><path d="${path}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linejoin="round"/>${dots}<text x="${pad.l}" y="11" fill="${textColor}" font-size="10" font-family="JetBrains Mono, monospace">error % (escala log)</text><text x="${w-pad.r}" y="${h-4}" fill="${textColor}" font-size="10" font-family="JetBrains Mono, monospace" text-anchor="end">iteración</text></svg>`;
}

// 7. RENDER DE RESULTADOS
function renderRows(rows, type) {
  if (type === 'fixed') {
    return rows.map(r => `<tr><td>${r.i}</td><td>${fmt(r.xPrev,6)}</td><td>${fmt(r.xr,6)}</td><td>${fmt(r.fxr,7)}</td><td>${r.err===null?'—':fmt(r.err,5)+'%'}</td></tr>`).join('');
  }
  if (type === 'newton') {
    return rows.map(r => `<tr><td>${r.i}</td><td>${fmt(r.xPrev,6)}</td><td>${fmt(r.xr,6)}</td><td>${fmt(r.fxr,7)}</td><td>${fmt(r.dfx,7)}</td><td>${r.err===null?'—':fmt(r.err,5)+'%'}</td></tr>`).join('');
  }
  if (type === 'secant') {
    return rows.map(r => `<tr><td>${r.i}</td><td>${fmt(r.x0,6)}</td><td>${fmt(r.x1,6)}</td><td>${fmt(r.xr,6)}</td><td>${fmt(r.fxr,7)}</td><td>${r.err===null?'—':fmt(r.err,5)+'%'}</td></tr>`).join('');
  }
  return rows.map(r => `<tr><td>${r.i}</td><td>${fmt(r.a,5)}</td><td>${fmt(r.b,5)}</td><td>${fmt(r.xr,5)}</td><td>${fmt(r.fxr,6)}</td><td>${r.err===null?'—':fmt(r.err,4)+'%'}</td></tr>`).join('');
}

function tableHeader(type) {
  if (type === 'fixed') return '<tr><th>Iter</th><th>x anterior</th><th>x nuevo</th><th>f(x)</th><th>Error (%)</th></tr>';
  if (type === 'newton') return '<tr><th>Iter</th><th>x anterior</th><th>x nuevo</th><th>f(x)</th><th>f′(x)</th><th>Error (%)</th></tr>';
  if (type === 'secant') return '<tr><th>Iter</th><th>x₀</th><th>x₁</th><th>x nuevo</th><th>f(x)</th><th>Error (%)</th></tr>';
  return '<tr><th>Iter</th><th>a</th><th>b</th><th>xr</th><th>f(xr)</th><th>Error (%)</th></tr>';
}

function showResult(id, rows, methodLabel, type, interp, color) {
  const resBox = document.getElementById(id + '-results');
  if (!rows || rows.length === 0) throw new Error('No se generaron iteraciones.');
  const last = rows[rows.length - 1];
  const converged = last.err !== null && last.err <= parseFloat(document.getElementById(id+'-tol').value);
  const invalid = last.invalid;
  const state = invalid ? 'Revisar valores ⚠' : (converged ? 'Convergió ✓' : 'Máx. iter. alcanzado');
  const tableRows = renderRows(rows, type);
  resBox.innerHTML = `
    <div class="result-head">
      <div class="stat"><div class="label">Método</div><div class="value" style="font-size:15px;">${methodLabel}</div></div>
      <div class="stat"><div class="label">Raíz aproximada</div><div class="value">${fmt(last.xr,6)}</div></div>
      <div class="stat"><div class="label">f(raíz)</div><div class="value">${fmt(last.fxr,7)}</div></div>
      <div class="stat"><div class="label">Iteraciones</div><div class="value">${last.i}</div></div>
      <div class="stat ${converged && !invalid ? '' : 'warn'}"><div class="label">Estado</div><div class="value">${state}</div></div>
    </div>
    <div class="table-wrap"><table class="iters"><thead>${tableHeader(type)}</thead><tbody>${tableRows}</tbody></table></div>
    <div class="chart-box"><div class="cap">Convergencia del error aproximado</div>${buildChartSVG(rows, color)}</div>
    <p class="interp-text">${interp}</p>`;
}

// 8. EJECUTAR PROBLEMAS
function runProblem(id) {
  const errBox = document.getElementById(id+'-error');
  const resBox = document.getElementById(id+'-results');
  errBox.style.display='none'; errBox.textContent=''; resBox.innerHTML='';
  const tol = parseFloat(document.getElementById(id+'-tol').value);
  const maxIter = parseInt(document.getElementById(id+'-max').value);
  if (!isFinite(tol) || tol <= 0 || !Number.isInteger(maxIter) || maxIter < 1) {
    errBox.style.display='block'; errBox.textContent='La tolerancia debe ser positiva y las iteraciones máximas deben ser un entero mayor que 0.'; return;
  }
  try {
    let rows, label, type, interp, color;
    if (id === 'p1' || id === 'p2') {
      const a=parseFloat(document.getElementById(id+'-a').value), b=parseFloat(document.getElementById(id+'-b').value);
      const f=funcs[id];
      if (!isFinite(a)||!isFinite(b)||a===b) throw new Error('Ingresa límites numéricos válidos y diferentes.');
      const fa=f(a), fb=f(b);
      if (!isFinite(fa)||!isFinite(fb)) throw new Error('El intervalo elegido queda fuera del dominio de la función.');
      if (fa*fb>0) throw new Error(`No hay cambio de signo en [${a}, ${b}]. Elige un intervalo donde f(a) y f(b) tengan signos opuestos.`);
      rows=id==='p1'?biseccion(f,a,b,tol,maxIter):falsaPosicion(f,a,b,tol,maxIter);
      label=id==='p1'?'Bisección':'Falsa Posición'; type='bracket'; color=id==='p1'?'#7ba9a1':'#c9a87c';
      interp=id==='p1'
        ? `<strong>Interpretación:</strong> la raíz encontrada es <code>C ≈ ${fmt(rows.at(-1).xr,4)} Mbps</code>. Representa la capacidad donde el modelo hace cero el tiempo de espera.`
        : `<strong>Interpretación:</strong> la raíz encontrada es <code>t ≈ ${fmt(rows.at(-1).xr,4)} años</code>, el punto de equilibrio entre los dos costos del modelo.`;
    } else if (id === 'p3') {
      const x0=parseFloat(document.getElementById('p3-x0').value), f=funcs.p3, g=fixedGs.p3;
      if (!isFinite(x0)) throw new Error('Ingresa un valor inicial T₀ válido.');
      rows=puntoFijo(g,f,x0,tol,maxIter); label='Punto Fijo'; type='fixed'; color='#7ba9a1';
      interp=`<strong>Interpretación:</strong> la temperatura de equilibrio obtenida es <code>T ≈ ${fmt(rows.at(-1).xr,6)} °C</code>. La iteración usa directamente <code>g(T)=18+8e^(−0.15T)</code> y parte de <code>T₀=${fmt(x0,3)}</code>.`;
    } else if (id === 'p4') {
      const x0=parseFloat(document.getElementById('p4-x0').value), f=funcs.p4, df=derivatives.p4;
      if (!isFinite(x0)) throw new Error('Ingresa un valor inicial t₀ válido.');
      rows=newtonRaphson(f,df,x0,tol,maxIter); label='Newton-Raphson'; type='newton'; color='#c9a87c';
      interp=`<strong>Interpretación:</strong> la solución aproximada es <code>t ≈ ${fmt(rows.at(-1).xr,6)} ms</code>. Esta es la raíz positiva buscada para el tiempo de respuesta del sistema. Se utilizó <code>f′(t)=3t²−7</code>.`;
    } else if (id === 'p5') {
      const x0=parseFloat(document.getElementById('p5-x0').value), x1=parseFloat(document.getElementById('p5-x1').value), f=funcs.p5;
      if (!isFinite(x0)||!isFinite(x1)||x0===x1) throw new Error('Los valores iniciales x₀ y x₁ deben ser numéricos y diferentes.');
      rows=secante(f,x0,x1,tol,maxIter); label='Secante'; type='secant'; color='#7ba9a1';
      interp=`<strong>Interpretación:</strong> el punto de operación aproximado es <code>x ≈ ${fmt(rows.at(-1).xr,6)}</code>. La secante obtiene la raíz usando dos aproximaciones iniciales, sin calcular una derivada explícita.`;
    }
    showResult(id,rows,label,type,interp,color);
  } catch(e) {
    errBox.style.display='block'; errBox.textContent=e.message;
  }
}

// 9. PARSER SEGURO DE EXPRESIONES
// Acepta notación matemática habitual: 2x, 2(x+1), x², x³, √x,
// e^-x, π, ecuaciones del tipo f(x)=0 y funciones matemáticas comunes.
function parseExpr(str, varName) {
  let s = String(str ?? '').trim();
  if (!s) throw new Error('Escribe una función.');

  varName = String(varName || 'x').trim();
  if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(varName)) {
    throw new Error('El nombre de la variable debe empezar con una letra y solo puede contener letras y números.');
  }

  const reserved = ['sqrt','exp','ln','log10','sin','cos','tan','abs','pow','pi','e'];
  if (reserved.includes(varName.toLowerCase())) {
    throw new Error(`"${varName}" es un nombre reservado.`);
  }

  // Normalización de símbolos que suelen copiarse desde Word/PDF/WhatsApp.
  s = s
    .replace(/[−–—]/g, '-')
    .replace(/[×·∙⋅]/g, '*')
    .replace(/÷/g, '/')
    .replace(/π/g, 'PI')
    .replace(/√\s*/g, 'sqrt')
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/⁴/g, '^4')
    .replace(/⁵/g, '^5')
    .replace(/⁶/g, '^6')
    .replace(/⁷/g, '^7')
    .replace(/⁸/g, '^8')
    .replace(/⁹/g, '^9')
    .replace(/⁰/g, '^0')
    .replace(/[⁽⁾]/g, m => m === '⁽' ? '(' : ')')
    .replace(/\s+/g, ' ')
    .trim();

  // Acepta decimales con coma (0,15) sin romper pow(a,b).
  // Las comas que pertenecen a pow(...) se protegen primero.
  s = s.replace(/pow\s*\(([^()]*)\)/gi, (m, inside) => 'pow(' + inside.replace(/,/g, '@@ARG@@') + ')');
  s = s.replace(/(\d),(?=\d)/g, '$1.');
  s = s.replace(/@@ARG@@/g, ',');

  // Permite escribir una ecuación completa: "e^-x - x² + 0.2 = 0".
  // Se transforma a (lado_izquierdo) - (lado_derecho).
  const equalParts = s.split('=');
  if (equalParts.length > 2) throw new Error('La función solo puede contener un signo =.');
  if (equalParts.length === 2) {
    const left = equalParts[0].trim();
    const right = equalParts[1].trim();
    if (!left || !right) throw new Error('La ecuación debe tener expresiones a ambos lados del signo =.');
    s = `(${left})-(${right})`;
  }

  // Caracteres permitidos. Las letras se validan después contra la lista de funciones.
  const allowed = /^[0-9.\+\-*/^(),\s_a-zA-Z]*$/;
  if (!allowed.test(s)) {
    throw new Error('La función contiene caracteres no permitidos. Usa +, -, *, /, ^, paréntesis y las funciones disponibles.');
  }

  if (/(constructor|prototype|window|document|eval|=>|import|require|process|global|this|Function)/i.test(s)) {
    throw new Error('La función contiene términos no permitidos.');
  }

  // Solo se admiten estas funciones/constantes y la variable elegida.
  const identifiers = ['sqrt','exp','ln','log10','sin','cos','tan','abs','pow','PI','E','e',varName];
  const idRegex = /[a-zA-Z][a-zA-Z0-9]*/g;
  const found = s.match(idRegex) || [];
  const unknown = [...new Set(found.filter(id => !identifiers.includes(id)))];
  if (unknown.length) throw new Error('Nombre no reconocido: ' + unknown.join(', ') + '.');

  // Multiplicación implícita: 2x, 2(x), x(…), )(…), 2sin(x), etc.
  // Protegemos temporalmente las llamadas a funciones para no convertir sin(…) en sin*(…).
  s = s.replace(/(sqrt|exp|ln|log10|sin|cos|tan|abs|pow)\s*\(/g, '$1@@(');
  s = s.replace(/(\d|\))\s*(?=[a-zA-Z(])/g, '$1*');
  s = s.replace(/([a-zA-Z0-9_)])\s*(?=\()/g, '$1*');
  s = s.replace(/@@/g, '');

  // Exponente matemático ^ -> JavaScript **.
  s = s.replace(/\^/g, '**');

  const body = `"use strict"; const {sqrt,exp,log10,sin,cos,tan,abs,pow,PI,E}=Math; const ln=Math.log; const e=Math.E; return (${s});`;
  let fn;
  try {
    fn = new Function(varName, body);
  } catch (err) {
    throw new Error('Expresión inválida: revisa paréntesis, operadores y exponentes.');
  }

  // Comprobación sintáctica/numérica sin exigir que la función tenga dominio en 1.2345.
  try {
    const test = fn(1.2345);
    if (typeof test !== 'number') throw new Error();
  } catch (err) {
    throw new Error('No se pudo evaluar la expresión. Revisa su sintaxis.');
  }
  return fn;
}

// 10. PERSONALIZADO
function updateCustomFields() {
  const method=document.getElementById('p6-method')?.value;
  const gWrap=document.getElementById('p6-g-wrap'), dfWrap=document.getElementById('p6-df-wrap');
  const aLabel=document.getElementById('p6-a-label'), bLabel=document.getElementById('p6-b-label');
  const a=document.getElementById('p6-a'), b=document.getElementById('p6-b');
  const bWrap=document.getElementById('p6-b-wrap');
  if(!method) return;

  // Mostrar únicamente los campos que realmente necesita cada método.
  // Punto Fijo y Newton-Raphson usan solo x₀; Secante usa x₀ y x₁;
  // Bisección/Falsa Posición usan a y b.
  const hideX1 = method === 'puntoFijo' || method === 'newton';
  if (gWrap) gWrap.style.display = method === 'puntoFijo' ? 'flex' : 'none';
  if (dfWrap) dfWrap.style.display = method === 'newton' ? 'flex' : 'none';
  if (bWrap) {
    bWrap.hidden = hideX1;
    bWrap.style.display = hideX1 ? 'none' : 'flex';
  }
  if (b) b.disabled = hideX1;

  if(method==='puntoFijo' || method==='newton' || method==='secante') {
    aLabel.textContent='x₀ (inicial)';
    bLabel.textContent='x₁ (inicial)';
  } else {
    aLabel.textContent='a (límite inf.)';
    bLabel.textContent='b (límite sup.)';
  }
  if(method==='puntoFijo') {
    a.value='20'; b.value='21';
  } else if(method==='newton') {
    a.value='2'; b.value='3';
  } else if(method==='secante') {
    a.value='0'; b.value='1';
  }
}

function runCustom() {
  const errBox=document.getElementById('p6-error'), resBox=document.getElementById('p6-results');
  errBox.style.display='none'; errBox.textContent=''; resBox.innerHTML='';
  const expr=document.getElementById('p6-fx').value, varName=document.getElementById('p6-var').value.trim()||'x';
  const method=document.getElementById('p6-method').value;
  const a=parseFloat(document.getElementById('p6-a').value), b=parseFloat(document.getElementById('p6-b').value);
  const tol=parseFloat(document.getElementById('p6-tol').value), maxIter=parseInt(document.getElementById('p6-max').value);
  if(!isFinite(a)||!isFinite(tol)||tol<=0||!Number.isInteger(maxIter)||maxIter<1) {
    errBox.style.display='block'; errBox.textContent='Ingresa un x₀ (o límite inferior) válido, una tolerancia positiva y un máximo de iteraciones entero.'; return;
  }
  if((method==='biseccion'||method==='falsaPosicion'||method==='secante') && (!isFinite(b)||a===b)) {
    errBox.style.display='block'; errBox.textContent='Este método necesita dos valores iniciales/límites distintos: x₀ y x₁, o a y b.'; return;
  }
  let f;
  try { f=parseExpr(expr,varName); } catch(e) { errBox.style.display='block'; errBox.textContent=e.message; return; }
  try {
    let rows,label,type,color,interp;
    if(method==='biseccion'||method==='falsaPosicion') {
      const fa=f(a),fb=f(b);
      if(!isFinite(fa)||!isFinite(fb)) throw new Error('f(a) o f(b) no es finita.');
      if(fa*fb>0) throw new Error(`No hay cambio de signo en [${a}, ${b}].`);
      rows=method==='biseccion'?biseccion(f,a,b,tol,maxIter):falsaPosicion(f,a,b,tol,maxIter);
      label=method==='biseccion'?'Bisección':'Falsa Posición'; type='bracket'; color='#7ba9a1';
    } else if(method==='puntoFijo') {
      const gx=parseExpr(document.getElementById('p6-gx').value,varName);
      if(!isFinite(f(a))) throw new Error('f(x₀) no es finita. Revisa el dominio de la función.');
      if(!isFinite(gx(a))) throw new Error('g(x₀) no es finita. Revisa g(x) y el valor inicial x₀.');
      rows=puntoFijo(gx,f,a,tol,maxIter); label='Punto Fijo'; type='fixed'; color='#7ba9a1';
    } else if(method==='newton') {
      const df=parseExpr(document.getElementById('p6-dfx').value,varName);
      if(!isFinite(f(a))) throw new Error('f(x₀) no es finita. Revisa el dominio de la función.');
      if(!isFinite(df(a))) throw new Error('f′(x₀) no es finita. Revisa la derivada y el valor inicial x₀.');
      rows=newtonRaphson(f,df,a,tol,maxIter); label='Newton-Raphson'; type='newton'; color='#c9a87c';
    } else {
      rows=secante(f,a,b,tol,maxIter); label='Secante'; type='secant'; color='#7ba9a1';
    }
    if(!rows.length) throw new Error('No se pudo generar una iteración.');
    const last=rows.at(-1);
    interp=`<strong>Interpretación:</strong> la raíz aproximada es <code>${varName} ≈ ${fmt(last.xr,6)}</code>, obtenida con ${label.toLowerCase()} y una tolerancia del ${tol}%.`;
    showResult('p6',rows,label,type,interp,color);
  } catch(e) { errBox.style.display='block'; errBox.textContent=e.message; }
}

// 11. INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', () => {
  runProblem('p1');
  runProblem('p2');
  runProblem('p3');
  runProblem('p4');
  runProblem('p5');
  const method=document.getElementById('p6-method');
  if(method) {
    method.addEventListener('change', updateCustomFields);
    updateCustomFields();
  }
  const p3VarInput=document.getElementById('p6-var'), p3FxLabel=document.getElementById('p6-fx-label');
  if(p3VarInput && p3FxLabel) p3VarInput.addEventListener('input',()=>{ const v=p3VarInput.value.trim()||'x'; p3FxLabel.textContent=`f(${v}) =`; });
  const gLabel=document.getElementById('p6-gx-label'), dfLabel=document.getElementById('p6-dfx-label');
  if(p3VarInput) p3VarInput.addEventListener('input',()=>{
    const v=p3VarInput.value.trim()||'x';
    if(gLabel) gLabel.textContent=`g(${v}) =`;
    if(dfLabel) dfLabel.textContent=`f'(${v}) =`;
  });
});