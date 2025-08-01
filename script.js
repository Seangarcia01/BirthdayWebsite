const messages = [
  "Happy Birthday 💜",
  "I love you 💖",
  "Forever 💫",
  "My sunshine ☀️",
  "You're amazing 🌟",
  "Beautiful soul ❤️",
  "You & Me 💕",
  "You're special 🎁"
];

const container = document.getElementById('message-container');

// Control max horizontal slots to avoid overlaps
const maxSlots = 10;
const usedSlots = new Set();

function getAvailableSlot() {
  if (usedSlots.size >= maxSlots) return null;

  let slot;
  do {
    slot = Math.floor(Math.random() * maxSlots);
  } while (usedSlots.has(slot));

  usedSlots.add(slot);
  setTimeout(() => usedSlots.delete(slot), 4000); // free up slot after animation
  return slot;
}

function spawnMessage() {
  const slot = getAvailableSlot();
  if (slot === null) return;

  const msg = document.createElement('div');
  msg.className = 'message';

  // Turn text into vertical layout using <br> and <span>
  const text = messages[Math.floor(Math.random() * messages.length)];
  msg.innerHTML = text.split('').map(ch => `<span>${ch}</span>`).join('<br>');

  // Random horizontal placement
  const slotWidth = 100 / maxSlots;
  msg.style.left = `${slot * slotWidth + slotWidth / 4}%`;
  msg.style.top = '-10%';

  container.appendChild(msg);

  // Clean up after animation
  msg.addEventListener('animationend', () => {
    msg.remove();
  });
}

// Spawn new message every 600ms
setInterval(spawnMessage, 600);
