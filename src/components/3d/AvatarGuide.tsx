"use client";

import React, { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, useFBX, useAnimations, Environment, Float, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { useTourGuide } from "@/context/TourGuideContext";
import { AnimatePresence, motion } from "framer-motion";

// Helper component for loading and animating the avatar
function AvatarModel() {
  const group = useRef<THREE.Group>(null);
  const { activeTarget } = useTourGuide();

  // Load models
  const { scene: avatarScene, animations: avatarAnimations } = useGLTF("/avatar.glb");
  const { scene: hoverboardScene } = useGLTF("/hoverboard.glb");
  
  // Load animations (FBX files in public/fbx)
  const idleAnim = useFBX("/fbx/Sitting.fbx"); // Or idle if we had it, fallback to sitting for now
  const flyAnim = useFBX("/fbx/Sitting.fbx"); // Using sitting as placeholder for flying if no fly is available
  const talkAnim = useFBX("/fbx/Talking.fbx");
  
  // Rename animations so we can easily call them
  if (idleAnim.animations.length) idleAnim.animations[0].name = "Idle";
  if (flyAnim.animations.length) flyAnim.animations[0].name = "Flying";
  if (talkAnim.animations.length) talkAnim.animations[0].name = "Talking";

  const { actions } = useAnimations(
    [...(idleAnim.animations || []), ...(flyAnim.animations || []), ...(talkAnim.animations || [])], 
    group
  );

  const [currentAction, setCurrentAction] = useState("Flying");

  useEffect(() => {
    // Basic animation blending
    if (actions[currentAction]) {
      actions[currentAction]?.reset().fadeIn(0.5).play();
      return () => {
        actions[currentAction]?.fadeOut(0.5);
      };
    }
  }, [currentAction, actions]);

  // Movement Logic
  useFrame((state, delta) => {
    if (!group.current) return;
    
    // We will calculate target position based on DOM elements later.
    // For now, if there is a target, we move towards it in 3D space.
    if (activeTarget) {
      // Map DOM coordinates (activeTarget.x, activeTarget.y) to 3D space.
      // This requires projecting the DOM coords to viewport coords.
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const targetX = (activeTarget.x / viewportWidth) * 2 - 1;
      const targetY = -(activeTarget.y / viewportHeight) * 2 + 1;
      
      // Extremely simplified movement for now
      const targetPos = new THREE.Vector3(targetX * 5, targetY * 5, 0);
      group.current.position.lerp(targetPos, 0.05);

      if (group.current.position.distanceTo(targetPos) < 1) {
        if (currentAction !== "Idle") setCurrentAction("Idle");
      } else {
        if (currentAction !== "Flying") setCurrentAction("Flying");
      }
    }
  });

  return (
    <group ref={group} dispose={null}>
      {/* Avatar */}
      <primitive object={avatarScene} scale={1.5} position={[0, 0.5, 0]} />
      {/* Hoverboard underneath */}
      <primitive object={hoverboardScene} scale={0.5} position={[0, 0, 0]} />
    </group>
  );
}

// Preload assets
useGLTF.preload("/avatar.glb");
useGLTF.preload("/hoverboard.glb");

export default function AvatarGuide() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 50 }}
        style={{ width: "100%", height: "100%" }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Environment preset="city" />
        
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
          <AvatarModel />
        </Float>
        
        <ContactShadows position={[0, -2, 0]} opacity={0.5} scale={10} blur={2} />
      </Canvas>
    </div>
  );
}
