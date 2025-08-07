document.querySelectorAll('.reason-card').forEach(card => {
  card.addEventListener('click', () => {
    const title = card.getAttribute('data-title');
    const detail = card.getAttribute('data-detail');
    document.getElementById('popup-title').textContent = title;
    document.getElementById('popup-content').textContent = detail;
    document.getElementById('popup-overlay').classList.remove('hidden');
  });
});

document.getElementById('popup-close').addEventListener('click', () => {
  document.getElementById('popup-overlay').classList.add('hidden');
});

document.getElementById('toggle-music').addEventListener('click', () => {
  const iframe = document.getElementById('music-frame');
  iframe.style.display = (iframe.style.display === 'none') ? 'block' : 'none';
});

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('toggle-music-btn');
  const iframe = document.getElementById('music-frame');

  btn.addEventListener('click', () => {
    iframe.classList.toggle('hidden');
  });
});
