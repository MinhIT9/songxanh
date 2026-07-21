const nav = document.querySelector('#mainNav');
const backToTop = document.querySelector('#backToTop');
const pageProgress = document.querySelector('#pageProgress');

function handleScroll() {
  nav.classList.toggle('scrolled', window.scrollY > 40);
  backToTop.classList.toggle('show', window.scrollY > 500);
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  pageProgress.style.width = `${scrollable > 0 ? window.scrollY / scrollable * 100 : 0}%`;
}
window.addEventListener('scroll', handleScroll, { passive: true });
handleScroll();

document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(link => {
  link.addEventListener('click', event => {
    const target = document.querySelector(link.hash);
    if (!target) return;
    event.preventDefault();
    const openMenu = document.querySelector('.navbar-collapse.show');
    if (openMenu) bootstrap.Collapse.getOrCreateInstance(openMenu).hide();
    const navigate = () => {
      history.pushState(null, '', link.hash);
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    if (document.startViewTransition && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.startViewTransition(navigate);
    } else navigate();
  });
});

window.addEventListener('popstate', () => {
  const target = document.querySelector(location.hash || '#trang-chu');
  target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// Message modal controls are wired explicitly so both actions remain reliable.
const messageModalElement = document.querySelector('#messageModal');
const closeMessageModalButton = document.querySelector('#closeMessageModal');
const startChallengeButton = document.querySelector('#startChallengeButton');

function getMessageModal() {
  return bootstrap.Modal.getOrCreateInstance(messageModalElement);
}

closeMessageModalButton.addEventListener('click', () => getMessageModal().hide());

startChallengeButton.addEventListener('click', () => {
  const modal = getMessageModal();
  messageModalElement.addEventListener('hidden.bs.modal', () => {
    document.querySelector('#thu-thach').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, { once: true });
  modal.hide();
});

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(item => revealObserver.observe(item));

const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = Number(el.dataset.target);
    const started = performance.now();
    function update(now) {
      const progress = Math.min((now - started) / 1200, 1);
      el.textContent = Math.floor(target * (1 - Math.pow(1 - progress, 3))).toLocaleString('vi-VN');
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
    counterObserver.unobserve(el);
  });
}, { threshold: .7 });
document.querySelectorAll('.counter').forEach(counter => counterObserver.observe(counter));

const binInfo = {
  organic: '<b>Rác hữu cơ:</b> Rau củ, thức ăn thừa, vỏ trái cây, lá cây. Có thể dùng để ủ phân compost.',
  recycle: '<b>Rác tái chế:</b> Chai nhựa sạch, lon kim loại, giấy và bìa carton. Nhớ làm sạch trước khi bỏ.',
  other: '<b>Rác còn lại:</b> Giấy ăn bẩn, gốm sứ vỡ, túi nylon bẩn và các vật không thể tái chế.',
  hazard: '<b>Rác nguy hại:</b> Pin, ắc quy, bóng đèn, hóa chất. Cần để riêng và chuyển đến điểm thu gom an toàn.'
};
document.querySelectorAll('.bin-card').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.bin-card').forEach(item => item.classList.remove('active'));
    button.classList.add('active');
    document.querySelector('#binResult span').innerHTML = binInfo[button.dataset.bin];
  });
});

const challenges = [
  'Tắt điện khi không sử dụng', 'Mang bình nước cá nhân', 'Phân loại rác đúng cách',
  'Đi bộ hoặc đi xe đạp', 'Ăn hết phần thức ăn', 'Chăm sóc một chậu cây', 'Chia sẻ lối sống xanh'
];
const checkList = document.querySelector('#checkList');
let checked = [];
try {
  const savedChallenge = JSON.parse(localStorage.getItem('greenChallenge') || '[]');
  checked = Array.isArray(savedChallenge)
    ? savedChallenge.filter(item => Number.isInteger(item) && item >= 0 && item < challenges.length)
    : [];
} catch {
  localStorage.removeItem('greenChallenge');
}
const challengeBox = document.querySelector('#challengeBox');
const celebration = document.querySelector('#celebration');

