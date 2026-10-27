/* =========================================================
   성찬의 iPhone — 데이터 파일
   ---------------------------------------------------------
   대화, 게시글, 일정 같은 "내용"은 전부 이 파일에 있어요.
   문구를 고칠 때는 이 파일만 수정하면 됩니다.

   - me        : 성찬이 보낸 메시지
   - read:false: 상대가 아직 안 읽음(카톡 숫자 1 표시)
   - { date: 'YYYY-MM-DD' } : 날짜 구분선
   - 이미지 경로(images/...)에 파일을 넣으면 자동으로 보이고,
     파일이 없으면 회색 자리 표시가 나와요.
   ========================================================= */

const CONFIG = {
  phoneName: '성찬의 iPhone',
  passcode: '2001',
  // 독자가 핸드폰을 여는 순간: 11화, 성찬이 체육관으로 뛰쳐나가기 직전
  now: { date: '2026-06-03', time: '1:53', dateLabel: '6월 3일 수요일', dayShort: '수요일', day: 3 },
  nowPlaying: {
    title: '오늘 뭐 했는지 말해봐',
    artist: '',
    art: 'images/spotify/pretender.jpg',
    progress: 0.42,
    elapsed: '2:12',
    duration: '5:26'
  },
  // 스포티파이 '요즘기분' 플레이리스트 (가수·앨범 사진 없이 제목만). playing: 지금 재생 중
  playlist: {
    name: '요즘기분', owner: 'jsc', ownerAvatar: 'images/profile/seongchan.jpg', length: '17분',
    songs: ['너에게 닿기를', '별 보러 갈래?', '그럴때마다', '묘해, 너와', '오늘 뭐 했는지 말해봐'],
    playing: 4
  },
  lockWallpaper: 'images/wallpaper/lock.jpg',
  homeWallpaper: 'images/wallpaper/home.jpg',
  myAvatar: 'images/profile/seongchan.jpg'
};

/* ---------------- 홈 화면 ---------------- */
// icon: 직접 만든 아이콘 이미지를 넣을 수 있는 자리 (images/icons/파일명)
const HOME_APPS = [
  { id: 'everytime', label: '에브리타임', icon: 'images/icons/everytime.png', color: '#e0312b', glyph: 'school', badge: 5 },
  { id: 'instagram', label: 'Instagram', icon: 'images/icons/instagram.png', color: 'linear-gradient(45deg,#f9b233,#e1306c 55%,#833ab4)', glyph: '◎', dot: true },
  { id: 'youtube', label: 'YouTube', icon: 'images/icons/youtube.png', color: '#ff0000', glyph: '▶' },
  { id: 'fotmob', label: 'FotMob', icon: 'images/icons/fotmob.png', color: '#0f1a24', glyph: '⚽' },
  { id: 'camera', label: '카메라', icon: 'images/icons/camera.png', color: 'linear-gradient(#d9d9de,#a5a5ab)', glyph: '◉' },
  { id: 'calendar', label: '캘린더', icon: 'images/icons/calendar.png', color: '#fff', glyph: 'cal' },
  { id: 'memo', label: '메모', icon: 'images/icons/memo.png', color: 'linear-gradient(#ffd84d 0 22%,#fff 22%)', glyph: '' },
  { id: 'clock', label: '시계', icon: 'images/icons/clock.png', color: '#111', glyph: 'clock' },
  { id: 'petcam', label: '펫캠', icon: 'images/icons/petcam.png', color: 'linear-gradient(135deg,#7cc6ff,#3d7bff)', glyph: '🐾' },
  { id: 'map', label: '지도', icon: 'images/icons/map.png', color: 'linear-gradient(135deg,#9be38f,#58b8f0)', glyph: '➤' },
  { id: 'spotify', label: 'Spotify', icon: 'images/icons/spotify.png', color: '#121212', glyph: '♫', glyphColor: '#1ed760' },
  { id: 'aiask', label: 'aiAsk', icon: 'images/icons/aiask.png', color: 'linear-gradient(135deg,#f4e9dc,#e8c9a6)', glyph: '✳', glyphColor: '#c8643b' }
];

const DOCK_APPS = [
  { id: 'phone', label: '전화', icon: 'images/icons/phone.png', color: 'linear-gradient(#6fe77a,#29c341)', glyph: '✆' },
  { id: 'sms', label: '메시지', icon: 'images/icons/messages.png', color: 'linear-gradient(#6fe77a,#29c341)', glyph: '💬', badge: 3 },
  { id: 'kakao', label: '카카오톡', icon: 'images/icons/kakaotalk.png', color: '#fee500', glyph: 'TALK', glyphColor: '#3c1e1e', badge: 'kakao' },
  { id: 'chrome', label: 'Chrome', icon: 'images/icons/chrome.png', color: '#fff', glyph: '◍', glyphColor: '#4285f4' }
];

/* ---------------- 잠금화면 알림 ---------------- */
const LOCK_NOTIFS = [];

/* ---------------- 홈 화면에서 순서대로 내려오는 배너 ---------------- */
// 11화: 소희의 단톡 알림 → 은석의 답장. 마지막 배너를 누르면 단톡방이 열려요.
// 링크를 열고 bannerDelay(ms) 뒤부터 차례로 내려와요
// afterTyping: 희수 DM 입력이 다 써진 뒤 첫 배너까지 (ms)
const BANNER_TIMING = { firstDelay: 3000, gap: 1900, afterTyping: 1200 };
// 링크를 열면 DM 입력창에 글자가 한 글자씩 써져요 (startDelay: 시작 전 대기, speed: 한 글자당 ms)
const DM_TYPING = { startDelay: 900, speed: 230 };
const BANNERS = [
  { chat: 'rise', title: '🏀🏀', sender: '미디 이소희', text: '은석이형 아직도 체육관이에요??' },
  { chat: 'rise', title: '🏀🏀', sender: '미디 이소희', text: '체육관 꼭 잠그고 가요 제발' },
  { chat: 'rise', title: '🏀🏀', sender: '경제 타로형', text: '은석 아직도 체육관이라고? 먼일이래' },
  { chat: 'rise', title: '🏀🏀', sender: '미디 이소희', text: '멀라요 문잠그는것만 까먹지 마요' },
  // delay: 바로 앞 배너와의 간격(ms). 없으면 BANNER_TIMING.gap
  { chat: 'rise', title: '🏀🏀', sender: '은석이', text: '죽는다 이소희', delay: 5000 }
];

