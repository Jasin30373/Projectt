import * as THREE from 'three';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 10);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 5);
scene.add(light);

// Maze Layout (1 = Wall, 0 = Path)
const maze = [
    [1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 1, 0, 0, 1],
    [1, 0, 1, 1, 0, 1, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1]
];

// Maze settings
const wallSize = 2;
const wallMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 });

// Create Walls from Maze Array
const walls = [];
maze.forEach((row, z) => {
    row.forEach((cell, x) => {
        if (cell === 1) {
            const wall = new THREE.Mesh(new THREE.BoxGeometry(wallSize, wallSize, wallSize), wallMaterial);
            wall.position.set(x * wallSize, wallSize / 2, z * wallSize);
            scene.add(wall);
            walls.push(wall);
        }
    });
});

// Player Cube
const playerGeometry = new THREE.BoxGeometry(1, 1, 1);
const playerMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
const player = new THREE.Mesh(playerGeometry, playerMaterial);
player.position.set(2, 0.5, 2);
scene.add(player);

// Movement
const speed = 0.2;
const keys = {};
window.addEventListener('keydown', (e) => keys[e.key] = true);
window.addEventListener('keyup', (e) => keys[e.key] = false);

// Collision Detection Function
function isColliding(newX, newZ) {
    return walls.some(wall => {
        return Math.abs(wall.position.x - newX) < wallSize / 2 &&
               Math.abs(wall.position.z - newZ) < wallSize / 2;
    });
}

// Game Loop
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

    renderer.render(scene, camera);
}

animate();
