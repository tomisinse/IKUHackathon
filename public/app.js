// --- DATA & CONFIG ---
const ORDER = ['en', 'es', 'ar', 'fr', 'de', 'zh'];
const COUNTRIES = [
  { code: 'UK', name: 'United Kingdom (UK)' },
  { code: 'Spain', name: 'Spain (España)' },
  { code: 'France', name: 'France' },
  { code: 'Germany', name: 'Germany (Deutschland)' },
  { code: 'USA', name: 'United States (USA)' },
  { code: 'Canada', name: 'Canada' },
  { code: 'UAE', name: 'United Arab Emirates (UAE)' },
  { code: 'Japan', name: 'Japan' }
];

const L = {
  en: { n: 'English', u: { h1: "Understand like a local.", ispeak: "I speak", tspk: "They speak", country: "Destination Country", choose: "Or choose a situation to practise", ask: "Help me understand", desc: "Describe what is happening", ph: "e.g. My landlord asked for a deposit...", scan: "Scan a letter or form", scanh: "Upload a file or photo.", up: "Upload file or photo", back: "← Back to home", practice: "Practise Conversation", speak: "🎤 Speak", stop: "🛑 Stop" } },
  es: { n: 'Español', u: { h1: "Entiende como un local.", ispeak: "Yo hablo", tspk: "Ellos hablan", country: "País de destino", choose: "O elige una situación", ask: "Ayúdame a entender", desc: "Describe lo que pasa", ph: "ej. Mi casero pidió un depósito...", scan: "Escanear carta", scanh: "Sube una foto.", up: "Subir foto", back: "← Volver al inicio", practice: "Practicar conversación", speak: "🎤 Hablar", stop: "🛑 Parar" } },
  ar: { n: 'العربية', rtl: 1, u: { h1: "افهم كأنك من أهل البلد.", ispeak: "أنا أتحدث", tspk: "هم يتحدثون", country: "بلد الوجهة", choose: "أو اختر موقفًا", ask: "ساعدني على الفهم", desc: "صف ما يحدث", ph: "مثال: طلب المالك وديعة...", scan: "امسح مستنداً", scanh: "ارفع صورة.", up: "رفع", back: "← العودة", practice: "ممارسة المحادثة", speak: "🎤 تحدث", stop: "🛑 إيقاف" } },
  fr: { n: 'Français', u: { h1: "Comprenez comme un local.", ispeak: "Je parle", tspk: "Ils parlent", country: "Pays de destination", choose: "Ou choisissez une situation", ask: "Aidez-moi à comprendre", desc: "Décrivez ce qui se passe", ph: "ex. Mon propriétaire a demandé un dépôt...", scan: "Scanner un document", scanh: "Téléchargez une photo.", up: "Télécharger", back: "← Retour", practice: "Pratiquer la conversation", speak: "🎤 Parler", stop: "🛑 Arrêter" } },
  de: { n: 'Deutsch', u: { h1: "Verstehen wie ein Einheimischer.", ispeak: "Ich spreche", tspk: "Sie sprechen", country: "Zielland", choose: "Oder wählen Sie eine Situation", ask: "Hilf mir zu verstehen", desc: "Beschreiben Sie die Situation", ph: "z.B. Mein Vermieter hat eine Kaution verlangt...", scan: "Brief scannen", scanh: "Foto hochladen.", up: "Datei hochladen", back: "← Zurück", practice: "Konversation üben", speak: "🎤 Sprechen", stop: "🛑 Stopp" } },
  zh: { n: '中文', u: { h1: "像当地人一样理解。", ispeak: "我说", tspk: "对方说", country: "目的地国家", choose: "或选择一个练习情境", ask: "帮我理解", desc: "描述正在发生的事情", ph: "例如：房东要求支付押金...", scan: "扫描文件或表格", scanh: "上传文件或照片。", up: "上传文件", back: "← 返回主页", practice: "练习对话", speak: "🎤 说话", stop: "🛑 停止" } }
};

const S = {
  flat: { ic: '🏠', t: { en: 'Viewing a flat', es: 'Ver un piso', ar: 'معاينة شقة', fr: 'Visite d\'appartement', de: 'Wohnungsbesichtigung', zh: '看公寓' }, d: { en: 'Talk to a landlord', es: 'Hablar con casero', ar: 'التحدث مع المالك', fr: 'Parler au propriétaire', de: 'Mit Vermieter sprechen', zh: '与房东交谈' } },
  bank: { ic: '🏦', t: { en: 'Banking services', es: 'Servicios bancarios', ar: 'الخدمات المصرفية', fr: 'Services bancaires', de: 'Bankdienstleistungen', zh: '银行服务' }, d: { en: 'Open an account', es: 'Abrir cuenta', ar: 'فتح حساب', fr: 'Ouvrir un compte', de: 'Konto eröffnen', zh: '开户' } },
  gp: { ic: '🩺', t: { en: "Doctor's visit", es: 'Visita médica', ar: 'زيارة الطبيب', fr: 'Visite médicale', de: 'Arztbesuch', zh: '看医生' }, d: { en: 'Register with GP', es: 'Registrarse', ar: 'التسجيل لدى الطبيب', fr: 'S\'inscrire chez le médecin', de: 'Beim Arzt anmelden', zh: '注册全科医生' } }
};