/* ---------------- 카카오톡 ---------------- */
const KAKAO = {
  ad: { brand: 'MAISON NOIR', title: 'NEW 누아르 오 드 퍼퓸', sub: '그 사람한테서 나던 그 향', img: 'images/kakao/ad.png' },
  // 친구 목록에 저장된 이름 → 프로필 이미지
  // 'default' = 카카오톡 기본 프사 (사진을 넣고 싶으면 이미지 경로로 바꾸세요)
  avatars: {
    '은석이': 'default',
    '미디 이소희': 'images/profile/sohee.jpg',
    '경제 타로형': 'images/profile/taro.jpg',
    '연영 박원빈': 'images/profile/wonbin.jpg',
    '사회 강민석': 'default',
    '연영 앤톤리': 'default',
    '연영 앤톤리': 'images/profile/anton.jpg',
    '은영 누나': 'default',
    '홍동기획 강성하': 'default',
    '홍동 김희수': 'default',
    '홍동 손연주': 'default',
    '홍동 이유은': 'default',
    '미윤': 'default',
    '지원 (홍대)': 'default',
    '채린': 'default',
    '체교 한도윤': 'default'
  },
  chats: [
    {
      id: 'rise', name: '🏀🏀', group: true, members: 14, avatar: 'default', unread: 0, // 배너가 오면서 늘어나요
      messages: [
        { date: '2026-04-04' },
        { from: '경제 타로형', type: 'photo', src: 'images/kakao/rise-0404-run.jpg', label: '은석이 어딘가로 달려가는 사진', t: '오후 11:02' },
        { from: '경제 타로형', text: '실시간', t: '오후 11:02' },
        { from: 'me', text: '?', t: '오후 11:04' },
        { from: '미디 이소희', text: '은석이형', t: '오후 11:04' },
        { from: 'me', text: '왜 저래?', t: '오후 11:04' },
        { from: '미디 이소희', text: '몰라요 갑자기 저러고 사라짐', t: '오후 11:05' },
        { from: '연영 앤톤리', text: 'wth lol', t: '오후 11:05' },
        { from: '연영 박원빈', text: '아 경도하냐ㅋㅋㅋ', t: '오후 11:05' },
        { date: '2026-05-11' },
        { from: '경제 타로형', text: '오늘 운동 끝나고 저녁 먹을 사람?', t: '오전 10:21' },
        { from: '미디 이소희', text: '저랑 은석이형이요', t: '오전 10:22' },
        { from: '미디 이소희', text: '성찬이형은 상황 보고 온대요', t: '오전 10:22' },
        { date: '2026-05-20' },
        { from: '미디 이소희', text: '오늘 미디로 집합', t: '오전 10:47' },
        { from: '미디 이소희', type: 'photo', src: 'images/kakao/rise-0520-suit.jpg', label: '단복 입은 은석 사진', t: '오전 10:47' },
        { from: '미디 이소희', text: '송은석 꾸밈', t: '오전 10:47' },
        { from: '연영 박원빈', text: '오 송동원', t: '오전 10:48' },
        { from: '연영 앤톤리', text: 'ㅋㅋㅋ 은석이형 화났다', t: '오전 10:48' },
        { from: '경제 타로형', text: '머리 넘 떡칠한거 아냐?', t: '오전 10:49' },
        { date: '2026-05-29' },
        { from: '미디 이소희', text: '코치님이 다음주부터 훈련 강도 올린대요', t: '오후 9:12' },
        { from: '사회 강민석', text: '아 진짜 메이저리그도 아니고', t: '오후 9:13' },
        { date: '2026-06-03' },
        // ↓ 이 아래는 배너와 함께 실시간으로 추가돼요 (BANNERS)
      ]
    },
    {
      id: 'eunseok', name: '은석이', avatar: 'default', unread: 0,
      messages: [
        { date: '2026-03-10' },
        { from: 'me', text: 'ㅇㄷ', t: '오후 5:48', read: true },
        { from: '은석이', text: '긱', t: '오후 5:51' },
        { from: 'me', text: '저녁ㄱ', t: '오후 5:51', read: true },
        { date: '2026-03-19' },
        { from: 'me', text: '1층', t: '오전 12:34', read: true },
        { date: '2026-03-28' },
        { from: 'me', type: 'photo', src: 'images/album/graduation.jpg', label: '고등학교 졸업식 때 찍은 둘 사진', t: '오후 8:12', read: true },
        { from: 'me', text: '우리 졸업때찍은겈ㅋ', t: '오후 8:12', read: true },
        { from: 'me', text: '엄마가보내줌', t: '오후 8:12', read: true },
        { from: '은석이', text: '어무니 잘지내시지', t: '오후 8:20' },
        { from: 'me', text: '몰라', t: '오후 8:21', read: true },
        { from: '은석이', text: 'ㅋㅋㅋ뭘몰라 아까도 통화했잔슴', t: '오후 8:21' },
        { from: 'me', text: 'ㅋㅋㅋㅋ', t: '오후 8:22', read: true },
        { date: '2026-04-05' },
        { from: 'me', text: '겨울이 밥 몇 끼 먹음?', t: '오후 6:40', read: true },
        { from: 'me', text: '똥은 몇 번 쌌어', t: '오후 6:40', read: true },
        { from: 'me', text: '고생했다 담에 밥 살게', t: '오후 6:41', read: true },
        { date: '2026-04-06' },
        { from: 'me', text: '오늘 교양 왜 안 옴?', t: '오전 10:20', read: true },
        { from: 'me', type: 'call', text: '보이스톡 취소', t: '오후 6:52' },
        { from: 'me', type: 'call', text: '보이스톡 취소', t: '오후 6:58' },
        { from: 'me', text: '전화 받아라', t: '오후 7:03', read: true },
        { date: '2026-04-07' },
        { from: '은석이', text: '수업 끝나고 잠깐 보자', t: '오후 12:41' },
        { date: '2026-05-08' },
        { from: 'me', text: '11시에 얼라이브 해장 ㄱㄱ', t: '오전 9:12', read: true },
        { from: '은석이', text: '오늘 타로형이랑 약속 있음', t: '오전 10:58' },
        { from: 'me', text: '어딘데? 나도 갈래', t: '오전 11:01', read: true },
        { from: '은석이', text: '밥 먹으면서 과제할 건데. 안 와도 됨', t: '오전 11:03' },
        { from: 'me', text: '어디서 먹는데?', t: '오후 12:34', read: true },
        { date: '2026-05-20' },
        { from: 'me', text: '팬티 가져가', t: '오전 10:52', read: true },
        { from: '은석이', text: '언제', t: '오전 10:52' },
        { from: 'me', text: '오늘', t: '오전 10:53', read: true },
        { from: '은석이', text: 'ㅇㅋ', t: '오전 10:53' },
        { from: 'me', text: '긱사 들리지 말고 바로와', t: '오전 10:53', read: true },
        { from: '은석이', text: '? 뭔 상관', t: '오전 10:54' },
        { from: 'me', text: '나 저녁에 바빠서', t: '오전 10:54', read: true },
        { from: '은석이', text: '볼일봐 알아서 가져갈게', t: '오전 10:54' },
        { from: 'me', text: '눈치 드럽게 없네', t: '오전 10:55', read: true },
        { from: '은석이', text: '?', t: '오전 10:55' },
        { from: 'me', text: '알아서해', t: '오전 10:55', read: true },
        { date: '2026-05-25' },
        { from: 'me', text: '겨울이 산책 좀 시켜주라', t: '오후 7:48', read: true },
        { from: '은석이', text: 'ㅇㅇ', t: '오후 7:51' },
        { date: '2026-06-02' },
        { from: 'me', text: '뭐함', t: '오후 5:41', read: true },
        { from: 'me', text: '저녁 먹자', t: '오후 5:41', read: true },
        { from: '은석이', text: 'ㄴㄴ 선약 있음', t: '오후 5:42' },
        { from: 'me', text: '취소하면 안됨?', t: '오후 5:42', read: false },
        { date: '2026-06-03' },
        { from: 'me', text: '뭐하냐', t: '오전 12:21', read: false },
        { from: 'me', type: 'deleted', t: '오전 12:21', read: false },
        { from: 'me', type: 'photo', src: 'images/kakao/winter-sleeping.jpg', label: '발치에서 자는 겨울이', t: '오전 12:23', read: false },
        { from: 'me', text: '겨울이가 너 보고 싶대', t: '오전 12:23', read: false },
        { from: 'me', text: '야 송은석', t: '오전 12:40', read: false },
        { from: 'me', text: '긱사 들어감?', t: '오전 1:12', read: false },
        { from: 'me', text: '야식 망빙 ㄱㄱ?', t: '오전 1:24', read: false },
        { from: 'me', text: '야', t: '오전 1:36', read: false },
        { from: 'me', text: '야야야', t: '오전 1:44', read: false }
      ]
    },
    {
      id: 'alive', name: '얼라이브 25-26', group: true, members: 38, avatar: 'default', unread: 0,
      messages: [
        { date: '2026-05-13' },
        { from: '은영 누나', text: '축제 둘째날 부스 사진 올립니다', t: '오후 9:30' },
        { from: '은영 누나', type: 'photo', src: 'images/kakao/alive-festival.jpg', label: '축제 부스에서 웃고 있는 성찬', t: '오후 9:30' },
        { from: '홍동 손연주', text: '성찬선배 오픈런 실화예요?', t: '오후 9:32' },
        { from: 'me', text: '이게 나야아ㅏ', t: '오후 9:40' },
        { date: '2026-06-02' },
        { from: '은영 누나', text: '[공지] 책자 1차 촬영 6/11(목) 확정!', t: '오후 6:20' },
        { from: '은영 누나', text: '도서관 열람실 → 본관 앞 계단 순서. 단복이랑 사복 한 벌씩 챙겨', t: '오후 6:20' },
        { from: '홍동기획 강성하', text: '콘티 공유드립니다', t: '오후 6:24' },
        { from: '홍동기획 강성하', type: 'file', text: '2026_홍보책자_콘티_v2.pdf', t: '오후 6:24' },
        { from: '홍동기획 강성하', text: '2차 날짜는 내일 공지할게요', t: '오후 6:25' },
        { from: '홍동 김희수', text: '넵! 감사합니다', t: '오후 6:31' },
        { from: '홍동 이유은', text: '넵넵', t: '오후 6:33' }
      ]
    },
    {
      // 미련 남은 전여친. 성찬이 읽고 답장 안 함(읽씹) → 안 읽은 숫자 없음
      id: 'ex', name: '미윤', avatar: 'default', unread: 0,
      messages: [
        { date: '2026-04-18' },
        { from: '미윤', text: '잘 지내?', t: '오후 11:58' },
        { from: '미윤', text: '그냥 생각나서', t: '오후 11:58' },
        { date: '2026-05-16' },
        { from: '미윤', text: '축제 사진 봤어ㅋㅋ 여전하더라', t: '오전 1:12' },
        { date: '2026-06-02' },
        { from: '미윤', text: '자?', t: '오후 11:47' },
        { from: '미윤', text: '오늘 너네 학교 앞 지나가다가 생각나서', t: '오후 11:47' },
        { from: '미윤', text: '겨울이는 잘 있어?', t: '오후 11:52' },
        { date: '2026-06-03' },
        { from: '미윤', text: '답장 안 해도 돼', t: '오전 12:05' }
      ]
    },
    {
      id: 'eunyoung', name: '은영 누나', avatar: 'default', unread: 0,
      messages: [
        { date: '2026-06-02' },
        { from: '은영 누나', text: '오늘 김치찌개 잘 먹었다~', t: '오후 8:15' },
        { from: '은영 누나', text: '목요일 연습 빼는 거 잊지 마라 정성찬', t: '오후 8:15' },
        { from: 'me', text: '넹ㅠㅠ', t: '오후 8:40', read: true }
      ]
    },
    {
      id: 'pe', name: '체육교육과 학생회 공지', group: true, members: 212, avatar: 'default', unread: 186,
      messages: [
        { date: '2026-06-02' },
        { from: '학생회', text: '[공지] 2026 체육대회 참가 신청 안내', t: '오후 3:00' },
        { from: '학생회', text: '기한 내 미제출 시 자동 참가 처리됩니다', t: '오후 3:00' }
      ]
    },
    {
      id: 'soccer', name: '일요축구회⚽', group: true, members: 23, avatar: 'default', unread: 27,
      messages: [
        { date: '2026-06-01' },
        { from: '총무', text: '이번주 일요일 9시 춘천 구장 투표 부탁드립니다', t: '오후 10:02' },
        { type: 'vote', text: '6/7(일) 춘천 원정 참석 투표', t: '오후 10:02', from: '총무' }
      ]
    },
    {
      // 원나잇 추정 ①
      id: 'on1', name: '지원 (멉대)', avatar: 'default', unread: 0,
      messages: [
        { date: '2026-03-15' },
        { from: '지원 (멉대)', text: '잘 들어갔어?ㅎㅎ', t: '오전 11:20' },
        { from: 'me', text: 'ㅇㅇ', t: '오후 3:02', read: true },
        { from: '지원 (멉대)', text: '담에 또 멉대 오면 연락해', t: '오후 3:05' }
      ]
    },
    {
      // 원나잇 추정 ②
      id: 'on2', name: '채린', avatar: 'default', unread: 0,
      messages: [
        { date: '2026-02-21' },
        { from: '채린', text: '번호 이거 맞지?', t: '오전 4:41' },
        { from: '채린', text: '내 귀걸이 거기 떨어져 있으면 버려줘', t: '오후 1:16' }
      ]
    },
    {
      id: 'doyoon', name: '체교 한도윤', avatar: 'default', unread: 0,
      messages: [
        { date: '2026-05-25' },
        { from: '체교 한도윤', text: '형!! 오늘 과팅 장소랑 시간입니다', t: '오전 9:40' },
        { from: '체교 한도윤', text: '와주셔서진짜진짜 감사합니다 은혜잊지않겟습니다형', t: '오전 9:40' },
        { from: '체교 한도윤', text: '7시 공일대 정문 앞 ‘ㅇㄴㅇ’ 술집입니다~', t: '오전 9:40' },
        { from: 'me', text: 'ㅋㅋ ㅇㅋ', t: '오전 9:52', read: true },
        { from: '체교 한도윤', text: '형 갑자기 어디 가셨어요ㅠㅠ', t: '오후 8:31' },
        { from: '체교 한도윤', text: '저쪽에서 형 번호 물어봤는데…', t: '오후 8:31' },
        { from: 'me', text: '미안 급한일생김', t: '오후 9:05', read: true },
        { from: 'me', text: '내번호주지마', t: '오후 9:05', read: true }
      ]
    }
  ]
};

