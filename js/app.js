/* =========================================================
   성찬의 iPhone — 화면 코드
   내용은 data.js에, 화면 그리는 방법은 이 파일에 있어요.
   ========================================================= */
(() => {
  'use strict';

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
  const ph = (src, label = '', cls = '') => {
    const media = /\.(mp4|webm)$/i.test(src || '')
      ? `<video src="${esc(src)}" autoplay muted loop playsinline preload="auto" onerror="this.remove()"></video>`
      : `<img src="${esc(src)}" alt="" onerror="this.remove()">`;
    return `<div class="ph ${cls}" data-label="${esc(label)}">${media}</div>`;
  };
  const P = (o) => esc(JSON.stringify(o || {}));

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
        ${showTime ? `<span class="sb-music">♫ <span>${esc(CONFIG.nowPlaying.title)} · ${esc(CONFIG.nowPlaying.artist)}</span></span>` : ''}
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

  /* ---------- 홈 ---------- */
  S.home = () => ({
    status: 'normal', ui: 'light',
    html: `<div class="scr home no-anim">
      ${ph(CONFIG.homeWallpaper, '', 'wall')}
      <div class="grid">
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
        ${ph(c.avatar, c.name.slice(0, 2), 'kk-ava')}
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
          <div class="top"><h1>채팅</h1><div class="ico"><span>⌕</span><span>💬</span><span>⚙︎</span></div></div>
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
      ${!me ? (showHead ? ph(avatarSrc, m.from.slice(-2), 'ava') : '<div class="ava blank" style="width:38px"></div>') : ''}
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
      after(el) { el.scrollTop = el.scrollHeight; }
    };
  };

  /* ---------- 배너 (11화 알림) ---------- */
  function startBanners() {
    if (state.bannersStarted) return;
    state.bannersStarted = true;
    let t = BANNER_TIMING.firstDelay;
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
      if (msgs) { msgs.innerHTML = roomBody(chat); const r = $('#room'); r.scrollTop = r.scrollHeight; }
    } else if (cur && cur.name === 'kakao') {
      const keep = $('#kkList') ? $('#kkList').scrollTop : 0;
      render(false); const l = $('#kkList'); if (l) l.scrollTop = keep;
    }
    const badge = $('.badge[data-badge="kakao"]');
    if (badge) { badge.textContent = kakaoTotal(); badge.classList.remove('bump'); void badge.offsetWidth; badge.classList.add('bump'); }

    if (inRoom) return;
    const old = bannerEl.firstElementChild;
    if (old) { old.classList.add('out'); setTimeout(() => old.remove(), 340); }
    const el = document.createElement('div');
    el.className = 'banner';
    el.dataset.chat = b.chat;
    const ava = KAKAO.avatars[b.sender] || chat.avatar;
    el.innerHTML = `
      <div class="b-ava">${ph(ava, b.sender.slice(-2))}<span class="mini">TALK</span></div>
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
        <div class="et-ad"><small>광고</small>${esc(ET.ad)}</div>
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
      </div>`
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
  function igTabs() {
    return `<div class="ig-tabs"><span data-tab="instagram">⌂</span><span data-tab="igSearch">⌕</span><span data-toast="새 게시물">⊕</span><span data-toast="릴스">▶</span><span class="me" data-tab="igMe">${ph(IG.me.avatar, '', 'round')}</span></div>`;
  }
  const ring = (src, seen, extra = '') => `<div class="ring ${seen ? 'seen' : ''}" ${extra}><div class="in">${ph(src, '', 'round')}</div></div>`;
  /* --- 인스타 댓글: 독자가 직접 다는 댓글 (이 브라우저에만 저장돼요) --- */
  const READER_ID_LIST = (typeof READER_IDS !== 'undefined' && READER_IDS.length) ? READER_IDS
    : ['ilovegay', 'zltmgo', 'rubyeontae', 'insomnia', 'icantsleep', 'yourbyeontae', 'aburasoba', 'mandu', 'byeontae', 'bigbunny', 'rockndeer', 'imbyeontae'];
  const store = {
    get(k, d) { try { const v = localStorage.getItem('scphone.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('scphone.' + k, JSON.stringify(v)); } catch (e) { /* 저장 불가 환경 */ } }
  };
  const mention = (t) => esc(t).replace(/(^|\s)(@[\w._]+)/g, '$1<span class="mention">$2</span>');
  function igCommentsHtml(f, fi) {
    const base = f.comments || [];
    const mine = store.get('igc.' + fi, null) || memComments[fi] || [];
    const total = base.reduce((n, c) => n + 1 + (c.replies ? c.replies.length : 0), 0) + mine.length;
    if (!total) return '';
    const row = (c, reply) => `<div class="tx ig-cmt ${reply ? 'reply' : ''} ${c.reader ? 'mine' : ''}"><b>${esc(c.id)}</b> ${mention(c.text)}${c.reader ? ' <small>방금</small>' : ''}</div>`;
    return `<div class="tx"><small>댓글 ${total}개 모두 보기</small></div>
      ${base.map((c) => row(c) + (c.replies || []).map((r) => row(r, true)).join('')).join('')}
      ${mine.map((c) => row(c)).join('')}`;
  }
  function addReaderComment(fi, text) {
    text = text.trim();
    if (!text) return;
    const n = store.get('igc.n', 0);
    const list = store.get('igc.' + fi, []);
    list.push({ id: READER_ID_LIST[n % READER_ID_LIST.length], text, reader: true });
    store.set('igc.' + fi, list);
    store.set('igc.n', n + 1);
    // 저장이 막힌 환경에서도 이번 화면에선 보이게
    if (store.get('igc.' + fi, null) === null) memComments[fi] = list;
    const box = document.getElementById('igc-' + fi);
    if (box) box.innerHTML = igCommentsHtml(IG.feed[fi], fi);
  }
  const memComments = {};
  S.instagram = () => ({
    status: 'normal', ui: 'dark',
    html: `<div class="scr ig">
      <div class="ig-top"><span class="logo">Instagram</span><div class="ic"><span>♡</span><span class="dm">✉<i>2</i></span></div></div>
      <div class="stories">
        <div class="story" data-go="igStory" data-p="${P({ u: 'me', i: 0 })}">${ring(IG.me.avatar, true)}<span>내 스토리</span></div>
        ${IG.storyBar.map((s) => { const has = s.id === IG.heesu.id || (IG.otherStories && IG.otherStories[s.id]); return `<div class="story" ${has ? `data-go="igStory" data-p="${P({ u: s.id, i: 0 })}"` : `data-toast="${esc(s.id)}"`}>${ring(s.avatar, s.seen)}<span>${esc(s.id)}</span></div>`; }).join('')}
      </div>
      ${IG.feed.map((f, fi) => `<div class="ig-post">
        <div class="hd">${ph(f.avatar, '', 'round')}${esc(f.user)}</div>
        ${ph(f.img, f.label, 'pic')}
        <div class="acts"><span>♡</span><span data-act="igFocus" data-i="${fi}">💬</span><span>➤</span></div>
        <div class="tx"><b>좋아요 ${esc(f.likes)}개</b></div>
        <div class="tx"><b>${esc(f.user)}</b> ${esc(f.caption)}</div>
        <div id="igc-${fi}">${igCommentsHtml(f, fi)}</div>
        <div class="tx"><small>${esc(f.time)}</small></div>
        <form class="ig-add" data-post="${fi}">
          ${ph(IG.me.avatar, '', 'round')}
          <input type="text" maxlength="150" placeholder="댓글 달기..." autocomplete="off" spellcheck="false">
          <button type="submit">게시</button>
        </form>
      </div>`).join('')}
      <div class="pad-bottom" style="height:20px"></div>
      ${igTabs()}
    </div>`
  });
  S.igSearch = () => ({
    status: 'normal', ui: 'dark',
    html: `<div class="scr ig ig-search">
      <div class="box">⌕ <span class="typed">김</span></div>
      <h5>최근 검색 항목 <small>모두 보기</small></h5>
      ${IG.recentSearch.map((u) => `<div class="ig-user" ${u.id === IG.heesu.id ? `data-go="igProfile"` : `data-toast="${esc(u.id)}"`}>${ph(u.avatar, '', 'round')}<div><b>${esc(u.id)}</b><small>${esc(u.name)}</small></div><span class="x">✕</span></div>`).join('')}
      <div class="pad-bottom" style="height:380px"></div>
      ${igTabs()}
    </div>`
  });
  S.igMe = () => {
    const me = IG.me;
    return {
      status: 'normal', ui: 'dark',
      html: `<div class="scr ig">
        <div class="ig-prof-head">${esc(me.id)} <span style="margin-left:auto;font-size:22px;font-weight:400">⊕ ≡</span></div>
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
        ${igTabs()}
      </div>`
    };
  };
  S.igProfile = () => {
    const h = IG.heesu;
    return {
      status: 'normal', ui: 'dark',
      html: `<div class="scr ig">
        <div class="ig-prof-head"><button class="bk" data-back>‹</button>${esc(h.id)}</div>
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
        <div class="who">${ph(h.avatar, '', 'round')}${esc(h.id)} <small>${esc(s.ago)}</small><span class="x" data-back>×</span></div>
        ${s.caption ? `<div class="cap">${esc(s.caption)}</div>` : ''}
        <div class="tapzone"><div data-act="storyPrev"></div><div data-act="storyNext"></div></div>
        <div class="reply"><div ${h.id === IG.heesu.id ? 'data-go="igDm"' : ''}>메시지 보내기</div><span>♡</span><span>➤</span></div>
      </div>`,
      after() { storyTimer = setTimeout(() => storyStep(1), 5000); }
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
        <div class="dm-head"><button class="bk" data-back>‹</button>${ph(h.avatar, '', 'round')}<div><b>${esc(h.name)}</b><small>${esc(h.id)}</small></div></div>
        <div class="dm-body">${ph(h.avatar, '', 'round')}<b>${esc(h.name)}</b><small>${esc(h.id)} · Instagram</small><small>팔로워 ${h.followers}명 · 게시물 ${h.posts}개</small><button>프로필 보기</button></div>
        <div class="dm-input"><div><span>📷</span><input class="tx-in" id="dmInput" type="text" value="${esc(state.dmText ?? IG.dmDraft)}" autocomplete="off" spellcheck="false"><span class="send" aria-disabled="true">보내기</span></div></div>
      </div>`,
      after() {
        const inp = $('#dmInput');
        inp.addEventListener('input', () => { state.dmText = inp.value; });
        inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') e.preventDefault(); });
      }
    };
  };

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
    const n = CONFIG.nowPlaying;
    return {
      status: 'normal', ui: 'light',
      html: `<div class="scr sp">
        <div class="top"><span>⌄</span><span>지금 재생 중</span><span>⋯</span></div>
        ${ph(n.art, '앨범 아트', 'art dark')}
        <h2>${esc(n.title)}</h2><p>${esc(n.artist)}</p>
        <div class="prog"><i style="width:${n.progress * 100}%"></i></div>
        <div class="tm"><span>${n.elapsed}</span><span>${n.duration}</span></div>
        <div class="ctl"><span>⤨</span><span>⏮</span><span class="pp">❚❚</span><span>⏭</span><span>⟲</span></div>
      </div>`
    };
  };

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
    state.stack = [{ name: 'home', params: {} }];
    render(false);
    if (fromUnlock) {
      screenEl.firstElementChild.classList.add('zoom-in');
      startBanners();
    }
  }
  function openApp(id) {
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
      case 'igFocus': { const i = document.querySelector(`.ig-add[data-post="${el.dataset.i}"] input`); if (i) i.focus(); break; }
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
    addReaderComment(+f.dataset.post, inp.value);
    inp.value = '';
  });
  $('#homeIndicator').addEventListener('click', () => { if (state.unlocked) goHome(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') back();
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
  startBanners();
})();
