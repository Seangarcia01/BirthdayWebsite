const messages = [
  "Happy Birthday 💜",
  "You're amazing",
  "I love you",
  "Forever yours 💫",
  "You're my heart 💖"
];

const container = document.getElementById('message-container');

function spawnMessage() {
  const msg = document.createElement('div');
  msg.className = 'message';
  msg.textContent = messages[Math.floor(Math.random() * messages.length)];

  // Position in the center horizontally
  msg.style.left = '50%';
  msg.style.transform = 'translateX(-50%)'; // center align text

  msg.style.top = '0%'; // start at top

  container.appendChild(msg);
  msg.addEventListener('animationend', () => msg.remove());
}

setInterval(spawnMessage, 1000);
