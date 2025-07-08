import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useJarvis } from '../../context/JarvisContext';
import { Eye, Mic, Shield, Lock, Zap } from 'lucide-react';

export const AuthenticationScreen: React.FC = () => {
  const { authenticate } = useJarvis();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authMethod, setAuthMethod] = useState<'face' | 'voice' | null>(null);

  const handleAuthenticate = async (method: 'face' | 'voice') => {
    setIsAuthenticating(true);
    setAuthMethod(method);
    
    try {
      const success = await authenticate(method);
      if (!success) {
        alert('Authentication failed. Please try again.');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      alert('Authentication error. Please try again.');
    } finally {
      setIsAuthenticating(false);
      setAuthMethod(null);
    }
  };

  return (
    <div className="relative w-full h-screen bg-black flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-black to-cyan-900 opacity-50" />
      
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      {/* Authentication Panel */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 bg-gray-900 bg-opacity-80 backdrop-blur-xl rounded-3xl border border-cyan-500 border-opacity-30 p-8 max-w-md w-full mx-4"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/50"
          >
            <Zap className="w-10 h-10 text-white" />
          </motion.div>
          
          <h1 className="text-3xl font-bold text-cyan-400 mb-2">J.A.R.V.I.S</h1>
          <p className="text-cyan-300 text-sm">Biometric Authentication Required</p>
        </div>

        {!isAuthenticating ? (
          <div className="space-y-4">
            <motion.button
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              onClick={() => handleAuthenticate('face')}
              className="w-full p-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium flex items-center justify-center space-x-3 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Eye className="w-5 h-5" />
              <span>Face Recognition</span>
            </motion.button>

            <motion.button
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              onClick={() => handleAuthenticate('voice')}
              className="w-full p-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium flex items-center justify-center space-x-3 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Mic className="w-5 h-5" />
              <span>Voice Recognition</span>
            </motion.button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-cyan-500 border-t-transparent"
            />
            <p className="text-cyan-300">
              {authMethod === 'face' ? 'Scanning facial features...' : 'Analyzing voice pattern...'}
            </p>
          </motion.div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-700">
          <div className="flex items-center justify-center space-x-2 text-gray-400 text-sm">
            <Shield className="w-4 h-4" />
            <span>Secured by quantum encryption</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};