/* ---------------- 에브리타임 ---------------- */
const EVERYTIME = {
  school: '영원대',
  notifications: [
    { board: '무영지개🌈', text: '새로운 대댓글이 달렸어요: 뭐하는 새끼지? 저ㄴ리ㅂ서ㄴ 말하는거잖아 ㅄ아', time: '05/15 08:19', unread: true },
    { board: '무영지개🌈', text: '새로운 대댓글이 달렸어요: ? 니 설마 ㅈㄹㅅ 말하는거?', time: '05/15 08:16', unread: true },
    { board: '자유게시판', text: '[졸준위] 2027년도 졸업앨범 봄학기 촬영 안내', time: '06/01 12:00', unread: true },
    { board: '학사공지', text: '2026학년도 1학기 기말고사 일정 안내', time: '05/29 09:00', unread: true },
    { board: '축구봐영⚽', text: 'HOT 게시물로 선정됐어요: 이럴거면 그냥 슛돌이나 봤지', time: '05/24 22:41', unread: true }
  ],
  searchHistory: ['ㅈㄹㅅ', '무지개', 'gey', 'g.a.y', 'gay', '게이'],
  ad: '영원대 앞 헬스장 3개월 99,000원',
  adImg: 'images/everytime/ad.jpg',
  homeBoards: [
    { board: 'free', name: '자유게시판', preview: '(졸준위) 2027년도 졸업앨범 봄학기 촬영 안내' },
    { board: 'secret', name: '비밀게시판', preview: '남긱사 요즘 누가 새벽에 자꾸 샤워하냐?' },
    { board: 'soccer', name: '축구봐영⚽', preview: '이럴거면 그냥 슛돌이나 봤지' },
    { board: 'rainbow', name: '무영지개🌈', preview: '학교근처에 퀴어바 괜찮은데 있음?' }
  ],
  boards: {
    free: { name: '자유게시판', posts: [
      { title: '(졸준위) 2027년도 졸업앨범 봄학기 촬영 안내', body: '촬영 일정은 학과별로 공지드립니다.', time: '06/01', likes: 12, comments: 3 },
      { title: '체교과 정성찬 책자 또 찍음?', body: '얼라이브 책자 촬영 날 알면 공유좀', time: '06/02', likes: 31, comments: 18 },
      { title: '도서관 열람실 에어컨 언제 틀어줌', body: '쪄 죽겠음', time: '06/02', likes: 44, comments: 9 }
    ]},
    secret: { name: '비밀게시판', posts: [
      { title: '남긱사 요즘 누가 새벽에 자꾸 샤워하냐?', body: '4층인데 3시에 물소리 나서 깸 진짜 누구임', time: '05/19', likes: 57, comments: 23 },
      { title: '10년지기 친구랑 어색해졌는데', body: '아니다 그냥 내가 알아서 할게', time: '05/30', likes: 4, comments: 2 }
    ]},
    soccer: { name: '축구봐영⚽', posts: [
      { title: '이럴거면 그냥 슛돌이나 봤지', body: '어제 경기 진심 무슨 축구임', time: '05/24', likes: 21, comments: 14 },
      { title: '일요일 춘천 원정 같이 갈 사람', body: '자리 2개 남음', time: '06/01', likes: 3, comments: 5 }
    ]},
    rainbow: { name: '무영지개🌈', posts: [
      { title: '학교근처에 퀴어바 괜찮은데 있음?', body: '분위기 조용한 데로', time: '06/01', likes: 6, comments: 11 },
      { title: '남소 받아요 (24, 미디과)', body: '애니 좋아하는 사람이면 좋겠음', time: '05/27', likes: 2, comments: 4 },
      { title: '여소 해줄 사람', body: '농담', time: '05/22', likes: 0, comments: 1 },
      { id: 'hetero', title: '난 솔직히 ㅎㅌㄹ가 더 쉽더라', body: 'ㅎㅌㄹ들이 한번 아래 맛들리면 더 매달림\n방금도 ㅎㅌㄹ 한명 뚫어줌', time: '25/11/21', likes: 9, comments: 8, scraps: 10, scrapped: true }
    ]}
  },
  // 9화: 성찬이 스크랩해 둔 '그 글'
  posts: {
    hetero: {
      author: '익명', time: '11/21 03:56',
      title: '난 솔직히 ㅎㅌㄹ가 더 쉽더라',
      body: 'ㅎㅌㄹ들이 한번 아래 맛들리면 더 매달림\n방금도 ㅎㅌㄹ 한명 뚫어줌',
      likes: 9, comments: 8, scraps: 10, scrapped: true,
      // depth: 들여쓰기 단계 (이미지처럼 계단식)
      thread: [
        { who: '익명1', depth: 0, text: '형 나도 알려줘', time: '11/21 04:10' },
        { who: '익명(글쓴이)', op: true, depth: 1, text: '침대까지 가는건 너몫이고 그이후에는 걍 ㅈㄹㅅ 잘해주면 기절함', time: '11/21 04:12' },
        { who: '익명1', depth: 2, text: '아—— 침대까지 가는게 문제잖아 장난?', time: '11/21 04:15' },
        { who: '익명3', depth: 3, text: '졸라서 해봤는데 안되던데', mine: true, time: '05/15 08:14' },
        { who: '익명(글쓴이)', op: true, depth: 4, text: '? 니 설마 ㅈㄹㅅ 말하는거?', time: '05/15 08:16' },
        { who: '익명3', depth: 5, text: 'ㅇㅇ', mine: true, time: '05/15 08:17' },
        { who: '익명(글쓴이)', op: true, depth: 6, text: '뭐하는 새끼지? 저ㄴ리ㅂ서ㄴ\n말하는거잖아 ㅄ아', time: '05/15 08:19' },
        { who: '익명2', depth: 0, deleted: true, text: '삭제된 댓글입니다.' }
      ]
    }
  },
  timetable: {
    semester: '2026년 1학기',
    me: {
      name: '정성찬', dept: '체육교육과',
      courses: [
        { name: '영화로 읽는 심리학', room: '인문관 301', color: '#f6b36b', slots: [['월', 9, 10.25], ['수', 9, 10.25]] },
        { name: '운동생리학', room: '체육관 B101', color: '#7fb3f5', slots: [['화', 10.5, 11.75], ['목', 10.5, 11.75]] },
        { name: '생활체육과건강', room: '체육관 실습실', color: '#f2c94c', slots: [['화', 13, 14.75]] },
        { name: '스포츠교육론', room: '사범관 204', color: '#9ad08a', slots: [['월', 13.5, 14.75], ['수', 13.5, 14.75]] },
        { name: '체육측정평가', room: '체육관 205', color: '#e78fb3', slots: [['화', 15, 17.75]] },
        { name: '수상스포츠실기', room: '수영장', color: '#82d5d0', slots: [['수', 15, 16.75]] },
        { name: '농구', room: '체육관', color: '#c4c4c8', slots: [['목', 16, 19]] }
      ]
    },
    friends: [
      { name: '송은석', open: true, dept: '디지털미디어학과',
        courses: [
          { name: '영화로 읽는 심리학', room: '인문관 301', color: '#f6b36b', slots: [['월', 9, 10.25], ['수', 9, 10.25]] },
          { name: '3D그래픽스', room: '미디어관 502', color: '#b39af0', slots: [['화', 9.5, 12.25]] },
          { name: '생활체육과건강', room: '체육관 실습실', color: '#f2c94c', slots: [['화', 13, 14.75]] },
          { name: '영상편집실습', room: '미디어관 B201', color: '#7fb3f5', slots: [['목', 13, 15.75]] },
          { name: '인터랙티브미디어', room: '미디어관 405', color: '#9ad08a', slots: [['월', 15, 16.25], ['수', 15, 16.25]] },
          { name: '농구', room: '체육관', color: '#c4c4c8', slots: [['목', 16, 19]] }
        ] },
      { name: '이소희', open: false },
      { name: '오사키 쇼타로', open: false }
    ]
  },
  messages: [] // 쪽지함 (비어 있음)
};