function renderChallenge() {
  checkList.innerHTML = challenges.map((text, index) => `
    <label class="check-item ${checked.includes(index) ? 'done' : ''}">
      <input type="checkbox" data-index="${index}" ${checked.includes(index) ? 'checked' : ''}>
      <span>Ngày ${index + 1}: ${text}</span>
    </label>`).join('');
  const count = checked.length;
  document.querySelector('#progressText').textContent = `${count}/7 ngày`;
  document.querySelector('#challengeProgress').style.width = `${count / 7 * 100}%`;
  challengeBox.classList.toggle('is-complete', count === 7);
  localStorage.setItem('greenChallenge', JSON.stringify(checked));
}
checkList.addEventListener('change', event => {
  const previousCount = checked.length;
  const index = Number(event.target.dataset.index);
  checked = event.target.checked ? [...new Set([...checked, index])] : checked.filter(item => item !== index);
  renderChallenge();
  if (previousCount < 7 && checked.length === 7) showCelebration();
});
document.querySelector('#resetChallenge').addEventListener('click', () => { checked = []; renderChallenge(); });
renderChallenge();

function showCelebration() {
  celebration.hidden = false;
  document.body.classList.add('celebrating');
  requestAnimationFrame(() => celebration.classList.add('show'));
  launchConfetti();
}

function closeCelebration() {
  celebration.classList.remove('show');
  document.body.classList.remove('celebrating');
  setTimeout(() => { celebration.hidden = true; }, 350);
}

document.querySelector('#closeCelebration').addEventListener('click', closeCelebration);
document.querySelector('#acceptAchievement').addEventListener('click', closeCelebration);
celebration.addEventListener('click', event => { if (event.target === celebration) closeCelebration(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !celebration.hidden) closeCelebration(); });

function launchConfetti() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const canvas = document.querySelector('#confettiCanvas');
  const context = canvas.getContext('2d');
  const colors = ['#c9f36a', '#ffffff', '#ff826f', '#59aee7', '#ffd65a', '#36b978'];
  const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
  resize();
  const pieces = Array.from({ length: 150 }, () => ({
    x: Math.random() * canvas.width,
    y: -20 - Math.random() * canvas.height * .55,
    w: 5 + Math.random() * 8,
    h: 8 + Math.random() * 10,
    color: colors[Math.floor(Math.random() * colors.length)],
    speed: 2.5 + Math.random() * 4.5,
    drift: -1.5 + Math.random() * 3,
    rotation: Math.random() * Math.PI,
    rotationSpeed: -.12 + Math.random() * .24
  }));
  const start = performance.now();
  function animate(now) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(piece => {
      piece.y += piece.speed;
      piece.x += piece.drift;
      piece.rotation += piece.rotationSpeed;
      context.save();
      context.translate(piece.x, piece.y);
      context.rotate(piece.rotation);
      context.fillStyle = piece.color;
      context.fillRect(-piece.w / 2, -piece.h / 2, piece.w, piece.h);
      context.restore();
    });
    if (now - start < 3200) requestAnimationFrame(animate);
    else context.clearRect(0, 0, canvas.width, canvas.height);
  }
  requestAnimationFrame(animate);
}

const sections = document.querySelectorAll('main section[id]');
const links = document.querySelectorAll('.nav-link[href^="#"]');
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      links.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
    }
  });
}, { rootMargin: '-35% 0px -55% 0px' });
sections.forEach(section => sectionObserver.observe(section));

// Lightweight ripple feedback for primary actions.
document.querySelectorAll('.ripple').forEach(button => button.addEventListener('pointerdown', event => {
  const wave = document.createElement('span');
  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  wave.className = 'ripple-wave';
  Object.assign(wave.style, { width: `${size}px`, height: `${size}px`, left: `${event.clientX - rect.left - size / 2}px`, top: `${event.clientY - rect.top - size / 2}px` });
  button.appendChild(wave);
  setTimeout(() => wave.remove(), 600);
}));

// Search and dark mode are intentionally local and instant.
document.querySelector('#searchToggle')?.addEventListener('click', () => {
  const keyword = prompt('Bạn muốn tìm chủ đề nào?');
  if (!keyword) return;
  const target = [...document.querySelectorAll('main section[id]')].find(section => section.textContent.toLowerCase().includes(keyword.toLowerCase()));
  if (target) target.scrollIntoView({ behavior: 'smooth' });
  else alert('Chưa tìm thấy chủ đề phù hợp.');
});
const themeToggle = document.querySelector('#themeToggle');
if (localStorage.getItem('greenTheme') === 'dark') document.body.classList.add('dark-mode');
themeToggle?.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('greenTheme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
  themeToggle.firstElementChild.className = document.body.classList.contains('dark-mode') ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
});

