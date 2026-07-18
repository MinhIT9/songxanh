const nav = document.querySelector('#mainNav');
const backToTop = document.querySelector('#backToTop');

function handleScroll() {
  nav.classList.toggle('scrolled', window.scrollY > 40);
  backToTop.classList.toggle('show', window.scrollY > 500);
}
window.addEventListener('scroll', handleScroll, { passive: true });
handleScroll();

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', () => {
    const openMenu = document.querySelector('.navbar-collapse.show');
    if (openMenu) bootstrap.Collapse.getOrCreateInstance(openMenu).hide();
  });
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
      el.textContent = Math.floor(target * (1 - Math.pow(1 - progress, 3)));
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
let checked = JSON.parse(localStorage.getItem('greenChallenge') || '[]');
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
