const messages = [
  "Happy Birthday 💜",
  "You're beautiful 💖",
  "Forever and always 💫",
  "My favorite person 🥰",
  "I love you so much ❤️"
];

const container = document.getElementById('message-container');

// Track horizontal slots to reduce overlap
const usedSlots = new Set();
const maxSlots = 10;

function getAvailableSlot() {
  if (usedSlots.size >= maxSlots) return null;

  let slot;
  do {
    slot = Math.floor(Math.random() * maxSlots);
  } while (usedSlots.has(slot));

  usedSlots.add(slot);
  setTimeout(() => usedSlots.delete(slot), 4000); // free slot after ~4s
  return slot;
}

function spawnMessage() {
  const slot = getAvailableSlot();
  if (slot === null) return;

  const msg = document.createElement('div');
  msg.className = 'message';
  msg.textContent = messages[Math.floor(Math.random() * messages.length)];

  // Position message horizontally based on slot
  const slotWidthPercent = 100 / maxSlots;
  msg.style.left = `${slot * slotWidthPercent + slotWidthPercent / 4}%`; // center in each slot
  msg.style.top = '-10%'; // start above view

  container.appendChild(msg);
  msg.addEventListener('animationend', () => msg.remove());
}

setInterval(spawnMessage, 600); // Spawn frequently but not too fast
