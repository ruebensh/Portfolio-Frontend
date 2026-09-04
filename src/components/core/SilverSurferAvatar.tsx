"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { motion, AnimatePresence } from "framer-motion";
import { getAvatarDecision } from "@/lib/api";
import { CircleNotch, ChatCircleDots } from "@phosphor-icons/react/dist/ssr";

interface SpeechState {
  text: string;
  emotion: string;
  bubbleStyle: string;
  durationMs: number;
}

export function SilverSurferAvatar() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Speech bubble state
  const [speech, setSpeech] = useState<SpeechState | null>({
    text: "Salom! Men sizning AI yo'lboshchingizman. Koinotga xush kelibsiz! 🚀",
    emotion: "FRIENDLY",
    bubbleStyle: "CYBER_NEON",
    durationMs: 4000,
  });

  const [screenPos, setScreenPos] = useState({ x: 0, y: 0, visible: false });
  const [scrollLocked, setScrollLocked] = useState(false);
  const scrollAttemptsRef = useRef(0);

  // References for Three.js objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const characterGroupRef = useRef<THREE.Group | null>(null);
  const hoverboardRef = useRef<THREE.Object3D | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const actionsRef = useRef<Record<string, THREE.AnimationAction>>({});
  const activeActionRef = useRef<THREE.AnimationAction | null>(null);

  // State target coordinates for 3D motion
  const targetPos = useRef({ x: 2.2, y: 0.2, z: 0, rotY: -0.4, rotZ: 0 });
  const currentPos = useRef({ x: 2.2, y: 0.2, z: 0, rotY: -0.4, rotZ: 0 });

  // 1. Initialize Three.js 3D Engine & Assets
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth || window.innerWidth;
    const height = containerRef.current.clientHeight || window.innerHeight;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1.2, 5);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xf4c95d, 2.0); // Starlight Gold
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    const cyanRimLight = new THREE.PointLight(0x06b6d4, 3.0, 15); // Cosmic Cyan Rim
    cyanRimLight.position.set(-4, 2, -2);
    scene.add(cyanRimLight);

    const purpleRimLight = new THREE.PointLight(0x7c3aed, 3.0, 15); // Nebula Violet Rim
    purpleRimLight.position.set(4, -2, -2);
    scene.add(purpleRimLight);

    // Starfield Particle Dust
    const starsGeo = new THREE.BufferGeometry();
    const starsCount = 300;
    const posArray = new Float32Array(starsCount * 3);
    for (let i = 0; i < starsCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 20;
    }
    starsGeo.setAttribute("position", new THREE.BufferAttribute(posArray, 3));
    const starsMat = new THREE.PointsMaterial({
      size: 0.04,
      color: 0xf4c95d,
      transparent: true,
      opacity: 0.6,
    });
    const starField = new THREE.Points(starsGeo, starsMat);
    scene.add(starField);

    // Root Group for Avatar + Board
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);
    characterGroupRef.current = mainGroup;

    // Loaders
    const gltfLoader = new GLTFLoader();
    const fbxLoader = new FBXLoader();

    // Load Hoverboard GLB
    gltfLoader.load(
      "/hoverboard.glb",
      (gltf) => {
        const board = gltf.scene;
        board.scale.set(0.7, 0.7, 0.7);
        board.position.set(0, -0.85, 0);
        board.rotation.y = Math.PI / 2;
        mainGroup.add(board);
        hoverboardRef.current = board;
      },
      undefined,
      (err) => console.warn("Hoverboard load fallback:", err)
    );

    // Load 3D Character FBX & Animations
    fbxLoader.load(
      "/Action Adventure Pack/Ch44_nonPBR.fbx",
      (character) => {
        character.scale.set(0.009, 0.009, 0.009);
        character.position.set(0, -0.85, 0);

        character.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        mainGroup.add(character);

        // Animation Mixer
        const mixer = new THREE.AnimationMixer(character);
        mixerRef.current = mixer;

        // Load Idle Animation
        fbxLoader.load(
          "/Action Adventure Pack/idle.fbx",
          (animFbx) => {
            if (animFbx.animations.length > 0) {
              const action = mixer.clipAction(animFbx.animations[0]);
              actionsRef.current["IDLE"] = action;
              action.play();
              activeActionRef.current = action;
            }
          },
          undefined,
          () => {}
        );
      },
      undefined,
      (err) => console.warn("Character FBX load fallback:", err)
    );

    // Animation Loop
    const clock = new THREE.Clock();
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Update Animation Mixer
      if (mixerRef.current) {
        mixerRef.current.update(delta);
      }

      // Smooth Interpolation for 3D Position & Rotation
      if (characterGroupRef.current) {
        currentPos.current.x += (targetPos.current.x - currentPos.current.x) * 0.05;
        currentPos.current.y += (targetPos.current.y - currentPos.current.y) * 0.05;
        currentPos.current.z += (targetPos.current.z - currentPos.current.z) * 0.05;
        currentPos.current.rotY += (targetPos.current.rotY - currentPos.current.rotY) * 0.05;
        currentPos.current.rotZ += (targetPos.current.rotZ - currentPos.current.rotZ) * 0.05;

        // Floating hover sine wave motion
        const hoverY = Math.sin(time * 2.5) * 0.08;

        characterGroupRef.current.position.set(
          currentPos.current.x,
          currentPos.current.y + hoverY,
          currentPos.current.z
        );
        characterGroupRef.current.rotation.y = currentPos.current.rotY;
        characterGroupRef.current.rotation.z = currentPos.current.rotZ + Math.sin(time * 2) * 0.03;

        // Project 3D Avatar position to 2D Screen coordinates for Speech Bubble
        if (cameraRef.current && containerRef.current) {
          const wp = new THREE.Vector3();
          characterGroupRef.current.getWorldPosition(wp);
          wp.y += 0.8; // Position bubble slightly above head

          wp.project(cameraRef.current);
          const x = (wp.x * 0.5 + 0.5) * containerRef.current.clientWidth;
          const y = (-(wp.y * 0.5) + 0.5) * containerRef.current.clientHeight;

          setScreenPos({ x, y, visible: wp.z < 1 });
        }
      }

      // Rotate Starfield
      starField.rotation.y = time * 0.03;

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();

    // Window Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      if (rendererRef.current && rendererRef.current.domElement) {
        rendererRef.current.domElement.remove();
      }
    };
  }, []);

  // 2. Scroll Interruption & Section Positioning Logic
  useEffect(() => {
    const handleScroll = (e: Event) => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = scrollY / Math.max(1, docHeight);

      // Hero Section (0% - 20% scroll)
      if (scrollProgress < 0.2) {
        if (scrollLocked) {
          window.scrollTo(0, 0); // Lock scroll temporarily if requested by AI dialogue
        } else {
          targetPos.current = { x: 1.8, y: 0.1, z: 0, rotY: -0.3, rotZ: 0 };
        }
      }
      // ProfileCard Section (20% - 40%)
      else if (scrollProgress < 0.4) {
        targetPos.current = { x: -1.6, y: -0.1, z: 0.5, rotY: 0.4, rotZ: 0.05 };
      }
      // Projects Section (40% - 65%)
      else if (scrollProgress < 0.65) {
        targetPos.current = { x: 1.6, y: 0.3, z: 0, rotY: -0.4, rotZ: -0.05 };
      }
      // Skills & Experience (65% - 85%)
      else if (scrollProgress < 0.85) {
        targetPos.current = { x: -1.8, y: 0, z: 0.2, rotY: 0.3, rotZ: 0 };
      }
      // Moon & AI Chat Landing (85% - 100%)
      else {
        targetPos.current = { x: 0, y: -0.5, z: 1.0, rotY: 0, rotZ: 0 };
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: false });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrollLocked]);

  // 3. Handle Scroll-Lock Interruption Dialogue
  const triggerScrollAttempt = useCallback(async () => {
    if (window.scrollY > 50 && window.scrollY < 400 && scrollAttemptsRef.current < 3) {
      scrollAttemptsRef.current++;
      const decision = await getAvatarDecision({
        section: "hero",
        eventType: "SCROLL_TRY",
        idleTimeSec: scrollAttemptsRef.current,
        lang: "uz",
      });

      if (decision) {
        setSpeech({
          text: decision.speech,
          emotion: decision.emotion,
          bubbleStyle: decision.thoughtBubbleStyle || "CYBER_NEON",
          durationMs: decision.durationMs || 3500,
        });

        if (decision.scrollLockRequested) {
          setScrollLocked(true);
          setTimeout(() => {
            setScrollLocked(false);
          }, decision.durationMs || 3000);
        }

        // Animate 3D Position on Scroll Lock Interrupt
        if (decision.actionId === "SCROLL_LOCK_ANNOYED") {
          targetPos.current = { x: 0, y: 0, z: 1.2, rotY: 0, rotZ: 0.1 };
        } else if (decision.actionId === "SCROLL_LOCK_ARAZ") {
          targetPos.current = { x: 0, y: 0, z: 1.2, rotY: Math.PI, rotZ: 0 }; // Turn back
        } else if (decision.actionId === "SCROLL_LOCK_SARCASTIC") {
          targetPos.current = { x: 0, y: 0, z: 1.2, rotY: -0.2, rotZ: 0 }; // Sarcastic grin
        }
      }
    }
  }, []);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY > 0) {
        triggerScrollAttempt();
      }
    };

    window.addEventListener("wheel", handleWheel);
    return () => window.removeEventListener("wheel", handleWheel);
  }, [triggerScrollAttempt]);

  // 4. Mobile Double-Tap High Five Listener
  useEffect(() => {
    let lastTap = 0;
    const handleTouchStart = async () => {
      const now = Date.now();
      if (now - lastTap < 300) {
        // Double tap detected!
        const decision = await getAvatarDecision({
          section: "hero",
          device: "mobile",
          eventType: "DOUBLE_TAP",
          lang: "uz",
        });
        if (decision) {
          setSpeech({
            text: decision.speech,
            emotion: decision.emotion,
            bubbleStyle: "CYBER_NEON",
            durationMs: 3000,
          });
          targetPos.current = { x: 0, y: 0, z: 1.5, rotY: 0, rotZ: 0 };
        }
      }
      lastTap = now;
    };

    window.addEventListener("touchstart", handleTouchStart);
    return () => window.removeEventListener("touchstart", handleTouchStart);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
      {/* 3D Canvas Container */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Floating 2D Speech / Thought Bubble */}
      <AnimatePresence>
        {speech && screenPos.visible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            style={{
              position: "absolute",
              left: `${screenPos.x}px`,
              top: `${screenPos.y - 40}px`,
              transform: "translate(-50%, -100%)",
            }}
            className="pointer-events-auto max-w-xs md:max-w-sm"
          >
            <div className={`p-4 rounded-2xl border backdrop-blur-2xl shadow-[0_0_30px_rgba(244,201,93,0.3)] ${
              speech.bubbleStyle === "WARNING_ORANGE"
                ? "border-rose-500/50 bg-rose-950/90 text-rose-200"
                : "border-accent/50 bg-[#0c0c1b]/95 text-white"
            }`}>
              <div className="flex items-center gap-2 mb-1 border-b border-white/10 pb-1 font-mono text-[10px] text-accent font-bold uppercase">
                <ChatCircleDots size={14} className="animate-pulse" />
                <span>RUEBENSH AI AVATAR</span>
              </div>
              <p className="font-sans text-xs md:text-sm leading-relaxed font-medium">
                {speech.text}
              </p>
            </div>
            {/* Bubble Tail Arrow */}
            <div className="w-3 h-3 bg-[#0c0c1b] border-r border-b border-accent/50 rotate-45 mx-auto -mt-1.5 shadow-md" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
