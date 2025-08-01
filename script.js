const messages = [
  "I love you 💜",
  "Forever 💖",
  "My heart 💘",
  "My joy 💫",
  "You're my person 🌹",
  "You + Me 💑",
  "Happy Birthday 🎉",
  "Beautiful soul ✨",
  "Together always 🕊️",
  "My everything ❤️"
];

const container = document.getElementById('message-container');

function spawnMessage() {
  const msg = document.createElement('div');
  msg.className = 'message';

  const text = messages[Math.floor(Math.random() * messages.length)];

  // Vertical layout
  msg.innerHTML = text.split('').map(ch => `<span>${ch}</span>`).join('<br>');

  // Random starting position
  const x = Math.random() * 100;
  const y = Math.random() * 100;
  msg.style.left = `${x}%`;
  msg.style.top = `${y}%`;

  // Random direction & depth
  const dx = (Math.random() - 0.5) * 300 + "px";
  const dy = (Math.random() - 0.5) * 300 + "px";
  const blur = Math.random() * 4 + "px";
  const scale = 0.8 + Math.random() * 0.6;

  // Custom properties to animate
  msg.style.setProperty('--dx', dx);
  msg.style.setProperty('--dy', dy);
  msg.style.setProperty('--blur', blur);
  msg.style.setProperty('--scale', scale);

  container.appendChild(msg);

  msg.addEventListener('animationend', () => msg.remove());
}

// More frequent message spawns
setInterval(spawnMessage, 400);
