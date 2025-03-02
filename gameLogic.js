/* gameLogic.js */

// Get canvas and context
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Global game state variables
let gameMode = "duo"; // updated by main.js events
const speed = 5;
let gameRunning = false;
let gamePaused = false;

// Player objects
const player1 = {
  x: 100,
  y: 0, // will be set on game start (drop animation)
  width: 40,
  height: 40,
  color: "blue",
  health: 100,
  shield: 100,
  shieldActive: false,
  shieldBroken: false,
  canShoot: true,
  lastDir: "right"
};
const player2 = {
  x: 600,
  y: 0,
  width: 40,
  height: 40,
  color: "red",
  health: 100,
  shield: 100,
  shieldActive: false,
  shieldBroken: false,
  canShoot: true,
  lastDir: "left"
};
const player3 = {
  x: 1100,
  y: 0,
  width: 40,
  height: 40,
  color: "green",
  health: 100,
  shield: 100,
  shieldActive: false,
  shieldBroken: false,
  canShoot: true,
  lastDir: "left"
};

// Bullets array
let bullets = [];

// Key controls
const keys = {
  w: false, a: false, s: false, d: false,
  ArrowUp: false, ArrowLeft: false, ArrowDown: false, ArrowRight: false,
  q: false, m: false, p: false
};

// Update the last direction based on key input (for human players)
function updateDirection() {
  if (keys.w) { player1.lastDir = "up"; }
  else if (keys.s) { player1.lastDir = "down"; }
  else if (keys.a) { player1.lastDir = "left"; }
  else if (keys.d) { player1.lastDir = "right"; }
  
  if (gameMode === "duo" || gameMode === "trio") {
    if (keys.ArrowUp) { player2.lastDir = "up"; }
    else if (keys.ArrowDown) { player2.lastDir = "down"; }
    else if (keys.ArrowLeft) { player2.lastDir = "left"; }
    else if (keys.ArrowRight) { player2.lastDir = "right"; }
  }
}

// Simple collision detection helper (with margin)
function rectCollision(rect1, rect2) {
  const margin = 5;
  return rect1.x < rect2.x + rect2.width + margin &&
         rect1.x + rect1.width > rect2.x - margin &&
         rect1.y < rect2.y + rect2.height + margin &&
         rect1.y + rect1.height > rect2.y - margin;
}

// Move players (using keys and AI movement in Solo/Trio modes)
function movePlayers() {
  let oldP1 = { x: player1.x, y: player1.y };
  let oldP2 = { x: player2.x, y: player2.y };
  let oldP3 = gameMode === "trio" ? { x: player3.x, y: player3.y } : null;
  
  // Player1 movement
  let dx1 = 0, dy1 = 0;
  if (keys.a && player1.x > 0) dx1 = -speed;
  if (keys.d && player1.x + player1.width < canvas.width) dx1 = speed;
  if (keys.w && player1.y > 0) dy1 = -speed;
  if (keys.s && player1.y + player1.height < canvas.height) dy1 = speed;
  
  // Player2 movement for Duo/Trio modes
  let dx2 = 0, dy2 = 0;
  if (gameMode === "duo" || gameMode === "trio") {
    if (keys.ArrowLeft && player2.x > 0) dx2 = -speed;
    if (keys.ArrowRight && player2.x + player2.width < canvas.width) dx2 = speed;
    if (keys.ArrowUp && player2.y > 0) dy2 = -speed;
    if (keys.ArrowDown && player2.y + player2.height < canvas.height) dy2 = speed;
  }
  
  player1.x += dx1;
  player2.x += dx2;
  if (rectCollision(player1, player2)) {
    player1.x = oldP1.x;
    player2.x = oldP2.x;
  }
  player1.y += dy1;
  player2.y += dy2;
  if (rectCollision(player1, player2)) {
    player1.y = oldP1.y;
    player2.y = oldP2.y;
  }
  
  // Solo mode: use simple AI for Player2
  if (gameMode === "solo") {
    updateAI();
    player2.y = Math.max(0, Math.min(player2.y, canvas.height - player2.height));
  }
  
  // Trio mode: update third (computer-controlled) player and check collisions
  if (gameMode === "trio") {
    updateAIForPlayer3();
    player3.y = Math.max(0, Math.min(player3.y, canvas.height - player3.height));
    if (rectCollision(player1, player3)) {
      player1.x = oldP1.x;
      player3.x = oldP3.x;
      player1.y = oldP1.y;
      player3.y = oldP3.y;
    }
    if (rectCollision(player2, player3)) {
      player2.x = oldP2.x;
      player3.x = oldP3.x;
      player2.y = oldP2.y;
      player3.y = oldP3.y;
    }
  }
  
  // Update shield toggles based on keys
  player1.shieldActive = keys.q;
  player2.shieldActive = keys.m;
  updateDirection();
}

