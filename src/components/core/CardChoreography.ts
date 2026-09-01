export interface TransformState {
  x: number;
  y: number;
  z: number;
  rx: number;
  ry: number;
  rz: number;
  angle: number;
  scale: number;
}

export interface ChoreoKeyframe {
  progress: number;
  opacity: number;
  transform: TransformState;
}

export interface ChoreoTimeline {
  id: string;
  keyframes: ChoreoKeyframe[];
}

export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

export function interpolateKeyframes(keyframes: ChoreoKeyframe[], progress: number): { opacity: number; transformString: string } {
  if (keyframes.length === 0) {
    return { opacity: 0, transformString: "translate3d(0,0,0) scale(1)" };
  }
  
  if (keyframes.length === 1 || progress <= keyframes[0].progress) {
    return formatState(keyframes[0]);
  }
  
  if (progress >= keyframes[keyframes.length - 1].progress) {
    return formatState(keyframes[keyframes.length - 1]);
  }
  
  // Find the segment
  let startIndex = 0;
  for (let i = 0; i < keyframes.length - 1; i++) {
    if (progress >= keyframes[i].progress && progress <= keyframes[i+1].progress) {
      startIndex = i;
      break;
    }
  }
  
  const k1 = keyframes[startIndex];
  const k2 = keyframes[startIndex + 1];
  
  const segmentProgress = (progress - k1.progress) / (k2.progress - k1.progress);
  const t = easeInOutCubic(Math.max(0, Math.min(1, segmentProgress)));
  
  const opacity = lerp(k1.opacity, k2.opacity, t);
  const transform: TransformState = {
    x: lerp(k1.transform.x, k2.transform.x, t),
    y: lerp(k1.transform.y, k2.transform.y, t),
    z: lerp(k1.transform.z, k2.transform.z, t),
    rx: lerp(k1.transform.rx, k2.transform.rx, t),
    ry: lerp(k1.transform.ry, k2.transform.ry, t),
    rz: lerp(k1.transform.rz, k2.transform.rz, t),
    angle: lerp(k1.transform.angle, k2.transform.angle, t),
    scale: lerp(k1.transform.scale, k2.transform.scale, t),
  };
  
  return {
    opacity,
    transformString: `translate3d(${transform.x}px, ${transform.y}px, ${transform.z}px) rotate3d(${transform.rx}, ${transform.ry}, ${transform.rz}, ${transform.angle}deg) scale(${transform.scale})`
  };
}

function formatState(k: ChoreoKeyframe) {
  const t = k.transform;
  return {
    opacity: k.opacity,
    transformString: `translate3d(${t.x}px, ${t.y}px, ${t.z}px) rotate3d(${t.rx}, ${t.ry}, ${t.rz}, ${t.angle}deg) scale(${t.scale})`
  };
}

// Ease functions for smoother motion
export const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
export const easeOutExpo = (t: number) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
