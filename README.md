# 성찬의 iPhone

『염치도 없이』 1~11화 속 정성찬의 핸드폰을 열어 볼 수 있는 웹페이지예요.
독자는 **11화 새벽 1시 53분**, 성찬이 체육관으로 뛰쳐나가기 직전의 핸드폰을 보게 돼요.

- 링크를 열면 **김희수 인스타 DM 창**에서 시작해요. 입력창에 "너 지금 은석이랑 있"이 쓰여 있고, 독자가 지우거나 고칠 수 있어요. 보내기 버튼은 눌리지 않아요.
- 링크를 열고 **3초 뒤**부터 라이즈 단톡 알림(소희 → 소희 → 타로 → 소희 → 은석)이 차례로 내려오고, 같은 순간 단톡방에도 대화가 쌓여요.
- 어느 배너를 눌러도 라이즈 단톡방이 열리고, 남은 대화는 방 안에서 이어서 올라와요.
- 홈 화면은 아래쪽 막대(홈 인디케이터)를 누르면 나와요.
- 잠금화면(암호 `2001`)은 기본으로는 안 나와요. 주소 끝에 `#lock`을 붙이면 잠금화면부터 시작해요.

---

## 1. GitHub Pages로 올리기

1. GitHub에서 새 저장소를 만들어요. (예: `seongchan-phone`, Public)
2. 이 폴더 안의 파일을 **폴더 구조 그대로** 업로드해요.
   `index.html`이 저장소 맨 위에 있어야 해요.
3. 저장소 → **Settings → Pages**
   - Source: `Deploy from a branch`
   - Branch: `main` / `/(root)` → Save
4. 1~2분 뒤 `https://아이디.github.io/seongchan-phone/` 주소로 열려요.

> 내 컴퓨터에서 미리 보려면 `index.html`을 브라우저로 열면 돼요.
> 주소 끝에 `#home`을 붙이면 홈 화면에서 시작해요. (작업 확인용)

## 2. 파일 구성

```
index.html        뼈대
css/style.css     디자인
js/data.js        ★ 대화·게시글·일정 같은 내용 (여기만 고치면 돼요)
js/app.js         화면 동작
images/           사진 넣는 곳
```

### 내용 고치는 법 (`js/data.js`)
- 카톡 대화: `KAKAO.chats` → 채팅방별 `messages`
  - `from: 'me'` = 성찬이 보낸 것, `read: false` = 상대가 안 읽음(노란 1)
  - `{ date: '2026-06-03' }` = 날짜 구분선
  - `type: 'photo'`, `'deleted'`(삭제된 메시지), `'file'`, `'call'`
- 배너 순서와 문구: `BANNERS`
- 에브리타임 게시판·게시글·시간표: `EVERYTIME`
- 인스타 스토리·DM 입력창 문구: `INSTAGRAM`
- 펫캠 녹화 기록 (`blur: true`면 흐리게, 재생 안 됨): `PETCAM`
- 캘린더 일정: `CALENDAR_EVENTS`, 매주 반복: `CALENDAR_WEEKLY`
- 배너가 뜨는 시각: `BANNER_TIMING` (firstDelay = 첫 배너까지, gap = 배너 사이 간격, 단위 ms)

## 3. 사진 넣는 자리

아래 경로에 **같은 이름**으로 파일을 넣으면 자동으로 보여요.
파일이 없으면 회색 줄무늬 자리에 설명 글이 보여요.
(확장자를 바꾸고 싶으면 `js/data.js`에서 경로도 같이 바꿔 주세요.)

### 배경화면
| 경로 | 내용 |
|---|---|
| `images/wallpaper/lock.jpg` | 잠금화면 배경 |
| `images/wallpaper/home.jpg` | 홈 화면 배경 |

### 앱 아이콘 (정사각형 PNG 권장, 없으면 기본 아이콘이 보여요)
`images/icons/` → `everytime.png`, `instagram.png`, `youtube.png`, `fotmob.png`, `camera.png`, `calendar.png`, `photos.png`, `memo.png`, `clock.png`, `petcam.png`, `map.png`, `spotify.png`, `aiask.png`, `phone.png`, `messages.png`, `kakaotalk.png`, `chrome.png`

> 캘린더와 시계는 아이콘 이미지가 없으면 날짜(3일)와 시각(1:53)이 그려진 기본 아이콘이 보여요.

### 프로필 사진 (`images/profile/`)
| 파일 | 인물 |
|---|---|
| `seongchan.jpg` | 성찬 (인스타 내 프로필) |
| `eunseok.jpg` | 은석 |
| `sohee.jpg` | 소희 |
| `taro.jpg` | 타로 |
| `wonbin.jpg` / `chanyoung.jpg` / `anton.jpg` | 라이즈 부원 |
| `eunyoung.jpg` | 은영 |
| `planner.jpg` | 기획부장 |
| `heesu.jpg` | 희수 (카톡) |
| `yeonju.jpg` / `yueun.jpg` | 연주, 유은 |
| `doyoon.jpg` | 과후배 한도윤 |