// Drag-and-drop waste sorting mini game.
const wasteTray = document.querySelector('#wasteTray');
if (wasteTray) {
  const wasteItems = [['🍌 Vỏ chuối', 'organic'], ['📰 Báo cũ', 'recycle'], ['💡 Bóng đèn hỏng', 'other'], ['🧻 Giấy bẩn', 'other']];
  wasteTray.innerHTML = wasteItems.map(([label, type], index) => `<button class="waste-piece" draggable="true" data-type="${type}" data-index="${index}">${label}</button>`).join('');
  let dragged = null;
  document.querySelectorAll('.waste-piece').forEach(piece => piece.addEventListener('dragstart', () => { dragged = piece; }));
  document.querySelectorAll('.bin-card').forEach(bin => {
    bin.addEventListener('dragover', event => { event.preventDefault(); bin.classList.add('drag-over'); });
    bin.addEventListener('dragleave', () => bin.classList.remove('drag-over'));
    bin.addEventListener('drop', event => {
      event.preventDefault(); bin.classList.remove('drag-over');
      if (!dragged) return;
      const correct = dragged.dataset.type === bin.dataset.bin;
      document.querySelector('#binResult span').textContent = correct ? 'Chính xác! Bạn đã phân loại đúng.' : 'Chưa đúng rồi, hãy thử một thùng khác nhé!';
      if (correct) dragged.remove();
      dragged = null;
    });
  });
}

// Four-question green living quiz.
const quizStart = document.querySelector('#quizStart');
if (quizStart) {
  const quiz = [
    ['Khi ra khỏi phòng, em nên làm gì?', ['Tắt đèn và quạt', 'Để mọi thiết bị chạy'], 0],
    ['Đồ nào nên mang theo mỗi ngày?', ['Cốc nhựa dùng một lần', 'Bình nước cá nhân'], 1],
    ['Chai nhựa sạch thuộc nhóm nào?', ['Rác tái chế', 'Rác hữu cơ'], 0],
    ['Cách đi lại nào xanh hơn?', ['Xe đạp', 'Xe máy cho quãng đường ngắn'], 0]
  ];
  let questionIndex = 0, quizPoints = 0;
  const showQuestion = () => {
    const current = quiz[questionIndex];
    document.querySelector('#quizQuestion').textContent = `${questionIndex + 1}/4 · ${current[0]}`;
    document.querySelector('#quizAnswers').innerHTML = current[1].map((answer, index) => `<button data-answer="${index}">${answer}</button>`).join('');
    quizStart.hidden = true;
    document.querySelectorAll('#quizAnswers button').forEach(answer => answer.addEventListener('click', () => {
      const correct = Number(answer.dataset.answer) === current[2];
      answer.classList.add(correct ? 'correct' : 'wrong');
      if (correct) quizPoints++;
      document.querySelectorAll('#quizAnswers button').forEach(item => item.disabled = true);
      setTimeout(() => { questionIndex++; if (questionIndex < quiz.length) showQuestion(); else { document.querySelector('#quizQuestion').textContent = 'Hoàn thành!'; document.querySelector('#quizAnswers').innerHTML = ''; document.querySelector('#quizScore').textContent = `Bạn đạt ${quizPoints}/4 điểm xanh.`; if (quizPoints >= 3) launchConfetti(); } }, 550);
    }));
  };
  quizStart.addEventListener('click', showQuestion);
}

// Commitment certificate preview.
document.querySelector('#pledgeForm')?.addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  document.querySelector('#certificateName').textContent = data.get('name');
  document.querySelector('#certificateMeta').textContent = `Lớp ${data.get('class')} · ${data.get('school')}`;
  document.querySelector('#certificate').classList.add('completed');
  document.querySelector('#pledgeSuccess').textContent = '🎉 Chúc mừng! Bạn đã trở thành Đại sứ Sống Xanh!';
  launchConfetti();
});

document.querySelectorAll('.resource-open').forEach((button, index) => button.addEventListener('click', () => {
  if (index < 2) {
    document.querySelector('#messageModalTitle').textContent = index === 0 ? 'Video Sống Xanh' : 'Bộ ảnh hành động xanh';
    document.querySelector('#messageModal .modal-body p').textContent = 'Học liệu đang được chuẩn bị. Bạn có thể quay lại sau để khám phá nội dung mới.';
    getMessageModal().show();
  } else {
    const file = new Blob(['3 bước phân loại rác: Làm sạch - Phân loại - Bỏ đúng thùng.'], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a'); link.href = URL.createObjectURL(file); link.download = 'so-tay-song-xanh.txt'; link.click(); URL.revokeObjectURL(link.href);
  }
}));

// Cache the app shell and visited assets for instant repeat visits and offline fallback.
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}
