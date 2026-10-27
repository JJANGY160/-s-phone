/* =========================================================
   성찬의 iPhone — 화면 코드
   내용은 data.js에, 화면 그리는 방법은 이 파일에 있어요.
   ========================================================= */
/* ★ 공유 댓글 주소 ★
   구글 Apps Script로 만든 '웹 앱 URL'을 따옴표 안에 붙여 넣으세요.
   비워 두면 댓글이 각 독자의 브라우저에만 저장돼요. (설정 방법: README.md '공유 댓글' 항목) */
const COMMENTS_API_URL = '';

/* 오류가 나면 검은 화면 대신 원인을 화면에 보여 줘요 (캡처해서 알려 주세요) */
window.addEventListener('error', (e) => {
  const sc = document.getElementById('screen');
  if (!sc || document.getElementById('errBox')) return;
  const box = document.createElement('div');
  box.id = 'errBox';
  box.style.cssText = 'position:absolute;left:16px;right:16px;top:80px;z-index:99;background:#fff;color:#c00;padding:14px;border-radius:12px;font:13px/1.5 sans-serif;white-space:pre-wrap;word-break:break-all';
  box.textContent = '⚠️ 오류\n' + (e.message || '') + '\n' + (e.filename || '').split('/').pop() + ':' + (e.lineno || '');
  sc.parentNode.appendChild(box);
});

