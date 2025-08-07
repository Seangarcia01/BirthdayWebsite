// ——— Floating Messages ———
const messages = [
  "I love you", "Forever", "My heart", "My joy",
  "You're my person", "You + Me", "Happy Birthday",
  "Beautiful soul", "Together always", "My everything"
];
const container = document.getElementById('message-container');
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
  msg.style.top  = `${y}%`;
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

// ——— Floating Images ———
const imageContainer = document.getElementById('image-container');
const imagePaths = [
  "assets/1.jpg","assets/2.jpg","assets/3.jpg","assets/4.jpg","assets/5.jpg",
  "assets/6.jpg","assets/7.jpg","assets/8.jpg","assets/9.jpg","assets/calle2.jpg"
];
function spawnImage() {
  const img = document.createElement('img');
  img.src = imagePaths[Math.floor(Math.random() * imagePaths.length)];
  img.className = 'floating-image';
  img.style.left = `${Math.random() * 100}%`;
  img.style.top  = `${Math.random() * 100}%`;
  img.style.setProperty('--dx', (Math.random()-0.5)*300 + "px");
  img.style.setProperty('--dy', (Math.random()-0.5)*300 + "px");
  img.style.setProperty('--scale', 0.5 + Math.random());
  img.style.setProperty('--blur', Math.random()*2 + "px");
  img.style.setProperty('--startOpacity', 0.2 + Math.random()*0.4);
  img.style.zIndex = Math.floor(Math.random() * 10) + 1;
  imageContainer.appendChild(img);
  img.addEventListener('animationend', () => img.remove());
}
setInterval(spawnImage, 1200);

// ——— “No” Button Behavior ———
const noBtn = document.getElementById("no-btn");
noBtn.classList.add("initial");
let clickCount = 0;
noBtn.addEventListener("click", e => {
  e.preventDefault();
  clickCount++;
  if (clickCount === 1) {
    noBtn.classList.remove("initial");
    noBtn.style.position = "absolute";
  }
  noBtn.classList.add("shake");
  setTimeout(() => noBtn.classList.remove("shake"), 400);
  if (clickCount < 8) {
    const btnContainer = document.getElementById("button-container");
    const maxX = btnContainer.offsetWidth - noBtn.offsetWidth;
    const maxY = btnContainer.offsetHeight - noBtn.offsetHeight;
    noBtn.style.left = `${Math.random() * maxX}px`;
    noBtn.style.top  = `${Math.random() * maxY}px`;
  } else {
    noBtn.style.opacity = 0;
    noBtn.style.pointerEvents = "none";
  }
});

// ——— Parallax Mousemove ———
document.addEventListener("mousemove", e => {
  const wrapper     = document.getElementById("parallax-wrapper");
  const hiddenImage = document.getElementById("hidden-image");
  const percentX    = (e.clientX / window.innerWidth  - 0.5);
  const percentY    = (e.clientY / window.innerHeight - 0.5);
  wrapper.style.transform = `translate(${percentX*50}px, ${percentY*50}px)`;
  hiddenImage.style.opacity = (e.clientX > window.innerWidth*0.85 && e.clientY > window.innerHeight*0.85) ? 1 : 0;
});

// ——— Emoji Decorations ———
const emojiGroups = [
  ["🎈","🎈","🎈","🎈","🎉"],
  ["🎂","🎂","🍰","🧁","🍩"],
  ["💖","💘","💝","💗","💞"],
  ["🎊","🎁","🎀","💐","🌸"]
];
const decoContainer = document.getElementById("decorations-container");
function spawnEmojiBundle() {
  const group = emojiGroups[Math.floor(Math.random() * emojiGroups.length)];
  group.forEach((emoji, i) => {
    const span = document.createElement("span");
    span.className = "floating-deco";
    span.textContent = emoji;
    span.style.left = `${Math.random()*100}%`;
    span.style.fontSize = `${1 + Math.random()*0.5}rem`;
    span.style.opacity = 0;
    span.style.animationDelay = `${Math.random()*0.5 + i*0.1}s`;
    decoContainer.appendChild(span);
    setTimeout(() => span.style.opacity = 1, (span.style.animationDelay.slice(0,-1))*1000);
    setTimeout(() => span.remove(), 4000);
  });
}
setInterval(spawnEmojiBundle, 400);

// ——— Infinite Zoom ———
let zoomLevel = 1;
const zoomWrapper = document.getElementById("zoom-wrapper");
document.addEventListener("wheel", e => {
  e.preventDefault();
  zoomLevel = e.deltaY < 0 ? zoomLevel + 0.1 : Math.max(0.2, zoomLevel - 0.1);
  zoomWrapper.style.transform = `scale(${zoomLevel})`;
}, { passive: false });

// ——— Two-Line Typing Animation ———
const line1 = "Happy Birthday, my Love!";
const line2 = "May your day be as wonderful as you are...";
const el1   = document.getElementById("typing-text");
const el2   = document.getElementById("typing-subtext");
const btns  = document.getElementById("button-container");
let i1 = 0, i2 = 0;

function typeLine1() {
  if (i1 < line1.length) {
    el1.textContent += line1[i1++];
    setTimeout(typeLine1, 100);
  } else {
    document.getElementById("typing-container").style.borderRight = "none";
    el2.style.opacity = 1;
    typeLine2();
  }
}

function typeLine2() {
  if (i2 < line2.length) {
    el2.textContent += line2[i2++];
    setTimeout(typeLine2, 80);
  } else {
    el2.style.borderRight = "none";
    btns.style.opacity = 1;
  }
}

window.addEventListener("load", () => {
  btns.style.opacity = 0;
  typeLine1();
});
