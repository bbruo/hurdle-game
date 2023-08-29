let player;
let hurdles = [];
let score = 0;
let highestScore = 0;
//let backgroundImage;
let isGameOver = false; // Define isGameOver
let resetEnabled = false;


//function preload() {
//  backgroundImage = loadImage('backgroundImage.png');
//}
let backgroundImages = [];

let currentBackground = 0;
let backgroundChangeInterval = 9; // Change every 9 frames
let frameCounter = 0;

function preload() {
  for (let i = 1; i <= 3; i++) {
    backgroundImages.push(loadImage(`backgroundImage${i}.png`));
  }
}

function setup() {
  let canvasContainer = select('#canvas-container');
  let canvas = createCanvas(min(400, windowWidth), min(400, windowHeight));
  canvas.parent(canvasContainer);
  player = new Player();
}
  
function draw() {
  
  background(backgroundImages[currentBackground]);
  noFill();
  stroke(255);
  rectMode(CENTER);
  rect(width / 2, height / 2,width-10,height-10);
  
  player.update();
  player.display();

  if (!isGameOver) {
    player.update();
    player.display();

    for (let i = hurdles.length - 1; i >= 0; i--) {
      hurdles[i].update();

      if (hurdles[i].hits(player)) {
        gameOver();
      }

      if (hurdles[i].offscreen()) {
        hurdles.splice(i, 1);
        score++;
      } else {
        hurdles[i].display();
      }
    }

    let hurdleSpawnRate = map(score, 0, 100, -120, 30); // Adjust the range as needed
    if (frameCount % hurdleSpawnRate === 0) {
      hurdles.push(new Hurdle());
      
    }

  fill(0,105,52);
    noStroke();
  textAlign(LEFT, TOP);
  textSize(20);
  textStyle(BOLD);
  text(`分數: ${score}`, 20, 30);
  text(`最高紀錄: ${highestScore}`, 20, 55);
    } else {
    displayGameOver();
  }
  frameCounter++;
  if (frameCounter >= backgroundChangeInterval) {
    frameCounter = 0;
    currentBackground = (currentBackground + 1) % backgroundImages.length;
  }
}

function touchStarted() {
  if (isGameOver && resetEnabled) {
    resetGame();
  } else if (!player.isJumping) {
    player.jump();
  }
}

  
function keyPressed() {
  if (key === ' ' && player.isJumping === false) {
    player.jump();
  }

  if (key === 'r' || key === 'R') {
    resetGame();
  }
}

function resetGame() {
  if (score > highestScore) {
    highestScore = score;
  }
  player = new Player();
  hurdles = [];
  score = 0;
  isGameOver = false;
  resetEnabled = false;
  player.reset(); // Add a reset method in the Player class to reset position and speed

  // Clear the canvas container
  let canvasContainer = select('#canvas-container');
  canvasContainer.html('');

  // Recreate the canvas with adjusted size
  let canvas = createCanvas(600, min(400, windowHeight));
  canvas.parent(canvasContainer);

  // Reset other game logic as needed
  hurdles = [];
  score = 0;
  
   for (let hurdle of hurdles) {
    hurdle.isVisible = true;
  }
  loop();
  // Reset the canvas size and reposition the text
  resizeCanvas(600, 400);
  textAlign(LEFT, TOP);
  textFont("Arial");
}



function gameOver() {
  noLoop();
  //background(220);
  //background(backgroundImage);
  background(backgroundImages[currentBackground]);
  fill(0,0,0,90);
  noStroke();
  rectMode(CENTER);
  rect(width / 2, height / 2,width,height);
  fill(0,105,52);
  noStroke();
  rectMode(CENTER);
  rect(width / 2, height / 2-34,180,48,10);
  fill(255);
  textSize(36);
  textAlign(CENTER, CENTER);
  text('遊戲結束', width / 2, height / 2-30);
  textSize(20);
  textStyle(BOLD);
  text(`總分數: ${score}`, width / 2, height / 2 +12);
  text(`最高紀錄: ${highestScore}`, width / 2, height / 2 + 40);
  text(`Tap to reset`, width / 2, height / 2 + 118);
  textStyle(BOLD);
 
  textAlign(LEFT, TOP);
  isGameOver = true;
   for (let hurdle of hurdles) {
    hurdle.isVisible = false;
  }
  resetEnabled = true;
  noLoop();
  
}

class Player {
  constructor() {
    this.x = 50;
    this.y = height - 50; // Start slightly above the bottom
    this.velocity = 0;
    this.gravity = 0.6;
    this.lift = -17.2;
    this.isJumping = false;
    this.baseSpeed = 3;
    this.speedMultiplier = 0.3;
    this.speedIncrease = 0;
    this.speed = this.baseSpeed + this.speedIncrease;
 
     this.images = [];
    for (let i = 1; i <= 7; i++) {
      this.images.push(loadImage(`playerImage${i}.png`));
    }
    this.imageIndex = 0;
    this.imageDelay = 10;
    this.imageTimer = this.imageDelay;
  }
  
 speedUp() {
    this.speedIncrease = this.speedMultiplier * score;
    this.speed = this.baseSpeed + this.speedIncrease;
  }
  
  jump() {
    if (!this.isJumping) {
      this.velocity += this.lift;
      this.isJumping = true;
    }
  }

  update() {
    this.velocity += this.gravity;
    this.y += this.velocity;

    if (this.y > height - 50) {
      this.y = height - 50;
      this.velocity = 0;
      this.isJumping = false;
    }

    // Change player image
    this.imageTimer--;
    if (this.imageTimer <= 0) {
      this.imageIndex = (this.imageIndex + 1) % this.images.length;
      this.imageTimer = this.imageDelay;
    }
  }

  display() {
    image(this.images[this.imageIndex], this.x - 15, this.y - 62, 100, 100);
  }
}

 
class Hurdle {
  constructor() {
    this.x = width;
    this.w = 54;
    this.h = 60; // Fixed height for all hurdles
     this.speed = map(score, 0, 100, 6, 10); // Initial speed
    this.distance = 100; // Constant distance between hurdles
    this.image = loadImage('hurdle.png'); // Load the image
    this.isVisible = true;
  }

    update() { 
    this.speed = map(score, 0, 100, 5, 8) + (0.09 * score); // Update speed
    this.x -= this.speed;
  }

  display() {
    //image(this.image, this.x, height - this.h-8, this.w, this.h); // Display the image
     if (this.isVisible) {
      image(this.image, this.x, height - this.h-8, this.w, this.h);
    }
  }

  hits(player) {
    if (
      player.x + 15 > this.x &&
      player.x - 15 < this.x + this.w &&
      player.y + 15 > height - this.h
    ) {
      return true;
    }
    return false;
  }

  offscreen() {
    if (this.x < -this.w) {
      return true;
    }
    return false;
  }
}