// AI for Solo mode (controls Player2)
function updateAI() {
  if (gameMode === "solo") {
    let oldP2x = player2.x;
    let oldP2y = player2.y;
    
    let centerX1 = player1.x + player1.width / 2;
    let centerY1 = player1.y + player1.height / 2;
    let centerX2 = player2.x + player2.width / 2;
    let centerY2 = player2.y + player2.height / 2;
    
    let diffX = centerX1 - centerX2;
    let diffY = centerY1 - centerY2;
    
    let factor = 0.3;
    let moveX = Math.max(-speed, Math.min(speed, diffX * factor));
    let moveY = Math.max(-speed, Math.min(speed, diffY * factor));
    
    player2.x += moveX;
    player2.y += moveY;
    
    if (rectCollision(player1, player2)) {
      player2.x = oldP2x;
      player2.y = oldP2y;
    }
    
    let distance = Math.sqrt(diffX * diffX + diffY * diffY);
    if (distance < 300 && player2.canShoot && gameRunning && !gamePaused) {
      shootBullet(player2, 2);
      player2.canShoot = false;
      setTimeout(() => { player2.canShoot = true; }, 50);
    }
  }
}

// AI for Trio mode (controls Player3)
// – Now updates its aiming direction (lastDir) toward the closest human target,
//   fixing the glitch where Player2 was not being damaged.
function updateAIForPlayer3() {
  if (gameMode === "trio") {
    let centerX1 = player1.x + player1.width / 2;
    let centerY1 = player1.y + player1.height / 2;
    let centerX2 = player2.x + player2.width / 2;
    let centerY2 = player2.y + player2.height / 2;
    let centerX3 = player3.x + player3.width / 2;
    let centerY3 = player3.y + player3.height / 2;
    
    // Determine the closer human target
    let dx1 = centerX1 - centerX3;
    let dy1 = centerY1 - centerY3;
    let dx2 = centerX2 - centerX3;
    let dy2 = centerY2 - centerY3;
    let dist1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
    let dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
    let target = dist1 < dist2 ? player1 : player2;
    
    // Update aiming direction toward the target
    let diffX = (target.x + target.width / 2) - centerX3;
    let diffY = (target.y + target.height / 2) - centerY3;
    if (Math.abs(diffX) > Math.abs(diffY)) {
      player3.lastDir = diffX > 0 ? "right" : "left";
    } else {
      player3.lastDir = diffY > 0 ? "down" : "up";
    }
    
    let oldP3x = player3.x;
    let oldP3y = player3.y;
    let factor = 0.3;
    let moveX = Math.max(-speed, Math.min(speed, diffX * factor));
    let moveY = Math.max(-speed, Math.min(speed, diffY * factor));
    player3.x += moveX;
    player3.y += moveY;
    if (rectCollision(player3, target)) {
      player3.x = oldP3x;
      player3.y = oldP3y;
    }
    let distance = Math.sqrt(diffX * diffX + diffY * diffY);
    if (distance < 300 && player3.canShoot && gameRunning && !gamePaused) {
      shootBullet(player3, 3);
      player3.canShoot = false;
      setTimeout(() => { player3.canShoot = true; }, 50);
    }
  }
}

