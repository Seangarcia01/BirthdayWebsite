const messages = [
  "Happy Birthday 💜",
  "I love you so much 💖",
  "You're the light of my life ✨",
  "To forever and always ❤️",
  "You make every day special 🥰"
];

const container = document.getElementById('message-container');

function spawnMessage() {
  const msg = document.createElement('div');
  msg.className = 'message';
  msg.textContent = messages[Math.floor(Math.random() * messages.length)];

  msg.style.left = '50%';
  msg.style.transform = 'translateX(-50%)'; // center horizontally
  msg.style.top = '0%';

  container.appendChild(msg);
  msg.addEventListener('animationend', () => msg.remove());
}

setInterval(spawnMessage, 1000);
