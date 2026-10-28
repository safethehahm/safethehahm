// 노무법인 더함 공식 홈페이지(thlabor.co.kr) 빠른 상담·상담예약 → 상담 메일(thehahm@thlabor.co.kr)로 알림 발송
// 안전더함 상담 신청(api/contact.js)과 같은 Vercel 환경변수를 쓴다: RESEND_API_KEY, NOTIFY_FROM, NOTIFY_TO
// thlabor.co.kr 페이지에서 보낸 요청만 받는다(CORS).

const ALLOW = ['https://thlabor.co.kr', 'https://www.thlabor.co.kr'];
const LIMIT = { name: 100, phone: 40, email: 120, area: 60, date: 40, body: 4000, page: 200 };
const KIND = {
  'thlabor-quick': { title: '빠른 상담 신청', tag: '더함 빠른상담', board: "'빠른 상담 신청' 게시판(thlabor.co.kr/quick)" },
  'thlabor-appointment': { title: '상담 예약 신청', tag: '더함 상담예약', board: "'상담 예약' 게시판(thlabor.co.kr/appointment)" }
};

function clean(v, max) {
  return String(v == null ? '' : v).trim().slice(0, max);
}

function esc(s) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

module.exports = async (req, res) => {
  const origin = req.headers.origin || '';
  if (ALLOW.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
  if (req.method === 'OPTIONS') return res.status(ALLOW.includes(origin) ? 204 : 403).end();
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false });
  }
  if (!ALLOW.includes(origin)) return res.status(403).json({ ok: false, error: 'origin' });

  let body = req.body || {};
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { return res.status(400).json({ ok: false }); }
  }
  const kind = KIND[body.via];
  if (!kind) return res.status(400).json({ ok: false, error: 'source' });

  const d = {};
  for (const k of Object.keys(LIMIT)) d[k] = clean(body[k], LIMIT[k]);
  if (!d.name || !d.phone || body.agree !== 'yes') {
    return res.status(400).json({ ok: false, error: 'required' });
  }
  if (d.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) d.email = '';

  const key = process.env.RESEND_API_KEY;
  const fromEnv = process.env.NOTIFY_FROM;
  const to = process.env.NOTIFY_TO || 'thehahm@thlabor.co.kr';
  if (!key || !fromEnv) return res.status(500).json({ ok: false, error: 'config' });
  const addr = (fromEnv.match(/<([^>]+)>/) || [null, fromEnv])[1];
  const from = `노무법인 더함 상담접수 <${addr}>`;

  const rows = [
    ['이름/회사명', d.name], ['연락처', d.phone], ['이메일', d.email],
    ['상담 분야', d.area], ['희망 상담일', d.date], ['상황', d.body], ['접수 페이지', d.page]
  ].filter(([k, v]) => k !== '희망 상담일' || v).map(([k, v]) => `<tr><th align="left" style="padding:6px 12px 6px 0;color:#555;white-space:nowrap;vertical-align:top">${k}</th><td style="padding:6px 0;white-space:pre-wrap">${esc(v || '-')}</td></tr>`).join('');

  const html = `<div style="font-family:sans-serif;font-size:14px;line-height:1.6">
<p><b>노무법인 더함 홈페이지 ${kind.title}</b></p>
<table style="border-collapse:collapse">${rows}</table>
<p style="color:#888;font-size:12px">개인정보 수집·이용 동의: 예 · 접수 시각 ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}<br>같은 내용이 홈페이지 관리자 화면의 ${kind.board}에도 저장됩니다.</p>
</div>`;

  const payload = {
    from,
    to: [to],
    subject: `[${kind.tag}] ${d.area || '상담 신청'} · ${d.name}`,
    html
  };
  if (d.email) payload.reply_to = d.email;

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!r.ok) {
      console.error('resend 실패', r.status, (await r.text()).slice(0, 300));
      return res.status(502).json({ ok: false });
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(502).json({ ok: false });
  }
};
