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

const ANIMATION_FILES: Record<string, string> = {
  IDLE: "/Action Adventure Pack/idle (2).fbx",
  IDLE_ALT: "/Action Adventure Pack/idle.fbx",
  JUMP: "/Action Adventure Pack/jumping up.fbx",
  FALL: "/Action Adventure Pack/falling idle.fbx",
  LAND: "/Action Adventure Pack/hard landing.fbx",
  COVER_STAND: "/Action Adventure Pack/cover to stand.fbx",
  STAND_COVER: "/Action Adventure Pack/stand to cover.fbx",
  RUN: "/Action Adventure Pack/running.fbx",
  WALK: "/Action Adventure Pack/walking.fbx",
  SNEAK: "/Action Adventure Pack/crouched sneaking left.fbx",
};

export function SilverSurferAvatar() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Speech bubble state
  const [speech, setSpeech] = useState<SpeechState | null>({
    text: "Salom! Men sizning 3D Cyber-Surfer yo'lboshchingizman. Koinotga xush kelibsiz! 🚀",
    emotion: "FRIENDLY",
    bubbleStyle: "CYBER_NEON",
    durationMs: 4000,
  });

  const [screenPos, setScreenPos] = useState({ x: 0, y: 0, visible: false });
  const [scrollLocked, setScrollLocked] = useState(false);
  const scrollAttemptsRef = useRef(0);

  // Three.js references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const mainGroupRef = useRef<THREE.Group | null>(null);
  const characterMeshRef = useRef<THREE.Object3D | null>(null);
  const hoverboardMeshRef = useRef<THREE.Object3D | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const actionsRef = useRef<Record<string, THREE.AnimationAction>>({});
  const currentActionNameRef = useRef<string>("IDLE");

  // Interpolation targets for 3D positioning
  const targetPos = useRef({ x: 1.8, y: -0.2, z: 0, rotY: -0.3, rotZ: 0, tiltX: 0 });
  const currentPos = useRef({ x: 1.8, y: -0.2, z: 0, rotY: -0.3, rotZ: 0, tiltX: 0 });

  // Play / Crossfade Animation Helper
  const playAnimation = useCallback((name: string, duration = 0.3) => {
    if (!mixerRef.current || !actionsRef.current[name]) return;
    const newAction = actionsRef.current[name];
    const currentName = currentActionNameRef.current;

    if (currentName !== name && actionsRef.current[currentName]) {
      const oldAction = actionsRef.current[currentName];
      oldAction.fadeOut(duration);
      newAction.reset().fadeIn(duration).play();
      currentActionNameRef.current = name;
    } else if (!newAction.isRunning()) {
      newAction.reset().play();
    }
  }, []);

  // 1. Three.js Engine Setup & Multi-Animation Loader
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth || window.innerWidth;
    const height = containerRef.current.clientHeight || window.innerHeight;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0.8, 6.5); // Position camera at comfortable distance
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xf4c95d, 2.5); // Starlight Gold
    dirLight.position.set(5, 12, 8);
    scene.add(dirLight);

    const cyanRimLight = new THREE.PointLight(0x06b6d4, 4.0, 20); // Cosmic Cyan
    cyanRimLight.position.set(-5, 3, -2);
    scene.add(cyanRimLight);

    const purpleRimLight = new THREE.PointLight(0x7c3aed, 4.0, 20); // Nebula Violet
    purpleRimLight.position.set(5, -3, -2);
    scene.add(purpleRimLight);

    // Starfield Particle Dust
    const starsGeo = new THREE.BufferGeometry();
    const starsCount = 400;
    const posArray = new Float32Array(starsCount * 3);
    for (let i = 0; i < starsCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 25;
    }
    starsGeo.setAttribute("position", new THREE.BufferAttribute(posArray, 3));
    const starsMat = new THREE.PointsMaterial({
      size: 0.04,
      color: 0xf4c95d,
      transparent: true,
      opacity: 0.7,
    });
    const starField = new THREE.Points(starsGeo, starsMat);
    scene.add(starField);

    // Main Group for Avatar + Board
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);
    mainGroupRef.current = mainGroup;

    // Loaders
    const gltfLoader = new GLTFLoader();
    const fbxLoader = new FBXLoader();

    // Load Hoverboard GLB with proper scale
    gltfLoader.load(
      "/hoverboard.glb",
      (gltf) => {
        const board = gltf.scene;
        // Fix scale so board is sleek, not gigantic in foreground
        board.scale.set(0.12, 0.12, 0.12);
        board.position.set(0, -0.65, 0);
        board.rotation.y = Math.PI / 2;
        mainGroup.add(board);
        hoverboardMeshRef.current = board;
      },
      undefined,
      (err) => console.warn("Hoverboard load error:", err)
    );

    // Load Character Mesh FBX
    fbxLoader.load(
      "/Action Adventure Pack/Ch44_nonPBR.fbx",
      (character) => {
        character.scale.set(0.0075, 0.0075, 0.0075);
        character.position.set(0, -0.65, 0); // Align feet onto hoverboard

        character.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        mainGroup.add(character);
        characterMeshRef.current = character;

        // Animation Mixer
        const mixer = new THREE.AnimationMixer(character);
        mixerRef.current = mixer;

        // Load all animation clips into mixer
        Object.entries(ANIMATION_FILES).forEach(([key, filePath]) => {
          fbxLoader.load(
            filePath,
            (animFbx) => {
              if (animFbx.animations.length > 0 && mixerRef.current) {
                const clip = animFbx.animations[0];
                const action = mixerRef.current.clipAction(clip);
                actionsRef.current[key] = action;

                if (key === "IDLE") {
                  action.play();
                }
              }
            },
            undefined,
            () => {}
          );
        });
      },
      undefined,
      (err) => console.warn("Character FBX load error:", err)
    );

    // Render Loop
    const clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      if (mixerRef.current) {
        mixerRef.current.update(delta);
      }

      if (mainGroupRef.current) {
        // Interpolate position and angles
        currentPos.current.x += (targetPos.current.x - currentPos.current.x) * 0.06;
        currentPos.current.y += (targetPos.current.y - currentPos.current.y) * 0.06;
        currentPos.current.z += (targetPos.current.z - currentPos.current.z) * 0.06;
        currentPos.current.rotY += (targetPos.current.rotY - currentPos.current.rotY) * 0.06;
        currentPos.current.rotZ += (targetPos.current.rotZ - currentPos.current.rotZ) * 0.06;
        currentPos.current.tiltX += (targetPos.current.tiltX - currentPos.current.tiltX) * 0.06;

        // Floating hover sine wave
        const hoverY = Math.sin(time * 2.8) * 0.07;
        const boardTiltZ = Math.sin(time * 2.0) * 0.04;

        mainGroupRef.current.position.set(
          currentPos.current.x,
          currentPos.current.y + hoverY,
          currentPos.current.z
        );

        mainGroupRef.current.rotation.y = currentPos.current.rotY;
        mainGroupRef.current.rotation.z = currentPos.current.rotZ + boardTiltZ;
        mainGroupRef.current.rotation.x = currentPos.current.tiltX;

        // Project 3D Avatar coordinates to 2D Screen for Speech Bubble
        if (cameraRef.current && containerRef.current) {
          const wp = new THREE.Vector3();
          mainGroupRef.current.getWorldPosition(wp);
          wp.y += 0.95;

          wp.project(cameraRef.current);
          const x = (wp.x * 0.5 + 0.5) * containerRef.current.clientWidth;
          const y = (-(wp.y * 0.5) + 0.5) * containerRef.current.clientHeight;

          setScreenPos({ x, y, visible: wp.z < 1 });
        }
      }

      starField.rotation.y = time * 0.02;

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();

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
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      if (rendererRef.current && rendererRef.current.domElement) {
        rendererRef.current.domElement.remove();
      }
    };
  }, []);

  // 2. Scroll-Driven 3D Transformations & Section Behaviors
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = scrollY / Math.max(1, docHeight);

      // Hero Section (0% - 20%)
      if (scrollProgress < 0.2) {
        if (!scrollLocked) {
          targetPos.current = { x: 1.5, y: -0.2, z: 0, rotY: -0.3, rotZ: 0, tiltX: 0 };
          playAnimation("IDLE");
        }
      }
      // ProfileCard Section (20% - 40%) -> Max Zoom & "Wohoo!" Jump
      else if (scrollProgress < 0.4) {
        targetPos.current = { x: -1.2, y: -0.1, z: 0.8, rotY: 0.5, rotZ: 0.05, tiltX: -0.1 };
        if (scrollProgress > 0.28 && scrollProgress < 0.35) {
          playAnimation("JUMP");
          setSpeech({
            text: "Wohoo! 🎉 Jaloliddin Xalimov — ML Student at School 21 & Startup Founder!",
            emotion: "EXCITED",
            bubbleStyle: "CYBER_NEON",
            durationMs: 3000,
          });
        } else {
          playAnimation("COVER_STAND");
        }
      }
      // Projects Section (40% - 65%) -> Sit on Card & Hover
      else if (scrollProgress < 0.65) {
        targetPos.current = { x: 1.4, y: 0.2, z: 0.3, rotY: -0.4, rotZ: -0.05, tiltX: 0.05 };
        playAnimation("SNEAK"); // Crouched/sitting stance on hoverboard next to card
      }
      // Skills & Experience (65% - 85%) -> Walk/Fly along timeline
      else if (scrollProgress < 0.85) {
        targetPos.current = { x: -1.4, y: -0.1, z: 0.1, rotY: 0.3, rotZ: 0, tiltX: 0 };
        playAnimation("WALK");
      }
      // Moon & AI Chat Landing (85% - 100%) -> Landing on Moon & Scared Shift
      else {
        targetPos.current = { x: 0, y: -0.6, z: 1.2, rotY: 0, rotZ: 0, tiltX: -0.15 };
        playAnimation("LAND");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrollLocked, playAnimation]);

  // 3. Handle Scroll-Lock Interruption Dialogue
  const triggerScrollAttempt = useCallback(async () => {
    if (window.scrollY > 40 && window.scrollY < 400 && scrollAttemptsRef.current < 3) {
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

        // Animate 3D Position & Actions on Scroll Lock Interrupt
        if (decision.actionId === "SCROLL_LOCK_ANNOYED") {
          targetPos.current = { x: 0, y: -0.1, z: 1.4, rotY: 0, rotZ: 0.1, tiltX: -0.1 };
          playAnimation("STAND_COVER");
        } else if (decision.actionId === "SCROLL_LOCK_ARAZ") {
          targetPos.current = { x: 0, y: -0.1, z: 1.4, rotY: Math.PI, rotZ: 0, tiltX: 0 }; // Turn back
          playAnimation("SNEAK");
        } else if (decision.actionId === "SCROLL_LOCK_SARCASTIC") {
          targetPos.current = { x: 0, y: -0.1, z: 1.4, rotY: -0.3, rotZ: 0, tiltX: 0 }; // Sarcastic smile
          playAnimation("COVER_STAND");
        }
      }
    }
  }, [playAnimation]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY > 0) {
        triggerScrollAttempt();
      }
    };

    window.addEventListener("wheel", handleWheel);
    return () => window.removeEventListener("wheel", handleWheel);
  }, [triggerScrollAttempt]);

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
              top: `${screenPos.y - 50}px`,
              transform: "translate(-50%, -100%)",
            }}
            className="pointer-events-auto max-w-xs md:max-w-sm"
          >
            <div className={`p-4 rounded-2xl border backdrop-blur-2xl shadow-[0_0_30px_rgba(244,201,93,0.35)] ${
              speech.bubbleStyle === "WARNING_ORANGE"
                ? "border-rose-500/60 bg-rose-950/95 text-rose-200"
                : "border-accent/60 bg-[#0c0c1b]/95 text-white"
            }`}>
              <div className="flex items-center gap-2 mb-1 border-b border-white/10 pb-1 font-mono text-[10px] text-accent font-bold uppercase tracking-wider">
                <ChatCircleDots size={14} className="animate-pulse" />
                <span>RUEBENSH 3D AI AVATAR</span>
              </div>
              <p className="font-sans text-xs md:text-sm leading-relaxed font-medium">
                {speech.text}
              </p>
            </div>
            {/* Bubble Tail Arrow */}
            <div className="w-3 h-3 bg-[#0c0c1b] border-r border-b border-accent/60 rotate-45 mx-auto -mt-1.5 shadow-md" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
