import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Scene Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(20, 30, 40);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(20, 40, 20);
scene.add(light);

// Floor
const floorTexture = new THREE.TextureLoader().load('assets/textures/floor.jpg');
const floorMaterial = new THREE.MeshBasicMaterial({ map: floorTexture });
const floor = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), floorMaterial);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// Maze Generation Function
function generateSquareMaze(dimension) {
    function iterate(field, x, y) {
        field[x][y] = false;
        while (true) {
            const directions = [];
            if (x > 1 && field[x - 2][y]) directions.push([-1, 0]);
            if (x < field.dimension - 2 && field[x + 2][y]) directions.push([1, 0]);
            if (y > 1 && field[x][y - 2]) directions.push([0, -1]);
            if (y < field.dimension - 2 && field[x][y + 2]) directions.push([0, 1]);

            if (directions.length === 0) return field;

            const dir = directions[Math.floor(Math.random() * directions.length)];
            field[x + dir[0]][y + dir[1]] = false;
            field = iterate(field, x + dir[0] * 2, y + dir[1] * 2);
        }
    }

    // Initialize the field.
    const field = new Array(dimension);
    field.dimension = dimension;
    for (let i = 0; i < dimension; i++) {
        field[i] = new Array(dimension).fill(true);
    }

    // Generate the maze recursively.
    iterate(field, 1, 1);
    return field;
}

// Maze and Player
let mazeDimension = 21; // Starting maze size
let maze, walls, player;
let offsetX, offsetZ;

// Track the current level
let currentLevel = 1;

// Load the maze level
function loadLevel() {
    // Generate a new maze
    maze = generateSquareMaze(mazeDimension);

    // Calculate the offset to center the maze
    offsetX = -mazeDimension;
    offsetZ = -mazeDimension;

    // Remove old walls
    if (walls) {
        walls.forEach(wall => scene.remove(wall));
    }
    walls = [];

    // Load the new level
    maze.forEach((row, z) => {
        row.forEach((cell, x) => {
            if (cell) {
                const wall = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), wallMaterial);
                wall.position.set(x * 2 + offsetX, 1, z * 2 + offsetZ);
                scene.add(wall);
                walls.push(wall);
            }
        });
    });

    // Reset player position
    player.position.set(2 + offsetX, 0.5, 2 + offsetZ);
}

// Player Cube
player = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: 0x0000ff }));
scene.add(player);

// Wall Material
const wallTexture = new THREE.TextureLoader().load('assets/textures/wall.jpg');
const wallMaterial = new THREE.MeshLambertMaterial({ map: wallTexture });

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Player Movement
const speed = 0.2;
const keys = {};
window.addEventListener('keydown', (e) => keys[e.key] = true);
window.addEventListener('keyup', (e) => keys[e.key] = false);

function isColliding(newX, newZ) {
    return walls.some(wall =>
        Math.abs(wall.position.x - newX) < 1.5 && Math.abs(wall.position.z - newZ) < 1.5
    );
}

// Check if the player reaches the exit
function checkExit() {
    const exitX = mazeDimension - 2; // Exit at the bottom-right corner
    const exitZ = mazeDimension - 2;

    if (
        Math.abs(player.position.x - (exitX * 2 + offsetX)) < 1 &&
        Math.abs(player.position.z - (exitZ * 2 + offsetZ)) < 1
    ) {
        currentLevel++;
        mazeDimension += 2; // Increase maze size for the next level
        alert(`You completed Level ${currentLevel - 1}! Loading Level ${currentLevel}...`);
        loadLevel(); // Load the next level
    }
}

function animate() {
    requestAnimationFrame(animate);

    let newX = player.position.x;
    let newZ = player.position.z;

    if (keys['w'] || keys['ArrowUp']) newZ -= speed;
    if (keys['s'] || keys['ArrowDown']) newZ += speed;
    if (keys['a'] || keys['ArrowLeft']) newX -= speed;
    if (keys['d'] || keys['ArrowRight']) newX += speed;

    if (!isColliding(newX, newZ)) {
        player.position.x = newX;
        player.position.z = newZ;
    }

    // Check if the player reaches the exit
    checkExit();

    renderer.render(scene, camera);
}

// Load the first level
loadLevel();
animate();