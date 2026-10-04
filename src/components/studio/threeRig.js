import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { disposeGroup } from '@/components/studio/threeGeometry';
export function createRig(el) {
    const scene = new THREE.Scene(); scene.background = new THREE.Color('#f4f5ee'); const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true }); renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); renderer.domElement.setAttribute('aria-label', '3D設計キャンバス'); renderer.domElement.dataset.testid = '3d-canvas'; renderer.setSize(el.clientWidth, el.clientHeight); el.appendChild(renderer.domElement);
    const controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true; controls.maxPolarAngle = Math.PI / 2 - 0.03; controls.minDistance = 2; controls.maxDistance = 160; controls.mouseButtons = { LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN };
    scene.add(new THREE.HemisphereLight(0xffffff, 0x9da58b, 2)); const light = new THREE.DirectionalLight(0xffffff, 2.5); light.position.set(10, 20, 5); scene.add(light);
    const model = new THREE.Group(), draft = new THREE.Group(), grid = new THREE.GridHelper(200, 400, 0xc3cdba, 0xe0e4d9); scene.add(model, draft, grid);
    const resize = () => { if (el.clientWidth && el.clientHeight) { camera.aspect = el.clientWidth / el.clientHeight; camera.updateProjectionMatrix(); renderer.setSize(el.clientWidth, el.clientHeight); } }; const observer = new ResizeObserver(resize); observer.observe(el); resize();
    let frame; const animate = () => { frame = requestAnimationFrame(animate); controls.update(); renderer.render(scene, camera); }; animate();
    const fit = (floor, base, zoom = 1) => { const es = floor.elements; const minX = es.length ? Math.min(...es.map(e => e.x)) : 0, maxX = es.length ? Math.max(...es.map(e => e.x + e.w)) : 10, minZ = es.length ? Math.min(...es.map(e => e.y)) : 0, maxZ = es.length ? Math.max(...es.map(e => e.y + e.h)) : 10; const target = new THREE.Vector3((minX + maxX) / 2, base + 0.8, (minZ + maxZ) / 2), size = Math.max(7, maxX - minX, maxZ - minZ), distance = size * 1.8 / zoom; controls.target.copy(target); camera.position.copy(target).add(new THREE.Vector3(distance, distance * 0.95, distance)); controls.update(); };
    const dispose = () => { cancelAnimationFrame(frame); observer.disconnect(); controls.dispose(); disposeGroup(scene); renderer.dispose(); renderer.domElement.remove(); };
    return { scene, camera, renderer, controls, model, draft, grid, fit, dispose };
}