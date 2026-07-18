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

function renderChallenge() {
  checkList.innerHTML = challenges.map((text, index) => `
    <label class="check-item ${checked.includes(index) ? 'done' : ''}">
      <input type="checkbox" data-index="${index}" ${checked.includes(index) ? 'checked' : ''}>
      <span>Ngày ${index + 1}: ${text}</span>
    </label>`).join('');
  const count = checked.length;
  document.querySelector('#progressText').textContent = `${count}/7 ngày`;
  document.querySelector('#challengeProgress').style.width = `${count / 7 * 100}%`;
  localStorage.setItem('greenChallenge', JSON.stringify(checked));
}
checkList.addEventListener('change', event => {
  const index = Number(event.target.dataset.index);
  checked = event.target.checked ? [...new Set([...checked, index])] : checked.filter(item => item !== index);
  renderChallenge();
});
document.querySelector('#resetChallenge').addEventListener('click', () => { checked = []; renderChallenge(); });
renderChallenge();

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
