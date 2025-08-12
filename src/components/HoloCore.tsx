import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const RadialWaveform: React.FC<{ amplitude: number }> = ({ amplitude }) => {
  const meshRef = useRef<THREE.Points>(null);

  useFrame(() => {
    if (meshRef.current) {
      const positions = meshRef.current.geometry.attributes.position.array as Float32Array;
      const count = meshRef.current.geometry.attributes.position.count;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const baseRadius = 1.5;
        const wave = Math.sin(angle * 32 + Date.now() * 0.002) * amplitude * 0.8;
        positions[i * 3] = (baseRadius + wave) * Math.cos(angle);
        positions[i * 3 + 1] = (baseRadius + wave) * Math.sin(angle);
      }
      meshRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  const segments = 1024;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(segments * 3);
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    positions[i * 3] = Math.cos(angle) * 1.5;
    positions[i * 3 + 1] = Math.sin(angle) * 1.5;
    positions[i * 3 + 2] = 0;
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  return (
    <points ref={meshRef} geometry={geometry}>
      <pointsMaterial color={0x00ffff} size={0.05} sizeAttenuation />
    </points>
  );
};

const OuterRings: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const [rings, setRings] = useState<{ mesh: THREE.Mesh; radius: number; opacity: number }[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const geometry = new THREE.RingGeometry(1.6, 1.62, 64);
      const material = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(geometry, material);
      if (groupRef.current) {
        groupRef.current.add(mesh);
      }
      setRings((prev) => [...prev, { mesh, radius: 1.6, opacity: 0.6 }]);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  useFrame(() => {
    setRings((prev) =>
      prev
        .map((ring) => {
          ring.radius += 0.02;
          ring.opacity -= 0.01;
          (ring.mesh.material as THREE.MeshBasicMaterial).opacity = ring.opacity;
          ring.mesh.geometry = new THREE.RingGeometry(ring.radius, ring.radius + 0.02, 64);
          return ring;
        })
        .filter((ring) => ring.opacity > 0)
    );
  });

  return <group ref={groupRef}></group>;
};

const CentralCore: React.FC<{ amplitude: number }> = ({ amplitude }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (meshRef.current) {
      const scale = 0.4 + amplitude * 0.8;
      meshRef.current.scale.set(scale, scale, scale);
      const colorIntensity = 0.5 + amplitude * 1.5;
      (meshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = colorIntensity;
    }
  });
  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial
        color={0x00ffff}
        emissive={0x00ffff}
        emissiveIntensity={1}
        transparent
        opacity={0.9}
      />
    </mesh>
  );
};

const ParticleAura: React.FC<{ amplitude: number }> = ({ amplitude }) => {
  const groupRef = useRef<THREE.Points>(null);
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.002;
      const positions = groupRef.current.geometry.attributes.position.array as Float32Array;
      const count = groupRef.current.geometry.attributes.position.count;
      for (let i = 0; i < count; i++) {
        const idx = i * 3;
        const distance = Math.sqrt(
          positions[idx] * positions[idx] +
          positions[idx + 1] * positions[idx + 1] +
          positions[idx + 2] * positions[idx + 2]
        );
        const factor = 0.02 + amplitude * 0.05;
        positions[idx] += (Math.random() - 0.5) * factor;
        positions[idx + 1] += (Math.random() - 0.5) * factor;
        positions[idx + 2] += (Math.random() - 0.5) * factor;
        const scale = 1.5 / distance;
        positions[idx] *= scale;
        positions[idx + 1] *= scale;
        positions[idx + 2] *= scale;
      }
      groupRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });
  const particles = 300;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particles * 3);
  for (let i = 0; i < particles; i++) {
    const phi = Math.acos(2 * Math.random() - 1);
    const theta = 2 * Math.PI * Math.random();
    const radius = 1.8 + Math.random() * 0.2;
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  return (
    <points ref={groupRef} geometry={geometry}>
      <pointsMaterial color={0x00ffff} size={0.03} opacity={0.6} transparent />
    </points>
  );
};

const HoloCore: React.FC = () => {
  const [amplitude, setAmplitude] = useState(0.5);
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws/voice');
    ws.onopen = () => console.log('[WebSocket] Connected to J.A.R.V.I.S voice events');
    ws.onmessage = (event) => {
      if (event.data === 'jarvis-speak-start' || event.data === 'user-speak-start') {
        setAmplitude(1.0);
      } else if (event.data === 'jarvis-speak-stop' || event.data === 'user-speak-stop') {
        setAmplitude(0.3);
      }
    };
    ws.onclose = () => console.log('[WebSocket] Disconnected from J.A.R.V.I.S voice events');
    return () => ws.close();
  }, []);
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        background: 'radial-gradient(ellipse at center, #00131a 60%, #000 100%)',
      }}
    >
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <ambientLight intensity={0.8} />
        <pointLight position={[2, 2, 2]} intensity={1} />
        <OuterRings />
        <RadialWaveform amplitude={amplitude} />
        <CentralCore amplitude={amplitude} />
        <ParticleAura amplitude={amplitude} />
      </Canvas>
    </div>
  );
};

export default HoloCore; 