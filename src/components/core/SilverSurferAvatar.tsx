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
    speech: "Salom! Men sizning 3D AI yo'lboshchingizman. 🚀",
    emotion: "FRIENDLY",
  });
  const [showSpeech, setShowSpeech] = useState(true);
  const [idleTimerSec, setIdleTimerSec] = useState(0);

  // Three.js references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const avatarGroupRef = useRef<THREE.Group | null>(null);
  const hoverboardMeshRef = useRef<THREE.Group | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const targetPosRef = useRef({ x: 1.8, y: -0.2, z: 0, rotY: -0.3, rotZ: 0 });

  // 1. Initialize Three.js 3D Engine & Load /Jaloliddin.glb
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
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

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

    // Root avatar group
    const avatarGroup = new THREE.Group();
    scene.add(avatarGroup);
    avatarGroupRef.current = avatarGroup;
    avatarGroup.position.set(1.8, -0.2, 0);

    // Build Cyber-Hoverboard Procedural Mesh
    const boardGroup = new THREE.Group();
    avatarGroup.add(boardGroup);
    hoverboardMeshRef.current = boardGroup;

    // Board Body
    const boardGeo = new THREE.BoxGeometry(0.7, 0.08, 1.8);
    const boardMat = new THREE.MeshStandardMaterial({
      color: 0x111122,
      metalness: 0.9,
      roughness: 0.2,
    });
    const boardMesh = new THREE.Mesh(boardGeo, boardMat);
    boardGroup.add(boardMesh);

    // Board Neon Trim
    const trimGeo = new THREE.BoxGeometry(0.74, 0.04, 1.84);
    const trimMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const trimMesh = new THREE.Mesh(trimGeo, trimMat);
    trimMesh.position.y = -0.02;
    boardGroup.add(trimMesh);

    // Board Thruster Particles
    const pCount = 60;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount * 3; i += 3) {
      pPos[i] = (Math.random() - 0.5) * 0.4;
      pPos[i + 1] = (Math.random() - 0.5) * 0.1 - 0.1;
      pPos[i + 2] = -0.9 - Math.random() * 0.8;
    }
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0xf4c95d,
      size: 0.06,
      transparent: true,
      opacity: 0.8,
    });
    const particles = new THREE.Points(pGeo, pMat);
    boardGroup.add(particles);
    particlesRef.current = particles;

    // Load Jaloliddin.glb avatar
    const loader = new GLTFLoader();
    loader.load(
      "/Jaloliddin.glb",
      (gltf) => {
        const model = gltf.scene;
        // Scale and position avatar on hoverboard
        model.scale.set(0.85, 0.85, 0.85);
        model.position.set(0, 0.05, 0);

        // Ensure materials display nicely
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
          }
        });

        avatarGroup.add(model);
      },
      undefined,
      (err) => {
        console.warn("Failed to load /Jaloliddin.glb avatar, rendering hoverboard:", err);
      }
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

    // Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      if (avatarGroupRef.current) {
        const ag = avatarGroupRef.current;
        const tp = targetPosRef.current;

        // Smooth position & rotation lerp (60 FPS)
        ag.position.x += (tp.x - ag.position.x) * 0.05;
        ag.position.y += (tp.y + Math.sin(elapsedTime * 2) * 0.08 - ag.position.y) * 0.05;
        ag.position.z += (tp.z - ag.position.z) * 0.05;

        ag.rotation.y += (tp.rotY - ag.rotation.y) * 0.05;
        ag.rotation.z += (tp.rotZ + Math.sin(elapsedTime * 1.5) * 0.05 - ag.rotation.z) * 0.05;
      }

      // Animate thruster particles
      if (particlesRef.current) {
        const posArr = particlesRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 2; i < posArr.length; i += 3) {
          posArr[i] -= 0.03;
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

  // 2. React to Section and Decision Changes (Updates 3D Avatar Target Posture)
  useEffect(() => {
    if (!currentDecision) return;
    const act = currentDecision.actionId;

    switch (act) {
      case "HERO_INTRO_PEEK":
        targetPosRef.current = { x: 1.5, y: -0.2, z: 0, rotY: -0.4, rotZ: 0.05 };
        break;
      case "SCROLL_LOCK_ANNOYED":
        targetPosRef.current = { x: 0.8, y: 0.1, z: 0.5, rotY: 0, rotZ: -0.1 };
        break;
      case "SCROLL_LOCK_ARAZ":
        targetPosRef.current = { x: 0.8, y: 0.1, z: 0.5, rotY: Math.PI, rotZ: 0 };
        break;
      case "SCROLL_LOCK_SARCASTIC":
        targetPosRef.current = { x: 0.9, y: 0.2, z: 0.6, rotY: -0.2, rotZ: 0.15 };
        break;
      case "WOHOO_JUMP":
        targetPosRef.current = { x: 0, y: 0.6, z: 1.0, rotY: 0, rotZ: 0.2 };
        break;
      case "THUMBS_UP":
        targetPosRef.current = { x: 0, y: 0.1, z: 0.8, rotY: -0.1, rotZ: 0 };
        break;
      case "SIT_ON_CARD":
        targetPosRef.current = { x: -1.2, y: -0.3, z: 0.2, rotY: 0.5, rotZ: -0.1 };
        break;
      case "MOON_LANDING":
        targetPosRef.current = { x: 0.5, y: -1.0, z: 0.2, rotY: -0.3, rotZ: 0 };
        break;
      case "MOON_SCARED":
        targetPosRef.current = { x: -1.4, y: -0.8, z: 0.4, rotY: 0.4, rotZ: -0.2 };
        break;
      default:
        targetPosRef.current = { x: 1.5, y: -0.2, z: 0, rotY: -0.3, rotZ: 0 };
    }
  }, [currentDecision]);

  // 3. User Interaction Listeners (Idle, Scroll attempts, Section triggers)
  useEffect(() => {
    let scrollCount = 0;

    const handleWheel = (e: WheelEvent) => {
      if (currentSection === "hero" && e.deltaY > 0) {
        scrollCount++;
        getAvatarDecision({
          section: "hero",
          eventType: "SCROLL_TRY",
          idleTimeSec: scrollCount,
          lang,
        }).then((data) => {
          if (data) {
            setCurrentDecision(data);
            setShowSpeech(true);
            if (onScrollLockChange && data.scrollLockRequested !== undefined) {
              onScrollLockChange(data.scrollLockRequested);
            }
          }
        });
      }
    };

    window.addEventListener("wheel", handleWheel);
    return () => window.removeEventListener("wheel", handleWheel);
  }, [currentSection, lang, onScrollLockChange]);

  return (
    <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
      {/* Three.js 3D Canvas Container */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Floating Dynamic Thought / Speech Bubble */}
      <AnimatePresence>
        {showSpeech && currentDecision?.speech && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-24 right-6 md:right-24 max-w-xs md:max-w-sm p-4 rounded-2xl border border-accent/40 bg-[#0d0d1a]/95 backdrop-blur-2xl text-white shadow-[0_0_30px_rgba(244,201,93,0.3)] pointer-events-auto"
          >
            <div className="flex items-start gap-3">
              <span className="text-xl">💬</span>
              <div className="space-y-1">
                <span className="font-mono text-[10px] text-accent uppercase tracking-widest font-bold block">
                  AI Yo'lboshchi (Silver Surfer)
                </span>
                <p className="font-sans text-xs md:text-sm text-white/95 leading-relaxed">
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