/* ---------------- 인스타그램 ---------------- */
const INSTAGRAM = {
  me: { id: 'jeong.sc', name: '정성찬', avatar: 'images/profile/seongchan.jpg', posts: 23, followers: '2,184', following: 301, bio: '🏀⚽ 체육교육\n겨울이 아빠 🐶', grid: 9,
    // 내 스토리 (회색 테두리 = 이미 올린 것)
    stories: [{ img: 'images/instagram/story-me.jpg', label: '성찬 스토리 사진', caption: '', ago: '15시간' }] },
  recentSearch: [
    { id: 'heesu.k', name: '김희수', avatar: 'default' },
    { id: 'alive.youngwon', name: '영원대 홍보대사 얼라이브', avatar: 'images/instagram/alive-avatar.png' }
  ],
  storyBar: [
    { id: 'heesu.k', avatar: 'default', seen: true },
    { id: 'alive.youngwon', avatar: 'images/instagram/alive-avatar.png', seen: false },
    { id: 'sohee_lee', avatar: 'images/profile/sohee.jpg', seen: false }
  ],
  // 스토리를 누르면 열리는 사진 (희수 스토리는 아래 heesu.stories)
  otherStories: {
    'sohee_lee': { name: '이소희', avatar: 'images/profile/sohee.jpg', stories: [
      { img: 'images/instagram/story-sohee.jpg', label: '소희 스토리 사진', caption: '', ago: '2시간' }
    ]}
  },
  feed: [
    { user: 'alive.youngwon', avatar: 'images/instagram/alive-avatar.png', img: 'images/instagram/alive-post.jpg', label: '성찬과 은석 투샷 (10화)', likes: '1,027', caption: '여자라면 영원대 💙 #영원대 #얼라이브 #홍보대사', time: '1주 전',
      // 사진 왼쪽 아래에 뜨는 '좋아요 누른 사람' 프사. likedByMe: 성찬이 이미 하트를 누른 상태
      likers: [ { avatar: 'images/profile/seongchan.jpg' }, { avatar: 'images/profile/sohee.jpg' } ],
      likedByMe: true,
      comments: [
        { id: 'seow_1', text: '영원대 가려고 방금 자퇴하고 옴' },
        { id: 'imnotgay', text: '내남자들 찾았다' },
        { id: 'ggu_guu_y', text: '진짜존나잘생ㅅ겼네' },
        { id: 'n._.n22', text: '인스타정보' },
        { id: 'donghi_8', text: '이분들 내년인가 졸업으로 알고있는데 지금 입학해서뭐함',
          replies: [
            { id: 'eunyounge', text: '@donghi_8 너 무슨과냐' }
          ] }
      ] }
  ],
  heesu: {
    id: 'heesu.k', name: '김희수', avatar: 'default',
    posts: 41, followers: 612, following: 588, bio: '디지털미디어 26 📷\n얼라이브',
    grid: 9,
    // 11화: 성찬이 밤새 들락거린 스토리 두 개
    stories: [
      { img: 'images/instagram/story-1-aburasoba.jpg', label: '아부라소바 사진 (양파 종지가 걸린 컷)', caption: '은석이 형이 사준 아부라소바', ago: '7시간' },
      { img: 'images/instagram/story-2-cocktail.png', label: '칵테일바 셀카 (옆자리에 잘린 잔)', caption: '', ago: '6분' }
    ]
  },
  // 김희수 DM: 보내지 못한 채 입력창에 남은 문장
  dmDraft: '너 지금 은석이랑 있'
};