const st = { lang: 'en', they: 'en', country: 'UK', view: 'home', text: '', res: null, scan: '' };

const esc = s => (s || '').toString().replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const $ = s => document.querySelector(s);
const attr = l => 'lang="' + l + '"' + (L[l] && L[l].rtl ? ' dir="rtl"' : '');

// --- API ACTIONS ---
async function analyse(text) {
  try {
    const res = await fetch('/api/understand', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, language: st.lang, country: st.country, they: st.they })
    });
    return await res.json();
  } catch (e) {
    return { guide: { summary: "Could not connect to backend server.", do_now: [], bring: [] } };
  }
}

async function say(text) {
  try {
    const res = await fetch('/api/speak', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    if (!res.ok) throw new Error();
    const blob = await res.blob();
    const audio = new Audio(URL.createObjectURL(blob));
    audio.play();
  } catch (e) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const m = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(m);
    }
  }
}

async function handleFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async () => {
    const base64Data = reader.result.split(',')[1];
    st.scan = "Analyzing document with Gemini...";
    render();
    try {
      const res = await fetch('/api/document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: base64Data, mediaType: file.type, language: st.lang, country: st.country, they: st.they })
      });
      st.res = await res.json();
      st.scan = st.res.title || "Document analyzed.";
      st.view = 'results';
    } catch (e) {
      st.scan = "Failed to process image.";
    }
    render();
  };
  reader.readAsDataURL(file);
}

// --- RENDER VIEWS ---
function setupView() {
  if (st.view === 'results' && st.res) {
    return resultsView();
  }
  return homeView();
}

function homeView() {
  const langConfig = L[st.lang] || L.en;
  const u = langConfig.u;
  const langAttr = attr(st.lang);

  let countryOptions = '';
  for (const c of COUNTRIES) {
    countryOptions += '<option value="' + c.code + '" ' + (c.code === st.country ? 'selected' : '') + '>' + c.name + '</option>';
  }

  let scenesHtml = '';
  for (const [k, s] of Object.entries(S)) {
    const title = s.t[st.lang] || s.t.en;
    const desc = s.d[st.lang] || s.d.en;
    scenesHtml += '<button class="scene" data-sc="' + k + '"><span class="ic">' + s.ic + '</span><strong>' + esc(title) + '</strong><small>' + esc(desc) + '</small></button>';
  }

  let optionsHtml = '';
  for (const k of ORDER) optionsHtml += '<option value="' + k + '" ' + (k === st.lang ? 'selected' : '') + '>' + L[k].n + '</option>';

  let theyOptionsHtml = '';
  for (const k of ORDER) theyOptionsHtml += '<option value="' + k + '" ' + (k === st.they ? 'selected' : '') + '>' + L[k].n + '</option>';

  return '<h1 ' + langAttr + '>' + esc(u.h1) + '</h1>' +
    '<div class="pair" ' + langAttr + '>' +
      '<div><h2><label>' + esc(u.country) + '</label></h2><select id="csel" data-country>' + countryOptions + '</select></div>' +
      '<div><h2><label for="lsel">' + esc(u.ispeak) + '</label></h2><select id="lsel" data-select>' + optionsHtml + '</select></div>' +
      '<div><h2><label for="tsel">' + esc(u.tspk) + '</label></h2><select id="tsel" data-they>' + theyOptionsHtml + '</select></div>' +
    '</div>' +
    '<h2 ' + langAttr + '><label for="sit">' + esc(u.desc) + '</label></h2>' +
    '<textarea id="sit" rows="4" ' + langAttr + ' placeholder="' + esc(u.ph) + '">' + esc(st.text) + '</textarea>' +
    '<p class="row">' +
      '<button class="next" data-help ' + langAttr + '>' + esc(u.ask) + '</button>' +
      '<button class="mic" data-mic type="button">' + esc(u.speak) + '</button>' +
    '</p>' +
    '<section class="scan" ' + langAttr + '>' +
      '<h2>' + esc(u.scan) + '</h2>' +
      '<p class="lead">' + esc(u.scanh) + '</p>' +
      '<div class="row"><button class="next" data-upload>📁 ' + esc(u.up) + '</button></div>' +
      '<input type="file" id="file" style="display:none" accept="image/*">' +
      '<p id="smsg" class="vmsg">' + esc(st.scan) + '</p>' +
    '</section>' +
    '<h2 ' + langAttr + '>' + esc(u.choose) + '</h2>' +
    '<div class="scenes" ' + langAttr + '>' + scenesHtml + '</div>';
}

