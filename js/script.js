// 文件路径: /js/script.js
(() => {
  const LINE_BASE_URL = "https://line.me/ti/p/~na8ys";

  const toastEl = document.getElementById('toast');
  const showToast = (msg, duration = 2400) => {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    setTimeout(() => toastEl.classList.remove('show'), duration);
  };

  // 取得目前篩選條件
  const getCurrentFilters = () => {
    const filters = { age: '全部', style: '全部', body: '全部' };
    document.querySelectorAll('.chips').forEach(group => {
      const key = group.dataset.filter;
      const active = group.querySelector('.chip.is-active');
      if (key && active) filters[key] = active.dataset.value || '全部';
    });
    return filters;
  };

  // 產生要傳給 LINE 的訊息
  const generateMessage = () => {
    const f = getCurrentFilters();
    return `約愛｜年齡偏好：${f.age}　類型：${f.style}　身形：${f.body}`;
  };

  // 處理所有 CTA 點擊
  const handleCtaClick = (e) => {
    e.preventDefault();
    const target = e.currentTarget;
    const url = target.dataset.lineUrl || LINE_BASE_URL;

    const msg = generateMessage();
    // 嘗試複製文字到剪貼簿
    navigator.clipboard?.writeText(msg).catch(() => {});

    // 開啟 LINE
    const lineScheme = `line://msg/text/${encodeURIComponent(msg)}`;
    window.open(lineScheme, '_blank');

    // 備用：直接跳轉網址版
    setTimeout(() => {
      window.open(url, '_blank');
    }, 800);

    showToast('已複製偏好 → 請貼到 LINE 對話框', 2800);
  };

  // 綁定所有 CTA 按鈕
  document.querySelectorAll('[data-line-url], #btnLine, #headerLineCta').forEach(el => {
    el.addEventListener('click', handleCtaClick);
  });

  // -----------------------
  //  圖片動態更新邏輯
  // -----------------------
  const catalog = [
   
    { src: 'static/images/girls/a2.png', age: '18-25', style: '清純', body: '纖細', name: '安娜', tags: ['制服扮演','後入最佳'] },
    { src: 'static/images/girls/a3.png', age: '26-35', style: '熟女', body: '豐滿', name: '欣妮', tags: ['巨乳乳交','3P可'] },
    { src: 'static/images/girls/a4.png', age: '26-35', style: '性感', body: '運動型', name: '艾拉', tags: ['黑絲後入','內射OK'] },
    { src: 'static/images/girls/a5.png', age: '35+', style: '熟女', body: '豐滿', name: '卡欣', tags: ['熟女口交','顏射OK'] },
    { src: 'static/images/girls/a6.png', age: '18-25', style: '性感', body: '纖細', name: '米亞', tags: ['深喉','內射OK'] },
    { src: 'static/images/girls/a7.png', age: '26-35', style: '清純', body: '纖細', name: '優潔', tags: ['顏射內射','3P可'] },
    { src: 'static/images/girls/a8.png', age: '35+', style: '清純', body: '運動型', name: '王蓉', tags: ['瑜珈後入','生插入'] },
    { src: 'static/images/girls/a9.png', age: '18-25', style: '可愛', body: '豐滿', name: '可莫', tags: ['巨乳乳交','內射OK'] },
   ];

  const matchFilter = (item, f) => {
    return (
      (f.age   === '全部' || item.age   === f.age   || item.age   === '全部') &&
      (f.style === '全部' || item.style === f.style || item.style === '全部') &&
      (f.body  === '全部' || item.body  === f.body  || item.body  === '全部')
    );
  };

  const shuffleArray = arr => arr.slice().sort(() => Math.random() - 0.5);

  const pickRandomN = (arr, n, exclude = new Set()) => {
    const candidates = arr.filter(x => !exclude.has(x.src));
    return shuffleArray(candidates).slice(0, n);
  };

  const updateImages = () => {
    const f = getCurrentFilters();
    let matched = catalog.filter(item => matchFilter(item, f));
    if (matched.length === 0) matched = catalog;

    const used = new Set();

    // Hero 三張
    const heroCards = [
      document.querySelector('.portrait-card--a'),
      document.querySelector('.portrait-card--b'),
      document.querySelector('.portrait-card--c')
    ];
    const top3 = pickRandomN(matched, 3, used);
    top3.forEach((item, i) => {
      const card = heroCards[i];
      if (!card || !item) return;
      const img = card.querySelector('img');
      const label = card.querySelector('.portrait-label');
      if (img) {
        img.src = item.src;
        img.classList.remove('loaded');
        img.onload = () => img.classList.add('loaded');
      }
      if (label) label.textContent = item.style;
    });

    // Gallery 六張
    const galleryItems = document.querySelectorAll('.gallery-card');
    const top6 = pickRandomN(matched, 6, used);
    galleryItems.forEach((card, idx) => {
      const item = top6[idx];
      if (!item) return;
      const img = card.querySelector('img');
      const cap = card.querySelector('.gallery-caption');
      if (img) {
        img.src = item.src;
        img.classList.remove('loaded');
        img.onload = () => img.classList.add('loaded');
      }
      if (cap) cap.textContent = item.tags?.[0] || item.style;
    });
  };

  // 綁定 chip 點擊
  document.querySelectorAll('.chips').forEach(group => {
    group.addEventListener('click', e => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      [...group.children].forEach(c => c.classList.remove('is-active'));
      chip.classList.add('is-active');
      // updateImages();
    });
  });

  // 初次渲染
  updateImages();

  // Slider 拖曳功能
  const slider = document.getElementById('gallerySlider');
  if (slider) {
    let isDown = false;
    let startX;
    let scrollLeft;
    slider.addEventListener('mousedown', (e) => {
      isDown = true;
      slider.style.cursor = 'grabbing';
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
    });
    slider.addEventListener('mouseleave', () => {
      isDown = false;
      slider.style.cursor = 'grab';
    });
    slider.addEventListener('mouseup', () => {
      isDown = false;
      slider.style.cursor = 'grab';
    });
    slider.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX) * 1.5;
      slider.scrollLeft = scrollLeft - walk;
    });
    slider.style.cursor = 'grab';
  }
})();