/* ---------------- 펫캠 ---------------- */
const PETCAM = {
  cams: [
    { id: 'living', name: '거실', live: 'images/petcam/live-living.jpg', liveLabel: '빈 거실, 소파 위 터그 장난감' },
    // 5/22 아침 이후로 침실 캠은 꺼 둠
    { id: 'bedroom', name: '침실', live: 'images/petcam/live-bedroom.jpg', liveLabel: '', off: true, offSince: '5월 22일 오전 8:31' }
  ],
  // blur:true → 썸네일 흐리게, 재생 안 됨 / .gif 파일을 넣으면 움짤로 재생돼요
  clips: [
    { date: '2026-06-03', items: [
      { cam: 'living', time: '01:51', tag: '움직임 감지', img: 'images/petcam/clip-0603-0151.jpg', label: '현관으로 뛰어가는 성찬, 따라 나온 겨울이' }
    ]},
    { date: '2026-05-25', items: [
      { cam: 'living', time: '21:46', tag: '사람 감지', img: 'images/petcam/clip-0525-2146.jpg', label: '부엌 쪽, 화면 밖', blur: true },
      { cam: 'living', time: '20:12', tag: '움직임 감지', img: 'images/petcam/clip-0525-2012.jpg', label: '산책 다녀온 겨울이' }
    ]},
    { date: '2026-05-22', items: [
      { cam: 'bedroom', time: '08:31', tag: '카메라 꺼짐', img: '', label: '', system: true },
      { cam: 'bedroom', time: '08:14', tag: '움직임 감지', img: 'images/petcam/clip-0522-0814.gif', label: '아침 상황 (움짤)', star: true }
    ]},
    { date: '2026-05-21', items: [
      { cam: 'bedroom', time: '03:12', tag: '사람 감지', img: 'images/petcam/clip-0521-0312.jpg', label: '침실', blur: true }
    ]},
    // 축제 끝난 밤(5/14) ~ 다음 날 아침(5/15)
    { date: '2026-05-15', items: [
      { cam: 'living', time: '10:41', tag: '사람 감지', img: 'images/petcam/clip-0515-1041.jpg', label: '거실 소파', blur: true },
      { cam: 'bedroom', time: '03:20', tag: '움직임 감지', img: 'images/petcam/clip-0515-0320.jpg', label: '침실', blur: true }
    ]},
    { date: '2026-05-14', items: [
      { cam: 'bedroom', time: '23:52', tag: '사람 감지', img: 'images/petcam/clip-0514-2352.jpg', label: '침실', blur: true, star: true }
    ]},
    { date: '2026-04-07', items: [
      { cam: 'bedroom', time: '23:31', tag: '사람 감지', img: 'images/petcam/clip-0407-2331.jpg', label: '캠을 요리조리 살피는 은석', blur: true, star: true },
      { cam: 'living', time: '23:24', tag: '사람 감지', img: 'images/petcam/clip-0407-2324.png', label: '거실 캠 앞으로 다가오는 은석' }
    ]},
    { date: '2026-04-04', items: [
      // 타로가 23:02에 '실시간' 사진을 올린 뒤 → 은석이 성찬 집으로 달려와 캠을 쳐다봄 (파일 이름은 그대로)
      { cam: 'living', time: '23:12', tag: '사람 감지', img: 'images/petcam/clip-0404-2258.jpg', label: '캠을 빤히 쳐다보는 은석' },
      { cam: 'bedroom', time: '21:40', tag: '사람 감지', img: 'images/petcam/clip-0404-2140.jpg', label: '침대 위 뒷모습', blur: true, star: true },
      { cam: 'living', time: '18:03', tag: '움직임 감지', img: 'images/petcam/clip-0404-1803.gif', label: '은석 품에 뛰어드는 겨울이' }
    ]},
    { date: '2026-04-03', items: [
      { cam: 'living', time: '19:20', tag: '사람 감지', img: 'images/petcam/clip-0403-1920.png', label: '첫날, 겨울이를 쓰다듬는 은석' }
    ]}
  ]
};

