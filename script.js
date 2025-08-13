const messages = [
  "I love you",
  "I love you so much",
  "Forever",
  "My heart",
  "Happy Birthday",
  "Happy Birthday",
  "Happy Birthday",
  "Happy Birthday",
  "Happy Birthday",
  "You're my person",
  "You + Me",
  "Happy Birthday",
  "Beautiful soul",
  "Mahal Kita",
  "Ms. Sungit",
  "Always here for you",
  "Aking sinta",
  "My comfort",
  "Love of my life",
];

const container = document.getElementById('message-container');
const imageContainer = document.getElementById('image-container');
const noBtn = document.getElementById("no-btn");
const proceedBtn = document.getElementById("proceed-btn");

let clickCount = 0;

// Initially keep button static
noBtn.classList.add("initial");

noBtn.addEventListener("click", (e) => {
  e.preventDefault();
  clickCount++;

  // Remove static class and allow movement
  if (clickCount === 1) {
    noBtn.classList.remove("initial");
    noBtn.style.position = "absolute";
  }

  // Shake animation
  noBtn.classList.add("shake");
  setTimeout(() => noBtn.classList.remove("shake"), 400);

  if (clickCount < 8) {
    const container = document.getElementById("button-container");
    const maxX = container.offsetWidth - noBtn.offsetWidth;
    const maxY = container.offsetHeight - noBtn.offsetHeight;

    const randomX = Math.floor(Math.random() * maxX);
    const randomY = Math.floor(Math.random() * maxY);

    noBtn.style.left = `${randomX}px`;
    noBtn.style.top = `${randomY}px`;
    noBtn.style.transform = "none";
  } else {
    noBtn.style.opacity = 0;
    noBtn.style.pointerEvents = "none";
  }
});

const imagePaths = [
  "assets/1.jpg",
  "assets/2.jpg",
  "assets/3.jpg",
  "assets/4.jpg",
  "assets/5.jpg",
  "assets/6.jpg",
  "assets/7.jpg",
  "assets/8.jpg",
  "assets/9.jpg",
  "assets/10.jpg",
];

function spawnImage() {
  // Build a set of filenames already on-screen (e.g. "1.jpg")
  const existingFiles = new Set(
    Array.from(imageContainer.querySelectorAll('img.floating-image'))
      .map(img => img.src.split('/').pop())
  );

  // Try up to 5 times to pick an image not already shown
  let path, file, tries = 0;
  do {
    path = imagePaths[Math.floor(Math.random() * imagePaths.length)]; 
    // path is something like "assets/1.jpg"
    file = path.split('/').pop();                        // get "1.jpg"
    tries++;
  } while (tries < 5 && existingFiles.has(file));

  // If after 5 tries it's still a duplicate, bail out
  if (existingFiles.has(file)) return;

  // Create and animate
  const img = document.createElement('img');
  img.src       = path;            // use the exact relative path
  img.className = 'floating-image';

  // Random start position
  img.style.left = `${Math.random() * 100}%`;
  img.style.top  = `${Math.random() * 100}%`;

  // Random animation variables
  img.style.setProperty('--dx', (Math.random() - 0.5)*300 + 'px');
  img.style.setProperty('--dy', (Math.random() - 0.5)*300 + 'px');
  img.style.setProperty('--scale', (0.5 + Math.random()).toString());
  img.style.setProperty('--blur', (Math.random()*2) + 'px');
  img.style.setProperty('--startOpacity', (0.2 + Math.random()*0.4).toString());
  img.style.zIndex = Math.floor(Math.random() * 10) + 1;

  imageContainer.appendChild(img);
  img.addEventListener('animationend', () => img.remove());
}

setInterval(spawnImage, 1200);

function spawnMessage() {
  const msg = document.createElement('div');
  msg.className = 'message';

  const text = messages[Math.floor(Math.random() * messages.length)];
  msg.innerHTML = text.split('').map(ch => `<span>${ch}</span>`).join('<br>');

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

document.addEventListener("mousemove", (e) => {
  const wrapper = document.getElementById("parallax-wrapper");
  const hiddenImage = document.getElementById("hidden-image");

  const percentX = (e.clientX / window.innerWidth - 0.5);
  const percentY = (e.clientY / window.innerHeight - 0.5);

  const translateX = percentX * 50;
  const translateY = percentY * 50;

  wrapper.style.transform = `translate(${translateX}px, ${translateY}px)`;

  if (e.clientX > window.innerWidth * 0.85 && e.clientY > window.innerHeight * 0.85) {
    hiddenImage.style.opacity = 1;
  } else {
    hiddenImage.style.opacity = 0;
  }
});

const emojiGroups = [
  ["🎈", "🎈", "🎈", "🎈", "🎉"],
  ["🎂", "🎂", "🍰", "🧁", "🍩"],
  ["💖", "💘", "💝", "💗", "💞"],
  ["🎊", "🎁", "🎀", "💐", "🌸"]
];

const decoContainer = document.getElementById("decorations-container");

function spawnEmojiBundle() {
  const group = emojiGroups[Math.floor(Math.random() * emojiGroups.length)];

  group.forEach((emoji, index) => {
    const span = document.createElement("span");
    span.className = "floating-deco";
    span.textContent = emoji;

    const x = Math.random() * 100;
    const delay = Math.random() * 0.5 + index * 0.1;
    const size = 1 + Math.random() * 0.5;

    span.style.left = `${x}%`;
    span.style.fontSize = `${size}rem`;
    span.style.opacity = 0;
    span.style.animationDelay = `${delay}s`;

    decoContainer.appendChild(span);

    // Appear just before floating begins
    setTimeout(() => {
      span.style.opacity = 1;
    }, delay * 1000);

    setTimeout(() => span.remove(), 4000);
  });
}

// Spawn a bundle every 400ms
setInterval(spawnEmojiBundle, 400);

let zoomLevel = 1;
const zoomWrapper = document.getElementById("zoom-wrapper");

function setZoom(scale) {
  zoomWrapper.style.transform = `scale(${scale})`;
}

// Zoom with mouse wheel
document.addEventListener("wheel", (e) => {
  e.preventDefault();
  const zoomIntensity = 0.1;
  if (e.deltaY < 0) {
    zoomLevel += zoomIntensity;
  } else {
    zoomLevel = Math.max(0.2, zoomLevel - zoomIntensity);
  }
  setZoom(zoomLevel);
}, { passive: false });

// ——— Extended Typing Sequence ———
const line1 = "Happy Birthday,<br>my Love!";
const line2 = "May your day be as wonderful as you are...";
const el1 = document.getElementById("typing-text");
const el2 = document.getElementById("typing-subtext");
const btns = document.getElementById("button-container");
let i1 = 0, i2 = 0;

// Type first line with <br> support
function typeLine1() {
  if (i1 < line1.length) {
    if (line1.slice(i1, i1 + 4) === "<br>") {
      el1.innerHTML += "<br>";
      i1 += 4;
    } else {
      el1.innerHTML += line1[i1++];
    }
    setTimeout(typeLine1, 100);
  } else {
    document.getElementById("typing-container").style.borderRight = "none";
    el2.style.opacity = 1;
    typeLine2();
  }
}

// Type second line (no <br>)
function typeLine2() {
  if (i2 < line2.length) {
    el2.textContent += line2[i2++];
    setTimeout(typeLine2, 80);
  } else {
    el2.style.borderRight = "none";
    btns.style.opacity = 1;
  }
}

// Initialize typing
window.addEventListener("load", () => {
  btns.style.opacity = 0;
  typeLine1();
});