function resultsView() {
  const langConfig = L[st.lang] || L.en;
  const u = langConfig.u;
  const r = st.res;
  if (!r || !r.guide) return homeView();

  let scriptHtml = '';
  if (r.guide.say && r.guide.say.length > 0) {
    let items = '';
    for (const t of r.guide.say) {
      const phraseText = typeof t === 'string' ? t : (t.them || t.me);
      items += '<div class="turn-item" style="margin-bottom:1rem; padding:0.8rem; background:#fff; border-radius:12px;"><p><strong>Them:</strong> "' + esc(t.them || '') + '"</p><p><strong>You:</strong> "' + esc(t.me || '') + '"</p><button data-say="' + esc(phraseText) + '">🔊 Listen</button></div>';
    }
    scriptHtml = '<div class="means"><h3>Practice Phrases</h3><div class="turns">' + items + '</div></div>';
  } else if (r.script && r.script.length > 0) {
    let items = '';
    for (const t of r.script) {
      items += '<div class="turn-item" style="margin-bottom:1rem; padding:0.8rem; background:#fff; border-radius:12px;"><strong>' + esc(t.speaker) + ':</strong><p>"' + esc(t.text) + '"</p><button data-say="' + esc(t.text) + '">🔊 Listen</button></div>';
    }
    scriptHtml = '<div class="means"><h3>Practice Conversation Script</h3><div class="turns">' + items + '</div></div>';
  }

  let doNowHtml = '';
  if (r.guide.do_now) {
    for (const s of r.guide.do_now) doNowHtml += '<li>' + esc(s) + '</li>';
  }

  let bringHtml = '';
  if (r.guide.bring) {
    for (const b of r.guide.bring) bringHtml += '<li>' + esc(b) + '</li>';
  }

  return '<div class="results-page">' +
    '<p><button class="small" data-back>' + esc(u.back) + '</button></p>' +
    '<h2>' + esc(r.title || u.practice) + ' (' + st.country + ')</h2>' +
    '<article class="turn">' +
      '<div class="means"><h3>Summary</h3><p>' + esc(r.guide.summary) + '</p></div>' +
      '<div class="means"><h3>Do Now</h3><ul>' + doNowHtml + '</ul></div>' +
      '<div class="means"><h3>Bring</h3><ul>' + bringHtml + '</ul></div>' +
      scriptHtml +
    '</article>' +
  '</div>';
}

function render() {
  const app = $('#app');
  if (app) app.innerHTML = setupView();
  window.scrollTo(0, 0);
}

// --- EVENT LISTENERS ---
document.addEventListener('click', async e => {
  const b = e.target.closest('button');
  if (!b) return;
  const d = b.dataset;

  if ('upload' in d) { $('#file').click(); }
  else if ('say' in d) { say(d.say); }
  else if ('back' in d) {
    st.view = 'home';
    render();
  }
  else if ('mic' in d) {
    if (!navigator.mediaDevices?.getUserMedia) {
      alert('Microphone not supported in this browser.');
      return;
    }
    b.classList.toggle('rec');
    if (b.classList.contains('rec')) {
      b.textContent = L[st.lang]?.u?.stop || '🛑 Stop';
      navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        window._mediaRecorder = new MediaRecorder(stream);
        window._audioChunks = [];
        window._mediaRecorder.ondataavailable = ev => window._audioChunks.push(ev.data);
        window._mediaRecorder.onstop = async () => {
          const blob = new Blob(window._audioChunks, { type: 'audio/webm' });
          st.scan = "Transcribing voice...";
          render();
          try {
            const res = await fetch('/api/transcribe', { method: 'POST', body: blob });
            const data = await res.json();
            if (data.text) {
              st.text = data.text;
              const sitBox = $('#sit');
              if (sitBox) sitBox.value = data.text;
            }
          } catch (err) {
            console.error(err);
          }
          st.scan = "";
          render();
        };
        window._mediaRecorder.start();
      }).catch(err => {
        console.error(err);
        b.classList.remove('rec');
      });
    } else {
      b.textContent = L[st.lang]?.u?.speak || '🎤 Speak';
      if (window._mediaRecorder) window._mediaRecorder.stop();
    }
  }
  else if ('sc' in d) {
    const scKey = d.sc;
    if (S[scKey]) {
      st.text = S[scKey].t[st.lang] || S[scKey].t.en;
      render();
      st.scan = "Thinking...";
      render();
      st.res = await analyse(st.text);
      st.scan = "";
      st.view = 'results';
      render();
    }
  }
  else if ('help' in d) {
    const sitBox = $('#sit');
    if (sitBox) st.text = sitBox.value;
    if (!st.text.trim()) return;
    st.scan = "Thinking...";
    render();
    st.res = await analyse(st.text);
    st.scan = "";
    st.view = 'results';
    render();
  }
});

document.addEventListener('change', e => {
  const d = e.target.dataset;
  if (e.target.id === 'file') { handleFile(e.target.files[0]); e.target.value = ''; }
  else if (d.select !== undefined) { st.lang = e.target.value; render(); }
  else if (d.they !== undefined) { st.they = e.target.value; render(); }
  else if (d.country !== undefined) { st.country = e.target.value; render(); }
});

document.addEventListener('input', e => { if (e.target.id === 'sit') st.text = e.target.value; });

render();