/* ---------------- 캘린더 ---------------- */
const CALENDAR_EVENTS = [
  { date: '2026-03-19', title: '은석', color: '#ff375f' },
  { date: '2026-04-03', title: '엠티', color: '#ff9f0a' },
  { date: '2026-04-04', title: '엠티', color: '#ff9f0a' },
  { date: '2026-04-05', title: '춘천 축구', time: '오전 9:00', color: '#34c759' },
  { date: '2026-05-08', title: '얼라이브 해장', time: '오전 11:00', color: '#ff375f', alarm: true },
  { date: '2026-05-12', title: '축제 (~5/14)', color: '#bf5af2' },
  { date: '2026-05-13', title: '축제 · 얼라이브 부스', color: '#bf5af2' },
  { date: '2026-05-14', title: '축제끝', color: '#bf5af2' },
  { date: '2026-05-15', title: '홍보단 회의', time: '오후 6:00', color: '#ff375f' },
  { date: '2026-05-25', title: '과팅 (공일대) - 도윤이가 부탁', time: '오후 7:00', color: '#8e8e93' },
  { date: '2026-06-02', title: '책자 촬영 일정 회의', time: '오후 4:30', color: '#ff375f' },
  { date: '2026-06-07', title: '춘천 원정 축구', time: '오전 9:00', color: '#34c759' },
  { date: '2026-06-11', title: '책자 1차 촬영 (연습 빠짐)', time: '오후 3:00', color: '#ff375f' },
  { date: '2026-06-15', title: '기말고사 시작', color: '#0a84ff' },
  { date: '2026-06-22', title: '겨울이 예방접종', time: '오전 11:00', color: '#ffd60a' }
];
// 매주 목요일 반복 일정
const CALENDAR_WEEKLY = [{ weekday: 4, title: '농구', time: '오후 4:00', color: '#0a84ff' }];

