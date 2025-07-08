import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

const ParticleField: React.FC = () => {
  const ref = useRef<THREE.Points>(null);
  
  // Generate random positions for particles
  const particleCount = 1000;
  const positions = new Float32Array(particleCount * 3);
  
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
  }

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.elapsedTime * 0.05;
      ref.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#00ffff"
        size={0.02}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.6}
      />
    </Points>
  );
};

const HolographicGrid: React.FC = () => {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
      ref.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <group ref={ref}>
      <mesh position={[0, 0, -5]}>
        <planeGeometry args={[20, 20, 50, 50]} />
        <meshBasicMaterial 
          color="#00ffff"
          transparent
          opacity={0.1}
          wireframe
        />
      </mesh>
    </group>
  );
};

const EnergyCore: React.FC = () => {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x += 0.01;
      ref.current.rotation.y += 0.02;
      ref.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.1);
    }
  });

  return (
    <mesh ref={ref} position={[0, 0, -2]}>
      <icosahedronGeometry args={[0.5, 1]} />
      <meshBasicMaterial 
        color="#00ffff"
        transparent
        opacity={0.3}
        wireframe
      />
    </mesh>
  );
};

export const Scene3D: React.FC = () => {
  return (
    <>
      <ambientLight intensity={0.1} />
      <pointLight position={[10, 10, 10]} intensity={0.5} color="#00ffff" />
      
      <ParticleField />
      <HolographicGrid />
      <EnergyCore />
    </>
  );
};