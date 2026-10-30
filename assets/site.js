(function () {
  // 모바일 메뉴
  var btn = document.getElementById('menuBtn');
  var nav = document.getElementById('mainNav');
  if (btn && nav) {
    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // 이메일 주소 복사
  document.querySelectorAll('.copy').forEach(function (b) {
    b.addEventListener('click', function () {
      var value = b.getAttribute('data-copy');
      var label = b.textContent;
      function done(text) { b.textContent = text; setTimeout(function () { b.textContent = label; }, 1600); }
      if (navigator.clipboard) {
        navigator.clipboard.writeText(value).then(function () { done('복사됨'); }, function () { done(value); });
      } else {
        done(value);
      }
    });
  });

  // 인사이트 분야별 보기 (스크립트가 없으면 버튼 없이 전체 목록만 보인다)
  var pf = document.getElementById('postFilter');
  if (pf) {
    var items = document.querySelectorAll('#posts > li, .soon li');
    var posts = document.querySelectorAll('#posts > li');
    var empty = document.getElementById('postsEmpty');
    var buttons = pf.querySelectorAll('button');
    pf.hidden = false;
    buttons.forEach(function (b) {
      b.addEventListener('click', function () {
        var f = b.getAttribute('data-f');
        buttons.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        items.forEach(function (li) { li.hidden = !!f && li.getAttribute('data-field') !== f; });
        var shown = 0;
        posts.forEach(function (li) { if (!li.hidden) shown++; });
        if (empty) empty.hidden = shown > 0;
        var soon = document.querySelector('.soon');
        if (soon) soon.hidden = !soon.querySelector('li:not([hidden])');
      });
    });
  }

  // 상담 신청
  var form = document.getElementById('consult');
  if (!form) return;
  var msg = document.getElementById('done');
  var submit = form.querySelector('button[type="submit"]');

  function show(text, ok) {
    msg.textContent = text;
    msg.style.color = ok ? '' : 'var(--warn)';
    msg.hidden = false;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var data = {};
    new FormData(form).forEach(function (v, k) { data[k] = String(v).trim(); });

    if (!data.company || !data.phone) { show('회사명/성명과 연락처를 입력해 주세요.', false); return; }
    if (data.agree !== 'yes') { show('개인정보 수집·이용에 동의해 주세요.', false); return; }

    data.via = 'form';
    submit.disabled = true;
    show('전송하고 있습니다.', true);

    fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
      .then(function (r) { if (!r.ok) throw new Error('send failed'); return r.json(); })
      .then(function () {
        // 접수 후에는 입력 칸과 버튼을 감추고 완료 안내만 남긴다 (빈 폼 재전송 방지)
        form.reset();
        form.parentNode.insertBefore(msg, form);
        form.hidden = true;
        show('상담 신청이 접수되었습니다. 공인노무사가 확인 후 연락드리겠습니다.', true);
        msg.style.fontSize = '17px';
        msg.style.padding = '24px 0';
      })
      .catch(function () {
        show('전송하지 못했습니다. 02-6949-6920 또는 thehahm@thlabor.co.kr로 연락해 주세요.', false);
      })
      .finally(function () { submit.disabled = false; });
  });
})();
