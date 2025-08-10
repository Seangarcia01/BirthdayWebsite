// Hearts animation
const heartsContainer = document.querySelector('.hearts-container');

function spawnHeart() {
  const heart = document.createElement('div');
  heart.textContent = '💖';
  heart.style.position = 'absolute';
  heart.style.left = Math.random() * 100 + 'vw';
  heart.style.fontSize = (Math.random() * 24 + 16) + 'px';
  heart.style.animation = `floatUp ${Math.random() * 3 + 3}s ease-out forwards`;
  heartsContainer.appendChild(heart);

  setTimeout(() => heart.remove(), 6000);
}

setInterval(spawnHeart, 500);

const style = document.createElement('style');
style.textContent = `
@keyframes floatUp {
  0% { transform: translateY(100vh); opacity: 1; }
  100% { transform: translateY(-10vh); opacity: 0; }
}`;
document.head.appendChild(style);

// Background music autoplay unlock
const music = document.getElementById('bg-music');
let musicUnlocked = false;

function unlockMusic() {
  if (!musicUnlocked) {
    music.volume = 0;
    music.play().then(() => {
      music.pause();
      music.currentTime = 0;
      music.volume = 1;
      music.play().catch(()=>{});
      musicUnlocked = true;
    }).catch(()=>{});
  }
}

document.body.addEventListener('click', unlockMusic, { once: true });
document.body.addEventListener('touchstart', unlockMusic, { once: true });
