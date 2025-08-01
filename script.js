const messages = [
  "Happy Birthday!",
  "I love you ❤️",
  "You make me smile 😊",
  "To many more memories 🎉",
  "You're my favorite person 💕"
];

const container = document.getElementById('message-container');

function spawnMessage() {
  const msg = document.createElement('div');
  msg.className = 'message';
  msg.textContent = messages[Math.floor(Math.random() * messages.length)];

  // random horizontal position
  msg.style.left = Math.random() * 80 + 10 + '%';
  msg.style.top = '100%';

  container.appendChild(msg);

  msg.addEventListener('animationend', () => msg.remove());
}

setInterval(spawnMessage, 800); // message every 0.8s
