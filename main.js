/* main.js */

// DOM references for mode selection and player name inputs
const duoBtn = document.getElementById("duoButton");
const soloBtn = document.getElementById("soloButton");
const trioBtn = document.getElementById("trioButton");
const p2NameInput = document.getElementById("p2Name");

let p1Name = "Player 1";
let p2Name = "Player 2";

// Mode selection events
duoBtn.addEventListener("click", () => {
  gameMode = "duo";
  duoBtn.style.border = "3px solid white";
  soloBtn.style.border = "none";
  trioBtn.style.border = "none";
  p2NameInput.disabled = false;
  p2NameInput.placeholder = "Enter 🟥 Player 2 Name";
  p2NameInput.value = "";
});
soloBtn.addEventListener("click", () => {
  gameMode = "solo";
  soloBtn.style.border = "3px solid white";
  duoBtn.style.border = "none";
  trioBtn.style.border = "none";
  p2NameInput.disabled = true;
  p2NameInput.value = "Computer";
});
trioBtn.addEventListener("click", () => {
  gameMode = "trio";
  trioBtn.style.border = "3px solid white";
  duoBtn.style.border = "none";
  soloBtn.style.border = "none";
  p2NameInput.disabled = false;
  p2NameInput.placeholder = "Enter 🟥 Player 2 Name";
  p2NameInput.value = "";
});

// Audio elements and volume control
const bgMusic = document.getElementById("bgMusic");
const shootSound = document.getElementById("shootSound");
const hitSound = document.getElementById("hitSound");
const shieldBreakSound = document.getElementById("shieldBreakSound");

const volumeSlider = document.getElementById("volumeSlider");
volumeSlider.addEventListener("input", function() {
  const vol = parseFloat(this.value);
  bgMusic.volume = vol;
  shootSound.volume = vol;
  hitSound.volume = vol;
  shieldBreakSound.volume = vol;
});

function startBackgroundMusic() {
  bgMusic.play();
}

// Helper: Draw a rounded rectangle (used in control boxes)
function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

// Full screen toggle function
function toggleFullScreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else if (document.exitFullscreen) {
    document.exitFullscreen();
  }
}

// --- Drawing functions for the UI ---

function drawPlayers() {
  ctx.fillStyle = player1.color;
  ctx.fillRect(player1.x, player1.y, player1.width, player1.height);
  
  ctx.fillStyle = player2.color;
  ctx.fillRect(player2.x, player2.y, player2.width, player2.height);
  
  if (gameMode === "trio") {
    ctx.fillStyle = player3.color;
    ctx.fillRect(player3.x, player3.y, player3.width, player3.height);
  }
}