(() => {
  'use strict';

  /* data.js에 없는 설정은 기본값으로 (옛날 data.js와 섞여도 멈추지 않게) */
  const DMT = (typeof DM_TYPING !== 'undefined') ? DM_TYPING : { startDelay: 900, speed: 230 };
  const MAPW = (typeof MAP_WIDGET !== 'undefined') ? MAP_WIDGET : {
    places: { home: { x: 68, y: 64, label: '집' }, mid: { x: 50, y: 62 }, gym: { x: 24, y: 62, label: '영원대 체육관' } },
    seongchan: { name: '성찬', avatar: 'images/profile/seongchan.jpg' },
    eunseok: { name: '은석', avatar: 'images/profile/eunseok.jpg' }
  };
  const PCA = (typeof PETCAM_ALERT !== 'undefined') ? PETCAM_ALERT : {
    cam: '거실', title: '거실 캠', text: '사람의 움직임이 감지되었어요', media: 'images/petcam/alert-0603.gif', label: '현관으로 들어오는 두 사람', delay: 1500
  };

  /* ---------- 기본 도구 ---------- */
  const $ = (s, el = document) => el.querySelector(s);
  const phoneEl = $('#phone');
  const screenEl = $('#screen');
  const statusEl = $('#statusbar');
  const bannerEl = $('#bannerLayer');
  const toastEl = $('#toast');

  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  // 이미지 자리: 파일이 있으면 이미지, 없으면 회색 자리 + 설명
  // .mp4 / .webm 경로면 소리 없이 자동 반복 재생되는 영상으로 보여 줘요
  // .mp4 / .webm 경로면 소리 없이 자동 반복 재생되는 영상으로 보여 줘요
  const ph = (src, label = '', cls = '') => {
    if (src === 'default') return `<div class="ph igdef ${cls}">${IGDEF}</div>`;
    const media = /\.(mp4|webm)$/i.test(src || '')
      ? `<video src="${esc(src)}" autoplay muted loop playsinline preload="auto" onerror="this.remove()"></video>`
      : `<img src="${esc(src)}" alt="" onerror="this.remove()">`;
    return `<div class="ph ${cls}" data-label="${esc(label)}">${media}</div>`;
  };
  const P = (o) => esc(JSON.stringify(o || {}));
  // 카카오톡 기본 프사 ('default') 또는 사진
  // 카톡 기본 프사: 이름마다 3가지 색 중 하나 (샘플 디자인)
  const KTINTS = [['#94c9dc', '#ffffff'], ['#95bee7', '#c8dcf3'], ['#a3b6ea', '#cfd8f5']];
  const kdefSvg = (name) => {
    let h = 0; for (const ch of String(name || '')) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    const [bg, fg] = KTINTS[h % KTINTS.length];
    return `<svg viewBox="0 0 40 40"><rect width="40" height="40" fill="${bg}"/><circle cx="20" cy="15.2" r="4.6" fill="${fg}"/><path d="M12.6 27.6c0-4.4 3.3-7 7.4-7s7.4 2.6 7.4 7z" fill="${fg}"/></svg>`;
  };
  const kava = (src, label = '', cls = '', name = label) => (!src || src === 'default')
    ? `<div class="ph kdef ${cls}">${kdefSvg(name)}</div>` : ph(src, label, cls);
  // 인스타 기본 프사 (회색 바탕 + 흰 사람)
  const IGDEF = '<svg viewBox="0 0 40 40"><rect width="40" height="40" fill="#dbdbdb"/><circle cx="20" cy="15" r="7.6" fill="#fff"/><path d="M5 40c0-9 6.7-14.5 15-14.5S35 31 35 40z" fill="#fff"/></svg>';

  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 1800);
  }

  /* ---------- 상태 ---------- */
  const state = {
    unlocked: false,
    stack: [],
    bannersStarted: false,
    done: new Set(),
    alertShown: false,
    backHome: false,
    seenStories: new Set(),
    typed: false,
    bannerIdx: -1
  };
  const chatById = (id) => KAKAO.chats.find((c) => c.id === id);
  const kakaoTotal = () => KAKAO.chats.reduce((n, c) => n + (c.unread || 0), 0) + 182; // 182: 목록 밖 오래된 단톡들

  /* ---------- 날짜 도우미 ---------- */
  const NOW = new Date(CONFIG.now.date + 'T00:00:00');
  const DOW = ['일', '월', '화', '수', '목', '금', '토'];
  function dateLabel(iso) {
    const d = new Date(iso + 'T00:00:00');
    return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${DOW[d.getDay()]}요일`;
  }
  function shortWhen(iso, t) {
    const d = new Date(iso + 'T00:00:00');
    const diff = Math.round((NOW - d) / 86400000);
    if (diff === 0) return t;
    if (diff === 1) return '어제';
    if (d.getFullYear() !== NOW.getFullYear()) return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}.`;
    return `${d.getMonth() + 1}월 ${d.getDate()}일`;
  }

  /* ---------- 흐르는 시계 (CONFIG.now.time 에서 시작) ---------- */
  const T0 = Date.now();
  const [H0, M0] = CONFIG.now.time.split(':').map(Number);
  function clockNow() {
    const sec = H0 * 3600 + M0 * 60 + Math.floor((Date.now() - T0) / 1000);
    return { h: Math.floor(sec / 3600) % 24, m: Math.floor(sec / 60) % 60, s: sec % 60 };
  }
  const hm = (c = clockNow()) => `${c.h % 12 || 12}:${String(c.m).padStart(2, '0')}`;
  const ampm = (c = clockNow()) => `${c.h < 12 ? '오전' : '오후'} ${hm(c)}`;
  const hands = (c = clockNow()) => ({ h: (c.h % 12) * 30 + c.m * 0.5, m: c.m * 6 + c.s * 0.1, s: c.s * 6 });
  setInterval(() => {
    const c = clockNow();
    const t = hm(c);
    document.querySelectorAll('[data-clock]').forEach((el) => { if (el.textContent !== t) el.textContent = t; });
    const hd = hands(c);
    document.querySelectorAll('.clock-ico .dial').forEach((d) => {
      d.querySelector('.h').style.transform = `translateX(-50%) rotate(${hd.h}deg)`;
      d.querySelector('.m').style.transform = `translateX(-50%) rotate(${hd.m}deg)`;
      d.querySelector('.s').style.transform = `translateX(-50%) rotate(${hd.s}deg)`;
    });
    const ts = document.getElementById('pcTs');
    if (ts) ts.textContent = `2026-06-03 ${String(c.h).padStart(2, '0')}:${String(c.m).padStart(2, '0')}:${String(c.s).padStart(2, '0')}`;
  }, 1000);

  /* ---------- 상태바 ---------- */
  function renderStatus(mode) {
    if (mode === 'hidden') { statusEl.className = 'statusbar hidden'; return; }
    statusEl.className = 'statusbar';
    const showTime = mode !== 'lock';
    statusEl.innerHTML = `
      <div class="left">
        ${showTime ? `<span data-clock>${hm()}</span>` : ''}
        ${showTime ? `<span class="sb-music"><b>♫</b><span class="mq"><span>${esc([CONFIG.nowPlaying.title, CONFIG.nowPlaying.artist].filter(Boolean).join(' · '))}</span></span></span>` : ''}
      </div>
      <div class="right">
        <svg class="sb-icon" viewBox="0 0 18 12" fill="currentColor"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5.5" width="3" height="6.5" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1" opacity=".35"/></svg>
        <span style="font-size:12px">5G</span>
        <span class="battery"></span>
      </div>`;
  }

  /* ---------- 아이콘 ---------- */
  function iconHtml(app) {
    let inner = '';
    let cls = '';
    if (app.glyph === 'cal') {
      cls = 'cal-ico';
      inner = `<span class="d">${CONFIG.now.dayShort}</span><span class="n">${CONFIG.now.day}</span>`;
    } else if (app.glyph === 'clock') {
      cls = 'clock-ico';
      const hd = hands();
      inner = `<div class="dial"><i class="h" style="transform:translateX(-50%) rotate(${hd.h}deg)"></i><i class="m" style="transform:translateX(-50%) rotate(${hd.m}deg)"></i><i class="s" style="transform:translateX(-50%) rotate(${hd.s}deg)"></i></div>`;
    } else if (app.glyph === 'school') {
      inner = `<svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="#fff" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"><path d="M3 10.5L12 5l9 5.5"/><path d="M5 10v9h14v-9"/><path d="M10 19v-4.5h4V19"/><path d="M12 5V2.5h3"/><path d="M8 12.5h.01M16 12.5h.01"/></svg>`;
    } else if (app.glyph === 'TALK') {
      inner = `<span style="font-size:17px;font-weight:900;color:${app.glyphColor}">TALK</span>`;
    } else {
      inner = `<span style="color:${app.glyphColor || '#fff'}">${esc(app.glyph)}</span>`;
    }
    let badge = '';
    if (app.badge === 'kakao') badge = `<span class="badge" data-badge="kakao">${kakaoTotal()}</span>`;
    else if (app.badge) badge = `<span class="badge">${app.badge}</span>`;
    else if (app.dot) badge = `<span class="badge dot"></span>`;
    return `<div class="icon ${cls}"><div class="face" style="background:${app.color}">${inner}<img src="${esc(app.icon)}" alt="" onerror="this.remove()"></div>${badge}</div>`;
  }

  /* =========================================================
     화면들
     ========================================================= */
  const S = {};

  /* ---------- 잠금화면 ---------- */
  S.lock = () => ({
    status: 'lock', ui: 'light',
    html: `<div class="scr lock no-anim" data-go="passcode">
      ${ph(CONFIG.lockWallpaper, '', 'wall')}
      <div class="content">
        <div class="lock-ico">🔒</div>
        <div class="date">${esc(CONFIG.now.dateLabel)}</div>
        <div class="time" data-clock>${hm()}</div>
        <div class="notifs">
          ${LOCK_NOTIFS.map((n) => `
            <div class="notif">
              <div class="n-ico" style="background:linear-gradient(45deg,#f9b233,#e1306c 55%,#833ab4)">◎</div>
              <div class="n-body"><div class="n-title">${esc(n.app)} <small>${esc(n.time)}</small></div><div class="n-text">${esc(n.text)}</div></div>
            </div>`).join('')}
        </div>
        <div class="hint">눌러서 열기</div>
      </div>
    </div>`
  });

  /* ---------- 암호 입력 ---------- */
  let code = '';
  S.passcode = () => {
    code = '';
    const keys = [['1', ''], ['2', 'ABC'], ['3', 'DEF'], ['4', 'GHI'], ['5', 'JKL'], ['6', 'MNO'], ['7', 'PQRS'], ['8', 'TUV'], ['9', 'WXYZ']];
    return {
      status: 'lock', ui: 'light',
      html: `<div class="scr passcode no-anim">
        ${ph(CONFIG.lockWallpaper, '', 'bg')}
        <h2>암호 입력</h2>
        <div class="dots" id="dots">${'<i></i>'.repeat(CONFIG.passcode.length)}</div>
        <div class="keypad">
          ${keys.map(([n, l]) => `<button class="key" data-key="${n}">${n}<small>${l}</small></button>`).join('')}
          <span></span><button class="key" data-key="0">0</button><span></span>
        </div>
        <button class="cancel" data-act="cancelPass">취소</button>
      </div>`
    };
  };
  function pressKey(k) {
    if (code.length >= CONFIG.passcode.length) return;
    code += k;
    const dots = $('#dots');
    [...dots.children].forEach((d, i) => d.classList.toggle('on', i < code.length));
    if (code.length === CONFIG.passcode.length) {
      setTimeout(() => {
        if (code === CONFIG.passcode) {
          state.unlocked = true;
          goHome(true);
        } else {
          dots.classList.add('shake');
          setTimeout(() => { dots.classList.remove('shake'); code = ''; [...dots.children].forEach((d) => d.classList.remove('on')); }, 420);
        }
      }, 120);
    }
  }

  /* ---------- 홈 화면 지도 위젯 ---------- */
  function seongchanSpot() {
    if (state.backHome) return 'home';   // 4개 완료: 둘이 같이 집으로
    const n = state.done.size;
    return n === 0 ? 'home' : n === 1 ? 'mid' : 'gym';
  }
  function personPin(p, cls) {
    return `<div class="mw-pin ${cls}">${ph(p.avatar, p.name, 'round')}<span>${esc(p.name)}</span></div>`;
  }
  function mapWidgetHtml() {
    const W = MAPW;
    const at = W.places[seongchanSpot()];
    const gym = W.places.gym;
    const withE = state.done.size >= 3;
    return `<div class="map-widget" data-open="map">
      <div class="mw-map">
        <svg class="mw-roads" viewBox="0 0 320 150" preserveAspectRatio="none">
          <rect width="320" height="150" fill="#eef0f3"/>
          <g fill="#e2e5ea">${[[10,8,60,30],[80,8,70,30],[160,8,55,30],[225,8,85,30],[10,48,45,40],[65,48,80,40],[155,48,65,40],[230,48,80,40],[10,98,70,44],[90,98,60,44],[160,98,70,44],[240,98,70,44]].map(([x,y,w,h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3"/>`).join('')}</g>
          <rect x="18" y="52" width="40" height="30" rx="4" fill="#d6ecd2"/>
          <rect x="248" y="104" width="54" height="34" rx="4" fill="#fbecc4"/>
          <g fill="none" stroke-linecap="round">
            <path d="M0 42 H320" stroke="#7dce82" stroke-width="5"/>
            <path d="M0 94 H320" stroke="#7dce82" stroke-width="4"/>
            <path d="M74 0 V150" stroke="#7dce82" stroke-width="4"/>
            <path d="M152 0 V150" stroke="#7dce82" stroke-width="6"/>
            <path d="M152 0 V60" stroke="#f29b4b" stroke-width="6"/>
            <path d="M152 88 V108" stroke="#e5534b" stroke-width="6"/>
            <path d="M224 0 V150" stroke="#7dce82" stroke-width="4"/>
            <path d="M0 42 H70" stroke="#f29b4b" stroke-width="5"/>
            <path d="M224 94 H320" stroke="#e5534b" stroke-width="4"/>
            <path d="M152 94 Q190 120 230 128 L320 132" stroke="#f29b4b" stroke-width="4"/>
          </g>
        </svg>
        <span class="mw-label" style="left:${gym.x}%;top:${gym.y + 4}%">${esc(gym.label)}</span>
        <span class="mw-label" style="left:${W.places.home.x}%;top:${W.places.home.y + 4}%">${esc(W.places.home.label)}</span>
        <div class="mw-pos" id="mwSeongchan" style="left:${at.x}%;top:${at.y}%">${personPin(W.seongchan, 'sc')}</div>
        <div class="mw-pos ${withE ? 'show' : ''}" id="mwEunseok" style="${eunseokStyle()}">${personPin(W.eunseok, 'es')}</div>
        <span class="mw-zoom"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l4.5 4.5M8 10.5h5"/></svg></span>
      </div>
      <span class="lbl">지도</span>
    </div>`;
  }
  // 은석 핀: 체육관에서 '띡' 나타났다가(히든 설정: 성찬이 은석 폰을 뺏어 위치 공유 등록), 마지막엔 집으로
  function eunseokStyle() {
    const p = MAPW.places[state.backHome ? 'home' : 'gym'];
    return `left:${p.x + 12}%;top:${p.y}%`;
  }
  function updateMapWidget() {
    const W = MAPW;
    const sc = document.getElementById('mwSeongchan');
    if (sc) { const at = W.places[seongchanSpot()]; sc.style.left = at.x + '%'; sc.style.top = at.y + '%'; }
    const es = document.getElementById('mwEunseok');
    if (es) { es.classList.toggle('show', state.done.size >= 3); es.setAttribute('style', eunseokStyle()); }
  }

  /* ---------- 할 일 (미션) ---------- */
  // stories: 희수 스토리 2개 / rise: 라이즈 단톡방 / eunseok: 은석 카톡방 / comment: 얼라이브 게시글 댓글
  // comment: 얼라이브 게시글 댓글 / scrap: 에타 '스크랩한 글' 화면 / spotify: 스포티파이 열기 / calendar: 캘린더 열기
  const MISSIONS = ['comment', 'scrap', 'spotify', 'calendar'];
  function mission(key) {
    if (!key || !MISSIONS.includes(key) || state.done.has(key)) return;
    state.done.add(key);
    updateMapWidget();
    if (MISSIONS.every((k) => state.done.has(k)) && !state.alertShown) {
      state.alertShown = true;
      setTimeout(showPetcamAlert, PCA.delay || 1500);
    }
  }
  function showPetcamAlert() {
    state.backHome = true;
    updateMapWidget();
    const old = bannerEl.firstElementChild;
    if (old) old.remove();
    const el = document.createElement('div');
    el.className = 'banner pc-banner';
    el.innerHTML = `
      <div class="b-ava pc-ico">🐾</div>
      <div class="b-body">
        <div class="b-app">펫캠 · ${esc(PCA.title)} <small>지금</small></div>
        <div class="b-title">겨울이네 🐶</div>
        <div class="b-text">${esc(PCA.text)}</div>
      </div>`;
    el.addEventListener('click', (e) => { e.stopPropagation(); el.remove(); openPetcamPopup(); });
    bannerEl.appendChild(el);
  }
  const popLayer = document.createElement('div');
  popLayer.className = 'pop-layer';
  phoneEl.appendChild(popLayer);
  function openPetcamPopup() {
    const c = clockNow();
    const ts = `2026-06-03 ${String(c.h).padStart(2, '0')}:${String(c.m).padStart(2, '0')}`;
    popLayer.innerHTML = `
      <div class="pp-dim" data-act="closePop"></div>
      <div class="pp-card">
        <div class="pp-head"><span class="pp-app">🐾 펫캠</span><b>${esc(PCA.cam)} 캠</b><button class="pp-x" data-act="closePop">✕</button></div>
        <div class="pp-media">${ph(PCA.media, PCA.label, 'dark')}<span class="pp-rec">● 움직임 감지</span><span class="pp-ts">${ts}</span></div>
        <div class="pp-text">${esc(PCA.text)}</div>
        <div class="pp-btns"><button data-act="closePop">닫기</button><button class="pri" data-act="popToPetcam">펫캠 열기</button></div>
      </div>`;
    popLayer.classList.add('open');
    popLayer.querySelectorAll('video').forEach((v) => { v.muted = true; const pr = v.play(); if (pr) pr.catch(() => {}); });
  }
  function closePop() { popLayer.classList.remove('open'); popLayer.innerHTML = ''; }

  /* ---------- 홈 ---------- */
  S.home = () => ({
    status: 'normal', ui: 'light',
    html: `<div class="scr home no-anim">
      ${ph(CONFIG.homeWallpaper, '', 'wall')}
      <div class="grid">
        ${mapWidgetHtml()}
        ${HOME_APPS.map((a) => `<div class="app" data-open="${a.id}">${iconHtml(a)}<span class="lbl">${esc(a.label)}</span></div>`).join('')}
      </div>
      <div class="search-pill">🔍 검색</div>
      <div class="dock">
        ${DOCK_APPS.map((a) => `<div class="app" data-open="${a.id}">${iconHtml(a)}<span class="lbl">${esc(a.label)}</span></div>`).join('')}
      </div>
    </div>`
  });

  /* ---------- 카카오톡: 채팅 목록 ---------- */
  function lastOf(chat) {
    let date = '';
    let last = null;
    chat.messages.forEach((m) => { if (m.date) date = m.date; else last = { ...m, date }; });
    return last;
  }
  function previewText(m) {
    if (!m) return '';
    if (m.type === 'photo') return '사진을 보냈습니다.';
    if (m.type === 'deleted') return '삭제된 메시지입니다.';
    if (m.type === 'file') return '파일: ' + m.text;
    if (m.type === 'vote') return '투표: ' + m.text;
    if (m.type === 'call') return m.text;
    return m.text;
  }
  function sortedChats() {
    const key = (c) => { const l = lastOf(c); return l ? l.date + ' ' + toMinutes(l.t) : ''; };
    return [...KAKAO.chats].sort((a, b) => (key(b) > key(a) ? 1 : -1));
  }
  function toMinutes(t) {
    const m = /(오전|오후)\s*(\d+):(\d+)/.exec(t || '');
    if (!m) return '0000';
    let h = +m[2] % 12; if (m[1] === '오후') h += 12;
    return String(h).padStart(2, '0') + m[3];
  }
  S.kakao = () => {
    const total = kakaoTotal();
    const list = sortedChats().map((c) => {
      const l = lastOf(c);
      const prev = previewText(l);
      return `<div class="item" data-go="kakaoRoom" data-p="${P({ id: c.id })}">
        ${kava(c.avatar, c.name.slice(0, 2), 'kk-ava', c.name)}
        <div class="grow" style="flex:1;min-width:0">
          <div class="name">${esc(c.name)}${c.group ? ` <small>${c.members}</small>` : ''}</div>
          <div class="prev">${esc(prev)}</div>
        </div>
        <div class="meta"><span class="tm">${l ? esc(shortWhen(l.date, l.t)) : ''}</span>${c.unread ? `<span class="un">${c.unread > 999 ? '999+' : c.unread}</span>` : ''}</div>
      </div>`;
    }).join('');
    return {
      status: 'normal', ui: 'dark',
      html: `<div class="scr kk" id="kkList">
        <div class="kk-head">
          <div class="top"><h1>채팅</h1><div class="ico"><span>⌕</span><span>⚙︎</span></div></div>
          <div class="chips">
            <span class="chip on">전체</span>
            <span class="chip">💬 <span class="cnt">${total}</span></span>
            <span class="chip" data-open="aiask">aiAsk</span>
            <span class="chip">✆</span>
            <span class="chip">≡+</span>
          </div>
        </div>
        <div class="kk-ad">
          <div style="flex:1"><div class="t1">🎁 선물하기 ›</div><div class="t2">${esc(KAKAO.ad.title)}</div><div class="t3">${esc(KAKAO.ad.sub)}</div></div>
          ${ph(KAKAO.ad.img, KAKAO.ad.brand)}
        </div>
        <div class="kk-list">${list}</div>
        <div class="pad-bottom" style="height:20px"></div>
        <div class="kk-tabs"><span>👤</span><span class="on">💬<b>${total}</b></span><span>▶</span><span>🛍</span><span>⋯</span></div>
      </div>`
    };
  };

  /* ---------- 카카오톡: 채팅방 ---------- */
  function msgHtml(chat, m, prev, next, isNew) {
    const me = m.from === 'me';
    const sameAsPrev = prev && !prev.date && prev.from === m.from && prev.t === m.t;
    const sameAsNext = next && !next.date && next.from === m.from && next.t === m.t;
    const showHead = !me && !sameAsPrev;
    const avatarSrc = KAKAO.avatars[m.from] || chat.avatar;
    let bub;
    if (m.type === 'photo') bub = `<div class="bub photo">${ph(m.src, m.label)}</div>`;
    else if (m.type === 'deleted') bub = `<div class="bub deleted">삭제된 메시지입니다.</div>`;
    else if (m.type === 'call') bub = `<div class="bub call">${esc(m.text)}</div>`;
    else if (m.type === 'file') bub = `<div class="bub file">${esc(m.text)}</div>`;
    else if (m.type === 'vote') bub = `<div class="bub vote">${esc(m.text)}</div>`;
    else bub = `<div class="bub">${esc(m.text)}</div>`;
    const unreadMark = me && m.read === false && !chat.group ? '<span class="r">1</span>' : '';
    const side = `<div class="side">${unreadMark}${!sameAsNext ? `<span>${esc(m.t)}</span>` : ''}</div>`;
    return `<div class="m ${me ? 'me' : ''} ${isNew ? 'new-msg' : ''}">
      ${!me ? (showHead ? kava(avatarSrc, m.from.slice(-2), 'ava', KAKAO.avatars[m.from] ? m.from : chat.name) : '<div class="ava blank" style="width:38px"></div>') : ''}
      <div class="col">
        ${showHead ? `<div class="who">${esc(m.from)}</div>` : ''}
        <div class="line">${bub}${side}</div>
      </div>
    </div>`;
  }
  function roomBody(chat) {
    const arr = chat.messages;
    return arr.map((m, i) => {
      if (m.date) return `<div class="dsep"><span>${dateLabel(m.date)}</span></div>`;
      return msgHtml(chat, m, arr[i - 1], arr[i + 1], m._new);
    }).join('');
  }
  S.kakaoRoom = ({ id }) => {
    const chat = chatById(id);
    chat.unread = 0;
    chat.messages.forEach((m) => delete m._new);
    return {
      status: 'normal', ui: 'dark',
      html: `<div class="scr room" id="room" data-room="${id}">
        <div class="room-head">
          <button class="bk" data-back>‹</button>
          <div class="nm">${esc(chat.name)}${chat.group ? `<small>${chat.members}</small>` : ''}</div>
          <div class="ic"><span>⌕</span><span>≡</span></div>
        </div>
        <div class="msgs" id="msgs">${roomBody(chat)}</div>
        <div class="room-input"><span class="pl">＋</span><div class="box">메시지 입력</div><span class="pl">☺</span><span class="pl">#</span></div>
      </div>`,
      after() { const ms = $('#msgs'); ms.scrollTop = ms.scrollHeight; }
    };
  };

  /* ---------- 배너 (11화 알림) ---------- */
  function startBanners(now) {
    if (state.bannersStarted) return;
    state.bannersStarted = true;
    let t = now === true ? 0 : BANNER_TIMING.firstDelay;
    BANNERS.forEach((b, i) => {
      if (i > 0) t += b.delay ?? BANNER_TIMING.gap;
      setTimeout(() => showBanner(b, i), t);
    });
  }
  function showBanner(b, i) {
    const chat = chatById(b.chat);
    const msg = { from: b.sender, text: b.text, t: ampm(), _new: true };
    chat.messages.push(msg);
    const cur = currentScreen();
    const inRoom = cur && cur.name === 'kakaoRoom' && cur.params.id === b.chat;
    if (!inRoom) chat.unread = (chat.unread || 0) + 1;

    // 열려 있는 화면 갱신
    if (inRoom) {
      const msgs = $('#msgs');
      if (msgs) { msgs.innerHTML = roomBody(chat); msgs.scrollTop = msgs.scrollHeight; }
    } else if (cur && cur.name === 'kakao') {
      const keep = $('#kkList') ? $('#kkList').scrollTop : 0;
      render(false); const l = $('#kkList'); if (l) l.scrollTop = keep;
    }
    const badge = $('.badge[data-badge="kakao"]');
    if (badge) { badge.textContent = kakaoTotal(); badge.classList.remove('bump'); void badge.offsetWidth; badge.classList.add('bump'); }

    if (inRoom) return;
    if (bannerEl.querySelector('.pc-banner')) return;   // 펫캠 알림이 떠 있으면 그대로 둬요
    const old = bannerEl.firstElementChild;
    if (old) { old.classList.add('out'); setTimeout(() => old.remove(), 340); }
    const el = document.createElement('div');
    el.className = 'banner';
    el.dataset.chat = b.chat;
    const ava = KAKAO.avatars[b.sender] || chat.avatar;
    el.innerHTML = `
      <div class="b-ava">${kava(ava, b.sender.slice(-2), '', KAKAO.avatars[b.sender] ? b.sender : chat.name)}<span class="mini">TALK</span></div>
      <div class="b-body">
        <div class="b-app">카카오톡 · ${esc(b.title)} <small>지금</small></div>
        <div class="b-title">${esc(b.sender)}</div>
        <div class="b-text">${esc(b.text)}</div>
      </div>`;
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      clearBanners();
      state.stack = [{ name: 'home', params: {} }, { name: 'kakao', params: {} }];
      go('kakaoRoom', { id: b.chat });
    });
    setTimeout(() => bannerEl.appendChild(el), old ? 200 : 0);
    if (i === BANNERS.length - 1) setTimeout(() => { if (el.isConnected) { el.classList.add('out'); setTimeout(() => el.remove(), 340); } }, 9000);
  }
  function clearBanners() { bannerEl.innerHTML = ''; }

  /* ---------- 에브리타임 ---------- */
  const ET = EVERYTIME;
  function etTabs(on) {
    const t = [['everytime', '🏠', '홈'], ['etTimetable', '▦', '시간표'], ['etBoards', '💬', '게시판'], ['etMessages', '✉️', '쪽지']];
    return `<div class="et-tabs">${t.map(([s, i, l]) => `<button class="${s === on ? 'on' : ''}" data-tab="${s}"><i>${i}</i>${l}</button>`).join('')}</div>`;
  }
  S.everytime = () => {
    const unreadN = ET.notifications.filter((n) => n.unread).length;
    return {
      status: 'normal', ui: 'dark',
      html: `<div class="scr et">
        <div class="et-top">
          <div class="school"><small>에브리타임</small><b>${esc(ET.school)}</b></div>
          <div class="tools">
            <button data-go="etSearch">🔍</button>
            <button data-go="etNoti">🔔${unreadN ? `<span class="cnt">${unreadN}</span>` : ''}</button>
            <span class="me">👤</span>
          </div>
        </div>
        <div class="et-quick">
          <div data-tab="etTimetable">학교 일정<small>책자 1차 촬영 D-8</small></div>
          <div>오늘 할일<small>기말 과제 2개</small></div>
        </div>
        <div class="et-icons">
          ${[['🏫', '학교 홈'], ['📰', '학교뉴스'], ['💺', '열람실 현황'], ['📢', '학사공지'], ['✅', '전자출결']].map(([i, l]) => `<div data-toast="${l}"><i>${i}</i>${l}</div>`).join('')}
        </div>
        ${ET.adImg ? `<div class="et-ad-img">${ph(ET.adImg, ET.ad)}<small>AD</small></div>` : `<div class="et-ad"><small>광고</small>${esc(ET.ad)}</div>`}
        <div class="et-card">
          <h3>자주 찾는 게시판 <small data-tab="etBoards">더 보기 ›</small></h3>
          ${ET.homeBoards.map((b) => `<div class="b"><b>${esc(b.name)}</b><span>${esc(b.preview)}</span></div>`).join('')}
        </div>
        <div class="pad-bottom" style="height:30px"></div>
        ${etTabs('everytime')}
      </div>`
    };
  };

  function ttGrid(person) {
    const days = ['월', '화', '수', '목', '금'];
    const start = 9, end = 19, H = 44;
    const hours = [];
    for (let h = start; h < end; h++) hours.push(h);
    const cols = days.map((d) => {
      const blocks = [];
      person.courses.forEach((c) => c.slots.forEach(([day, s, e]) => {
        if (day !== d) return;
        blocks.push(`<div class="tt-course" style="top:${(s - start) * H}px;height:${(e - s) * H - 1}px;background:${c.color}">${esc(c.name)}<small>${esc(c.room)}</small></div>`);
      }));
      return `<div class="tt-col">${hours.map(() => '<div class="cell"></div>').join('')}${blocks.join('')}</div>`;
    });
    return `<div class="tt-card"><div class="tt-grid">
      <div class="dh"></div>${days.map((d) => `<div class="dh">${d}</div>`).join('')}
      <div>${hours.map((h) => `<div class="hr">${h > 12 ? h - 12 : h}</div>`).join('')}</div>
      ${cols.join('')}
    </div></div>`;
  }
  S.etTimetable = () => {
    const tt = ET.timetable;
    return {
      status: 'normal', ui: 'dark',
      html: `<div class="scr et">
        <div class="tt-head"><div><small>${esc(tt.semester)}</small><h1>시간표 <span style="font-size:16px">⌄</span></h1></div><span style="font-size:22px">⇆</span></div>
        ${ttGrid(tt.me)}
        <div class="tt-calc"><h3>학점계산기</h3><p><span>평균 학점 <b>3.62</b> / 4.5</span><span>취득 학점 <b>112</b> / 130</span></p></div>
        <div class="tt-sheet">
          <div class="grab"></div>
          <div class="srch"><div>🔍 이름으로 친구를 검색하세요.</div><span style="font-size:20px">👤＋</span></div>
          ${tt.friends.map((f) => `<div class="tt-friend" ${f.open ? `data-go="etFriendTT" data-p="${P({ name: f.name })}"` : `data-toast="${esc(f.name)}님은 시간표를 공개하지 않았어요"`}>
            <span class="st ${f.open ? 'on' : ''}">${f.open ? '★' : '☆'}</span><b>${esc(f.name)}</b><span class="btns">☝︎ | 💬</span></div>`).join('')}
        </div>
        <div class="pad-bottom" style="height:20px"></div>
        ${etTabs('etTimetable')}
      </div>`
    };
  };
  S.etFriendTT = ({ name }) => {
    const f = ET.timetable.friends.find((x) => x.name === name);
    return {
      status: 'normal', ui: 'dark',
      html: `<div class="scr et">
        <div class="et-sub"><button class="bk" data-back>‹</button><h2>${esc(f.name)}</h2></div>
        <div class="tt-head" style="padding-top:12px"><div><small>${esc(ET.timetable.semester)} · ${esc(f.dept)}</small><h1 style="display:block"><span class="who">${esc(f.name)}</span>의 시간표</h1></div></div>
        ${ttGrid(f)}
        <div class="pad-bottom"></div>
      </div>`
    };
  };

  S.etBoards = () => {
    const bs = [['free', '자유게시판'], ['secret', '비밀게시판'], ['soccer', '축구봐영⚽'], ['rainbow', '무영지개🌈']];
    return {
      status: 'normal', ui: 'dark',
      html: `<div class="scr et">
        <div class="tt-head"><h1>게시판</h1><span style="font-size:20px">🔍</span></div>
        <div class="et-boards">
          ${bs.map(([k, n]) => `<div class="eb eb-off"><span class="eb-ico">📌</span>${esc(n)}</div>`).join('')}
          <div class="eb-line"></div>
          <div class="eb eb-off"><span class="eb-ico">📝</span>내가 쓴 글</div>
          <div class="eb" data-go="etScrap"><span class="eb-ico">⭐</span>스크랩한 글</div>
        </div>
        <div class="pad-bottom"></div>
        ${etTabs('etBoards')}
      </div>`
    };
  };
  S.etMyPosts = () => {
    const mine = [];
    Object.entries(ET.boards).forEach(([k, b]) => b.posts.forEach((p, i) => { if (p.mine) mine.push(postRow(p, k, i)); }));
    return {
      status: 'normal', ui: 'dark',
      html: `<div class="scr et">
        <div class="et-sub"><button class="bk" data-back>‹</button><h2>내가 쓴 글</h2></div>
        ${mine.join('') || '<div class="empty">아직 쓴 글이 없어요</div>'}
      </div>`
    };
  };
  function postRow(p, board, i) {
    const target = p.id ? `data-go="etPost" data-p="${P({ id: p.id })}"` : `data-go="etPost" data-p="${P({ b: board, i })}"`;
    return `<div class="et-post-row" ${target}>
      <h4>${esc(p.title)}</h4><p>${esc(p.body.split('\n')[0])}</p>
      <div class="mt"><span>${esc(p.time)}</span><span>익명</span><span class="lk">♡ ${p.likes}</span><span class="cm">💬 ${p.comments}</span>${p.scrapped ? `<span class="sc">★ ${p.scraps}</span>` : ''}</div>
    </div>`;
  }
  S.etBoard = ({ b }) => {
    const board = ET.boards[b];
    return {
      status: 'normal', ui: 'dark',
      html: `<div class="scr et">
        <div class="et-sub"><button class="bk" data-back>‹</button><h2>${esc(board.name)}</h2></div>
        ${board.posts.map((p, i) => postRow(p, b, i)).join('')}
        <div class="pad-bottom"></div>
      </div>`
    };
  };
  S.etScrap = () => {
    const p = ET.boards.rainbow.posts.find((x) => x.id === 'hetero');
    return {
      status: 'normal', ui: 'dark',
      html: `<div class="scr et">
        <div class="et-sub"><button class="bk" data-back>‹</button><h2>스크랩한 글</h2></div>
        ${postRow(p, 'rainbow')}
      </div>`,
      after() { mission('scrap'); }
    };
  };
  S.etPost = ({ id, b, i }) => {
    let post, boardName;
    if (id) { post = ET.posts[id]; boardName = '무영지개🌈'; }
    else {
      const bp = ET.boards[b].posts[i];
      boardName = ET.boards[b].name;
      post = { author: '익명', time: bp.time, title: bp.title, body: bp.body, likes: bp.likes, comments: bp.comments, scraps: 0, thread: [] };
    }
    const thread = (post.thread || []).map((c) => `
      <div class="et-cmt" style="padding-left:${18 + Math.min(c.depth, 6) * 16}px">
        <div class="hd">${c.depth ? '<span class="arrow">↳</span>' : ''}<span class="anon sm"></span><b class="${c.op ? 'op' : ''}">${esc(c.who)}</b></div>
        <div class="tx ${c.deleted ? 'del' : ''}">${esc(c.text)}</div>
        ${c.time ? `<div class="tm">${esc(c.time)}</div>` : ''}
      </div>`).join('');
    return {
      status: 'normal', ui: 'dark',
      html: `<div class="scr et">
        <div class="et-sub"><button class="bk" data-back>‹</button><h2>${esc(boardName)}</h2></div>
        <div class="et-post">
          <div class="au"><span class="anon"></span><div><b>${esc(post.author)}</b><small>${esc(post.time)}</small></div></div>
          <h1>${esc(post.title)}</h1>
          <div class="body">${esc(post.body)}</div>
        </div>
        <div class="et-acts"><span>👍 공감 ${post.likes}</span><span>💬 댓글 ${post.comments}</span><span class="sc ${post.scrapped ? 'on' : ''}">🔖 스크랩 ${post.scraps}</span></div>
        ${thread}
        <div class="pad-bottom" style="height:20px"></div>
        <div class="et-input"><div>댓글을 입력하세요.</div></div>
      </div>`
    };
  };
  S.etSearch = () => ({
    status: 'normal', ui: 'dark',
    html: `<div class="scr et et-search">
      <div class="et-sub"><button class="bk" data-back>‹</button><h2>검색</h2></div>
      <div class="box">🔍 전체 게시판의 글을 검색하세요!</div>
      <h5><span>최근 검색어</span><span>전체 삭제</span></h5>
      ${ET.searchHistory.map((h) => `<div class="hist">${esc(h)}<span>✕</span></div>`).join('')}
    </div>`
  });
  S.etNoti = () => ({
    status: 'normal', ui: 'dark',
    html: `<div class="scr et">
      <div class="et-sub"><button class="bk" data-back>‹</button><h2>알림</h2></div>
      ${ET.notifications.map((n, i) => `<div class="et-noti ${n.unread ? 'un' : ''}" ${i < 2 ? `data-go="etPost" data-p="${P({ id: 'hetero' })}"` : ''}>
        <i>${i < 2 ? '💬' : '📢'}</i><div><b>${esc(n.board)}</b><p>${esc(n.text)}</p><small>${esc(n.time)}</small></div></div>`).join('')}
    </div>`
  });
  S.etMessages = () => ({
    status: 'normal', ui: 'dark',
    html: `<div class="scr et">
      <div class="tt-head"><h1>쪽지함</h1></div>
      <div class="empty">쪽지함이 비어 있어요</div>
      ${etTabs('etMessages')}
    </div>`
  });

  /* ---------- 인스타그램 ---------- */
  const IG = INSTAGRAM;
  // 인스타 아이콘: 전부 같은 굵기(2px)의 선 아이콘
  const svg = (d, extra = '') => `<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ${extra}>${d}</svg>`;
  const IC = {
    heart: svg('<path d="M12 20.3s-7.6-4.6-9.4-9.3C1.3 7.6 3.6 4.2 7 4.2c2 0 3.6 1.1 5 3 1.4-1.9 3-3 5-3 3.4 0 5.7 3.4 4.4 6.8-1.8 4.7-9.4 9.3-9.4 9.3z"/>'),
    comment: svg('<path d="M20.6 15.6A9 9 0 1 0 17 19.4L21 21z"/>'),
    repost: svg('<path d="M17 2.5l3.5 3.5L17 9.5"/><path d="M3.5 11V9.5a3.5 3.5 0 0 1 3.5-3.5h13.5"/><path d="M7 21.5L3.5 18 7 14.5"/><path d="M20.5 13v1.5a3.5 3.5 0 0 1-3.5 3.5H3.5"/>'),
    send: svg('<path d="M21.5 2.5L10.2 13.8"/><path d="M21.5 2.5l-7 19-4.3-7.7-7.7-4.3z"/>'),
    bookmark: svg('<path d="M19 21l-7-5.2L5 21V4.5A1.5 1.5 0 0 1 6.5 3h11A1.5 1.5 0 0 1 19 4.5z"/>'),
    home: svg('<path d="M3.5 10.2L12 3l8.5 7.2V20a1 1 0 0 1-1 1H15v-6.5H9V21H4.5a1 1 0 0 1-1-1z"/>'),
    search: svg('<circle cx="10.8" cy="10.8" r="7.3"/><path d="M16.2 16.2L21 21"/>'),
    plus: svg('<rect x="3" y="3" width="18" height="18" rx="5"/><path d="M12 8v8M8 12h8"/>'),
    reels: svg('<rect x="3" y="3" width="18" height="18" rx="5"/><path d="M3 8.5h18M9.5 3l3 5.5M15.5 3l3 5.5"/><path d="M10.2 12.3v5.2l4.5-2.6z"/>'),
    more: svg('<circle cx="5" cy="12" r=".9"/><circle cx="12" cy="12" r=".9"/><circle cx="19" cy="12" r=".9"/>', 'stroke-width="2.4"'),
    back: svg('<path d="M15 4l-8 8 8 8"/>'),
    close: svg('<path d="M6 6l12 12M18 6L6 18"/>'),
    menu: svg('<path d="M3.5 6h17M3.5 12h17M3.5 18h17"/>'),
    image: svg('<rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="8.8" cy="8.8" r="1.7"/><path d="M21 15.5l-5-5L5 21"/>'),
    gif: svg('<rect x="2.5" y="4.5" width="19" height="15" rx="3.5"/><path d="M9.8 10H8a1.5 1.5 0 0 0-1.5 1.5v1A1.5 1.5 0 0 0 8 14h1.8v-2H8.6M12.5 10v4M15.5 14v-4h2.5M15.5 12h2"/>', 'stroke-width="1.8"'),
    camera: svg('<path d="M3 8.5A2.5 2.5 0 0 1 5.5 6h2l1.5-2h6l1.5 2h2A2.5 2.5 0 0 1 21 8.5v9a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5z"/><circle cx="12" cy="12.8" r="3.6"/>'),
    person: '<svg class="i" viewBox="0 0 24 24"><circle cx="12" cy="9" r="4" fill="#c7c7cc"/><path d="M4 21c.8-4 4-6 8-6s7.2 2 8 6z" fill="#c7c7cc"/></svg>'
  };
  function igTabs(on = '') {
    const t = (k, ic) => `<span data-tab="${k}" class="${on === k ? 'on' : ''}">${ic}</span>`;
    return `<div class="ig-tabs">${t('instagram', IC.home)}${t('igSearch', IC.search)}<span data-toast="새 게시물">${IC.plus}</span><span data-toast="릴스">${IC.reels}</span><span class="me ${on === 'igMe' ? 'on' : ''}" data-tab="igMe">${ph(IG.me.avatar, '', 'round')}</span></div>`;
  }
  const ring = (src, seen, extra = '') => `<div class="ring ${seen ? 'seen' : ''}" ${extra}><div class="in">${ph(src, '', 'round')}</div></div>`;
  /* --- 인스타 댓글: 독자가 직접 다는 댓글 ---
     COMMENTS_API_URL이 있으면 모든 독자가 같이 보는 공유 댓글,
     없으면 이 브라우저에만 저장되는 댓글로 동작해요. */
  const READER_ID_LIST = (typeof READER_IDS !== 'undefined' && READER_IDS.length) ? READER_IDS
    : ['ilovegay', 'zltmgo', 'rubyeontae', 'insomnia', 'icantsleep', 'yourbyeontae', 'aburasoba', 'mandu', 'byeontae', 'bigbunny', 'rockndeer', 'imbyeontae'];
  const SHARED = !!COMMENTS_API_URL;
  const store = {
    get(k, d) { try { const v = localStorage.getItem('scphone.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('scphone.' + k, JSON.stringify(v)); } catch (e) { /* 저장 불가 환경 */ } }
  };
  const memComments = {};      // 로컬 모드: 저장이 막힌 브라우저용
  const sharedComments = {};   // 공유 모드: 서버에서 받아 온 댓글
  const mention = (t) => esc(t).replace(/(^|\s)(@[\w._]+)/g, '$1<span class="mention">$2</span>');
  function ago(at) {
    if (!at) return '방금';
    const d = (Date.now() - new Date(at).getTime()) / 1000;
    if (!(d >= 0) || d < 60) return '방금';
    if (d < 3600) return Math.floor(d / 60) + '분';
    if (d < 86400) return Math.floor(d / 3600) + '시간';
    if (d < 86400 * 7) return Math.floor(d / 86400) + '일';
    return Math.floor(d / (86400 * 7)) + '주';
  }
  function readerList(fi) {
    if (SHARED) return sharedComments[fi] || [];
    return store.get('igc.' + fi, null) || memComments[fi] || [];
  }
  function commentTotal(f, fi) {
    const base = f.comments || [];
    return base.reduce((n, c) => n + 1 + (c.replies ? c.replies.length : 0), 0) + readerList(fi).length;
  }
  function commentListHtml(f, fi) {
    const base = f.comments || [];
    const mine = readerList(fi);
    if (!base.length && !mine.length) {
      return `<div class="cs-empty"><b>아직 댓글이 없습니다</b><small>댓글을 남겨보세요.</small></div>`;
    }
    const row = (c, reply) => `<div class="cs-row ${reply ? 'reply' : ''}">
        <div class="cs-ava">${c.avatar ? ph(c.avatar, '', 'round') : IC.person}</div>
        <div class="cs-body">
          <div class="cs-meta"><b>${esc(c.id)}</b><small>${c.reader ? ago(c.at) : esc(c.ago || '6일')}</small></div>
          <div class="cs-text">${mention(c.text)}</div>
          <div class="cs-sub">답글 달기</div>
        </div>
        <span class="cs-like" data-act="cmtLike">${IC.heart}</span>
      </div>`;
    return base.map((c) => row(c) + (c.replies || []).map((r) => row(r, true)).join('')).join('')
      + mine.map((c) => row(c)).join('');
  }
  function refreshComments(fi) {
    const list = document.getElementById('csList');
    if (list && sheetPost === fi) { list.innerHTML = commentListHtml(IG.feed[fi], fi); list.scrollTop = list.scrollHeight; }
    document.querySelectorAll(`[data-cnt-comment="${fi}"]`).forEach((el) => { el.textContent = commentTotal(IG.feed[fi], fi); });
    const more = document.getElementById('igmore-' + fi);
    if (more) { const n = commentTotal(IG.feed[fi], fi); more.textContent = n ? `댓글 ${n}개 모두 보기` : ''; }
  }

  /* 댓글 창 열고 닫기 */
  const sheetLayer = document.createElement('div');
  sheetLayer.className = 'sheet-layer';
  phoneEl.appendChild(sheetLayer);
  let sheetPost = null;
  const EMOJIS = ['❤️', '🙌', '🔥', '👏', '😢', '😍', '😮', '😂'];
  function openSheet(fi) {
    sheetPost = fi;
    const f = IG.feed[fi];
    sheetLayer.innerHTML = `
      <div class="cs-dim" data-act="closeSheet"></div>
      <div class="cs">
        <div class="cs-grab" data-act="closeSheet"><i></i></div>
        <div class="cs-title">댓글</div>
        <div class="cs-list" id="csList">${commentListHtml(f, fi)}</div>
        <div class="cs-emoji">${EMOJIS.map((e) => `<button type="button" data-act="addEmoji" data-e="${e}">${e}</button>`).join('')}</div>
        <form class="cs-input ig-add" data-post="${fi}">
          <div class="cs-me">${ph(IG.me.avatar, '', 'round')}</div>
          <div class="cs-box">
            <input type="text" maxlength="150" placeholder="회원님의 생각을 남겨보세요." autocomplete="off" spellcheck="false">
            <span class="cs-tools">${IC.image}${IC.gif}</span>
            <button type="submit" class="cs-post">게시</button>
          </div>
        </form>
      </div>`;
    sheetLayer.classList.add('open');
    const inp = sheetLayer.querySelector('input');
    const sync = () => sheetLayer.querySelector('.cs-box').classList.toggle('typing', !!inp.value.trim());
    inp.addEventListener('input', sync);
    const list = document.getElementById('csList');
    list.scrollTop = 0;
    loadShared(fi);
  }
  function closeSheet() {
    if (sheetPost === null) return;
    sheetPost = null;
    sheetLayer.classList.remove('open');
    sheetLayer.innerHTML = '';
  }
  // 공유 모드: 서버에서 댓글 불러오기
  function loadShared(fi) {
    if (!SHARED) return;
    fetch(`${COMMENTS_API_URL}?post=${fi}&t=${Date.now()}`)
      .then((r) => r.json())
      .then((d) => {
        sharedComments[fi] = (d.comments || []).map((c) => ({ id: c.id, text: c.text, at: c.at, reader: true }));
        refreshComments(fi);
      })
      .catch(() => {});
  }
  let lastPost = 0;
  function addReaderComment(fi, text, form) {
    text = text.trim().slice(0, 150);
    if (!text) return;
    if (!SHARED) {
      const n = store.get('igc.n', 0);
      const list = readerList(fi).slice();
      list.push({ id: READER_ID_LIST[n % READER_ID_LIST.length], text, reader: true, at: new Date().toISOString() });
      store.set('igc.' + fi, list);
      store.set('igc.n', n + 1);
      memComments[fi] = list;
      refreshComments(fi);
      mission('comment');
      return;
    }
    // 같은 사람이 너무 빨리 연달아 올리지 못하게 (10초)
    if (Date.now() - lastPost < 10000) { toast('조금 있다가 다시 달아 주세요'); return; }
    lastPost = Date.now();
    const btn = form && form.querySelector('button');
    if (btn) { btn.disabled = true; btn.textContent = '게시 중'; }
    fetch(COMMENTS_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ post: fi, text })
    })
      .then((r) => r.json())
      .then((d) => {
        if (!d.ok) throw new Error('fail');
        loadShared(fi);
        mission('comment');
      })
      .catch(() => { toast('댓글을 올리지 못했어요. 잠시 후 다시 시도해 주세요'); lastPost = 0; })
      .finally(() => { if (btn) { btn.disabled = false; btn.textContent = '게시'; } });
  }
  const liked = {};
  const saved = {};
  const num = (v) => Number(String(v).replace(/,/g, '')) || 0;
  const baseLikes = (f) => num(f.likes) - (f.likedByMe ? 1 : 0);
  const fmt = (n) => (n >= 10000 ? (Math.floor(n / 1000) / 10).toString().replace(/\.0$/, '') + '만' : n.toLocaleString());
  S.instagram = () => ({
    status: 'normal', ui: 'dark',
    html: `<div class="scr ig">
      <div class="ig-top"><span class="logo">Instagram</span><div class="ic"><span>${IC.heart}</span><span class="dm">${IC.send}<i>2</i></span></div></div>
      <div class="stories">
        <div class="story" data-go="igStory" data-p="${P({ u: 'me', i: 0 })}">${ring(IG.me.avatar, true)}<span>내 스토리</span></div>
        ${IG.storyBar.map((s) => { const has = s.id === IG.heesu.id || (IG.otherStories && IG.otherStories[s.id]); return `<div class="story" ${has ? `data-go="igStory" data-p="${P({ u: s.id, i: 0 })}"` : `data-toast="${esc(s.id)}"`}>${ring(s.avatar, s.seen)}<span>${esc(s.id)}</span></div>`; }).join('')}
      </div>
      ${IG.feed.map((f, fi) => {
        // 좋아요 누른 친구들 (게시물 왼쪽 아래). data.js의 likers로 바꿀 수 있어요
        const likers = f.likers || [{ avatar: IG.heesu.avatar }, { avatar: 'images/profile/sohee.jpg' }];
        if (liked[fi] === undefined) liked[fi] = !!f.likedByMe;
        const likes = baseLikes(f) + (liked[fi] ? 1 : 0);
        return `<div class="ig-post">
        <div class="hd">${ph(f.avatar, '', 'round')}<b>${esc(f.user)}</b><span class="more">${IC.more}</span></div>
        <div class="pic-wrap" data-act="igDoubleLike" data-i="${fi}">
          ${ph(f.img, f.label, 'pic')}
          <div class="likers">${likers.map((l) => `<span class="lk">${ph(l.avatar, '', 'round')}<i>♥</i></span>`).join('')}</div>
        </div>
        <div class="bar">
          <span class="b ${liked[fi] ? 'liked' : ''}" data-act="igLike" data-i="${fi}">${IC.heart}<em id="iglikes-${fi}">${fmt(likes)}</em></span>
          <span class="b" data-act="igComments" data-i="${fi}">${IC.comment}<em data-cnt-comment="${fi}">${commentTotal(f, fi)}</em></span>
          <span class="b">${IC.repost}<em>${esc(f.reposts || '12')}</em></span>
          <span class="b">${IC.send}<em>${esc(f.shares || '54')}</em></span>
          <span class="b save ${saved[fi] ? 'on' : ''}" data-act="igSave" data-i="${fi}">${IC.bookmark}</span>
        </div>
        <div class="tx"><b>${esc(f.user)}</b> ${esc(f.caption)}</div>
        <div class="tx more-c" id="igmore-${fi}" data-act="igComments" data-i="${fi}">${commentTotal(f, fi) ? `댓글 ${commentTotal(f, fi)}개 모두 보기` : ''}</div>
        <div class="tx when">${esc(f.time)}</div>
      </div>`; }).join('')}
      <div class="pad-bottom" style="height:20px"></div>
      ${igTabs('instagram')}
    </div>`,
    after() { IG.feed.forEach((_, fi) => loadShared(fi)); }
  });
  // 공유 모드: 인스타 피드를 보고 있는 동안 20초마다 새 댓글 확인
  setInterval(() => {
    const cur = currentScreen();
    if (SHARED && cur && cur.name === 'instagram') IG.feed.forEach((_, fi) => loadShared(fi));
  }, 20000);
  S.igSearch = () => ({
    status: 'normal', ui: 'dark',
    html: `<div class="scr ig ig-search">
      <div class="box">${IC.search}<span class="typed">김</span></div>
      <h5>최근 검색 항목 <small>모두 보기</small></h5>
      ${IG.recentSearch.map((u) => `<div class="ig-user" ${u.id === IG.heesu.id ? `data-go="igProfile"` : `data-toast="${esc(u.id)}"`}>${ph(u.avatar, '', 'round')}<div><b>${esc(u.id)}</b><small>${esc(u.name)}</small></div><span class="x">${IC.close}</span></div>`).join('')}
      <div class="pad-bottom" style="height:380px"></div>
      ${igTabs('igSearch')}
    </div>`
  });
  S.igMe = () => {
    const me = IG.me;
    return {
      status: 'normal', ui: 'dark',
      html: `<div class="scr ig">
        <div class="ig-prof-head">${esc(me.id)}<span class="hd-ic">${IC.plus}${IC.menu}</span></div>
        <div class="ig-prof">
          <div class="r1">${ring(me.avatar, true, `data-go="igStory" data-p="${P({ u: 'me', i: 0 })}"`)}
            <div class="stats"><div><b>${me.posts}</b>게시물</div><div><b>${me.followers}</b>팔로워</div><div><b>${me.following}</b>팔로잉</div></div>
          </div>
          <div class="nm">${esc(me.name)}</div>
          <div class="bio">${esc(me.bio)}</div>
          <div class="btns"><button>프로필 편집</button><button>프로필 공유</button></div>
        </div>
        <div class="ig-grid">${Array.from({ length: me.grid || 9 }, (_, i) => ph(`images/instagram/me-grid-${i + 1}.jpg`, `게시물 ${i + 1}`)).join('')}</div>
        <div class="pad-bottom" style="height:20px"></div>
        ${igTabs('igMe')}
      </div>`
    };
  };
  S.igProfile = () => {
    const h = IG.heesu;
    return {
      status: 'normal', ui: 'dark',
      html: `<div class="scr ig">
        <div class="ig-prof-head"><button class="bk" data-back>${IC.back}</button>${esc(h.id)}<span class="hd-ic">${IC.more}</span></div>
        <div class="ig-prof">
          <div class="r1">${ring(h.avatar, false, `data-go="igStory" data-p="${P({ i: 0 })}"`)}
            <div class="stats"><div><b>${h.posts}</b>게시물</div><div><b>${h.followers}</b>팔로워</div><div><b>${h.following}</b>팔로잉</div></div>
          </div>
          <div class="nm">${esc(h.name)}</div>
          <div class="bio">${esc(h.bio)}</div>
          <div class="btns"><button>팔로잉 ⌄</button><button data-go="igDm">메시지</button></div>
        </div>
        <div class="ig-grid">${Array.from({ length: h.grid }, (_, i) => ph(`images/instagram/heesu-grid-${i + 1}.jpg`, `게시물 ${i + 1}`)).join('')}</div>
        <div class="pad-bottom"></div>
      </div>`
    };
  };
  let storyTimer;
  const storyOwner = (u) => {
    if (!u || u === IG.heesu.id) return IG.heesu;
    if (u === 'me') return { ...IG.me, id: IG.me.id };
    return { id: u, ...IG.otherStories[u] };
  };
  S.igStory = ({ u, i = 0 }) => {
    const h = storyOwner(u);
    const s = h.stories[i];
    clearTimeout(storyTimer);
    return {
      status: 'normal', ui: 'light',
      html: `<div class="scr story-view zoom-in">
        <div class="media">${ph(s.img, s.label, 'dark')}</div>
        <div class="bars">${h.stories.map((_, k) => `<i class="${k < i ? 'done' : k === i ? 'cur' : ''}"></i>`).join('')}</div>
        <div class="who">${ph(h.avatar, '', 'round')}${esc(h.id)} <small>${esc(s.ago)}</small><span class="x" data-back>${IC.close}</span></div>
        ${s.caption ? `<div class="cap">${esc(s.caption)}</div>` : ''}
        <div class="tapzone"><div data-act="storyPrev"></div><div data-act="storyNext"></div></div>
        <div class="reply"><div ${h.id === IG.heesu.id ? 'data-go="igDm"' : ''}>메시지 보내기</div><span>${IC.heart}</span><span>${IC.send}</span></div>
      </div>`,
      after() {
        storyTimer = setTimeout(() => storyStep(1), 5000);
        if (h.id === IG.heesu.id) {
          state.seenStories.add(i);

        }
      }
    };
  };
  function storyStep(d) {
    clearTimeout(storyTimer);
    const cur = currentScreen();
    if (!cur || cur.name !== 'igStory') return;
    const n = (cur.params.i || 0) + d;
    if (n < 0) return;
    if (n >= storyOwner(cur.params.u).stories.length) { back(); return; }
    cur.params.i = n;
    render(false);
  }
  S.igDm = () => {
    const h = IG.heesu;
    return {
      status: 'normal', ui: 'dark',
      html: `<div class="scr dm">
        <div class="dm-head"><button class="bk" data-back>${IC.back}</button>${ph(h.avatar, '', 'round')}<div><b>${esc(h.name)}</b><small>${esc(h.id)}</small></div></div>
        <div class="dm-body">${ph(h.avatar, '', 'round')}<b>${esc(h.name)}</b><small>${esc(h.id)} · Instagram</small><small>팔로워 ${h.followers}명 · 게시물 ${h.posts}개</small><button>프로필 보기</button></div>
        <div class="dm-input"><div><span class="cam">${IC.camera}</span><input class="tx-in" id="dmInput" type="text" value="${esc(state.dmText ?? '')}" ${state.typed ? '' : 'readonly'} autocomplete="off" spellcheck="false"><span class="send" aria-disabled="true">보내기</span></div></div>
      </div>`,
      after() {
        const inp = $('#dmInput');
        inp.addEventListener('input', () => { if (state.typed) state.dmText = inp.value; });
        startTyping();
        inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') e.preventDefault(); });
      }
    };
  };

  // 링크를 열면 DM 입력창에 글자가 한 글자씩 써지고, 다 써지면 카톡 배너 시작
  let typingStarted = false;
  function startTyping() {
    if (typingStarted || state.typed) return;
    typingStarted = true;
    const chars = [...IG.dmDraft];
    let k = 0;
    state.dmText = '';
    const step = () => {
      k += 1;
      state.dmText = chars.slice(0, k).join('');
      const inp = document.getElementById('dmInput');
      if (inp) inp.value = state.dmText;
      if (k < chars.length) {
        setTimeout(step, DMT.speed + Math.random() * 120 - 40);
      } else {
        state.typed = true;
        if (inp) inp.removeAttribute('readonly');
        setTimeout(() => startBanners(true), BANNER_TIMING.afterTyping ?? 1200);
      }
    };
    setTimeout(step, DMT.startDelay);
  }

  /* ---------- 펫캠 ---------- */
  S.petcam = ({ cam = 'living' }) => {
    const c = PETCAM.cams.find((x) => x.id === cam);
    const camName = (id) => PETCAM.cams.find((x) => x.id === id).name;
    return {
      status: 'normal', ui: 'light',
      html: `<div class="scr pc">
        <div class="pc-head"><div><small>● 연결됨</small><h1>겨울이네 🐶</h1></div><span style="font-size:20px">⚙︎</span></div>
        <div class="pc-tabs">${PETCAM.cams.map((x) => `<button class="${x.id === cam ? 'on' : ''}" data-replace="petcam" data-p="${P({ cam: x.id })}">${esc(x.name)} 캠</button>`).join('')}</div>
        ${c.off
          ? `<div class="pc-live pc-off"><div class="off-msg"><b>📷 카메라가 꺼져 있어요</b><small>${esc(c.offSince)}에 꺼짐</small></div></div>`
          : `<div class="pc-live">${ph(c.live, c.liveLabel, 'dark')}<span class="tag">LIVE</span><span class="ts" id="pcTs"></span></div>`}
        <div class="pc-ctrl">
          <div data-toast="말하기"><i>🎙</i>말하기</div><div data-toast="스냅샷 저장"><i>📸</i>스냅샷</div><div data-toast="녹화 시작"><i>⏺</i>녹화</div><div data-toast="간식 발사! (겨울이 없음)"><i>🦴</i>간식</div>
        </div>
        <h3>녹화 기록</h3>
        ${PETCAM.clips.map((g, gi) => `
          <div class="pc-date">${dateLabel(g.date)}</div>
          ${g.items.map((it, ii) => it.system ? `<div class="pc-clip pc-sys"><span class="sys-ico">⏻</span><div><b>${esc(it.time)} · ${esc(it.tag)}</b><small>${esc(camName(it.cam))} 캠</small></div></div>` : `<div class="pc-clip" data-go="petcamClip" data-p="${P({ g: gi, i: ii })}">
            ${ph(it.img, it.blur ? '' : it.label, `dark ${it.blur ? 'blur' : ''}`)}
            <div><b>${esc(it.time)} · ${esc(it.tag)}</b><small>${esc(camName(it.cam))} 캠${it.blur ? ' · 🙈' : ''}</small></div>
            ${it.star ? '<span class="star">★</span>' : ''}
          </div>`).join('')}`).join('')}
        <div class="pad-bottom"></div>
      </div>`
    };
  };
  S.petcamClip = ({ g, i }) => {
    const grp = PETCAM.clips[g];
    const it = grp.items[i];
    const camName = PETCAM.cams.find((x) => x.id === it.cam).name;
    return {
      status: 'normal', ui: 'light',
      html: `<div class="scr pc pc-player">
        <div class="pc-head"><button data-back style="font-size:17px;color:#5ac8fa">‹ 녹화 기록</button><span></span></div>
        <div class="vid ${it.blur ? 'blur' : ''}">${ph(it.img, it.blur ? '' : it.label, 'dark')}<button class="play" data-act="${it.blur ? 'blurPlay' : 'play'}">▶</button></div>
        <div class="bar"><i id="pcbar"></i></div>
        <div class="meta">${dateLabel(grp.date)} ${esc(it.time)}<br>${esc(camName)} 캠 · ${esc(it.tag)}${it.star ? '<br>★ 즐겨찾기한 영상' : ''}</div>
      </div>`
    };
  };

  /* ---------- 캘린더 ---------- */
  function eventsOn(iso) {
    const d = new Date(iso + 'T00:00:00');
    const list = CALENDAR_EVENTS.filter((e) => e.date === iso);
    CALENDAR_WEEKLY.forEach((w) => { if (d.getDay() === w.weekday && iso >= '2026-03-02' && iso <= '2026-06-12') list.push(w); });
    return list;
  }
  const isoOf = (y, m, d) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  S.calendar = ({ y = 2026, m = 5, sel = CONFIG.now.date }) => {
    const first = new Date(y, m, 1);
    const startDow = first.getDay();
    const days = new Date(y, m + 1, 0).getDate();
    const prevDays = new Date(y, m, 0).getDate();
    const cells = [];
    for (let k = 0; k < 42; k++) {
      const dn = k - startDow + 1;
      if (dn < 1) cells.push({ n: prevDays + dn, other: true });
      else if (dn > days) cells.push({ n: dn - days, other: true });
      else cells.push({ n: dn, iso: isoOf(y, m, dn) });
    }
    while (cells.length > 35 && cells.slice(-7).every((c) => c.other)) cells.splice(-7);
    const evs = eventsOn(sel);
    const pm = m === 0 ? { y: y - 1, m: 11 } : { y, m: m - 1 };
    const nm = m === 11 ? { y: y + 1, m: 0 } : { y, m: m + 1 };
    return {
      status: 'normal', ui: 'dark',
      html: `<div class="scr cal">
        <div class="cal-head">
          <div class="t"><h1><small>${y}년</small>${m + 1}월</h1>
            <div class="nav"><button data-replace="calendar" data-p="${P({ ...pm, sel: isoOf(pm.y, pm.m, 1) })}">‹</button><button data-replace="calendar" data-p="${P({ y: 2026, m: 5 })}" style="font-size:15px">오늘</button><button data-replace="calendar" data-p="${P({ ...nm, sel: isoOf(nm.y, nm.m, 1) })}">›</button></div>
          </div>
          <div class="cal-dow">${DOW.map((d) => `<span>${d}</span>`).join('')}</div>
        </div>
        <div class="cal-grid">
          ${cells.map((c) => {
            if (c.other) return `<div class="cal-day other"><div class="n">${c.n}</div></div>`;
            const e = eventsOn(c.iso);
            return `<div class="cal-day ${c.iso === CONFIG.now.date ? 'today' : ''} ${c.iso === sel ? 'sel' : ''}" data-replace="calendar" data-p="${P({ y, m, sel: c.iso })}">
              <div class="n">${c.n}</div><div class="dots">${e.slice(0, 3).map((x) => `<i style="background:${x.color}"></i>`).join('')}</div></div>`;
          }).join('')}
        </div>
        <div class="cal-list">
          <h4>${dateLabel(sel)}</h4>
          ${evs.length ? evs.map((e) => `<div class="cal-ev"><i style="background:${e.color}"></i><div><b>${esc(e.title)}</b><small>${e.time ? esc(e.time) : '하루 종일'}${e.alarm ? ' · ⏰ 알람' : ''}</small></div></div>`).join('') : '<div class="sub" style="color:#999;padding:10px 0">일정 없음</div>'}
        </div>
        <div class="pad-bottom"></div>
      </div>`
    };
  };

  /* ---------- 시계 ---------- */
  S.clock = () => ({
    status: 'normal', ui: 'light',
    html: `<div class="scr clk">
      <div class="big-title">알람</div>
      ${ALARMS.map((a, i) => `<div class="alarm ${a.on ? '' : 'off'}" data-act="alarm" data-i="${i}"><div><div class="t"><small>${a.ampm}</small>${a.time}</div><div class="l">${esc(a.label)}</div></div><span class="sw ${a.on ? 'on' : ''}"></span></div>`).join('')}
      <div class="pad-bottom" style="height:200px"></div>
      <div class="clk-tabs"><span><i>🌐</i>세계 시계</span><span class="on"><i>⏰</i>알람</span><span><i>⏱</i>스톱워치</span><span><i>⏲</i>타이머</span></div>
    </div>`
  });

  /* ---------- 사진 ---------- */
  S.album = () => ({
    status: 'normal', ui: 'dark',
    html: `<div class="scr ph-app">
      <div class="navbar" style="background:#fff"><span class="title" style="margin:0;text-align:left;font-size:30px;font-weight:800">사진</span><span style="color:var(--ios-blue)">선택</span></div>
      <div class="ph-grid">${ALBUM.recent.map((p, i) => `<div data-go="albumView" data-p="${P({ i })}">${ph(p.src, p.label)}</div>`).join('')}</div>
      <div style="text-align:center;color:#8e8e93;font-size:13px;padding:10px 0 0">사진 ${ALBUM.recent.length}장</div>
      <h3 style="padding:18px 16px 10px;font-size:21px">앨범</h3>
      <div class="albums">${ALBUM.albums.map((a) => `<div>${ph(a.cover, a.name)}<b>${esc(a.name)}</b><small>${a.count.toLocaleString()}</small></div>`).join('')}</div>
      <div class="pad-bottom"></div>
    </div>`
  });
  S.albumView = ({ i }) => {
    const p = ALBUM.recent[i];
    return {
      status: 'normal', ui: 'light',
      html: `<div class="scr viewer zoom-in">
        <div class="v-top"><button class="x" data-back>‹</button>
          <div class="v-info"><b>${p.date ? esc(dateLabel(p.date).replace(/^\d+년 /, '')) : ''}</b><small>${esc(p.time || '')}${p.place ? ` · 📍${esc(p.place)}` : ''}${p.type ? ` · ${esc(p.type)}` : ''}</small></div>
          <span style="width:30px"></span></div>
        ${ph(p.src, p.label, 'dark')}
        ${p.caption ? `<div class="v-cap">${esc(p.caption)}</div>` : ''}
        <div class="v-bottom"><span>⇪</span><span>♡</span><span>ⓘ</span><span>🗑</span></div>
      </div>`
    };
  };

  /* ---------- 메모 ---------- */
  S.memo = () => ({
    status: 'normal', ui: 'dark',
    html: `<div class="scr ios">
      <div class="navbar"><span></span></div>
      <div class="big-title">메모</div>
      <div class="group memo-list">${MEMOS.map((n, i) => `<div class="row" data-go="memoView" data-p="${P({ i })}"><div class="grow"><b>${esc(n.title)}</b><div class="sub">${esc(n.date)}  ${esc(n.body.split('\n')[0])}</div></div></div>`).join('')}</div>
    </div>`
  });
  S.memoView = ({ i }) => {
    const n = MEMOS[i];
    return {
      status: 'normal', ui: 'dark',
      html: `<div class="scr" style="background:#fff">
        <div class="navbar" style="background:#fff"><button class="back" data-back style="color:#e0a800">메모</button></div>
        <div class="memo-body"><small>${esc(n.date)}</small><h2>${esc(n.title)}</h2>${esc(n.body)}</div>
      </div>`
    };
  };

  /* ---------- 카메라 ---------- */
  S.camera = () => ({
    status: 'normal', ui: 'light',
    html: `<div class="scr cam zoom-in">
      <div class="vf">${ph('images/camera/viewfinder.jpg', '카메라 화면 (어두운 방, 발치의 겨울이)', 'dark')}</div>
      <div class="modes"><span>시네마틱</span><span>비디오</span><span class="on">사진</span><span>인물 사진</span><span>파노라마</span></div>
      <div data-open="album">${ph(ALBUM.recent[0].src, '', 'thumb')}</div>
      <button class="shutter" data-toast="찰칵"></button>
    </div>`
  });

  /* ---------- 지도 ---------- */
  S.map = () => ({
    status: 'normal', ui: 'dark',
    html: `<div class="scr map">
      <div class="canvas">${MAP_PINS.map((p) => `<div class="pin" style="left:${p.x}%;top:${p.y}%" data-toast="${esc(p.name)}${p.note ? ' · ' + esc(p.note) : ''}"><i style="background:${p.color}"></i><span>${esc(p.name)}</span></div>`).join('')}</div>
      <div class="search">🔍 장소 검색</div>
      <div class="sheet"><div class="grab"></div>
        <div style="padding:0 16px 8px;font-weight:800;font-size:18px">즐겨찾기</div>
        ${MAP_PINS.map((p) => `<div class="row" style="background:#fff;margin:0 12px 6px;border-radius:10px;border:0"><i style="width:30px;height:30px;border-radius:50%;background:${p.color};flex:none"></i><div class="grow"><b>${esc(p.name)}</b>${p.note ? `<div class="sub">${esc(p.note)}</div>` : ''}</div></div>`).join('')}
      </div>
    </div>`
  });

  /* ---------- 스포티파이 ---------- */
  S.spotify = () => {
    const pl = CONFIG.playlist || { name: '재생 목록', owner: '', length: '', songs: [CONFIG.nowPlaying.title], playing: 0 };
    const now = pl.songs[pl.playing];
    const eq = '<span class="sp-eq"><i></i><i></i><i></i></span>';
    return {
      status: 'normal', ui: 'light',
      html: `<div class="scr spl">
        <div class="spl-top"><button class="circ" data-back>${svgI('<path d="M19 12H5M11 5l-7 7 7 7"/>')}</button><button class="circ">${svgI('<circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>', 2.6)}</button></div>
        <div class="spl-cover"><span>${svgI('<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>', 1.6)}</span></div>
        <h1>${esc(pl.name)}</h1>
        <div class="spl-owner"><span class="plus">＋</span>${ph(pl.ownerAvatar, '', 'round')}<b>${esc(pl.owner)}</b></div>
        <div class="spl-meta">${svgI('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>', 2)}${esc(pl.length)}</div>
        <div class="spl-act">
          <span class="sh">${svgI('<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="M8.2 10.8l7.6-4.4M8.2 13.2l7.6 4.4"/>', 2)}</span>
          <span class="shuf">${svgI('<path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>', 2)}</span>
          <span class="play"><i></i><i></i></span>
        </div>
        <div class="spl-chips"><span>＋ 추가</span><span>⫶ 믹스</span><span>▷ 동영상</span><span>≡ 수정</span><span>✎ 이름</span></div>
        <div class="spl-list">${pl.songs.map((t, i) => `<div class="spl-song ${i === pl.playing ? 'on' : ''}"><span class="t">${i === pl.playing ? eq : ''}${esc(t)}</span><span class="m">⋮</span></div>`).join('')}</div>
        <div class="spl-mini"><div class="mt"><b>${esc(now)}</b><span class="bar"><i></i></span></div><span class="dev">${svgI('<rect x="4" y="3" width="10" height="18" rx="2"/><circle cx="9" cy="15" r="2.5"/><path d="M18 6v12"/>', 1.8)}</span><span class="ok">✓</span><span class="pz"><i></i><i></i></span></div>
      </div>`
    };
  };
  const svgI = (d, w = 2.2) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;

  /* ---------- 유튜브 ---------- */
  S.youtube = () => ({
    status: 'normal', ui: 'dark',
    html: `<div class="scr yt">
      <div class="yt-top"><b>YouTube</b><span>🔍</span></div>
      ${YOUTUBE.map((v) => `<div class="yt-v">${ph(v.img, '썸네일')}<div class="inf"><i></i><div><b>${esc(v.title)}</b><small>${esc(v.ch)} · ${esc(v.meta)}</small></div></div></div>`).join('')}
      <div class="pad-bottom"></div>
    </div>`
  });

  /* ---------- 풋몹 ---------- */
  S.fotmob = () => ({
    status: 'normal', ui: 'light',
    html: `<div class="scr fm">
      <div class="fm-top">경기</div>
      ${FOTMOB.map((f) => `<div class="fm-card"><small>${esc(f.league)}</small><div class="r"><div><div>${esc(f.home)}</div><div>${esc(f.away)}</div></div><div style="text-align:right"><b>${esc(f.score)}</b><div class="st">${esc(f.status)}</div></div></div></div>`).join('')}
    </div>`
  });

  /* ---------- aiAsk ---------- */
  S.aiask = () => ({
    status: 'normal', ui: 'dark',
    html: `<div class="scr ai">
      <div class="ai-head">aiAsk<small>최근 대화</small></div>
      <div class="ai-msgs">${AIASK.map((m) => {
        if (m.date) return `<div class="ai-date">${esc(m.date)}</div>`;
        if (m.type === 'photo') return `<div class="ai-photo">${ph(m.src, m.label)}</div>`;
        return `<div class="${m.role === 'user' ? 'ai-q' : 'ai-a'}">${esc(m.text)}</div>`;
      }).join('')}</div>
      <div class="ai-input"><div>aiAsk에게 물어보기</div></div>
    </div>`,
    after(el) { el.scrollTop = el.scrollHeight; }
  });

  /* ---------- 크롬 ---------- */
  S.chrome = () => ({
    status: 'normal', ui: 'dark',
    html: `<div class="scr chrome">
      <div class="logo"><span>G</span><span>o</span><span>o</span><span>g</span><span>l</span><span>e</span></div>
      <div class="box">검색어 또는 URL 입력</div>
      <div style="height:14px"></div>
      ${CHROME.history.map((h) => `<div class="hist">${esc(h)}</div>`).join('')}
    </div>`
  });

  /* ---------- 전화 ---------- */
  S.phone = () => ({
    status: 'normal', ui: 'dark',
    html: `<div class="scr ios">
      <div class="navbar"><span></span></div>
      <div class="big-title">최근 기록</div>
      <div class="seg"><span class="on">모두</span><span>부재중</span></div>
      <div class="group">${CALLS.map((c) => `<div class="row call-row"><span style="color:#8e8e93;width:14px;flex:none">${c.type === 'out' ? '↗' : ''}</span><div class="grow"><div class="nm ${c.missed ? 'miss' : ''}">${esc(c.name)}${c.count ? ` (${c.count})` : ''}</div><div class="sub">${c.type === 'out' ? '발신' : '휴대전화'}${c.note ? ' · ' + esc(c.note) : ''}</div></div><span class="tm">${esc(c.time)}</span></div>`).join('')}</div>
    </div>`
  });

  /* ---------- 메시지(문자) ---------- */
  S.sms = () => ({
    status: 'normal', ui: 'dark',
    html: `<div class="scr ios" style="background:#fff">
      <div class="navbar" style="background:#fff"><span></span></div>
      <div class="big-title">메시지</div>
      ${SMS.map((m) => `<div class="row sms-row"><span class="dotu ${m.unread ? '' : 'off'}"></span><div class="grow"><div style="display:flex;justify-content:space-between"><b>${esc(m.from)}</b><span class="sub">${esc(m.time)}</span></div><p>${esc(m.text)}</p></div></div>`).join('')}
    </div>`
  });

  /* =========================================================
     이동
     ========================================================= */
  const currentScreen = () => state.stack[state.stack.length - 1];
  function render(animate = true) {
    const cur = currentScreen();
    const fn = S[cur.name];
    const out = fn(cur.params || {});
    closeSheet();
    renderStatus(out.status);
    phoneEl.classList.toggle('ui-light', out.ui === 'light');
    screenEl.innerHTML = out.html;
    const el = screenEl.firstElementChild;
    if (!animate) el.classList.add('no-anim');
    if (out.after) out.after(el);
    // 영상 자동 재생 (핸드폰 브라우저용)
    el.querySelectorAll('video').forEach((v) => { v.muted = true; const pr = v.play(); if (pr) pr.catch(() => {}); });
  }
  function go(name, params = {}) {
    state.stack.push({ name, params });
    render(true);
  }
  function replace(name, params = {}) {
    state.stack[state.stack.length - 1] = { name, params };
    render(false);
  }
  function back() {
    clearTimeout(storyTimer);
    if (state.stack.length > 1) { state.stack.pop(); render(false); }
  }
  function goHome(fromUnlock) {
    clearTimeout(storyTimer);
    closePop();
    state.stack = [{ name: 'home', params: {} }];
    render(false);
    if (fromUnlock) {
      screenEl.firstElementChild.classList.add('zoom-in');
      startBanners();
    }
  }
  function openApp(id) {
    if (id === 'spotify' || id === 'calendar') mission(id);
    const map = { kakao: 'kakao' };
    const name = map[id] || id;
    if (!S[name]) { toast('준비 중'); return; }
    state.stack = [{ name: 'home', params: {} }];
    state.stack.push({ name, params: {} });
    render(false);
    screenEl.firstElementChild.classList.remove('no-anim');
    screenEl.firstElementChild.classList.add('zoom-in');
  }

  /* ---------- 클릭 처리 ---------- */
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-key],[data-act],[data-open],[data-tab],[data-replace],[data-go],[data-back],[data-toast]');
    if (!t || !phoneEl.contains(t)) return;
    const p = t.dataset.p ? JSON.parse(t.dataset.p) : {};
    if (t.dataset.key) return pressKey(t.dataset.key);
    if (t.dataset.act) return act(t.dataset.act, t);
    if (t.dataset.open) return openApp(t.dataset.open);
    if (t.dataset.tab) return replace(t.dataset.tab, p);
    if (t.dataset.replace) return replace(t.dataset.replace, p);
    if (t.dataset.go) return go(t.dataset.go, p);
    if ('back' in t.dataset) return back();
    if (t.dataset.toast) return toast(t.dataset.toast);
  });
  function act(a, el) {
    switch (a) {
      case 'cancelPass': state.stack = [{ name: 'lock', params: {} }]; render(false); break;
      case 'storyNext': storyStep(1); break;
      case 'igComments': openSheet(+el.dataset.i); break;
      case 'closeSheet': closeSheet(); break;
      case 'closePop': closePop(); break;
      case 'popToPetcam': closePop(); openApp('petcam'); break;
      case 'addEmoji': { const i = sheetLayer.querySelector('input'); if (i) { i.value += el.dataset.e; i.dispatchEvent(new Event('input')); i.focus(); } break; }
      case 'cmtLike': el.classList.toggle('on'); break;
      case 'igSave': { const k = +el.dataset.i; saved[k] = !saved[k]; el.classList.toggle('on', saved[k]); break; }
      case 'igLike': case 'igDoubleLike': {
        const k = +el.dataset.i;
        if (a === 'igDoubleLike') { const now = Date.now(); if (now - (el._t || 0) > 350) { el._t = now; break; } el._t = 0; if (liked[k]) break; }
        liked[k] = !liked[k];
        const b = document.querySelector(`.b[data-act="igLike"][data-i="${k}"]`);
        if (b) { b.classList.toggle('liked', liked[k]); b.classList.remove('pop'); void b.offsetWidth; if (liked[k]) b.classList.add('pop'); }
        const c = document.getElementById('iglikes-' + k);
        if (c) c.textContent = fmt(baseLikes(IG.feed[k]) + (liked[k] ? 1 : 0));
        break;
      }
      case 'storyPrev': storyStep(-1); break;
      case 'alarm': {
        const al = ALARMS[+el.dataset.i]; al.on = !al.on;
        el.classList.toggle('off', !al.on); el.querySelector('.sw').classList.toggle('on', al.on); break;
      }
      case 'play': {
        el.style.display = 'none';
        const bar = $('#pcbar'); bar.style.transition = 'width 6s linear'; requestAnimationFrame(() => (bar.style.width = '100%'));
        break;
      }
      case 'blurPlay': toast('🙈 이 영상은 성찬만 볼 수 있어요'); break;
    }
  }
  document.addEventListener('submit', (e) => {
    const f = e.target.closest('.ig-add');
    if (!f) return;
    e.preventDefault();
    const inp = f.querySelector('input');
    addReaderComment(+f.dataset.post, inp.value, f);
    inp.value = '';
    const box = f.querySelector('.cs-box'); if (box) box.classList.remove('typing');
  });
  $('#homeIndicator').addEventListener('click', () => { if (state.unlocked) goHome(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { if (popLayer.classList.contains('open')) { closePop(); return; } if (sheetPost !== null) { closeSheet(); return; } back(); }
    const cur = currentScreen();
    if (cur && cur.name === 'passcode' && /^\d$/.test(e.key)) pressKey(e.key);
  });

  /* ---------- 시작 ---------- */
  // 링크를 열면: 김희수 인스타 DM 창 (11화, DM을 보내려다 멈춘 순간)
  // 뒤로 가기: DM → 희수 프로필 → 인스타 검색 → 홈
  // 주소 끝에 #home 을 붙이면 홈 화면에서 시작해요 (작업 확인용)
  state.unlocked = true;
  if (location.hash === '#home') state.stack = [{ name: 'home', params: {} }];
  else if (location.hash === '#lock') { state.unlocked = false; state.stack = [{ name: 'lock', params: {} }]; }
  else state.stack = [{ name: 'home', params: {} }, { name: 'igSearch', params: {} }, { name: 'igProfile', params: {} }, { name: 'igDm', params: {} }];
  render(false);
  // 희수 DM에서 시작하면 타이핑이 끝난 뒤 배너가 시작돼요 (startTyping). 그 외에는 바로 시작.
  if (currentScreen().name !== 'igDm' && state.unlocked) { state.typed = true; startBanners(); }
  if (!state.unlocked) state.typed = true;
})();
