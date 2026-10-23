# 안전더함 홈페이지 (safethehahm.co.kr)

노무법인 더함 사업장 안전·노동분쟁 전문센터 홈페이지입니다. 정적 HTML과 상담 메일 발송 함수 하나로 구성되어 있습니다.

## 폴더 구성

| 경로 | 내용 |
|---|---|
| `index.html` | 메인 |
| `industrial-safety/` | 산업안전·중대재해 |
| `harassment/` | 직장 내 괴롭힘·성희롱 |
| `discipline/` | 징계·해고 |
| `labor-relations/` | 노사관계·교섭 |
| `labor-inspection/` | 노동감독 |
| `prevention-training/` | 예방교육 |
| `insight/` | 인사이트 목록, 예시 글 (예시 글은 검색 제외 처리) |
| `about/` | 센터 소개·공인노무사 |
| `contact/` | 상담 신청 |
| `privacy/` | 개인정보처리방침 |
| `assets/site.css`, `assets/site.js` | 공통 스타일과 스크립트 |
| `api/contact.js` | 상담 신청 → 메일 발송 (Vercel 서버 함수) |
| `robots.txt`, `sitemap.xml` | 검색엔진용 |
| `vercel.json` | 주소 규칙, 보안 헤더 |

## 배포 절차

1. GitHub 조직 `safethehahm`에 저장소를 만들고 이 폴더의 파일을 올립니다.
2. Vercel → Add New → Project → 저장소 Import → Deploy
3. Vercel → Settings → Environment Variables에 아래 3개를 넣고 Redeploy

   | 이름 | 값 |
   |---|---|
   | `RESEND_API_KEY` | Resend에서 발급한 API 키 |
   | `NOTIFY_FROM` | `안전더함 상담접수 <noreply@safethehahm.co.kr>` (Resend에서 도메인 인증 후) |
   | `NOTIFY_TO` | `thehahm@thlabor.co.kr` |

4. Vercel → Settings → Domains에 `safethehahm.co.kr`, `www.safethehahm.co.kr` 추가 → 화면에 나온 DNS 값을 후이즈 DNS 설정에 입력
5. Resend → Domains에 `safethehahm.co.kr` 추가 → 화면에 나온 SPF·DKIM 레코드를 후이즈 DNS에 입력
6. 상담 폼으로 테스트 신청 → thehahm@thlabor.co.kr 도착 확인
7. 구글 서치콘솔(도메인 속성), Bing 웹마스터, 네이버 서치어드바이저 등록 후 `sitemap.xml` 제출. 소유 확인 태그는 각 페이지 head의 "검색엔진 소유 확인 태그 자리"에 넣습니다.

주의: 후이즈에서 thlabor.co.kr 설정은 건드리지 않습니다. 비밀 키는 코드에 쓰지 않습니다.

## 채워 나갈 항목

시안 원본에는 주황색 [ ]로 표시되어 있고, 공개 사이트에서는 build가 자동으로 감춥니다. 시안에서 내용을 채우고 build하면 그 자리에 나타납니다.

- 유 진, 방진아 노무사 주요 이력
- 예방교육 과정별 시간·인원 기준, 추가 출강 이력
- 대외 활동 추가 항목
- 인사이트 예시 글: 작성 노무사, 작성일, 현장의 판단. 확정 전에는 페이지를 만들지 않습니다. 공개할 때는 `build.ps1`의 `$meta`에 `article` 줄을 되살리고 `HideDraft`의 예시 글 링크 제거 줄과 `$noindex`를 정리합니다.

개인정보처리방침은 2026-10-23 확정(보유 기간 3년, 보호책임자 함은호, 국외 이전: Vercel·Resend 미국).

## 수정 방법

시안 원본(`안전더함_홈페이지시안.html`)을 고친 뒤 `build.ps1`을 실행하면 페이지 HTML, `assets/site.css`, `sitemap.xml`이 다시 만들어집니다. `assets/site.js`, `api/contact.js`, `vercel.json`, `robots.txt`, `favicon.svg`, `404.html`, `README.md`는 직접 관리하는 파일이라 build가 건드리지 않습니다.