function drawTopStatus() {
  const barWidth = 200, barHeight = 15;
  let topY = 20;
  if (gameMode === "trio") {
    // --- Player1 (left) ---
    const leftX = 20;
    ctx.fillStyle = "red";
    ctx.fillRect(leftX, topY, (player1.health / 100) * barWidth, barHeight);
    ctx.strokeStyle = "white";
    ctx.strokeRect(leftX, topY, barWidth, barHeight);
    ctx.font = "14px Arial";
    ctx.textAlign = "left";
    ctx.fillStyle = "white";
    ctx.fillText("Health: " + player1.health + "%", leftX + 5, topY + 13);
    let shieldColor1 = player1.shield > 0
      ? ctx.createLinearGradient(leftX, topY + barHeight + 5, leftX + barWidth, topY + barHeight + 5)
      : "#777";
    if (player1.shield > 0) {
      shieldColor1.addColorStop(0, "#4A90E2");
      shieldColor1.addColorStop(1, "#003366");
    }
    ctx.fillStyle = shieldColor1;
    ctx.fillRect(leftX, topY + barHeight + 5, (player1.shield / 100) * barWidth, barHeight);
    ctx.strokeStyle = "white";
    ctx.strokeRect(leftX, topY + barHeight + 5, barWidth, barHeight);
    ctx.fillStyle = "white";
    ctx.fillText("Shield: " + player1.shield + "% 🛡️", leftX + 5, topY + barHeight * 2 + 3);
    if (player1.shieldActive) {
      ctx.strokeStyle = "cyan";
      ctx.lineWidth = 3;
      ctx.strokeRect(leftX - 2, topY - 2, barWidth + 4, barHeight * 2 + 9);
      ctx.lineWidth = 1;
    }
    
    // --- Player2 (center) ---
    const centerX = (canvas.width - barWidth) / 2;
    ctx.textAlign = "center";
    ctx.fillStyle = "red";
    ctx.fillRect(centerX, topY, (player2.health / 100) * barWidth, barHeight);
    ctx.strokeStyle = "white";
    ctx.strokeRect(centerX, topY, barWidth, barHeight);
    ctx.fillStyle = "white";
    ctx.fillText("Health: " + player2.health + "%", centerX + barWidth / 2, topY + 13);
    let shieldColor2 = player2.shield > 0
      ? ctx.createLinearGradient(centerX, topY + barHeight + 5, centerX + barWidth, topY + barHeight + 5)
      : "#777";
    if (player2.shield > 0) {
      shieldColor2.addColorStop(0, "#4A90E2");
      shieldColor2.addColorStop(1, "#003366");
    }
    ctx.fillStyle = shieldColor2;
    ctx.fillRect(centerX, topY + barHeight + 5, (player2.shield / 100) * barWidth, barHeight);
    ctx.strokeStyle = "white";
    ctx.strokeRect(centerX, topY + barHeight + 5, barWidth, barHeight);
    ctx.fillStyle = "white";
    ctx.fillText("Shield: " + player2.shield + "% 🛡️", centerX + barWidth / 2, topY + barHeight * 2 + 3);
    if (player2.shieldActive) {
      ctx.strokeStyle = "orange";
      ctx.lineWidth = 3;
      ctx.strokeRect(centerX - 2, topY - 2, barWidth + 4, barHeight * 2 + 9);
      ctx.lineWidth = 1;
    }
    
    // --- Player3 (right) ---
    const rightX = canvas.width - barWidth - 20;
    ctx.textAlign = "right";
    ctx.fillStyle = "green";
    ctx.fillRect(rightX, topY, (player3.health / 100) * barWidth, barHeight);
    ctx.strokeStyle = "white";
    ctx.strokeRect(rightX, topY, barWidth, barHeight);
    ctx.fillStyle = "white";
    ctx.fillText("Health: " + player3.health + "%", rightX + barWidth - 5, topY + 13);
    let shieldColor3 = player3.shield > 0
      ? ctx.createLinearGradient(rightX, topY + barHeight + 5, rightX + barWidth, topY + barHeight + 5)
      : "#777";
    if (player3.shield > 0) {
      shieldColor3.addColorStop(0, "#90ee90");
      shieldColor3.addColorStop(1, "#006400");
    }
    ctx.fillStyle = shieldColor3;
    ctx.fillRect(rightX, topY + barHeight + 5, (player3.shield / 100) * barWidth, barHeight);
    ctx.strokeStyle = "white";
    ctx.strokeRect(rightX, topY + barHeight + 5, barWidth, barHeight);
    ctx.fillStyle = "white";
    ctx.fillText("Shield: " + player3.shield + "% 🛡️", rightX + barWidth - 5, topY + barHeight * 2 + 3);
    if (player3.shieldActive) {
      ctx.strokeStyle = "lime";
      ctx.lineWidth = 3;
      ctx.strokeRect(rightX - 2, topY - 2, barWidth + 4, barHeight * 2 + 9);
      ctx.lineWidth = 1;
    }
    
    // --- Name boxes for Trio Mode ---
    const nameBoxWidth = 160, nameBoxHeight = 30;
    ctx.fillStyle = "white";
    ctx.fillRect(20, topY + barHeight * 2 + 20, nameBoxWidth, nameBoxHeight);
    ctx.strokeStyle = "black";
    ctx.strokeRect(20, topY + barHeight * 2 + 20, nameBoxWidth, nameBoxHeight);
    ctx.textAlign = "center";
    ctx.fillStyle = "blue";
    ctx.font = "bold 16px Arial";
    ctx.fillText("🟦 " + p1Name, 20 + nameBoxWidth / 2, topY + barHeight * 2 + 40);
    
    const centerBoxX = (canvas.width - nameBoxWidth) / 2;
    ctx.fillStyle = "white";
    ctx.fillRect(centerBoxX, topY + barHeight * 2 + 20, nameBoxWidth, nameBoxHeight);
    ctx.strokeStyle = "black";
    ctx.strokeRect(centerBoxX, topY + barHeight * 2 + 20, nameBoxWidth, nameBoxHeight);
    ctx.fillStyle = "red";
    ctx.fillText("🟥 " + p2Name, centerBoxX + nameBoxWidth / 2, topY + barHeight * 2 + 40);
    
    const rightBoxX = canvas.width - nameBoxWidth - 20;
    ctx.fillStyle = "white";
    ctx.fillRect(rightBoxX, topY + barHeight * 2 + 20, nameBoxWidth, nameBoxHeight);
    ctx.strokeStyle = "black";
    ctx.strokeRect(rightBoxX, topY + barHeight * 2 + 20, nameBoxWidth, nameBoxHeight);
    ctx.fillStyle = "green";
    ctx.fillText("🟩 " + "Computer", rightBoxX + nameBoxWidth / 2, topY + barHeight * 2 + 40);
    ctx.textAlign = "left";
  } else {
    // --- Duo/Solo Mode status ---
    const leftX = 20, topY = 20;
    ctx.fillStyle = "red";
    ctx.fillRect(leftX, topY, (player1.health / 100) * barWidth, barHeight);
    ctx.strokeStyle = "white";
    ctx.strokeRect(leftX, topY, barWidth, barHeight);
    ctx.font = "14px Arial";
    ctx.textAlign = "left";
    ctx.fillStyle = "white";
    ctx.fillText("Health: " + player1.health + "%", leftX + 5, topY + 13);
    
    let shieldColor1 = player1.shield > 0 
      ? ctx.createLinearGradient(leftX, topY + barHeight + 5, leftX + barWidth, topY + barHeight + 5) 
      : "#777";
    if (player1.shield > 0) {
      shieldColor1.addColorStop(0, "#4A90E2");
      shieldColor1.addColorStop(1, "#003366");
    }
    ctx.fillStyle = shieldColor1;
    ctx.fillRect(leftX, topY + barHeight + 5, (player1.shield / 100) * barWidth, barHeight);
    ctx.strokeStyle = "white";
    ctx.strokeRect(leftX, topY + barHeight + 5, barWidth, barHeight);
    ctx.fillStyle = "white";
    ctx.fillText("Shield: " + player1.shield + "% 🛡️", leftX + 5, topY + barHeight * 2 + 3);
    if (player1.shieldActive) {
      ctx.strokeStyle = "cyan";
      ctx.lineWidth = 3;
      ctx.strokeRect(leftX - 2, topY - 2, barWidth + 4, barHeight * 2 + 9);
      ctx.lineWidth = 1;
    }
    
    const rightX = canvas.width - barWidth - 20;
    ctx.textAlign = "right";
    ctx.fillStyle = "red";
    ctx.fillRect(rightX, topY, (player2.health / 100) * barWidth, barHeight);
    ctx.strokeStyle = "white";
    ctx.strokeRect(rightX, topY, barWidth, barHeight);
    ctx.font = "14px Arial";
    ctx.fillStyle = "white";
    ctx.fillText("Health: " + player2.health + "%", rightX + barWidth - 5, topY + 13);
    
    let shieldColor2 = player2.shield > 0 
      ? ctx.createLinearGradient(rightX, topY + barHeight + 5, rightX + barWidth, topY + barHeight + 5) 
      : "#777";
    if (player2.shield > 0) {
      shieldColor2.addColorStop(0, "#4A90E2");
      shieldColor2.addColorStop(1, "#003366");
    }
    ctx.fillStyle = shieldColor2;
    ctx.fillRect(rightX, topY + barHeight + 5, (player2.shield / 100) * barWidth, barHeight);
    ctx.strokeStyle = "white";
    ctx.strokeRect(rightX, topY + barHeight + 5, barWidth, barHeight);
    ctx.fillStyle = "white";
    ctx.fillText("Shield: " + player2.shield + "% 🛡️", rightX + barWidth - 5, topY + barHeight * 2 + 3);
    if (player2.shieldActive) {
      ctx.strokeStyle = "orange";
      ctx.lineWidth = 3;
      ctx.strokeRect(rightX - 2, topY - 2, barWidth + 4, barHeight * 2 + 9);
      ctx.lineWidth = 1;
    }
    
    const nameBoxWidth = 220, nameBoxHeight = 30;
    ctx.fillStyle = "white";
    ctx.fillRect(leftX, topY + barHeight * 2 + 20, nameBoxWidth, nameBoxHeight);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.strokeRect(leftX, topY + barHeight * 2 + 20, nameBoxWidth, nameBoxHeight);
    ctx.textAlign = "center";
    ctx.fillStyle = "blue";
    ctx.font = "bold 16px Arial";
    ctx.fillText("🟦 " + p1Name, leftX + nameBoxWidth / 2, topY + barHeight * 2 + 27);
    
    ctx.fillStyle = "white";
    ctx.fillRect(rightX, topY + barHeight * 2 + 20, nameBoxWidth, nameBoxHeight);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.strokeRect(rightX, topY + barHeight * 2 + 20, nameBoxWidth, nameBoxHeight);
    ctx.fillStyle = "red";
    ctx.fillText("🟥 " + (gameMode === "solo" ? "Computer" : p2Name), rightX + nameBoxWidth / 2, topY + barHeight * 2 + 27);
    ctx.textAlign = "left";
  }
}

