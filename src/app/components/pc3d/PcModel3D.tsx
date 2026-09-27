'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface ComponentInfo {
  key: string;
  name: string;
  spec: string;
  description: string;
  photo: string;
}

const COMPONENT_INFO_EN: Record<string, ComponentInfo> = {
  cpu: {
    key: 'cpu',
    name: 'CPU',
    spec: 'AMD Ryzen 7 2700X',
    description: 'Cooled by a full-cover Alphacool Eisblock XPX Aurora waterblock.',
    photo: '/images/setup/pc-setup/cpu-image.jpg'
  },
  ram: {
    key: 'ram',
    name: 'RAM',
    spec: '32 GB — 4x G.Skill Trident Z RGB DDR4-3200',
    description: 'Four RGB-illuminated DIMMs synced to the rest of the build.',
    photo: '/images/setup/pc-setup/ram-image.jpg'
  },
  mb: {
    key: 'mb',
    name: 'Motherboard',
    spec: 'ASUS ROG Strix X470-F Gaming',
    description: 'AM4 board with onboard RGB and solid VRM cooling for the 2700X.',
    photo: '/images/setup/pc-setup/mb-image.jpg'
  },
  gpu: {
    key: 'gpu',
    name: 'GPU',
    spec: 'ASUS ROG Strix GeForce RTX 2080 OC 8GB',
    description: 'Triple-fan card with an illuminated ROG shroud.',
    photo: '/images/setup/pc-setup/graphic-image.jpg'
  },
  cooling: {
    key: 'cooling',
    name: 'Water Cooling',
    spec: 'Alphacool Eisbecher Helix 250 + Eisblock XPX Aurora + Eisflügel flow indicator',
    description: 'Custom hardline loop — reservoir/pump combo, CPU block and a flow meter.',
    photo: '/images/setup/pc-setup/water-cooling-image.jpg'
  },
  fans: {
    key: 'fans',
    name: 'Fans & Radiator',
    spec: 'LIAN LI UNI FAN SL-INFINITY 120',
    description: 'Daisy-chained ARGB fans pushing air through the radiator.',
    photo: '/images/setup/pc-setup/fan-image.jpg'
  },
  case: {
    key: 'case',
    name: 'Case',
    spec: 'LIAN LI O11 Dynamic + Bykski "Ice Dragon" water block side panel',
    description: 'Dual tempered-glass panels for a full view of the loop.',
    photo: '/images/setup/pc-setup/case-image.jpg'
  },
  psu: {
    key: 'psu',
    name: 'Power Supply',
    spec: 'be quiet! Dark Power Pro 11 1000W',
    description: '80+ Platinum, fully modular with silent cable management.',
    photo: '/images/setup/pc-setup/power-supply-image.jpg'
  }
};

