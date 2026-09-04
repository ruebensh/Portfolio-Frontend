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
    speech: "Salom! Men sizning 3D AI yo'lboshchingizman. 🚀 Shoshmang, avval meni eshiting!",
    emotion: "FRIENDLY",
  });
  const [showSpeech, setShowSpeech] = useState(true);
  const [hasWebgl, setHasWebgl] = useState(true);

  // Three.js References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const avatarGroupRef = useRef<THREE.Group | null>(null);
  const avatarModelRef = useRef<THREE.Group | null>(null);
  const hoverboardMeshRef = useRef<THREE.Group | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);

  // Procedural Animation State Targets
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

  // Track user scroll attempts for humorous dialogue progression
  const scrollAttemptRef = useRef(0);
  const isLockedRef = useRef(false);

  // 1. Initialize Three.js 3D Engine & Procedural Silver Surfer Avatar
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
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.5);
    dirLight.position.set(5, 8, 5);
    scene.add(dirLight);

    const cyanPointLight = new THREE.PointLight(0x00f0ff, 3, 10);
    cyanPointLight.position.set(0, -1, 1);
    scene.add(cyanPointLight);

    const goldPointLight = new THREE.PointLight(0xf4c95d, 2.5, 10);
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

    // Board Body (Metallic Chrome)
    const boardGeo = new THREE.BoxGeometry(0.7, 0.08, 1.8);
    const boardMat = new THREE.MeshStandardMaterial({
      color: 0x111122,
      metalness: 0.95,
      roughness: 0.15,
    });
    const boardMesh = new THREE.Mesh(boardGeo, boardMat);
    boardGroup.add(boardMesh);

    // Board Neon Edge Strip (Cyan/Gold)
    const trimGeo = new THREE.BoxGeometry(0.74, 0.04, 1.84);
    const trimMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const trimMesh = new THREE.Mesh(trimGeo, trimMat);
    trimMesh.position.y = -0.02;
    boardGroup.add(trimMesh);

    // Board Thruster Cosmic Particles
    const pCount = 80;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount * 3; i += 3) {
      pPos[i] = (Math.random() - 0.5) * 0.4;
      pPos[i + 1] = (Math.random() - 0.5) * 0.1 - 0.1;
      pPos[i + 2] = -0.9 - Math.random() * 1.0;
    }
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0xf4c95d,
      size: 0.07,
      transparent: true,
      opacity: 0.85,
    });
    const particles = new THREE.Points(pGeo, pMat);
    boardGroup.add(particles);
    particlesRef.current = particles;

    // Load Jaloliddin.glb Avatar & Apply Liquid-Platinum Silver Surfer Material
    const loader = new GLTFLoader();
    loader.load(
      "/Jaloliddin.glb",
      (gltf) => {
        const model = gltf.scene;
        avatarModelRef.current = model;
        model.scale.set(0.85, 0.85, 0.85);
        model.position.set(0, 0.05, 0);

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

        avatarGroup.add(model);
      },
      undefined,
      (err) => console.warn("Failed to load /Jaloliddin.glb avatar, rendering hoverboard:", err)
    );

    // Resize Listener
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth || window.innerWidth;
      const h = containerRef.current.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // 60 FPS Procedural Animation Engine Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      if (avatarGroupRef.current) {
        const ag = avatarGroupRef.current;
        const tp = targetPosRef.current;

        // Position Lerp
        ag.position.x += (tp.x - ag.position.x) * 0.06;
        ag.position.y += (tp.y + Math.sin(time * 2.2) * 0.09 + tp.jumpY - ag.position.y) * 0.06;
        ag.position.z += (tp.z - ag.position.z) * 0.06;

        // Rotation Lerp
        ag.rotation.y += (tp.rotY + tp.boardSpinY - ag.rotation.y) * 0.06;
        ag.rotation.z += (tp.rotZ + Math.sin(time * 1.8) * 0.06 - ag.rotation.z) * 0.06;
        ag.rotation.x += (tp.rotX - ag.rotation.x) * 0.06;

        // Jump impulse decay
        if (tp.jumpY > 0) tp.jumpY *= 0.92;
      }

      // Procedural Head & Arm Joint Control
      if (avatarModelRef.current) {
        const tp = targetPosRef.current;
        avatarModelRef.current.rotation.y = Math.sin(time * 3) * tp.headShake * 0.2;
      }

      // Animate Thruster Particles
      if (particlesRef.current) {
        const posArr = particlesRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 2; i < posArr.length; i += 3) {
          posArr[i] -= 0.04;
          if (posArr[i] < -1.8) posArr[i] = -0.9;
        }
        particlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // 2. Map AI Director Action Decisions to 3D Procedural Postures & Transforms
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
      default:
        targetPosRef.current = { x: 1.5, y: -0.2, z: 0, rotY: -0.3, rotZ: 0, rotX: 0, boardSpinY: 0, jumpY: 0, armAngle: 0, headShake: 0 };
    }
  }, [currentDecision]);

  // 3. User Scroll Interception & AI Humorous Dialogue Director Trigger
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

            // Handle Scroll Lock Request
            if (data.scrollLockRequested) {
              isLockedRef.current = true;
              document.body.style.overflow = "hidden";
              if (onScrollLockChange) onScrollLockChange(true);

              // Auto-unlock after speech duration
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

  // 4. Mobile Double-Tap High Five Gesture Listener
  useEffect(() => {
    let lastTap = 0;
    const handleTouchStart = (e: TouchEvent) => {
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTap;
      if (tapLength < 300 && tapLength > 0) {
        // Double tap detected!
        getAvatarDecision({
          section: currentSection,
          device: "mobile",
          eventType: "DOUBLE_TAP",
          lang,
        }).then((data) => {
          if (data) {
            setCurrentDecision(data);
            setShowSpeech(true);
          }
        });
        e.preventDefault();
      }
      lastTap = currentTime;
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    return () => window.removeEventListener("touchstart", handleTouchStart);
  }, [currentSection, lang]);

  return (
    <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
      {/* Three.js 3D Canvas Container */}
      <div ref={containerRef} className="w-full h-full" />

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

      {/* Floating Dynamic Thought / Speech Bubble */}
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
                <span className="font-mono text-[10px] text-accent uppercase tracking-widest font-bold block">
                  {currentDecision.emotion === "ANNOYED" ? "AI Yo'lboshchi (Jahli chiqdi!)" : "AI Yo'lboshchi (Silver Surfer)"}
                </span>
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
