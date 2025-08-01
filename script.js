const messages = [
  "Happy Birthday 💜",
  "You're beautiful 💖",
  "Forever and always 💫",
  "My favorite person 🥰",
  "I love you so much ❤️"
];

const container = document.getElementById('message-container');

// Horizontal slot control
const usedSlots = new Set();
const maxSlots = 10;

function getAvailableSlot() {
  if (usedSlots.size >= maxSlots) return null;

  let slot;
  do {
    slot = Math.floor(Math.random() * maxSlots);
  } while (usedSlots.has(slot));

  usedSlots.add(slot);
  setTimeout(() => usedSlots.delete(slot), 4000); // release slot after animation
  return slot;
}

function spawnMessage() {
  const slot = getAvailableSlot();
  if (slot === null) return;

  const msg = document.createElement('div');
  msg.className = 'message';
  msg.textContent = messages[Math.floor(Math.random() * messages.length)];

  const slotWidth = 100 / maxSlots;
  msg.style.left = `${slot * slotWidth + slotWidth / 4}%`; // center in slot
  msg.style.top = '-10%';

  container.appendChild(msg);
  msg.addEventListener('animationend', () => msg.remove());
}

// Spawn every 600ms
setInterval(spawnMessage, 600);