const COMPONENT_INFO_DE: Record<string, ComponentInfo> = {
  cpu: {
    key: 'cpu',
    name: 'CPU',
    spec: 'AMD Ryzen 7 2700X',
    description: 'Gekühlt von einem Alphacool Eisblock XPX Aurora Full-Cover-Waterblock.',
    photo: '/images/setup/pc-setup/cpu-image.jpg'
  },
  ram: {
    key: 'ram',
    name: 'RAM',
    spec: '32 GB — 4x G.Skill Trident Z RGB DDR4-3200',
    description: 'Vier RGB-beleuchtete DIMMs, synchronisiert mit dem Rest des Builds.',
    photo: '/images/setup/pc-setup/ram-image.jpg'
  },
  mb: {
    key: 'mb',
    name: 'Mainboard',
    spec: 'ASUS ROG Strix X470-F Gaming',
    description: 'AM4-Board mit integriertem RGB und solider VRM-Kühlung für den 2700X.',
    photo: '/images/setup/pc-setup/mb-image.jpg'
  },
  gpu: {
    key: 'gpu',
    name: 'Grafikkarte',
    spec: 'ASUS ROG Strix GeForce RTX 2080 OC 8GB',
    description: 'Grafikkarte mit drei Lüftern und beleuchteter ROG-Abdeckung.',
    photo: '/images/setup/pc-setup/graphic-image.jpg'
  },
  cooling: {
    key: 'cooling',
    name: 'Wasserkühlung',
    spec: 'Alphacool Eisbecher Helix 250 + Eisblock XPX Aurora + Eisflügel Durchflussanzeiger',
    description: 'Individueller Hardline-Kreislauf — AGB/Pumpen-Kombi, CPU-Block und Durchflussanzeiger.',
    photo: '/images/setup/pc-setup/water-cooling-image.jpg'
  },
  fans: {
    key: 'fans',
    name: 'Lüfter & Radiator',
    spec: 'LIAN LI UNI FAN SL-INFINITY 120',
    description: 'In Reihe geschaltete ARGB-Lüfter, die Luft durch den Radiator drücken.',
    photo: '/images/setup/pc-setup/fan-image.jpg'
  },
  case: {
    key: 'case',
    name: 'Gehäuse',
    spec: 'LIAN LI O11 Dynamic + Bykski "Ice Dragon" Water-Block-Seitenteil',
    description: 'Zwei Hartglas-Seitenteile für die volle Sicht auf den Kreislauf.',
    photo: '/images/setup/pc-setup/case-image.jpg'
  },
  psu: {
    key: 'psu',
    name: 'Netzteil',
    spec: 'be quiet! Dark Power Pro 11 1000W',
    description: '80+ Platinum, vollmodular mit sauberem Kabelmanagement.',
    photo: '/images/setup/pc-setup/power-supply-image.jpg'
  }
};

const TEAL = 0x4fb9ad;
const TEAL_BRIGHT = 0x7fe7d6;
const ROG_RED = 0xc4212f;