/* ---------------- 시계 (알람) ---------------- */
const ALARMS = [
  { time: '7:30', ampm: '오전', label: '월수 1교시', on: true },
  { time: '7:40', ampm: '오전', label: '진짜 일어나', on: true },
  { time: '10:30', ampm: '오전', label: '얼라이브 해장 (11시)', on: false },
  { time: '8:00', ampm: '오전', label: '일요축구', on: false }
];

/* ---------------- 앨범 ---------------- */
// 파일을 images/album/ 에 같은 이름으로 넣으면 보여요
const ALBUM = {
  // 최신순. date/time/place는 사진을 열면 위에 뜨고, caption은 아래에 떠요.
  // 은석 자는 사진(eunseok-*)은 은석이 자고 간 날 새벽 → 카톡·펫캠·캘린더 날짜와 맞물려요
  recent: [
    { src: 'images/album/01.jpg', label: '자는 겨울이', date: '2026-06-03', time: '오전 12:23', place: '집', caption: '우리 애기 코 자' },
    { src: 'images/album/eunseok-0525.jpg', label: '자는 은석', date: '2026-05-25', time: '오전 5:12', place: '집', caption: '1교시 어떡하냐 얘' },
    { src: 'images/album/eunseok-0521.jpg', label: '자는 은석', date: '2026-05-21', time: '오전 3:40', place: '집', caption: '넥타이 그대로 잠듦ㅋㅋ' },
    { src: 'images/album/04.jpg', label: '은석 단복 (단톡에서 저장)', date: '2026-05-20', time: '오전 10:48' },
    { src: 'images/album/eunseok-0515.jpg', label: '자는 은석', date: '2026-05-15', time: '오전 4:20', place: '집', caption: '축제 끝. 기절' },
    { src: 'images/album/05.jpg', label: '축제 부스', date: '2026-05-13', time: '오후 3:02', place: '영원대학교' },
    { src: 'images/album/06.jpg', label: '겨울이 터그놀이', date: '2026-05-10', time: '오후 8:41', place: '집' },
    { src: 'images/album/07.jpg', label: '겨울이', date: '2026-05-02', time: '오전 11:15', place: '집' },
    { src: 'images/album/08.jpg', label: '겨울이', date: '2026-04-20', time: '오후 9:30', place: '집' },
    { src: 'images/album/eunseok-0408.jpg', label: '자는 은석', date: '2026-04-08', time: '오전 3:05', place: '집', caption: '또 내 베개 뺏음' },
    { src: 'images/album/09.jpg', label: '춘천 축구', date: '2026-04-05', time: '오전 10:27', place: '춘천' },
    { src: 'images/album/10.jpg', label: '엠티', date: '2026-04-03', time: '오후 10:14', place: '가평' },
    { src: 'images/album/graduation.jpg', label: '고등학교 졸업식 (엄마가 보내 준 사진)', date: '2026-03-28', time: '오후 8:11' },
    { src: 'images/album/11.jpg', label: '겨울이 산책', date: '2026-03-28', time: '오후 5:50', place: '집' },
    { src: 'images/album/12.jpg', label: '겨울이 아기 때', date: '2024-11-02', time: '오후 2:16', place: '집' }
  ],
  albums: [
    { name: '겨울이🐶', count: 1208, cover: 'images/album/06.jpg' },
    { name: '즐겨찾는 항목', count: 57, cover: 'images/album/04.jpg' }
  ]
};

/* ---------------- 메모 ---------------- */
const MEMOS = [
  // 11화 농구부 긴급회의 때 쓴 메모
  { title: '아 왜저래', date: '5월 29일', body: '아 왜저래 지가 먼저 입술들이대놓고 왜저래 왜러재 왜저래 왜재럴ㄹㄹㄹ' },
  { title: '겨울이 사료', date: '5월 30일', body: '연어 1.8kg\n덴탈껌\n터그 장난감 새로' }
];

/* ---------------- 전화 ---------------- */
const CALLS = [
  // 위에서부터 최신순. count = 같은 날 연달아 건 횟수
  { name: '은석이', type: 'out', time: '오전 1:31', count: 4, note: '응답 없음' },   // 6/3 새벽 (11화)
  { name: '미디 이소희', type: 'out', time: '6월 1일' },
  { name: '체교 한도윤', type: 'in', time: '5월 25일' },
  { name: '동물병원', type: 'out', time: '5월 20일' },
  { name: '은석이', type: 'in', time: '5월 16일' },
  { name: '은석이', type: 'out', time: '5월 15일' },
  { name: '미디 이소희', type: 'in', time: '5월 11일' },
  { name: '은석이', type: 'out', time: '5월 8일', note: '응답 없음' },
  { name: '은영 누나', type: 'in', time: '5월 7일' },
  { name: '은석이', type: 'in', time: '4월 21일' },
  { name: '은석이', type: 'out', time: '4월 7일' },                              // 펫캠 이후 처음 마주한 날, 새벽
  { name: '은석이', type: 'out', time: '4월 6일', count: 7, note: '응답 없음' },     // 펫캠 사건, 교양 결석 후 연락 두절
  { name: '은석이', type: 'out', time: '3월 19일' },                             // 오전 12:35, 카톡 '1층' 직후
  { name: '미디 이소희', type: 'out', time: '3월 18일' }                          // 오후 11:21
];

