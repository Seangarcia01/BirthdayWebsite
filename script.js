const messages = [
  "I love you \u{1F49C}",         // 💜
  "Forever \u{1F496}",            // 💖
  "My heart \u{1F498}",           // 💘
  "My joy \u{1F4AB}",             // 💫
  "You're my person \u{1F339}",   // 🌹
  "You + Me \u{1F491}",           // 💑
  "Happy Birthday \u{1F389}",     // 🎉
  "Beautiful soul \u{2728}",      // ✨
  "Together always \u{1F54A}",    // 🕊️
  "My everything \u{2764}",       // ❤️
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
