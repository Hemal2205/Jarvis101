import React, { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { MemoryVaultPanel, TaskBoardPanel, LearningDashboardPanel } from './VRPanels';

interface VRWorkspaceProps {
  isActive: boolean;
  onClose?: () => void;
}

export const VRWorkspace: React.FC<VRWorkspaceProps> = ({ isActive, onClose }) => {
  // Fallback for non-WebGL environments
  const isWebGLAvailable = () => {
    try {
      const canvas = document.createElement('canvas');
      return !!window.WebGLRenderingContext && !!canvas.getContext('webgl');
    } catch (e) {
      return false;
    }
  };

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gray-900 border border-cyan-500/30 rounded-2xl w-full max-w-7xl h-full max-h-[95vh] overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between p-4 border-b border-cyan-500/30">
          <div className="flex items-center space-x-3">
            <span className="text-2xl font-bold text-cyan-400">VR/AR Workspace</span>
            <span className="text-gray-400 text-sm">Immersive 3D learning & productivity</span>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors">
            ✕
          </button>
        </div>
        <div className="flex-1 relative bg-black">
          {isWebGLAvailable() ? (
            <Canvas camera={{ position: [0, 2, 8], fov: 60 }} shadows>
              <ambientLight intensity={0.7} />
              <directionalLight position={[5, 10, 7]} intensity={1.2} castShadow />
              <Suspense fallback={<Html center><div className="text-white">Loading 3D scene...</div></Html>}>
                {/* Memory Vault Panel */}
                <MemoryVaultPanel position={[-3, 1, 0]} />
                {/* Task Board Panel */}
                <TaskBoardPanel position={[0, 1, -2]} />
                {/* Learning Dashboard Panel */}
                <LearningDashboardPanel position={[3, 1, 0]} />
              </Suspense>
              <OrbitControls enablePan enableZoom enableRotate />
            </Canvas>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-white">
              <div className="text-2xl mb-4">WebGL Not Supported</div>
              <div className="text-gray-400">Your browser or device does not support 3D/VR features.</div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// VRPanels.tsx should export MemoryVaultPanel, TaskBoardPanel, LearningDashboardPanel as simple 3D panels with mock data. 