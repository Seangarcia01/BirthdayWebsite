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

const imagePaths = [
  "assets/3.jpg",
  "assets/4.jpg",
  "assets/5.png",
  "assets/6.jpg"
];

const imageContainer = document.getElementById('image-container');

function spawnImage() {
  const img = document.createElement('img');
  img.src = imagePaths[Math.floor(Math.random() * imagePaths.length)];
  img.className = 'floating-image';

  // Start somewhere random
  const x = Math.random() * 100;
  const y = Math.random() * 100;
  img.style.left = `${x}%`;
  img.style.top = `${y}%`;

  // Motion variation
  const dx = (Math.random() - 0.5) * 300 + "px";
  const dy = (Math.random() - 0.5) * 300 + "px";
  const scale = 0.5 + Math.random() * 1;
  const blur = Math.random() * 2 + "px";
  const startOpacity = 0.2 + Math.random() * 0.4;

  img.style.setProperty('--dx', dx);
  img.style.setProperty('--dy', dy);
  img.style.setProperty('--scale', scale);
  img.style.setProperty('--blur', blur);
  img.style.setProperty('--startOpacity', startOpacity);

  imageContainer.appendChild(img);

  img.addEventListener('animationend', () => img.remove());
}

// Spawn an image every 1200ms
setInterval(spawnImage, 1200);

function spawnMessage() {
  const msg = document.createElement('div');
  msg.className = 'message';

  const text = messages[Math.floor(Math.random() * messages.length)];
  msg.innerHTML = text.split('').map(ch => `<span>${ch}</span>`).join('<br>');

  // Random position on the screen
  const x = Math.random() * 100;
  const y = Math.random() * 100;
  msg.style.left = `${x}%`;
  msg.style.top = `${y}%`;

  // Random motion properties
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

// Spawn messages more frequently
setInterval(spawnMessage, 300);