function drawControls() {
  const boxWidth = 300, boxHeight = 50, padding = 20, radius = 10;
  if (gameMode === "trio") {
    // Left control box (Player1)
    const leftX = padding;
    const leftY = canvas.height - boxHeight - padding;
    let grad1 = ctx.createLinearGradient(leftX, leftY, leftX, leftY + boxHeight);
    grad1.addColorStop(0, "#777");
    grad1.addColorStop(1, "#444");
    ctx.save();
    ctx.shadowColor = "black";
    ctx.shadowBlur = 6;
    drawRoundedRect(ctx, leftX, leftY, boxWidth, boxHeight, radius);
    ctx.fillStyle = grad1;
    ctx.fill();
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
    ctx.font = "14px Arial";
    ctx.textAlign = "left";
    ctx.fillStyle = "white";
    ctx.fillText("🟦P1: WASD | SPACE shoot | Q shield", leftX + 10, leftY + 30);
    
    // Center control box (Player2)
    const centerX = (canvas.width - boxWidth) / 2;
    const centerY = canvas.height - boxHeight - padding;
    let grad2 = ctx.createLinearGradient(centerX, centerY, centerX, centerY + boxHeight);
    grad2.addColorStop(0, "#777");
    grad2.addColorStop(1, "#444");
    ctx.save();
    ctx.shadowColor = "black";
    ctx.shadowBlur = 6;
    drawRoundedRect(ctx, centerX, centerY, boxWidth, boxHeight, radius);
    ctx.fillStyle = grad2;
    ctx.fill();
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
    ctx.font = "14px Arial";
    ctx.textAlign = "left";
    ctx.fillStyle = "white";
    ctx.fillText("🟥P2: Arrow Keys | ENTER shoot | M shield", centerX + 10, centerY + 30);
    
    // Right control box (Player3 - Computer)
    const rightX = canvas.width - boxWidth - padding;
    const rightY = canvas.height - boxHeight - padding;
    let grad3 = ctx.createLinearGradient(rightX, rightY, rightX, rightY + boxHeight);
    grad3.addColorStop(0, "#777");
    grad3.addColorStop(1, "#444");
    ctx.save();
    ctx.shadowColor = "black";
    ctx.shadowBlur = 6;
    drawRoundedRect(ctx, rightX, rightY, boxWidth, boxHeight, radius);
    ctx.fillStyle = grad3;
    ctx.fill();
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
    ctx.font = "14px Arial";
    ctx.textAlign = "left";
    ctx.fillStyle = "white";
    ctx.fillText("🟩P3 (Computer): AI controlled", rightX + 10, rightY + 30);
  } else {
    // Duo/Solo mode: two control boxes
    const leftX = padding;
    const leftY = canvas.height - boxHeight - padding;
    let grad1 = ctx.createLinearGradient(leftX, leftY, leftX, leftY + boxHeight);
    grad1.addColorStop(0, "#777");
    grad1.addColorStop(1, "#444");
    ctx.save();
    ctx.shadowColor = "black";
    ctx.shadowBlur = 6;
    drawRoundedRect(ctx, leftX, leftY, boxWidth, boxHeight, radius);
    ctx.fillStyle = grad1;
    ctx.fill();
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
    ctx.font = "14px Arial";
    ctx.textAlign = "left";
    ctx.fillStyle = "white";
    ctx.fillText("🟦P1: WASD | SPACE shoot | Q shield", leftX + 10, leftY + 30);
    
    const rightX = canvas.width - boxWidth - padding;
    const rightY = canvas.height - boxHeight - padding;
    let grad2 = ctx.createLinearGradient(rightX, rightY, rightX, rightY + boxHeight);
    grad2.addColorStop(0, "#777");
    grad2.addColorStop(1, "#444");
    ctx.save();
    ctx.shadowColor = "black";
    ctx.shadowBlur = 6;
    drawRoundedRect(ctx, rightX, rightY, boxWidth, boxHeight, radius);
    ctx.fillStyle = grad2;
    ctx.fill();
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
    ctx.font = "14px Arial";
    ctx.textAlign = "left";
    ctx.fillStyle = "white";
    if (gameMode === "solo") {
      ctx.fillText("🟥P2: Computer AI", rightX + 10, rightY + 30);
    } else {
      ctx.fillText("🟥P2: Arrow Keys | ENTER shoot | M shield", rightX + 10, rightY + 30);
    }
  }
}

