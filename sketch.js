let particles = [];
let boxSizeSlider, freqSlider, ampSlider, particleCountSlider;
let pistonFrequency = 1, pistonAmplitude = 30, boxSize = 400, particleCount = 100;
let kineticEnergySum = 0;
let kineticEnergyVariance = 0;
let kineticEnergyStdDev = 0;
let pistonX, pistonVelocity = 0, time = 0;

function setup() {
  createCanvas(600, 600);
  
  // Initialize sliders below the simulation area
  freqSlider = createSlider(0.1, 5, 0.2, 0.1).position(10, height + 20);
  freqSlider.style('width', '100px');
  ampSlider = createSlider(10, 50, 30, 1).position(120, height + 20);
  ampSlider.style('width', '100px');
  boxSizeSlider = createSlider(200, 500, 300, 10).position(230, height + 20);
  boxSizeSlider.style('width', '100px');
  particleCountSlider = createSlider(50, 500, 300, 10).position(340, height + 20);
  particleCountSlider.style('width', '100px');

  initParticles();
}

function initParticles() {
  particles = [];
  for (let i = 0; i < particleCount; i++) {
    let posX = random(0, boxSize);
    let posY = random(0, boxSize);
    let speed = randomGaussian(50, 10);
    let angle = random(TWO_PI);
    particles.push(new Particle(posX, posY, speed * cos(angle), speed * sin(angle)));
  }
}

function draw() {
  background(255);

  // Update parameters from sliders
  pistonFrequency = freqSlider.value();
  pistonAmplitude = ampSlider.value();
  boxSize = boxSizeSlider.value();
  particleCount = particleCountSlider.value();
  
  // Redraw particles if particle count changes
  if (particles.length != particleCount) {
    initParticles();
  }
  
  // Draw the box with an oscillating piston
  drawBox();
  
  // Update and display particles
  kineticEnergySum = 0;
  for (let particle of particles) {
    particle.update();
    particle.display();
    kineticEnergySum += particle.kineticEnergy();
  }
  
  // Calculate and display average and variance of kinetic energy
  let avgKineticEnergy = kineticEnergySum / particleCount;
  let varianceSum = 0;
  for (let particle of particles) {
    varianceSum += sq(particle.kineticEnergy() - avgKineticEnergy);
  }
  kineticEnergyVariance = varianceSum / particleCount;
  kineticEnergyStdDev = sqrt(kineticEnergyVariance);

  // Display energy statistics
  fill(0);
  textSize(16);
  text(`Average KE: ${avgKineticEnergy.toFixed(2)}`, 10, height - 20);
  text(`StdDev of KE: ${kineticEnergyStdDev.toFixed(2)}`, 200, height - 20);
}

const speedScale = 0.01; // Scale applied to both particle and piston speeds

function drawBox() {
  // Draw static walls
  noFill();
  stroke(0);
  rect(0, 0, boxSize, boxSize);

  // Calculate piston position and scaled velocity based on oscillation
  pistonX = boxSize + pistonAmplitude * sin(TWO_PI * pistonFrequency * time);
  pistonVelocity = speedScale * TWO_PI * pistonFrequency * pistonAmplitude * cos(TWO_PI * pistonFrequency * time);
  time += deltaTime / 1000; // Increment time for oscillation
  
  // Draw the piston (moving right boundary)
  stroke(255, 0, 0);
  line(pistonX, 0, pistonX, boxSize);
}

class Particle {
  constructor(x, y, vx, vy) {
    this.pos = createVector(x, y);
    this.vel = createVector(vx * speedScale, vy * speedScale); // Apply speed scale to initial velocities
  }
  
  update() {
    this.pos.add(this.vel);

    // Wall collisions (left, top, bottom)
    if (this.pos.x < 0) {
      this.vel.x *= -1;
      this.pos.x = 0; // Prevent crossing the left wall
    }
    if (this.pos.y < 0 || this.pos.y > boxSize) {
      this.vel.y *= -1;
      this.pos.y = constrain(this.pos.y, 0, boxSize); // Keep y within bounds
    }

    // Piston collision as the moving right boundary
    if (this.pos.x > pistonX && this.vel.x > 0) {
      // Calculate the relative velocity between particle and piston
      let relativeVelocity = this.vel.x - pistonVelocity;

      // Reflect the relative velocity and calculate new x-velocity
      this.vel.x = pistonVelocity - relativeVelocity;

      // Set position to prevent crossing the piston boundary
      this.pos.x = pistonX - 0.1; // Small offset to avoid getting stuck at the boundary
    }
  }

  display() {
    fill(0);
    noStroke();
    ellipse(this.pos.x, this.pos.y, 5, 5);
  }

  kineticEnergy() {
    return 0.5 * (this.vel.x ** 2 + this.vel.y ** 2);
  }
}