export function PcModel3D() {
  const { i18n } = useTranslation();
  const lang = i18n.language === 'de' ? 'de' : 'en';
  const COMPONENT_INFO = lang === 'de' ? COMPONENT_INFO_DE : COMPONENT_INFO_EN;
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [pinnedKey, setPinnedKey] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(4.6, 2.2, 5.6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 4;
    controls.maxDistance = 12;
    controls.target.set(0, 0, 0);
    controls.autoRotate = !prefersReducedMotion;
    controls.autoRotateSpeed = 0.9;

    // --- lighting ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const key1 = new THREE.PointLight(0x7fe7d6, 2.4, 13);
    key1.position.set(2, 2, 3);
    scene.add(key1);
    const key2 = new THREE.PointLight(0x4fb9ad, 1.6, 13);
    key2.position.set(-3, -1, -2);
    scene.add(key2);
    const rim = new THREE.DirectionalLight(0xffffff, 0.45);
    rim.position.set(-2, 4, -3);
    scene.add(rim);

    const interactive: THREE.Object3D[] = [];
    const group = new THREE.Group();
    scene.add(group);

    // Real-world proportions, scaled down: LIAN LI O11 Dynamic is roughly
    // 445mm(H) x 272mm(W) x 446mm(D) — a nearly-square footprint, taller than deep.
    const MM = 1 / 140;
    const caseW = 272 * MM;
    const caseH = 445 * MM;
    const caseD = 446 * MM;

    const darkMetal = new THREE.MeshStandardMaterial({ color: 0x1a1c1f, roughness: 0.45, metalness: 0.65 });
    const brushedAlu = new THREE.MeshStandardMaterial({ color: 0x2a2d31, roughness: 0.35, metalness: 0.8 });
    const pcbMat = new THREE.MeshStandardMaterial({ color: 0x121417, roughness: 0.75, metalness: 0.25 });
    const shroudMat = new THREE.MeshStandardMaterial({ color: 0x111214, roughness: 0.4, metalness: 0.5 });

    function makeGlow(color: number, intensity = 0.9) {
      return new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: intensity, roughness: 0.3, metalness: 0.2 });
    }

    function tag(mesh: THREE.Object3D, key: string) {
      mesh.userData.key = key;
      interactive.push(mesh);
    }

    // --- case frame (open wireframe cage on a base) ---
    const edges = new THREE.EdgesGeometry(new THREE.BoxGeometry(caseW, caseH, caseD));
    const frame = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x4fb9ad, transparent: true, opacity: 0.55 }));
    group.add(frame);

    const feet = new THREE.Mesh(new THREE.BoxGeometry(caseW * 0.94, 0.05, caseD * 0.94), brushedAlu);
    feet.position.y = -caseH / 2 - 0.03;
    group.add(feet);

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x9fe0d6,
      transparent: true,
      opacity: 0.09,
      roughness: 0.04,
      metalness: 0,
      side: THREE.DoubleSide
    });
    const frontGlass = new THREE.Mesh(new THREE.PlaneGeometry(caseW - 0.08, caseH - 0.08), glassMat);
    frontGlass.position.z = caseD / 2 - 0.015;
    tag(frontGlass, 'case');
    group.add(frontGlass);

    const sideGlass = new THREE.Mesh(new THREE.PlaneGeometry(caseD - 0.08, caseH - 0.08), glassMat.clone());
    sideGlass.rotation.y = Math.PI / 2;
    sideGlass.position.x = caseW / 2 - 0.015;
    tag(sideGlass, 'case');
    group.add(sideGlass);

    // faint dragon-etch hint on the side glass (Bykski "Ice Dragon" panel)
    const etchCurve = new THREE.Mesh(
      new THREE.TorusGeometry(caseD * 0.13, 0.007, 8, 40, Math.PI * 1.4),
      makeGlow(0x3fc9d6, 0.4)
    );
    etchCurve.rotation.set(0, Math.PI / 2, 0.6);
    etchCurve.position.set(caseW / 2 - 0.02, 0.3, 0.05);
    tag(etchCurve, 'case');
    group.add(etchCurve);

    // --- motherboard: ATX, ~305mm x 244mm, mounted vertically on the left wall ---
    const mbH = 305 * MM;
    const mbD = 244 * MM;
    const mb = new THREE.Mesh(new THREE.BoxGeometry(0.06, mbH, mbD), pcbMat);
    mb.position.set(-caseW / 2 + 0.45, 0.25, -0.05);
    tag(mb, 'mb');
    group.add(mb);

    // VRM heatsinks near the top of the board
    [0.55, 0.78].forEach((yOff, i) => {
      const hs = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.5, 0.16), brushedAlu);
      hs.position.set(mb.position.x + 0.06, mb.position.y + yOff - 0.1, mb.position.z - mbD / 2 + 0.2 + i * 0.35);
      tag(hs, 'mb');
      group.add(hs);
    });

    // PCIe slot groove (where the GPU plugs in)
    const pcieSlot = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.8), new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.8 }));
    pcieSlot.position.set(mb.position.x + 0.045, mb.position.y - 0.55, mb.position.z + 0.05);
    group.add(pcieSlot);

    // --- CPU waterblock (ROG-style square block, teal glow core) ---
    const cpuGroup = new THREE.Group();
    const cpuBase = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.045, 0.3), brushedAlu);
    const cpuCore = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.05, 0.22), makeGlow(TEAL_BRIGHT, 0.85));
    cpuCore.position.y = 0.05;
    cpuGroup.add(cpuBase, cpuCore);
    cpuGroup.rotation.z = Math.PI / 2;
    cpuGroup.position.set(mb.position.x + 0.09, 0.75, mb.position.z - 0.35);
    tag(cpuBase, 'cpu');
    tag(cpuCore, 'cpu');
    group.add(cpuGroup);

    // --- RAM: 4 Trident Z RGB DIMMs next to the CPU block ---
    const ramColors = [0xe07a7a, 0xdb8a7a, 0xd6997a, 0xd1a87a];
    for (let i = 0; i < 4; i++) {
      const stickGroup = new THREE.Group();
      const pcb = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.78, 0.1), new THREE.MeshStandardMaterial({ color: 0x0c0d0f, roughness: 0.6 }));
      const heatspreader = new THREE.Mesh(new THREE.BoxGeometry(0.052, 0.55, 0.1), new THREE.MeshStandardMaterial({ color: 0x1c1e21, roughness: 0.4, metalness: 0.6 }));
      heatspreader.position.y = 0.05;
      const rgbCap = new THREE.Mesh(new THREE.BoxGeometry(0.054, 0.12, 0.1), makeGlow(ramColors[i], 0.9));
      rgbCap.position.y = 0.33;
      stickGroup.add(pcb, heatspreader, rgbCap);
      stickGroup.position.set(mb.position.x + 0.09, 0.72, mb.position.z + 0.05 + i * 0.13);
      tag(pcb, 'ram');
      tag(heatspreader, 'ram');
      tag(rgbCap, 'ram');
      group.add(stickGroup);
    }

    // --- GPU: ~300mm ROG Strix RTX 2080, triple fan, horizontal mount ---
    const gpuLen = 300 * MM;
    const gpuGroup = new THREE.Group();
    const gpuPcb = new THREE.Mesh(new THREE.BoxGeometry(gpuLen, 0.02, 0.32), pcbMat);
    const gpuShroud = new THREE.Mesh(new THREE.BoxGeometry(gpuLen * 0.94, 0.11, 0.36), shroudMat);
    gpuShroud.position.y = 0.065;
    gpuGroup.add(gpuPcb, gpuShroud);
    for (let i = -1; i <= 1; i++) {
      const fanRing = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.012, 8, 24), makeGlow(ROG_RED, 0.8));
      fanRing.position.set(i * (gpuLen * 0.3), 0.13, 0);
      fanRing.rotation.x = Math.PI / 2;
      gpuGroup.add(fanRing);
      tag(fanRing, 'gpu');
    }
    const gpuBacklplateStrip = new THREE.Mesh(new THREE.BoxGeometry(gpuLen * 0.94, 0.015, 0.015), makeGlow(ROG_RED, 1.1));
    gpuBacklplateStrip.position.set(0, 0.005, 0.18);
    gpuGroup.add(gpuBacklplateStrip);
    tag(gpuPcb, 'gpu');
    tag(gpuShroud, 'gpu');
    tag(gpuBacklplateStrip, 'gpu');
    gpuGroup.position.set(mb.position.x + 0.14, -0.15, mb.position.z + 0.1);
    group.add(gpuGroup);

    // --- PSU: be quiet! Dark Power Pro 11, shrouded at the bottom ---
    const psu = new THREE.Mesh(new THREE.BoxGeometry(caseW * 0.78, 0.42, 0.86), darkMetal);
    psu.position.set(0, -caseH / 2 + 0.35, -0.15);
    tag(psu, 'psu');
    group.add(psu);
    for (let i = -2; i <= 2; i++) {
      const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.12, 8), new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.6 }));
      cable.rotation.x = Math.PI / 2;
      cable.position.set(i * 0.09, psu.position.y, psu.position.z + 0.5);
      tag(cable, 'psu');
      group.add(cable);
    }

    // --- reservoir + pump: Alphacool Eisbecher Helix, spiral visible through acrylic ---
    const reservoirPos = new THREE.Vector3(0.55, -0.45, 0.45);
    const reservoirGlass = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.2, 1.0, 24, 1, true),
      new THREE.MeshPhysicalMaterial({ color: 0xbfeee7, transparent: true, opacity: 0.22, roughness: 0.05 })
    );
    reservoirGlass.position.copy(reservoirPos);
    tag(reservoirGlass, 'cooling');
    group.add(reservoirGlass);

    // helix coil inside the reservoir (matches the product name)
    class HelixCurve extends THREE.Curve<THREE.Vector3> {
      constructor() {
        super();
      }
      getPoint(t: number) {
        const angle = t * Math.PI * 10;
        const r = 0.14;
        const y = -0.42 + t * 0.84;
        return new THREE.Vector3(Math.cos(angle) * r, y, Math.sin(angle) * r);
      }
    }
    const helixTube = new THREE.Mesh(
      new THREE.TubeGeometry(new HelixCurve(), 120, 0.02, 6, false),
      makeGlow(0x2fb8e0, 0.9)
    );
    helixTube.position.copy(reservoirPos);
    tag(helixTube, 'cooling');
    group.add(helixTube);

    const pumpBase = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.2, 24), brushedAlu);
    pumpBase.position.set(reservoirPos.x, reservoirPos.y - 0.55, reservoirPos.z);
    tag(pumpBase, 'cooling');
    group.add(pumpBase);

    // flow indicator (Eisflügel) — small glowing rotor puck near the pump
    const flowMeter = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.08, 16), makeGlow(0x7fe7d6, 0.8));
    flowMeter.rotation.z = Math.PI / 2;
    flowMeter.position.set(reservoirPos.x + 0.28, reservoirPos.y - 0.55, reservoirPos.z);
    tag(flowMeter, 'cooling');
    group.add(flowMeter);

    // --- tubing (hardline-style right-angle runs) ---
    const tubeMat = new THREE.MeshStandardMaterial({ color: 0x6fd6c8, transparent: true, opacity: 0.75, roughness: 0.15 });
    function straightTube(from: THREE.Vector3, to: THREE.Vector3, radius = 0.04) {
      const dir = new THREE.Vector3().subVectors(to, from);
      const len = dir.length();
      if (len < 1e-4) return;
      const tube = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, len, 10), tubeMat);
      tube.position.copy(from).addScaledVector(dir, 0.5);
      tube.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
      group.add(tube);
    }
    const cpuTop = new THREE.Vector3(cpuGroup.position.x, cpuGroup.position.y + 0.1, cpuGroup.position.z);
    const radTop = new THREE.Vector3(0, caseH / 2 - 0.28, 0);
    straightTube(cpuTop, new THREE.Vector3(cpuTop.x, radTop.y, cpuTop.z));
    straightTube(new THREE.Vector3(cpuTop.x, radTop.y, cpuTop.z), new THREE.Vector3(reservoirPos.x, radTop.y, reservoirPos.z));
    straightTube(new THREE.Vector3(reservoirPos.x, radTop.y, reservoirPos.z), new THREE.Vector3(reservoirPos.x, reservoirPos.y + 0.5, reservoirPos.z));
    straightTube(new THREE.Vector3(reservoirPos.x, reservoirPos.y - 0.65, reservoirPos.z), new THREE.Vector3(reservoirPos.x, -caseH / 2 + 0.7, reservoirPos.z));
    straightTube(new THREE.Vector3(reservoirPos.x, -caseH / 2 + 0.7, reservoirPos.z), new THREE.Vector3(cpuTop.x, -caseH / 2 + 0.7, cpuTop.z));
    straightTube(new THREE.Vector3(cpuTop.x, -caseH / 2 + 0.7, cpuTop.z), new THREE.Vector3(cpuTop.x, cpuGroup.position.y - 0.04, cpuTop.z));

    // --- radiator + fans (360mm triple-fan, top-mounted) ---
    const radiator = new THREE.Mesh(new THREE.BoxGeometry(caseW * 0.9, 0.13, 1.15), darkMetal);
    radiator.position.set(0, caseH / 2 - 0.2, 0);
    tag(radiator, 'fans');
    group.add(radiator);
    // fin ridges
    for (let i = -6; i <= 6; i++) {
      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.13, 1.13), new THREE.MeshStandardMaterial({ color: 0x0e0f11, roughness: 0.7 }));
      fin.position.set(i * (caseW * 0.9) / 14, radiator.position.y, 0);
      group.add(fin);
    }

    const fanBlades: THREE.Object3D[] = [];
    const fanSpacing = (caseW * 0.9) / 3.2;
    [-fanSpacing, 0, fanSpacing].forEach((x) => {
      const fan = new THREE.Group();
      const housing = new THREE.Mesh(
        new THREE.CylinderGeometry(0.46, 0.46, 0.1, 28, 1, true),
        new THREE.MeshStandardMaterial({ color: 0x232629, roughness: 0.6, side: THREE.DoubleSide })
      );
      fan.add(housing);
      const rimLight = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.014, 8, 32), makeGlow(TEAL, 1));
      rimLight.rotation.x = Math.PI / 2;
      fan.add(rimLight);
      const blades = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.025, 7), new THREE.MeshStandardMaterial({ color: 0x2a2d31, roughness: 0.5 }));
      fan.add(blades);
      fanBlades.push(blades);
      fan.position.set(x, radiator.position.y + 0.12, 0);
      tag(housing, 'fans');
      tag(rimLight, 'fans');
      tag(blades, 'fans');
      group.add(fan);
    });

    group.rotation.y = -0.4;

    // --- resize handling ---
    function resize() {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    // --- raycasting for hover / click ---
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    function updateHover(clientX: number, clientY: number) {
      const rect = container!.getBoundingClientRect();
      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(interactive, false);
      const key = hits.length > 0 ? (hits[0].object.userData.key as string) : null;
      setHoveredKey(key);
      container!.style.cursor = key ? 'pointer' : 'grab';
    }

    function onPointerMove(e: PointerEvent) {
      setTooltipPos({ x: e.clientX, y: e.clientY });
      updateHover(e.clientX, e.clientY);
    }

    function onClick(e: MouseEvent) {
      const rect = container!.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(interactive, false);
      if (hits.length > 0) {
        const key = hits[0].object.userData.key as string;
        setPinnedKey((prev) => (prev === key ? null : key));
      } else {
        setPinnedKey(null);
      }
    }

    function onPointerLeave() {
      setHoveredKey(null);
    }

    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('click', onClick);
    container.addEventListener('pointerleave', onPointerLeave);

    let raf = 0;
    const clock = new THREE.Clock();
    function animate() {
      raf = requestAnimationFrame(animate);
      const dt = clock.getDelta();
      if (!prefersReducedMotion) {
        fanBlades.forEach((b) => { b.rotation.y += dt * 4; });
      }
      controls.update();
      renderer.render(scene, camera);
    }
    animate();
    setReady(true);

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('click', onClick);
      container.removeEventListener('pointerleave', onPointerLeave);
      controls.dispose();
      renderer.dispose();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.LineSegments) {
          obj.geometry.dispose();
          const mat = obj.material;
          if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
          else mat.dispose();
        }
      });
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const activeKey = pinnedKey || hoveredKey;
  const active = activeKey ? COMPONENT_INFO[activeKey] : null;

  const uiText = lang === 'de'
    ? {
        canvasLabel: 'Interaktives 3D-Modell des PC-Builds — ziehen zum Drehen, über ein Teil hovern oder klicken für Details',
        loading: 'Lade 3D-Modell…',
        hint: '🖱️ Ziehen zum Drehen · Scrollen zum Zoomen · Klicken, um Infos anzupinnen'
      }
    : {
        canvasLabel: 'Interactive 3D model of the PC build — drag to rotate, hover or click a part for details',
        loading: 'Loading 3D model…',
        hint: '🖱️ Drag to rotate · Scroll to zoom · Click a part to pin its info'
      };

  return (
    <div className="pc3d-wrap">
      <div ref={containerRef} className="pc3d-canvas" aria-label={uiText.canvasLabel} role="img" />
      {!ready && <div className="pc3d-loading">{uiText.loading}</div>}
      <div className="pc3d-hint">{uiText.hint}</div>
      {active && (
        <div
          className="pc3d-tooltip"
          style={{ left: tooltipPos.x, top: tooltipPos.y }}
        >
          <img src={active.photo} alt={active.name} className="pc3d-tooltip-photo" />
          <div className="pc3d-tooltip-body">
            <div className="pc3d-tooltip-title">{active.name}{pinnedKey === active.key ? ' 📌' : ''}</div>
            <div className="pc3d-tooltip-spec">{active.spec}</div>
            <div className="pc3d-tooltip-desc">{active.description}</div>
          </div>
        </div>
      )}
    </div>
  );
}
