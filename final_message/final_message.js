// Spawn floating heart emojis
function spawnHeart() {
  const heart = document.createElement('div');
  heart.className = 'heart';
  heart.textContent = '❤️';
  heart.style.left = Math.random() * 100 + 'vw';
  heart.style.fontSize = (Math.random() * 1.5 + 1) + 'rem';
  document.body.appendChild(heart);

  setTimeout(() => {
    heart.remove();
  }, 4000); // matches animation time
}

// Keep spawning hearts every 300ms
setInterval(spawnHeart, 300);