### 카카오톡 (`images/kakao/`)
| 파일 | 내용 |
|---|---|
| `rise.jpg` | 라이즈 단톡방 사진 |
| `alive.jpg` | 얼라이브 단톡방 사진 |
| `pe.jpg`, `soccer.jpg` | 학생회 공지방, 축구회 단톡방 사진 |
| `rise-0404-run.jpg` | 1화: 타로가 올린, 어딘가로 달려가는 은석 |
| `rise-0520-suit.jpg` | 10화: 소희가 올린 단복 입은 은석 |
| `winter-sleeping.jpg` | 11화: 성찬이 은석에게 보낸, 자는 겨울이 |
| `alive-festival.jpg` | 축제 부스 사진 |
| `ad.png` | 채팅 목록 위 광고 이미지 |

### 인스타그램 (`images/instagram/`)
| 파일 | 내용 |
|---|---|
| `heesu-avatar.jpg` | 희수 프로필 |
| `story-1-aburasoba.jpg` | 11화 스토리 ① 아부라소바 (양파 종지가 걸린 컷) |
| `story-2-cocktail.jpg` | 11화 스토리 ② 칵테일바 셀카 (옆자리 잔이 잘린 컷) |
| `heesu-grid-1.jpg` ~ `heesu-grid-9.jpg` | 희수 피드 게시물 9개 |
| `alive-avatar.jpg` | 얼라이브 공식 계정 프로필 |
| `alive-post.jpg` | 10화: 성찬·은석 투샷 ("여자라면 영원대") |
| `story-sohee.jpg` | 소희 스토리 사진 |

### 펫캠 (`images/petcam/`)
| 파일 | 내용 |
|---|---|
| `live-living.jpg` | 거실 캠 실시간 화면 |
| `live-bedroom.jpg` | 침실 캠 실시간 화면 |
| `clip-0403-1920.jpg` | 4/3 첫날, 겨울이를 쓰다듬는 은석 |
| `clip-0404-1803.jpg` | 4/4 은석 품에 뛰어드는 겨울이 |
| `clip-0404-2140.jpg` | 4/4 침실 (흐림 처리) |
| `clip-0404-2258.jpg` | 4/4 캠을 빤히 쳐다보는 은석 (1화) |
| `clip-0407-2324.jpg` | 4/7 거실 캠 앞으로 다가오는 은석 (3화) |
| `clip-0407-2331.jpg` | 4/7 침실 (흐림 처리) |
| `clip-0525-2012.jpg` | 5/25 산책 다녀온 겨울이 |
| `clip-0525-2146.jpg` | 5/25 부엌 (흐림 처리) |
| `clip-0603-0151.jpg` | 6/3 현관으로 뛰어가는 성찬 |

### 사진 앱 (`images/album/`)
`01.jpg` ~ `12.jpg` — 설명은 `js/data.js`의 `ALBUM`에 적혀 있어요.
(01 자는 겨울이, 02·03 희수 스토리 캡처, 04 은석 단복, 05 축제 부스, 06~08 겨울이, 09 춘천 축구, 10 엠티, 11 겨울이 산책, 12 겨울이 아기 때)

### 그 밖
| 경로 | 내용 |
|---|---|
| `images/spotify/pretender.jpg` | Spotify 앨범 아트 |
| `images/camera/viewfinder.jpg` | 카메라 화면 |
| `images/youtube/01.jpg` ~ `03.jpg` | 유튜브 썸네일 |
| `images/aiask/professor.jpg` | aiAsk에 보낸 교수님 사진 |

---

## 4. 1~11화 타임라인 (데이터 기준)

| 날짜 | 회차 | 핸드폰에 남은 흔적 |
|---|---|---|
| 4/3(금)~4/4(토) | 1화 | 엠티, 펫캠 녹화, 라이즈 '실시간' 사진 |
| 4/5(일) | 1화 | 춘천 축구, 겨울이 밥 묻는 톡 |
| 4/6(월) | 1화 | 교양 결석, 보이스톡 취소 ×2, "전화 받아라" |
| 4/7(화) | 2~3화 | "수업 끝나고 잠깐 보자", 펫캠 재현 녹화 |
| 5/8(금) | 6화 | 11시 얼라이브 해장 알람, 은석 "타로형이랑 약속" |
| 5/12~14 | 축제 | 캘린더 |
| 5/15(금) | 9~10화 | 무영지개 댓글, 홍보단 회의 |
| 5/20(수) | 10화 | 단복 사진, "팬티 가져가" |
| 5/25(월) | 10~11화 | 과팅, "겨울이 산책 좀 시켜주라" |
| 6/2(화) | 11화 | 책자 촬영 회의, "뭐함 / 저녁 먹자", 희수 스토리 ① |
| 6/3(수) 01:53 | 11화 | 쌓인 1, 삭제된 메시지, 희수 스토리 ②, 소희 단톡 |
