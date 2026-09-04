"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { motion, AnimatePresence } from "framer-motion";
import { getAvatarDecision } from "@/lib/api";

export interface AvatarActionPayload {
  actionId: string;
  speech: string;
  emotion?: string;
  thoughtBubbleStyle?: string;
  scrollLockRequested?: boolean;
  durationMs?: number;
}

interface SilverSurferAvatarProps {
  currentSection?: string;
  lang?: string;
  onScrollLockChange?: (locked: boolean) => void;
}

export function SilverSurferAvatar({
  currentSection = "hero",
  lang = "uz",
  onScrollLockChange,
}: SilverSurferAvatarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentDecision, setCurrentDecision] = useState<AvatarActionPayload>({
    actionId: "HERO_INTRO_PEEK",
    speech: "Salom! Men sizning 3D AI Yo'lboshchingizman. 🚀 Meni bosib ko'ring yoki laser/trick tugmalarini sinang!",
    emotion: "FRIENDLY",
  });
  const [showSpeech, setShowSpeech] = useState(true);
  const [hasWebgl, setHasWebgl] = useState(true);
  const [isHudOpen, setIsHudOpen] = useState(true);
  const [activeVfx, setActiveVfx] = useState<"none" | "laser" | "sonic">("none");

  // Three.js References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const avatarGroupRef = useRef<THREE.Group | null>(null);
  const avatarModelRef = useRef<THREE.Group | null>(null);
  const hoverboardMeshRef = useRef<THREE.Group | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const laserMeshRef = useRef<THREE.Mesh | null>(null);
  const shockwaveMeshRef = useRef<THREE.Mesh | null>(null);
  const shieldMeshRef = useRef<THREE.Mesh | null>(null);

  // Mouse & Target Animation State
  const mouseRef = useRef({ x: 0, y: 0 });
  const raycasterRef = useRef(new THREE.Raycaster());
  const flipAngleRef = useRef(0);
  const rollAngleRef = useRef(0);
  const shockwaveScaleRef = useRef(0);
  const squashStretchRef = useRef({ sy: 1, sxz: 1 });

  const targetPosRef = useRef({
    x: 1.5,
    y: -0.2,
    z: 0,
    rotY: -0.3,
    rotZ: 0,
    rotX: 0,
    boardSpinY: 0,
    jumpY: 0,
    armAngle: 0,
    headShake: 0,
  });

  const scrollAttemptRef = useRef(0);
  const isLockedRef = useRef(false);

  // 1. Initialize Three.js 3D Engine & Procedural Silver Surfer Engine
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 5);
    cameraRef.current = camera;

    // Renderer
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, failIfMajorPerformanceCaveat: false });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      container.appendChild(renderer.domElement);
    } catch (err) {
      console.warn("WebGL disabled in browser/VM environment. Using 2D glassmorphic fallback:", err);
      setHasWebgl(false);
      return;
    }

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.0);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.8);
    dirLight.position.set(5, 8, 5);
    scene.add(dirLight);

    const cyanPointLight = new THREE.PointLight(0x00f0ff, 4, 12);
    cyanPointLight.position.set(0, -1, 1);
    scene.add(cyanPointLight);

    const goldPointLight = new THREE.PointLight(0xf4c95d, 3, 12);
    goldPointLight.position.set(2, 2, -1);
    scene.add(goldPointLight);

    // Avatar Root Group
    const avatarGroup = new THREE.Group();
    scene.add(avatarGroup);
    avatarGroupRef.current = avatarGroup;
    avatarGroup.position.set(1.5, -0.2, 0);

    // Build Cyber-Hoverboard Procedural Mesh
    const boardGroup = new THREE.Group();
    avatarGroup.add(boardGroup);
    hoverboardMeshRef.current = boardGroup;

    // Board Body (Metallic Dark Chrome)
    const boardGeo = new THREE.BoxGeometry(0.7, 0.08, 1.8);
    const boardMat = new THREE.MeshStandardMaterial({
      color: 0x0a0a16,
      metalness: 0.95,
      roughness: 0.1,
    });
    const boardMesh = new THREE.Mesh(boardGeo, boardMat);
    boardGroup.add(boardMesh);

    // Board Neon Edge Strip (Cyan/Gold)
    const trimGeo = new THREE.BoxGeometry(0.74, 0.04, 1.84);
    const trimMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const trimMesh = new THREE.Mesh(trimGeo, trimMat);
    trimMesh.position.y = -0.02;
    boardGroup.add(trimMesh);

    // Foot Binding Holographic Cyan Neon Rings (On Top of Hoverboard)
    const footRingGeo = new THREE.RingGeometry(0.08, 0.12, 16);
    footRingGeo.rotateX(Math.PI / 2);
    const footRingMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, side: THREE.DoubleSide });
    const leftFootRing = new THREE.Mesh(footRingGeo, footRingMat);
    leftFootRing.position.set(-0.15, 0.041, 0.25);
    boardGroup.add(leftFootRing);

    const rightFootRing = new THREE.Mesh(footRingGeo, footRingMat);
    rightFootRing.position.set(0.15, 0.041, -0.25);
    boardGroup.add(rightFootRing);

    // VFX 1: Laser Beam Cylinder (Front Thruster / Blaster)
    const laserGeo = new THREE.CylinderGeometry(0.04, 0.12, 8, 16);
    laserGeo.rotateX(Math.PI / 2);
    laserGeo.translate(0, 0, 4);
    const laserMat = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    const laserMesh = new THREE.Mesh(laserGeo, laserMat);
    laserMesh.position.set(0, 0, 0.9);
    boardGroup.add(laserMesh);
    laserMeshRef.current = laserMesh;

    // VFX 2: Sonic Shockwave Ring
    const shockGeo = new THREE.RingGeometry(0.2, 0.45, 32);
    shockGeo.rotateX(Math.PI / 2);
    const shockMat = new THREE.MeshBasicMaterial({
      color: 0xf4c95d,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    const shockMesh = new THREE.Mesh(shockGeo, shockMat);
    shockMesh.position.set(0, -0.08, 0);
    boardGroup.add(shockMesh);
    shockwaveMeshRef.current = shockMesh;

    // VFX 3: Quantum Energy Shield Bubble
    const shieldGeo = new THREE.IcosahedronGeometry(0.95, 2);
    const shieldMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
    });
    const shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
    shieldMesh.position.set(0, 0.6, 0);
    avatarGroup.add(shieldMesh);
    shieldMeshRef.current = shieldMesh;

    // Thruster Cosmic Particles
    const pCount = 100;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount * 3; i += 3) {
      pPos[i] = (Math.random() - 0.5) * 0.4;
      pPos[i + 1] = (Math.random() - 0.5) * 0.1 - 0.1;
      pPos[i + 2] = -0.9 - Math.random() * 1.2;
    }
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0xf4c95d,
      size: 0.08,
      transparent: true,
      opacity: 0.9,
    });
    const particles = new THREE.Points(pGeo, pMat);
    boardGroup.add(particles);
    particlesRef.current = particles;

    // Load Jaloliddin.glb Avatar & Auto-Align Feet ON TOP of Hoverboard
    const loader = new GLTFLoader();
    loader.load(
      "/Jaloliddin.glb",
      (gltf) => {
        const model = gltf.scene;
        avatarModelRef.current = model;

        // Silver Surfer Chrome Superhero Shader Material
        const silverSurferMat = new THREE.MeshPhysicalMaterial({
          color: 0xddeeff,
          metalness: 0.95,
          roughness: 0.12,
          clearcoat: 1.0,
          clearcoatRoughness: 0.1,
          reflectivity: 0.9,
        });

        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.material = silverSurferMat;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
          }
        });

        // Compute Bounding Box to automatically align feet ON TOP of the hoverboard (y = 0.04)
        const initialBox = new THREE.Box3().setFromObject(model);
        const size = new THREE.Vector3();
        initialBox.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);

        // Normalize scale to ~1.4 units tall
        const targetScale = maxDim > 0 ? 1.4 / maxDim : 0.85;
        model.scale.set(targetScale, targetScale, targetScale);

        // Re-compute bounding box after scale to position feet at y = 0.04
        const scaledBox = new THREE.Box3().setFromObject(model);
        const center = new THREE.Vector3();
        scaledBox.getCenter(center);

        model.position.x = -center.x;
        model.position.z = -center.z;
        model.position.y = -scaledBox.min.y + 0.04;

        // Diagonal Surfer Stance Angle on the Hoverboard
        model.rotation.y = Math.PI / 5;

        avatarGroup.add(model);
      },
      undefined,
      (err) => console.warn("Failed to load /Jaloliddin.glb avatar, rendering hoverboard:", err)
    );

    // Mouse Tracking Event Listener
    const handlePointerMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handlePointerMove);

    // Window Resize Listener
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth || window.innerWidth;
      const h = containerRef.current.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // 60 FPS Animation Engine Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      if (avatarGroupRef.current) {
        const ag = avatarGroupRef.current;
        const tp = targetPosRef.current;

        // Smooth Mouse Lean (Interactive Freedom)
        const mouseLeanX = mouseRef.current.x * 0.35;
        const mouseLeanY = mouseRef.current.y * 0.25;

        // Position Lerp
        ag.position.x += (tp.x + mouseLeanX * 0.5 - ag.position.x) * 0.06;
        ag.position.y += (tp.y + Math.sin(time * 2.2) * 0.09 + tp.jumpY + mouseLeanY * 0.4 - ag.position.y) * 0.06;
        ag.position.z += (tp.z - ag.position.z) * 0.06;

        // Dynamic Backflip & Barrel Roll Rotations
        if (flipAngleRef.current > 0) {
          ag.rotation.x += 0.25;
          flipAngleRef.current -= 0.25;
          squashStretchRef.current = { sy: 1.25, sxz: 0.8 };
          if (flipAngleRef.current <= 0) flipAngleRef.current = 0;
        } else {
          ag.rotation.x += (tp.rotX - mouseLeanY * 0.2 - ag.rotation.x) * 0.06;
        }

        if (rollAngleRef.current > 0) {
          ag.rotation.z += 0.3;
          rollAngleRef.current -= 0.3;
          squashStretchRef.current = { sy: 0.9, sxz: 1.15 };
          if (rollAngleRef.current <= 0) rollAngleRef.current = 0;
        } else {
          ag.rotation.z += (tp.rotZ + Math.sin(time * 1.8) * 0.06 + mouseLeanX * 0.3 - ag.rotation.z) * 0.06;
        }

        // Rotation Lerp
        ag.rotation.y += (tp.rotY + tp.boardSpinY + mouseLeanX * 0.4 - ag.rotation.y) * 0.06;

        // Jump & Squash/Stretch Decay
        if (tp.jumpY > 0) {
          tp.jumpY *= 0.92;
        }
        squashStretchRef.current.sy += (1 - squashStretchRef.current.sy) * 0.08;
        squashStretchRef.current.sxz += (1 - squashStretchRef.current.sxz) * 0.08;
      }

      // Procedural Surfer Body Kinematics & Speech Pulse
      if (avatarModelRef.current) {
        const model = avatarModelRef.current;
        const speechPulse = showSpeech ? Math.sin(time * 12) * 0.02 : 0;
        const waveBob = Math.sin(time * 4) * 0.03;

        // Apply dynamic surfer stance tilt & speech pulse
        model.rotation.z = Math.PI / 24 + speechPulse + mouseRef.current.x * 0.1;
        model.rotation.x = waveBob;

        // Apply Squash & Stretch physics to avatar model
        model.scale.y = 1.0 * squashStretchRef.current.sy + speechPulse;
        model.scale.x = 1.0 * squashStretchRef.current.sxz;
        model.scale.z = 1.0 * squashStretchRef.current.sxz;
      }

      // Animate Quantum Shield Mesh
      if (shieldMeshRef.current) {
        shieldMeshRef.current.rotation.y = time * 0.5;
        shieldMeshRef.current.rotation.z = Math.sin(time * 0.8) * 0.2;
        const mat = shieldMeshRef.current.material as THREE.MeshBasicMaterial;
        mat.opacity = 0.1 + Math.sin(time * 4) * 0.05 + (activeVfx !== "none" ? 0.3 : 0);
      }

      // Animate Laser Beam VFX
      if (laserMeshRef.current) {
        const mat = laserMeshRef.current.material as THREE.MeshBasicMaterial;
        if (activeVfx === "laser") {
          mat.opacity = 0.85 + Math.sin(time * 25) * 0.15;
          laserMeshRef.current.scale.set(1 + Math.sin(time * 20) * 0.2, 1, 1);
        } else {
          mat.opacity = 0;
        }
      }

      // Animate Sonic Shockwave VFX
      if (shockwaveMeshRef.current) {
        const mat = shockwaveMeshRef.current.material as THREE.MeshBasicMaterial;
        if (shockwaveScaleRef.current > 0) {
          shockwaveScaleRef.current += 0.15;
          shockwaveMeshRef.current.scale.set(shockwaveScaleRef.current, shockwaveScaleRef.current, 1);
          mat.opacity = Math.max(0, 1 - shockwaveScaleRef.current / 4);
          if (shockwaveScaleRef.current > 4) shockwaveScaleRef.current = 0;
        } else {
          mat.opacity = 0;
        }
      }

      // Thruster Particle Velocity
      if (particlesRef.current) {
        const posArr = particlesRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 2; i < posArr.length; i += 3) {
          posArr[i] -= 0.05;
          if (posArr[i] < -2.0) posArr[i] = -0.9;
        }
        particlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [activeVfx, showSpeech]);

  // 2. Direct 3D Raycasting Canvas Click Listener
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cameraRef.current || !sceneRef.current) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);
    const intersects = raycasterRef.current.intersectObjects(sceneRef.current.children, true);

    if (intersects.length > 0) {
      triggerStunt("SPIN");
    }
  };

  // 3. Trigger Interactive Stunts & Animations
  const triggerStunt = (type: "SPIN" | "FLIP" | "LASER" | "SONIC" | "ASK_AI" | "CYBER_DANCE") => {
    setShowSpeech(true);

    switch (type) {
      case "SPIN":
        rollAngleRef.current = Math.PI * 2;
        targetPosRef.current.jumpY = 0.4;
        setCurrentDecision({
          actionId: "STUNT_SPIN",
          speech: "🚀 360° Barrel Roll! Fazoviy giper-tezlik ishga tushdi!",
          emotion: "FRIENDLY",
        });
        break;
      case "FLIP":
        flipAngleRef.current = Math.PI * 2;
        targetPosRef.current.jumpY = 0.6;
        setCurrentDecision({
          actionId: "STUNT_BACKFLIP",
          speech: "🤸 Akrobatik Backflip! Gravitatsiya men uchun muammo emas!",
          emotion: "FRIENDLY",
        });
        break;
      case "LASER":
        setActiveVfx("laser");
        setTimeout(() => setActiveVfx("none"), 2500);
        setCurrentDecision({
          actionId: "LASER_BLAST",
          speech: "⚡ Plasma Laser Beam! Kosmik kvant nuri otildi!",
          emotion: "FRIENDLY",
        });
        break;
      case "SONIC":
        shockwaveScaleRef.current = 0.2;
        setCurrentDecision({
          actionId: "SONIC_WAVE",
          speech: "💥 Sonik Tovush To'lqini! Ekrandagi barcha ionlar tebrandi!",
          emotion: "FRIENDLY",
        });
        break;
      case "CYBER_DANCE":
        targetPosRef.current = {
          x: 0,
          y: 0.2,
          z: 0.8,
          rotY: 0,
          rotZ: 0.2,
          rotX: 0,
          boardSpinY: Math.PI * 4,
          jumpY: 0.3,
          armAngle: 1,
          headShake: 1,
        };
        setCurrentDecision({
          actionId: "CYBER_DANCE",
          speech: "🕺 Kiber-Raqs Mode! Neyron tarmoqlari maromida tebranmoqda!",
          emotion: "FRIENDLY",
        });
        break;
      case "ASK_AI":
        getAvatarDecision({
          section: currentSection,
          device: window.innerWidth < 768 ? "mobile" : "desktop",
          eventType: "USER_CLICK",
          lang,
        }).then((data) => {
          if (data) setCurrentDecision(data);
        });
        break;
    }
  };

  // 4. Map Section & AI Director Decisions to 3D Postures
  useEffect(() => {
    if (!currentDecision) return;
    const act = currentDecision.actionId;

    switch (act) {
      case "HERO_INTRO_PEEK":
        targetPosRef.current = { x: 1.5, y: -0.2, z: 0, rotY: -0.4, rotZ: 0.05, rotX: 0, boardSpinY: 0, jumpY: 0, armAngle: 0, headShake: 0 };
        break;
      case "SCROLL_LOCK_ANNOYED":
        targetPosRef.current = { x: 0.8, y: 0.1, z: 0.6, rotY: 0, rotZ: -0.15, rotX: -0.2, boardSpinY: 0, jumpY: 0, armAngle: 0.5, headShake: 1 };
        break;
      case "SCROLL_LOCK_ARAZ":
        targetPosRef.current = { x: 0.8, y: 0.1, z: 0.6, rotY: Math.PI, rotZ: 0, rotX: 0.1, boardSpinY: 0, jumpY: 0, armAngle: 0, headShake: 0 };
        break;
      case "SCROLL_LOCK_SARCASTIC":
        targetPosRef.current = { x: 0.9, y: 0.25, z: 0.7, rotY: -0.25, rotZ: 0.18, rotX: 0, boardSpinY: 0, jumpY: 0, armAngle: 0.8, headShake: 0.5 };
        break;
      case "WOHOO_JUMP":
        targetPosRef.current = { x: 0, y: 0.6, z: 1.1, rotY: 0, rotZ: 0.25, rotX: 0, boardSpinY: Math.PI * 2, jumpY: 0.5, armAngle: 1.0, headShake: 0 };
        break;
      case "THUMBS_UP":
        targetPosRef.current = { x: 0, y: 0.15, z: 0.8, rotY: -0.1, rotZ: 0, rotX: 0, boardSpinY: 0, jumpY: 0, armAngle: 1.2, headShake: 0 };
        break;
      case "SIT_ON_CARD":
        targetPosRef.current = { x: -1.2, y: -0.35, z: 0.3, rotY: 0.5, rotZ: -0.12, rotX: -0.3, boardSpinY: 0, jumpY: 0, armAngle: 0, headShake: 0 };
        break;
      case "DOUBLE_TAP_HIGH_FIVE":
        targetPosRef.current = { x: 0, y: 0.3, z: 1.6, rotY: 0, rotZ: 0, rotX: 0.1, boardSpinY: 0, jumpY: 0.3, armAngle: 1.5, headShake: 0 };
        break;
      case "MOON_LANDING":
        targetPosRef.current = { x: 0.5, y: -1.1, z: 0.2, rotY: -0.3, rotZ: 0, rotX: 0, boardSpinY: 0, jumpY: 0, armAngle: 0, headShake: 0 };
        break;
      case "MOON_SCARED":
        targetPosRef.current = { x: -1.4, y: -0.85, z: 0.5, rotY: 0.45, rotZ: -0.22, rotX: 0.2, boardSpinY: 0, jumpY: 0.2, armAngle: 0, headShake: 1 };
        break;
    }
  }, [currentDecision]);

  // 5. Scroll Interception & AI Humorous Dialogue Director
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (currentSection === "hero" && e.deltaY > 0) {
        scrollAttemptRef.current += 1;
        const attempts = scrollAttemptRef.current;

        getAvatarDecision({
          section: "hero",
          device: window.innerWidth < 768 ? "mobile" : "desktop",
          eventType: "SCROLL_TRY",
          idleTimeSec: attempts,
          lang,
        }).then((data) => {
          if (data) {
            setCurrentDecision(data);
            setShowSpeech(true);

            if (data.scrollLockRequested) {
              isLockedRef.current = true;
              document.body.style.overflow = "hidden";
              if (onScrollLockChange) onScrollLockChange(true);

              setTimeout(() => {
                isLockedRef.current = false;
                document.body.style.overflow = "";
                if (onScrollLockChange) onScrollLockChange(false);
              }, data.durationMs || 3500);
            }
          }
        });
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", handleWheel);
      document.body.style.overflow = "";
    };
  }, [currentSection, lang, onScrollLockChange]);

  // 6. Autonomous AI Director Loop (Heartbeat every 16 seconds if idle)
  useEffect(() => {
    const interval = setInterval(() => {
      getAvatarDecision({
        section: currentSection,
        device: window.innerWidth < 768 ? "mobile" : "desktop",
        eventType: "IDLE_BEAT",
        lang,
      }).then((data) => {
        if (data) {
          setCurrentDecision(data);
          setShowSpeech(true);
        }
      });
    }, 16000);

    return () => clearInterval(interval);
  }, [currentSection, lang]);

  return (
    <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
      {/* 3D WebGL Canvas Container */}
      <div
        ref={containerRef}
        onClick={handleCanvasClick}
        className="w-full h-full pointer-events-auto cursor-pointer"
        title="Silver Surfer avatarini bosib harakatlantiring!"
      />

      {/* Fallback 2D Avatar Badge for VirtualBox / Non-WebGL Browsers */}
      {!hasWebgl && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute bottom-28 right-6 md:right-16 flex items-center gap-3 p-3.5 rounded-2xl border border-accent/40 bg-[#0c0c1a]/90 backdrop-blur-xl text-white shadow-[0_0_35px_rgba(244,201,93,0.3)] pointer-events-auto"
        >
          <div className="relative w-12 h-12 rounded-xl bg-accent/20 border border-accent/40 overflow-hidden flex items-center justify-center text-xl shrink-0">
            🤖
          </div>
          <div>
            <span className="font-mono text-[9px] text-accent uppercase tracking-widest font-bold block">
              3D AI Yo'lboshchi (Silver Surfer)
            </span>
            <span className="font-mono text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> AI Director Active
            </span>
          </div>
        </motion.div>
      )}

      {/* Interactive Quick Stunt Control HUD */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-6 right-6 z-40 pointer-events-auto flex items-center gap-2"
      >
        <button
          onClick={() => setIsHudOpen(!isHudOpen)}
          className="w-10 h-10 rounded-full bg-[#0d0d1a]/90 border border-accent/40 text-accent hover:bg-accent/20 flex items-center justify-center transition-all shadow-[0_0_20px_rgba(244,201,93,0.2)] text-base font-bold"
          title="Stunt va AI menyusini ko'rsatish/yashirish"
        >
          ⚡
        </button>

        <AnimatePresence>
          {isHudOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: 20 }}
              className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#0c0c1b]/95 border border-accent/30 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.5)]"
            >
              <button
                onClick={() => triggerStunt("SPIN")}
                className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-accent/20 border border-white/10 text-xs font-mono font-semibold text-white transition-all flex items-center gap-1"
                title="360° Barrel Roll"
              >
                🚀 Roll
              </button>
              <button
                onClick={() => triggerStunt("FLIP")}
                className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-accent/20 border border-white/10 text-xs font-mono font-semibold text-white transition-all flex items-center gap-1"
                title="Backflip acrobatics"
              >
                🤸 Flip
              </button>
              <button
                onClick={() => triggerStunt("LASER")}
                className="px-2.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/30 border border-cyan-400/40 text-xs font-mono font-semibold text-cyan-300 transition-all flex items-center gap-1"
                title="Laser Plasma Beam"
              >
                ⚡ Laser
              </button>
              <button
                onClick={() => triggerStunt("SONIC")}
                className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/30 border border-amber-400/40 text-xs font-mono font-semibold text-amber-300 transition-all flex items-center gap-1"
                title="Sonic Shockwave"
              >
                💥 Wave
              </button>
              <button
                onClick={() => triggerStunt("CYBER_DANCE")}
                className="px-2.5 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/30 border border-purple-400/40 text-xs font-mono font-semibold text-purple-300 transition-all flex items-center gap-1"
                title="Cyber Dance Stunt"
              >
                🕺 Dance
              </button>
              <button
                onClick={() => triggerStunt("ASK_AI")}
                className="px-2.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/40 border border-emerald-400/50 text-xs font-mono font-bold text-emerald-300 transition-all flex items-center gap-1 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                title="Ask AI Director for action"
              >
                🤖 AI
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Floating Dynamic Speech / Thought Bubble */}
      <AnimatePresence>
        {showSpeech && currentDecision?.speech && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ duration: 0.3 }}
            className={`absolute bottom-24 right-6 md:right-24 max-w-xs md:max-w-sm p-4 rounded-2xl border text-white backdrop-blur-2xl shadow-[0_0_35px_rgba(244,201,93,0.3)] pointer-events-auto ${
              currentDecision.thoughtBubbleStyle === "WARNING_ORANGE"
                ? "border-rose-500/50 bg-[#1f0a0a]/95 shadow-rose-500/20"
                : "border-accent/40 bg-[#0d0d1a]/95"
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-xl">
                {currentDecision.emotion === "ANNOYED" ? "😠" : currentDecision.emotion === "SARCASTIC" ? "😏" : "💬"}
              </span>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-accent uppercase tracking-widest font-bold block">
                    {currentDecision.emotion === "ANNOYED" ? "AI Yo'lboshchi (Jahli chiqdi!)" : "AI Yo'lboshchi (Silver Surfer)"}
                  </span>
                  <button
                    onClick={() => setShowSpeech(false)}
                    className="text-xs text-white/40 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>
                <p className="font-sans text-xs md:text-sm text-white/95 leading-relaxed font-medium">
                  {currentDecision.speech}
                </p>
              </div>
            </div>
            {/* Speech Tail */}
            <div className="absolute -bottom-2 right-12 w-4 h-4 bg-[#0d0d1a] border-r border-b border-accent/40 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

