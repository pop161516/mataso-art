import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

// 1. Core Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // Sky blue background

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.y = 1.6; // Average human eye level in meters

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 2. Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(5, 10, 7.5);
scene.add(dirLight);

// 3. Load Blender Model
const loader = new GLTFLoader();
loader.load(
  'static/3D/AvasRoom.glb', 
  function (gltf) {
    scene.add(gltf.scene);
    console.log('Model loaded successfully!');
  },
  undefined,
  function (error) {
    console.error('Error loading model:', error);
  }
);

// 4. Controls setup
const controls = new PointerLockControls(camera, document.body);
const blocker = document.getElementById('blocker');

blocker.addEventListener('click', function () {
  controls.lock(); 
});

controls.addEventListener('lock', function () {
  blocker.style.display = 'none';
});

controls.addEventListener('unlock', function () {
  blocker.style.display = 'flex';
});

scene.add(controls.getObject());

// 5. Movement Logic
const keyboard = { KeyW: false, KeyA: false, KeyS: false, KeyD: false };

document.addEventListener('keydown', (e) => { 
  if (keyboard[e.code] !== undefined) keyboard[e.code] = true; 
});
document.addEventListener('keyup', (e) => { 
  if (keyboard[e.code] !== undefined) keyboard[e.code] = false; 
});

const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const clock = new THREE.Clock();
const moveSpeed = 40.0; // Adjusted for physics calculations

// 6. Animation Loop
function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();

  if (controls.isLocked === true) {
    // Apply friction/damping to existing velocity over time
    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;

    // Determine input direction matrix
    direction.z = Number(keyboard.KeyS) - Number(keyboard.KeyW); // Postive Z is backward, Negative Z is forward
    direction.x = Number(keyboard.KeyD) - Number(keyboard.KeyA);
    direction.normalize(); 

    // Accelerate velocity based on inputs
    if (keyboard.KeyW || keyboard.KeyS) velocity.z += direction.z * moveSpeed * delta;
    if (keyboard.KeyA || keyboard.KeyD) velocity.x += direction.x * moveSpeed * delta;

    // Apply translation using the controls built-in directional methods
    controls.moveRight(velocity.x * delta);
    controls.moveForward(-velocity.z * delta); 
  }

  renderer.render(scene, camera);
}

animate();

// Handle window resizing
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});