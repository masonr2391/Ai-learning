const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const width = canvas.width;
const height = canvas.height;

const gravity = 0.5;
const tileSize = 40;
const groundLevel = height - tileSize;

const level = [
  [0, 0, 0, 1, 0, 0, 0, 1, 0, 0],
  [0, 1, 0, 1, 0, 0, 0, 1, 0, 0],
  [0, 0, 0, 1, 0, 0, 0, 1, 0, 0],
  [0, 1, 0, 1, 0, 0, 0, 1, 0, 0],
  [0, 0, 0, 1, 0, 0, 0, 1, 0, 0]
];

let attempts = 0;
let lastTimes = [];
let bestTime = Infinity;

class Player {
  constructor() {
    this.reset();
  }
  reset() {
    this.x = 20;
    this.y = groundLevel - 20;
    this.vx = 0;
    this.vy = 0;
    this.width = 20;
    this.height = 20;
    this.onGround = false;
    this.finished = false;
    this.startTime = Date.now();
  }
  update() {
    if (this.finished) return;

    this.vx = 2;

    this.vy += gravity;
    this.x += this.vx;
    this.y += this.vy;

    if (this.y + this.height >= groundLevel) {
      this.y = groundLevel - this.height;
      this.vy = 0;
      this.onGround = true;
    }

    if (this.x >= width - tileSize) {
      this.finished = true;
      const timeTaken = (Date.now() - this.startTime) / 1000;
      this.registerTime(timeTaken);
    }

    for (let row = 0; row < level.length; row++) {
      for (let col = 0; col < level[row].length; col++) {
        const type = level[row][col];
        if (type === 0) continue;
        const x = col * tileSize;
        const y = groundLevel - tileSize;
        if (this.x < x + tileSize && this.x + this.width > x &&
            this.y < y + tileSize && this.y + this.height > y) {
          if (type === 1) {
            this.y = y - this.height;
            this.vy = 0;
            this.onGround = true;
          } else if (type === 2) {
            this.finished = true;
            this.registerTime(Infinity);
          }
        }
      }
    }
  }
  draw() {
    ctx.fillStyle = '#0f0';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
  registerTime(timeTaken) {
    if (timeTaken !== Infinity) {
      lastTimes.push(timeTaken);
      if (lastTimes.length > 10) lastTimes.shift();
      if (timeTaken < bestTime) bestTime = timeTaken;
    }
    attempts++;
    updateUI(timeTaken);
    setTimeout(() => this.reset(), 500);
  }
}

function drawLevel() {
  for (let row = 0; row < level.length; row++) {
    for (let col = 0; col < level[row].length; col++) {
      const type = level[row][col];
      if (type === 0) continue;
      const x = col * tileSize;
      const y = groundLevel - tileSize;
      ctx.fillStyle = (type === 1) ? '#888' : '#f00';
      ctx.fillRect(x, y, tileSize, tileSize);
    }
  }
  ctx.fillStyle = '#f0f';
  ctx.fillRect(width - tileSize, groundLevel - tileSize, tileSize, tileSize);
}

function updateUI(lastTime) {
  document.getElementById('attempts').innerText = attempts;
  document.getElementById('time').innerText = (lastTime === Infinity ? 'Failed' : lastTime.toFixed(2));
  const avg = lastTimes.reduce((a, b) => a + b, 0) / lastTimes.length || 0;
  document.getElementById('avg').innerText = avg.toFixed(2);
}

const player = new Player();
function loop() {
  ctx.clearRect(0, 0, width, height);
  drawLevel();
  player.update();
  player.draw();
  requestAnimationFrame(loop);
}
loop();
