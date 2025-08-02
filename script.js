const messages = [
  "I love you",
  "Forever",
  "My heart",
  "My joy",
  "You're my person",
  "You + Me",
  "Happy Birthday",
  "Beautiful soul",
  "Together always",
  "My everything"
];

const container = document.getElementById('message-container');
const imageContainer = document.getElementById('image-container');

const imagePaths = [
  "assets/1.jpg",
  "assets/3.jpg",
  "assets/4.jpg",
  "assets/5.jpg",
  "assets/6.jpg",
  "assets/7.jpg",
  "assets/8.jpg",
  "assets/9.jpg"
];

// Spawn floating image
function spawnImage() {
  const img = document.createElement('img');
  img.src = imagePaths[Math.floor(Math.random() * imagePaths.length)];
  img.className = 'floating-image';

  const x = Math.random() * 100;
  const y = Math.random() * 100;
  img.style.left = `${x}%`;
  img.style.top = `${y}%`;

  const dx = (Math.random() - 0.5) * 300 + "px";
  const dy = (Math.random() - 0.5) * 300 + "px";
  const scale = 0.5 + Math.random();
  const blur = Math.random() * 2 + "px";
  const startOpacity = 0.2 + Math.random() * 0.4;

  img.style.setProperty('--dx', dx);
  img.style.setProperty('--dy', dy);
  img.style.setProperty('--scale', scale);
  img.style.setProperty('--blur', blur);
  img.style.setProperty('--startOpacity', startOpacity);
  img.style.zIndex = Math.floor(Math.random() * 10) + 1;

  imageContainer.appendChild(img);

  img.addEventListener('animationend', () => img.remove());
}

setInterval(spawnImage, 1200);

// Spawn floating vertical message
function spawnMessage() {
  const msg = document.createElement('div');
  msg.className = 'message';

  const text = messages[Math.floor(Math.random() * messages.length)];
  msg.innerHTML = text.split('').map(ch => `<span>${ch}</span>`).join('<br>');

  // Avoid central area (center image)
  let x, y;
  do {
    x = Math.random() * 100;
    y = Math.random() * 100;
  } while (x > 35 && x < 65 && y > 35 && y < 65);

  msg.style.left = `${x}%`;
  msg.style.top = `${y}%`;

  const dx = (Math.random() - 0.5) * 300 + "px";
  const dy = (Math.random() - 0.5) * 300 + "px";
  const blur = Math.random() * 4 + "px";
  const scale = 0.8 + Math.random() * 0.6;

  msg.style.setProperty('--dx', dx);
  msg.style.setProperty('--dy', dy);
  msg.style.setProperty('--blur', blur);
  msg.style.setProperty('--scale', scale);

  container.appendChild(msg);

  msg.addEventListener('animationend', () => msg.remove());
}

setInterval(spawnMessage, 300);
