import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import { useJarvis } from '../context/JarvisContext';
import { HUD } from './HUD/HUD';
import { Scene3D } from './3D/Scene3D';
import { AuthenticationScreen } from './Authentication/AuthenticationScreen';
import { MemoryVault } from './MemoryVault/MemoryVault';
import { CopyEngine } from './CopyEngine/CopyEngine';
import { EvolutionPanel } from './Evolution/EvolutionPanel';
import { StealthOverlay } from './Stealth/StealthOverlay';
import EnhancedStealthOverlay from './Stealth/EnhancedStealthOverlay';
import { StatusBar } from './StatusBar/StatusBar';
import SystemAutomation from './SystemAutomation/SystemAutomation';

export const JarvisSystem: React.FC = () => {
  const { state } = useJarvis();
  const [showMemoryVault, setShowMemoryVault] = useState(false);
  const [showCopyEngine, setShowCopyEngine] = useState(false);
  const [showEvolution, setShowEvolution] = useState(false);
  const [showSystemAutomation, setShowSystemAutomation] = useState(false);

  useEffect(() => {
    // Initialize system startup sequence
    const startupSequence = async () => {
      console.log('J.A.R.V.I.S System initializing...');
      
      // Add startup sound effect (optional)
      try {
        const audio = new Audio('/startup.mp3');
        audio.volume = 0.3;
        audio.play().catch(() => {
          // Ignore audio errors (user interaction required)
        });
      } catch (error) {
        // Ignore audio errors
      }
    };

    startupSequence();
  }, []);

  if (!state.isAuthenticated) {
    return <AuthenticationScreen />;
  }

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* 3D Background Scene */}
      <div className="absolute inset-0 z-0">
        <Canvas
          camera={{ position: [0, 0, 5], fov: 75 }}
          style={{ background: 'radial-gradient(circle at center, #001122 0%, #000000 100%)' }}
        >
          <Scene3D />
        </Canvas>
      </div>

      {/* Status Bar */}
      <StatusBar />

      {/* Main HUD Interface */}
      <HUD 
        onOpenMemoryVault={() => setShowMemoryVault(true)}
        onOpenCopyEngine={() => setShowCopyEngine(true)}
        onOpenEvolution={() => setShowEvolution(true)}
        onOpenSystemAutomation={() => setShowSystemAutomation(true)}
      />

      {/* Enhanced Stealth Overlay for Interview/Exam/Copilot Modes */}
      {(state.mode === 'stealth-interview' || state.mode === 'stealth-exam' || state.mode === 'passive-copilot') && (
        <EnhancedStealthOverlay 
          mode={state.mode as 'stealth-exam' | 'stealth-interview' | 'passive-copilot'} 
          isActive={true}
        />
      )}
      
      {/* Fallback Stealth Overlay */}
      {(state.mode === 'stealth-interview' || state.mode === 'stealth-exam') && (
        <StealthOverlay mode={state.mode} />
      )}

      {/* Memory Vault Modal */}
      <AnimatePresence>
        {showMemoryVault && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center p-4"
          >
            <MemoryVault onClose={() => setShowMemoryVault(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Copy Engine Modal */}
      <AnimatePresence>
        {showCopyEngine && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center p-4"
          >
            <CopyEngine onClose={() => setShowCopyEngine(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Evolution Panel Modal */}
      <AnimatePresence>
        {showEvolution && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center p-4"
          >
            <EvolutionPanel onClose={() => setShowEvolution(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* System Automation Modal */}
      <AnimatePresence>
        {showSystemAutomation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-6xl h-5/6 relative"
            >
              <button
                onClick={() => setShowSystemAutomation(false)}
                className="absolute top-4 right-4 z-10 p-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded hover:bg-red-500/30 transition-colors"
              >
                ✕
              </button>
              <SystemAutomation isActive={showSystemAutomation} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emergency Kill Switch Overlay */}
      {state.mode === 'emergency' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-60 bg-red-900 bg-opacity-90 flex items-center justify-center"
        >
          <div className="text-center">
            <h1 className="text-6xl font-bold text-red-400 mb-4">EMERGENCY MODE</h1>
            <p className="text-2xl text-red-300">System is shutting down...</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};