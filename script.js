const messages = [
  "Happy Birthday!", "I love you", "You’re amazing", "Best wishes"
];
const container = document.getElementById('message-container');

function spawnMessage() {
  const msg = document.createElement('div');
  msg.className = 'message';
  msg.textContent = messages[
    Math.floor(Math.random() * messages.length)
  ];
  // random horizontal start between 5% and 90%
  msg.style.left = Math.random() * 85 + 5 + '%';
  container.appendChild(msg);

  // remove after animation ends
  msg.addEventListener('animationend', () => {
    msg.remove();
  });
}

// spawn a new message every 800ms
setInterval(spawnMessage, 800);