// --- Drop Animation ---
// Players drop from off-screen to center. When finished, display player instructions.
function dropAnimation(callback) {
  const dropSpeed = 5; 
  const destinationY = canvas.height / 2 - player1.height / 2;
  function animate() {
    let done = true;
    if (player1.y < destinationY) {
      player1.y += dropSpeed;
      if (player1.y > destinationY) player1.y = destinationY;
      done = false;
    }
    if (gameMode !== "solo") {
      if (player2.y < destinationY) {
        player2.y += dropSpeed;
        if (player2.y > destinationY) player2.y = destinationY;
        done = false;
      }
    }
    if (gameMode === "trio") {
      if (player3.y < destinationY) {
        player3.y += dropSpeed;
        if (player3.y > destinationY) player3.y = destinationY;
        done = false;
      }
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayers();
    drawTopStatus();
    drawControls();
    if (!done) {
      requestAnimationFrame(animate);
    } else {
      // Show name instructions for a short duration then start gameLoop
      displayNameInstructions(callback);
    }
  }
  animate();
}

// Display player name instructions based on mode
function displayNameInstructions(callback) {
  let instructions = "";
  if (gameMode === "duo") {
    instructions = "🟦 " + p1Name + " vs 🟥 " + p2Name;
  } else if (gameMode === "solo") {
    instructions = "🟦 " + p1Name + " vs 🟥 Computer";
  } else if (gameMode === "trio") {
    instructions = "🟦 " + p1Name + ", 🟥 " + p2Name + " vs 🟩 Computer";
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPlayers();
  drawTopStatus();
  drawControls();
  ctx.font = "bold 48px Arial";
  ctx.textAlign = "center";
  ctx.fillStyle = "white";
  ctx.fillText(instructions, canvas.width / 2, canvas.height / 2);
  setTimeout(callback, 2000);
}

// Start game: hides start screen, reads player names, starts background music,
// positions players off-screen and triggers drop animation.
function startGame() {
  document.getElementById("startScreen").classList.add("hidden");
  const p1Input = document.getElementById("p1Name");
  if (p1Input.value.trim() !== "") p1Name = p1Input.value;
  const p2Input = document.getElementById("p2Name");
  if (p2Input.value.trim() !== "") p2Name = p2Input.value;
  gameRunning = true;
  startBackgroundMusic();
  
  // Set players off-screen for the drop animation
  player1.y = -player1.height;
  player2.y = -player2.height;
  if (gameMode === "trio") { player3.y = -player3.height; }
  
  dropAnimation(() => {
    gameLoop();
  });
}

// Restart and play again functions
function restartGame() {
  location.reload();
}

function playAgain() {
  restartGame();
}

// Toggle pause: shows/hides the pause overlay and stops/continues the game loop.
function togglePause() {
  if (!gameRunning) return;
  gamePaused = !gamePaused;
  const pauseScreen = document.getElementById("pauseScreen");
  if (gamePaused) {
    pauseScreen.classList.remove("hidden");
  } else {
    pauseScreen.classList.add("hidden");
    gameLoop();
  }
}

// --- Key event handlers for movement and shooting ---
document.addEventListener("keydown", (e) => {
  if (e.key === "CapsLock") { e.preventDefault(); return; }
  
  if (e.code === "Space") {
    if (player1.canShoot && gameRunning && !gamePaused) {
      shootBullet(player1, 1);
      player1.canShoot = false;
    }
    return;
  }
  if (e.code === "Enter" && gameMode !== "solo") {
    if (player2.canShoot && gameRunning && !gamePaused) {
      shootBullet(player2, 2);
      player2.canShoot = false;
    }
    return;
  }
  
  if (keys.hasOwnProperty(e.key)) {
    if (e.key === "p") { togglePause(); return; }
    keys[e.key] = true;
    updateDirection();
  }
});

document.addEventListener("keyup", (e) => {
  if (e.key === "CapsLock") { e.preventDefault(); return; }
  
  if (e.code === "Space") {
    player1.canShoot = true;
    return;
  }
  if (e.code === "Enter" && gameMode !== "solo") {
    player2.canShoot = true;
    return;
  }
  
  if (keys.hasOwnProperty(e.key)) {
    keys[e.key] = false;
    updateDirection();
  }
});

// Expose functions for HTML onclicks
window.startGame = startGame;
window.restartGame = restartGame;
window.togglePause = togglePause;
window.playAgain = playAgain;
window.toggleFullScreen = toggleFullScreen;