/* ---------------- 메시지(문자) ---------------- */
const SMS = [
  { from: 'CJ대한통운', text: '[Web발신] 고객님의 상품(연어 사료 1.8kg)이 배송 완료되었습니다.', time: '오후 2:14', unread: true },
  { from: '010-0000-0000', text: '[Web발신] 영원헬스 3개월 99,000원 이번주까지!', time: '어제', unread: true },
  { from: '동물병원', text: '겨울이 보호자님, 6월 22일 예방접종 예약 안내드립니다.', time: '5월 30일', unread: true },
  { from: '바이레도', text: '(광고)[BYREDO] 블랑쉬 오 드 퍼퓸 회원 전용 15% 할인 코드: BLANCHE15 (~6/7까지) 무료수신거부 080-000-0000', time: '5월 27일', unread: false }
];

/* ---------------- 크롬 ---------------- */
const CHROME = {
  history: [
    '영원대 근처 칵테일바',
    'X연애 출연자',
    '공일대 무용과',
    '아부라소바 양파 많이',
    '손흥민',
    '말티즈 간식'
  ]
};

/* ---------------- aiAsk (가상 AI) ---------------- */
const AIASK = [
  { date: '4월 14일' },
  { role: 'user', type: 'photo', src: 'images/aiask/professor.png', label: '운동생리학 교수님 사진' },
  { role: 'user', text: '이 교수님 관상 보고 중간고사에 낼 것 같은 문제 골라줘' },
  { role: 'ai', text: '얼굴만 보고 시험 문제를 맞히는 건 제가 할 수 없어요. 😅\n\n대신 확실한 방법이 있어요.\n\n1. 수업 중에 "이건 중요하다"고 두 번 이상 말한 부분\n2. 쪽지시험에서 틀린 사람이 많았던 단원\n3. 강의자료에 굵게 표시된 개념\n\n강의자료를 보내 주시면 예상 문제를 같이 정리해 드릴게요.' },
  { role: 'user', text: '아니 관상으로' },
  { role: 'user', text: '눈썹이 좀 깐깐해 보이지 않음? 서술형 낼 상임?' },
  { role: 'ai', text: '눈썹으로 출제 경향을 알 수 있다는 근거는 없어요. 다만 서술형이 나온다면 \'운동 중 에너지 대사 과정\'은 단골 주제예요. 그것부터 정리해 볼까요?' },
  { role: 'user', text: 'ㅇㅋ 그거 외울게 땡큐' },
  { date: '5월 27일' },
  { role: 'user', text: '친구가 나한테 키스하려다가 내가 피했는데 다음날 완전 아무렇지 않게 굴면 무슨 심리임?' },
  { role: 'ai', text: '상황만으로 단정하긴 어렵지만, 몇 가지 가능성이 있어요.\n\n1. 정말로 별 의미가 없었을 수 있어요.\n2. 거절당했다고 느껴서 일부러 덤덤하게 구는 걸 수도 있어요.\n3. 두 사람 관계가 어색해질까 봐 먼저 선을 그은 걸 수도 있어요.\n\n궁금하다면 직접 물어보는 게 가장 정확해요. 혹시 피한 이유가 싫어서였나요?' },
  { role: 'user', text: '아니 싫은건 아닌데' },
  { role: 'user', text: '아 됐다' }
];

/* ---------------- YouTube ---------------- */
const YOUTUBE = [
  { title: '말티즈 산책 거부할 때 꿀팁 5가지', ch: '멍멍연구소', meta: '조회수 82만회 · 2주 전', img: 'images/youtube/01.jpg' },
  { title: '조기축구에서 바로 써먹는 원터치 패스 연습법', ch: '축구는발로', meta: '조회수 31만회 · 1개월 전', img: 'images/youtube/02.jpg' },
  { title: '축구 하이라이트 | 이번 주 베스트 골 TOP10', ch: '풋볼클립', meta: '조회수 120만회 · 3일 전', img: 'images/youtube/03.jpg' }
];

/* ---------------- FotMob ---------------- */
const FOTMOB = [
  { league: '프리미어리그 · 시즌 종료', home: '맨체스터 시티', away: '아스널', score: '2 - 1', status: '종료' },
  { league: 'K리그1', home: '강원 FC', away: '울산 HD', score: '1 - 1', status: '종료' },
  { league: '국가대표 친선전', home: '대한민국', away: '일본', score: '20:00', status: '6월 6일' }
];

/* ---------------- 지도 ---------------- */
const MAP_PINS = [
  { name: '후문 아부라소바', note: '', x: 62, y: 38, color: '#ff9f0a' },
  { name: '영원대 체육관', note: '', x: 40, y: 55, color: '#0a84ff' },
  { name: '남자 기숙사', note: '', x: 28, y: 30, color: '#8e8e93' },
  { name: '집', note: '겨울이네', x: 75, y: 72, color: '#ff375f' }
];

/* ---------------- 홈 화면 지도 위젯 ---------------- */
// 위치는 위젯 안에서의 % 좌표. 독자가 '할 일'을 하나씩 할 때마다 성찬이 집 → 중간 → 체육관으로 움직여요.
const MAP_WIDGET = {
  places: {
    home: { x: 68, y: 64, label: '집' },
    mid:  { x: 50, y: 62 },
    gym:  { x: 24, y: 62, label: '영원대 체육관' }
  },
  seongchan: { name: '성찬', avatar: 'images/profile/seongchan.jpg' },
  eunseok:   { name: '은석', avatar: 'images/profile/eunseok.jpg' }
};

/* ---------------- 할 일 4개를 모두 하면 뜨는 펫캠 알림 ---------------- */
// 할 일: 인스타 댓글 달기 · 에타 '스크랩한 글' 들어가기 · 스포티파이 열기 · 캘린더 열기
const PETCAM_ALERT = {
  cam: '거실',
  title: '거실 캠',
  text: '사람의 움직임이 감지되었어요',
  media: 'images/petcam/alert-0603.gif',   // .mp4로 바꿔도 돼요
  label: '현관으로 들어오는 두 사람',
  delay: 1500                               // 4번째를 끝내고 알림이 뜰 때까지 (ms)
};