// Shooting function: creates a bullet moving in the player's lastDir
function shootBullet(player, playerNum) {
  const bullet = {
    x: player.x + player.width / 2,
    y: player.y + player.height / 2,
    speed: 10,
    direction: player.lastDir,
    player: playerNum
  };
  bullets.push(bullet);
  if (typeof shootSound !== "undefined") {
    shootSound.currentTime = 0;
    shootSound.play();
  }
}

// Update shields for each player (depletes when active, recharges otherwise)
function updateShields() {
  const players = [player1, player2];
  if (gameMode === "trio") {
    players.push(player3);
  }
  players.forEach(player => {
    if (player.shieldActive && player.shield > 0) {
      player.shield = Math.max(0, player.shield - 0.5);
      if (player.shield === 0) {
        player.shieldActive = false;
        player.shieldBroken = true;
        if (typeof shieldBreakSound !== "undefined") {
          shieldBreakSound.currentTime = 0;
          shieldBreakSound.play();
        }
        setTimeout(() => { player.shieldBroken = false; }, 3000);
      }
    } else if (!player.shieldActive && !player.shieldBroken && player.shield < 100) {
      player.shield = Math.min(100, player.shield + 0.2);
    }
  });
}

// Check win condition and return the winner's name (the names are set in main.js)
function checkWinCondition() {
  if (gameMode === "duo" || gameMode === "solo") {
    if (player1.health <= 0) return p2Name;
    if (player2.health <= 0) return p1Name;
  } else if (gameMode === "trio") {
    let remaining = [];
    if (player1.health > 0) remaining.push({ name: p1Name, health: player1.health });
    if (player2.health > 0) remaining.push({ name: p2Name, health: player2.health });
    if (player3.health > 0) remaining.push({ name: "Computer", health: player3.health });
    if (remaining.length === 1) return remaining[0].name;
  }
  return null;
}

// Main game loop: updates bullets, shields, players, and checks win condition.
function gameLoop() {
  if (!gameRunning || gamePaused) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Update and draw bullets
  for (let i = bullets.length - 1; i >= 0; i--) {
    let bullet = bullets[i];
    switch (bullet.direction) {
      case "up":    bullet.y -= bullet.speed; break;
      case "down":  bullet.y += bullet.speed; break;
      case "left":  bullet.x -= bullet.speed; break;
      case "right": bullet.x += bullet.speed; break;
    }
    if (bullet.x < 0 || bullet.x > canvas.width || bullet.y < 0 || bullet.y > canvas.height) {
      bullets.splice(i, 1);
      continue;
    }
    if (bullet.player !== 1 && bulletHitsPlayer(bullet, player1)) {
      player1.health = Math.max(0, player1.health - 10);
      if (typeof hitSound !== "undefined") {
        hitSound.currentTime = 0;
        hitSound.play();
      }
      bullets.splice(i, 1);
      continue;
    }
    if (bullet.player !== 2 && bulletHitsPlayer(bullet, player2)) {
      player2.health = Math.max(0, player2.health - 10);
      if (typeof hitSound !== "undefined") {
        hitSound.currentTime = 0;
        hitSound.play();
      }
      bullets.splice(i, 1);
      continue;
    }
    if (gameMode === "trio" && bullet.player !== 3 && bulletHitsPlayer(bullet, player3)) {
      player3.health = Math.max(0, player3.health - 10);
      if (typeof hitSound !== "undefined") {
        hitSound.currentTime = 0;
        hitSound.play();
      }
      bullets.splice(i, 1);
      continue;
    }
    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  
  updateShields();
  movePlayers();
  // The UI drawing functions (drawPlayers, drawTopStatus, drawControls) are in main.js
  
  let winner = checkWinCondition();
  if (winner !== null) {
    gameRunning = false;
    document.getElementById("gameOverScreen").classList.remove("hidden");
    document.getElementById("winnerText").innerText = winner + " Wins 🏆!";
    return;
  }
  
  requestAnimationFrame(gameLoop);
}

// Helper for bullet collision detection
function bulletHitsPlayer(bullet, player) {
  return bullet.x >= player.x &&
         bullet.x <= player.x + player.width &&
         bullet.y >= player.y &&
         bullet.y <= player.y + player.height;
}
