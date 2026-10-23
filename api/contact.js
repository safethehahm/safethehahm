// 상담 신청 → 상담 메일(thehahm@thlabor.co.kr)로 알림 발송
// Vercel 환경변수: RESEND_API_KEY, NOTIFY_FROM, NOTIFY_TO
// 비밀 키는 이 파일에 쓰지 않고 Vercel 환경변수에만 넣는다.

const LIMIT = { company: 100, name: 100, phone: 40, email: 120, size: 40, area: 60, body: 4000 };

function clean(v, max) {
  return String(v == null ? '' : v).trim().slice(0, max);
}

function esc(s) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false });
  }

  let body = req.body || {};
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { return res.status(400).json({ ok: false }); }
  }

  // 자동 입력 방지 칸에 값이 있으면 조용히 종료
  // (칸 이름이 website였을 때 크롬 자동완성이 채워 실제 신청이 버려진 적이 있어 hp_check로 바꿈)
  if (body.hp_check) {
    console.log('honeypot: 신청 무시', String(body.hp_check).slice(0, 40));
    return res.status(200).json({ ok: true });
  }

  const d = {};
  for (const k of Object.keys(LIMIT)) d[k] = clean(body[k], LIMIT[k]);

  if (!d.company || !d.phone || body.agree !== 'yes') {
    return res.status(400).json({ ok: false, error: 'required' });
  }
  if (d.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) d.email = '';

  const key = process.env.RESEND_API_KEY;
  const from = process.env.NOTIFY_FROM;
  const to = process.env.NOTIFY_TO || 'thehahm@thlabor.co.kr';
  if (!key || !from) return res.status(500).json({ ok: false, error: 'config' });

  const rows = [
    ['회사명/성명', d.company], ['담당자', d.name], ['연락처', d.phone], ['이메일', d.email],
    ['상시근로자 수', d.size], ['상담 분야', d.area], ['상황 설명', d.body]
  ].map(([k, v]) => `<tr><th align="left" style="padding:6px 12px 6px 0;color:#555;white-space:nowrap;vertical-align:top">${k}</th><td style="padding:6px 0;white-space:pre-wrap">${esc(v || '-')}</td></tr>`).join('');

  const html = `<div style="font-family:sans-serif;font-size:14px;line-height:1.6">
<p><b>안전더함 홈페이지 상담 신청</b></p>
<table style="border-collapse:collapse">${rows}</table>
<p style="color:#888;font-size:12px">개인정보 수집·이용 동의: 예 · 접수 시각 ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}</p>
</div>`;

  const payload = {
    from,
    to: [to],
    subject: `[안전더함 상담] ${d.area || '상담 신청'} · ${d.company}`,
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
