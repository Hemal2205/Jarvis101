import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useJarvis } from '../../context/JarvisContext';
import { Eye, Mic, User, Camera, MicIcon, Check, X, Loader } from 'lucide-react';

interface RegistrationStep {
  id: string;
  name: string;
  icon: React.ReactNode;
  completed: boolean;
  active: boolean;
}

interface AuthenticationScreenProps {
  onAuthenticated?: () => void;
}

export const AuthenticationScreen: React.FC<AuthenticationScreenProps> = ({ onAuthenticated }) => {
  const { authenticate, login } = useJarvis();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authMethod, setAuthMethod] = useState<'face' | 'voice' | null>(null);
  const [registrationStep, setRegistrationStep] = useState<'username' | 'face' | 'voice' | 'complete'>('username');
  const [username, setUsername] = useState('');
  const [faceSamples, setFaceSamples] = useState<number>(0);
  const [voiceSamples, setVoiceSamples] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isVoiceAuthRecording, setIsVoiceAuthRecording] = useState(false);
  const [voiceAuthChunks, setVoiceAuthChunks] = useState<BlobPart[]>([]);

  const registrationSteps: RegistrationStep[] = [
    {
      id: 'username',
      name: 'Username',
      icon: <User className="w-5 h-5" />,
      completed: registrationStep !== 'username',
      active: registrationStep === 'username'
    },
    {
      id: 'face',
      name: 'Face Recognition',
      icon: <Camera className="w-5 h-5" />,
      completed: registrationStep === 'voice' || registrationStep === 'complete',
      active: registrationStep === 'face'
    },
    {
      id: 'voice',
      name: 'Voice Recognition',
      icon: <MicIcon className="w-5 h-5" />,
      completed: registrationStep === 'complete',
      active: registrationStep === 'voice'
    }
  ];

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      }
    };
  }, [stream]);

  const handleAuthenticate = async (method: 'face' | 'voice') => {
    // Check if username is set before attempting biometric authentication
    if (!username.trim()) {
      setError('Please enter your username first before using biometric authentication');
      return;
    }

    setIsAuthenticating(true);
    setAuthMethod(method);
    setError(null);
    
    try {
      let result;
      
      if (method === 'face') {
        const imageData = await captureImage();
        if (!imageData) {
          setError('Failed to capture image');
          setIsAuthenticating(false);
          setAuthMethod(null);
          return;
        }
        result = await authenticateWithFace(imageData);
        if (result && result.success) {
          setSuccess('Login successful!');
          // Log in the user
          await login(username);
          onAuthenticated?.();
        }
      } else if (method === 'voice') {
        // Start voice authentication recording
        await startVoiceAuthRecording();
        return; // The rest is handled after recording
      } else {
        result = await authenticate(method);
      }
      
      if (!result || !result.success) {
        setError(result?.message || 'Authentication failed. Please try again.');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setError('Authentication error. Please try again.');
    } finally {
      if (method !== 'voice') {
        setIsAuthenticating(false);
        setAuthMethod(null);
      }
    }
  };

  const startRegistration = async () => {
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    try {
      const response = await fetch('/api/register/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });

      const result = await response.json();
      
      if (result.success) {
        setRegistrationStep('face');
        setSuccess('Registration started successfully');
        await initializeCamera();
      } else {
        setError(result.message || 'Registration failed');
      }
    } catch {
      console.error('Registration error:', error);
      setError('Registration failed. Please try again.');
    }
  };

  const initializeCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 },
        audio: false
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch {
      console.error('Camera initialization error:', error);
      setError('Failed to access camera');
    }
  };

  const captureImage = async (): Promise<Blob | null> => {
    if (!videoRef.current || !canvasRef.current) return null;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    return new Promise((resolve: (value: Blob | null) => void) => {
      canvas.toBlob((blob: Blob | null) => {
        resolve(blob);
      }, 'image/jpeg', 0.8);
    });
  };

  const registerFaceSample = async () => {
    try {
      const imageBlob = await captureImage();
      if (!imageBlob) {
        setError('Failed to capture image');
        return;
      }

      const formData = new FormData();
      formData.append('image', imageBlob);
      formData.append('username', username); // Ensure username is sent

      const response = await fetch('/api/register/face', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (result.success) {
        setFaceSamples(prev => prev + 1);
        setSuccess(result.message);
        
        if (result.next_step === 'voice_enrollment') {
          setRegistrationStep('voice');
          await initializeMicrophone();
        }
      } else {
        setError(result.message || 'Face registration failed');
      }
    } catch {
      console.error('Face registration error:', error);
      setError('Face registration failed. Please try again.');
    }
  };

  // Utility: Safe MediaRecorder creation with fallback
  function createSafeMediaRecorder(stream: MediaStream): MediaRecorder | null {
    const mimeTypes = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/wav',
      '' // fallback to default
    ];
    for (const mimeType of mimeTypes) {
      try {
        if (mimeType && !MediaRecorder.isTypeSupported(mimeType)) continue;
        return mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      } catch (e) {
        // Try next
      }
    }
    return null;
  }

  const initializeMicrophone = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: false,
        audio: true
      });
      setStream(mediaStream);
      // SAFER: Use safe MediaRecorder creation
      const mediaRecorder = createSafeMediaRecorder(mediaStream);
      if (!mediaRecorder) throw new Error('MediaRecorder not supported for this browser/codec.');
      mediaRecorderRef.current = mediaRecorder;
    } catch (error) {
      console.error('Microphone initialization error:', error);
      setError('Failed to access microphone or MediaRecorder not supported.');
    }
  };

  const startVoiceRecording = async () => {
    if (!mediaRecorderRef.current) {
      console.log('MediaRecorder not initialized, initializing microphone...');
      await initializeMicrophone();
      if (!mediaRecorderRef.current) {
        setError('Failed to initialize microphone or MediaRecorder.');
        return;
      }
    }
    const chunks: BlobPart[] = [];
    mediaRecorderRef.current.ondataavailable = (event: BlobEvent) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };
    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(chunks, { type: 'audio/webm' }); // webm is most widely supported
      console.log('Recording stopped, uploading audio sample...');
      await registerVoiceSample(audioBlob);
    };
    try {
      mediaRecorderRef.current.start();
      setIsRecording(true);
      console.log('Recording started');
    } catch (error) {
      setError('Failed to start recording. MediaRecorder not supported or already started.');
      console.error('MediaRecorder start error:', error);
      return;
    }
    setTimeout(() => {
      if (mediaRecorderRef.current && isRecording) {
        console.log('Auto-stopping recording after 3 seconds');
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
    }, 3000);
  };

  // Patch: Add logging to registerVoiceSample
  const registerVoiceSample = async (audioBlob: Blob) => {
    try {
      console.log('Uploading voice sample...');
      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('username', username); // Ensure username is sent

      const response = await fetch('/api/register/voice', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      console.log('Voice sample upload result:', result);
      if (result.success) {
        setVoiceSamples((prev: number) => prev + 1);
        setSuccess(result.message);
        if (result.next_step === 'complete_registration') {
          await completeRegistration();
        }
      } else {
        setError(result.message || 'Voice registration failed');
      }
    } catch (error) {
      console.error('Voice registration error:', error);
      setError('Voice registration failed. Please try again.');
    }
  };

  const completeRegistration = async () => {
    try {
      const response = await fetch('/api/register/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setRegistrationStep('complete');
        setSuccess('Registration completed successfully! You can now log in.');
        
        // Automatically log in the user after successful registration
        await login(username);
        
        onAuthenticated?.();
        
        // Clean up streams
        if (stream) {
          stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
          setStream(null);
        }
        
        // Auto-switch to login after 3 seconds
        setTimeout(() => {
          setMode('login');
          setRegistrationStep('username');
          setFaceSamples(0);
          setVoiceSamples(0);
        }, 3000);
      } else {
        setError(result.message || 'Registration completion failed');
      }
    } catch (error) {
      console.error('Registration completion error:', error);
      setError('Registration completion failed. Please try again.');
    }
  };

  const authenticateWithFace = async (imageBlob: Blob) => {
    const formData = new FormData();
    formData.append('image', imageBlob);
    formData.append('username', username); // Add username parameter

    const response = await fetch('/api/authenticate/face', {
      method: 'POST',
      body: formData
    });

    return await response.json();
  };

  // Voice authentication recording logic
  const startVoiceAuthRecording = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      const recorder = createSafeMediaRecorder(mediaStream);
      if (!recorder) throw new Error('MediaRecorder not supported for this browser/codec.');
      setVoiceAuthChunks([]);
      setIsVoiceAuthRecording(true);
      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          setVoiceAuthChunks((prev: BlobPart[]) => [...prev, event.data]);
        }
      };
      recorder.onstop = async () => {
        setIsVoiceAuthRecording(false);
        const audioBlob = new Blob(voiceAuthChunks, { type: 'audio/webm' });
        await authenticateWithVoice(audioBlob);
        // Clean up
        mediaStream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
        setVoiceAuthChunks([]);
      };
      try {
        recorder.start();
      } catch (error) {
        setError('Failed to start voice authentication recording. MediaRecorder not supported or already started.');
        setIsVoiceAuthRecording(false);
        return;
      }
      setTimeout(() => {
        if (recorder.state === 'recording') {
          recorder.stop();
        }
      }, 3000);
    } catch (error) {
      setError('Failed to access microphone or MediaRecorder not supported for voice authentication.');
      setIsAuthenticating(false);
      setAuthMethod(null);
    }
  };

  const authenticateWithVoice = async (audioBlob: Blob) => {
    setIsAuthenticating(true);
    setAuthMethod('voice');
    setError(null);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('username', username); // Add username parameter
      const response = await fetch('/api/authenticate/voice', {
        method: 'POST',
        body: formData
      });
      const result = await response.json();
      if (result.success) {
        setSuccess('Voice authentication successful!');
        // Log in the user on successful voice authentication
        await login(username);
        onAuthenticated?.();
      } else {
        setError(result.message || 'Voice authentication failed.');
      }
    } catch (error) {
      setError('Voice authentication error. Please try again.');
    } finally {
      setIsAuthenticating(false);
      setAuthMethod(null);
    }
  };

  const renderLoginMode = () => (
    <div className="flex flex-col items-center space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-cyan-300 mb-4">J.A.R.V.I.S</h1>
        <p className="text-xl text-gray-300">Just A Rather Very Intelligent System</p>
        <p className="text-sm text-gray-400 mt-2">Please authenticate to continue</p>
      </motion.div>

      {/* Quick Login with Username */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-4"
      >
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="flex-1 px-4 py-2 bg-gray-800/50 border border-cyan-500/30 rounded-lg text-cyan-300 placeholder-gray-400 focus:outline-none focus:border-cyan-400"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={async () => {
              if (username.trim()) {
                await login(username);
                onAuthenticated?.();
              } else {
                setError('Please enter a username');
              }
            }}
            className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium hover:from-cyan-600 hover:to-blue-600 transition-all"
          >
            Quick Login
          </motion.button>
        </div>
      </motion.div>

      <div className="flex items-center space-x-4">
        <div className="flex-1 h-px bg-gray-600"></div>
        <span className="text-gray-400 text-sm">OR</span>
        <div className="flex-1 h-px bg-gray-600"></div>
      </div>

      <div className="flex space-x-8">
        <motion.button
          whileHover={{ scale: username.trim() ? 1.05 : 1, boxShadow: username.trim() ? "0 0 20px rgba(0, 255, 255, 0.3)" : "none" }}
          whileTap={{ scale: username.trim() ? 0.95 : 1 }}
          onClick={() => handleAuthenticate('face')}
          disabled={isAuthenticating || isVoiceAuthRecording || !username.trim()}
          className={`flex flex-col items-center space-y-4 p-8 rounded-xl backdrop-blur-sm transition-all ${
            username.trim() 
              ? 'bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border border-cyan-500/30' 
              : 'bg-gradient-to-br from-gray-800/30 to-gray-700/30 border border-gray-500/30 opacity-50'
          }`}
        >
          <div className="relative">
            <Eye className={`w-12 h-12 ${username.trim() ? 'text-cyan-400' : 'text-gray-500'}`} />
            {isAuthenticating && authMethod === 'face' && (
              <div className="absolute -top-2 -right-2">
                <Loader className="w-6 h-6 text-cyan-400 animate-spin" />
              </div>
            )}
          </div>
          <span className={`text-lg ${username.trim() ? 'text-cyan-300' : 'text-gray-500'}`}>Face Authentication</span>
          {!username.trim() && (
            <span className="text-xs text-gray-500 mt-2">Enter username first</span>
          )}
        </motion.button>

        <motion.button
          whileHover={{ scale: username.trim() ? 1.05 : 1, boxShadow: username.trim() ? "0 0 20px rgba(0, 255, 255, 0.3)" : "none" }}
          whileTap={{ scale: username.trim() ? 0.95 : 1 }}
          onClick={() => handleAuthenticate('voice')}
          disabled={isAuthenticating || isVoiceAuthRecording || !username.trim()}
          className={`flex flex-col items-center space-y-4 p-8 rounded-xl backdrop-blur-sm transition-all ${
            username.trim() 
              ? 'bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border border-cyan-500/30' 
              : 'bg-gradient-to-br from-gray-800/30 to-gray-700/30 border border-gray-500/30 opacity-50'
          }`}
        >
          <div className="relative">
            <Mic className={`w-12 h-12 ${username.trim() ? 'text-cyan-400' : 'text-gray-500'}`} />
            {(isAuthenticating && authMethod === 'voice') && (
              <div className="absolute -top-2 -right-2">
                <Loader className="w-6 h-6 text-cyan-400 animate-spin" />
              </div>
            )}
            {isVoiceAuthRecording && (
              <div className="absolute -top-2 -right-2">
                <Loader className="w-6 h-6 text-red-400 animate-spin" />
              </div>
            )}
          </div>
          <span className={`text-lg ${username.trim() ? 'text-cyan-300' : 'text-gray-500'}`}>Voice Authentication</span>
          {!username.trim() && (
            <span className="text-xs text-gray-500 mt-2">Enter username first</span>
          )}
          {isVoiceAuthRecording && (
            <span className="text-xs text-red-400 mt-2">Recording... Please say: "J.A.R.V.I.S, this is my voice authentication sample"</span>
          )}
        </motion.button>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setMode('register')}
        className="text-cyan-400 hover:text-cyan-300 transition-colors"
      >
        New user? Register here
      </motion.button>
    </div>
  );

  const renderRegistrationMode = () => (
    <div className="flex flex-col items-center space-y-8 max-w-md">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-cyan-300 mb-4">User Registration</h1>
        <p className="text-lg text-gray-300">Set up your biometric authentication</p>
      </motion.div>

      {/* Registration Steps */}
      <div className="flex space-x-4 mb-6">
        {registrationSteps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex items-center space-x-2 p-3 rounded-lg ${
              step.completed 
                ? 'bg-green-500/20 border-green-500/50' 
                : step.active 
                  ? 'bg-cyan-500/20 border-cyan-500/50' 
                  : 'bg-gray-500/20 border-gray-500/50'
            } border`}
          >
            {step.completed ? (
              <Check className="w-5 h-5 text-green-400" />
            ) : (
              step.icon
            )}
            <span className={`text-sm ${
              step.completed ? 'text-green-300' : step.active ? 'text-cyan-300' : 'text-gray-400'
            }`}>
              {step.name}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Registration Step Content */}
      <div className="w-full">
        {registrationStep === 'username' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900/50 border border-cyan-500/30 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                placeholder="Enter your username"
              />
            </div>
            
            <button
              onClick={startRegistration}
              disabled={!username.trim()}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 px-6 rounded-lg font-medium hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Start Registration
            </button>
          </motion.div>
        )}

        {registrationStep === 'face' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h3 className="text-lg font-semibold text-cyan-300 mb-2">Face Recognition Setup</h3>
              <p className="text-sm text-gray-400">
                We need 3 face samples. Current: {faceSamples}/3
              </p>
            </div>
            
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-64 object-cover rounded-lg border border-cyan-500/30"
              />
              <canvas ref={canvasRef} className="hidden" />
              
              <div className="absolute inset-0 border-2 border-cyan-400/50 rounded-lg pointer-events-none">
                <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-cyan-400"></div>
                <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-cyan-400"></div>
                <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-cyan-400"></div>
                <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-cyan-400"></div>
              </div>
            </div>
            
            <button
              onClick={registerFaceSample}
              disabled={faceSamples >= 3}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 px-6 rounded-lg font-medium hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2"
            >
              <Camera className="w-5 h-5" />
              <span>Capture Face Sample</span>
            </button>
          </motion.div>
        )}

        {registrationStep === 'voice' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h3 className="text-lg font-semibold text-cyan-300 mb-2">Voice Recognition Setup</h3>
              <p className="text-sm text-gray-400">
                We need 3 voice samples. Current: {voiceSamples}/3
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Say: "J.A.R.V.I.S, this is my voice authentication sample"
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4">
              <div className={`w-32 h-32 rounded-full border-4 flex items-center justify-center ${
                isRecording ? 'border-red-500 bg-red-500/20' : 'border-cyan-500 bg-cyan-500/20'
              }`}>
                <MicIcon className={`w-16 h-16 ${isRecording ? 'text-red-400' : 'text-cyan-400'}`} />
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={startVoiceRecording}
                  disabled={isRecording || voiceSamples >= 3}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 px-6 rounded-lg font-medium hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2"
                >
                  {isRecording ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Recording...</span>
                    </>
                  ) : (
                    <>
                      <MicIcon className="w-5 h-5" />
                      <span>Start Recording</span>
                    </>
                  )}
                </button>
                {isRecording && (
                  <button
                    onClick={() => {
                      if (mediaRecorderRef.current && isRecording) {
                        mediaRecorderRef.current.stop();
                        setIsRecording(false);
                        console.log('Recording stopped by user');
                      }
                    }}
                    className="bg-red-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-700 transition-all flex items-center justify-center space-x-2"
                  >
                    <span>Stop</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {registrationStep === 'complete' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <div className="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
              <Check className="w-10 h-10 text-green-400" />
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-green-300 mb-2">Registration Complete!</h3>
              <p className="text-gray-400">
                Your biometric authentication has been set up successfully.
              </p>
            </div>
            
            <button
              onClick={() => setMode('login')}
              className="bg-gradient-to-r from-green-500 to-cyan-500 text-white py-3 px-6 rounded-lg font-medium hover:from-green-600 hover:to-cyan-600 transition-all"
            >
              Go to Login
            </button>
          </motion.div>
        )}
      </div>

      {mode === 'register' && registrationStep === 'username' && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setMode('login')}
          className="text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          Already have an account? Login here
        </motion.button>
      )}
    </div>
  );

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

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-2xl mx-auto px-8">
        <AnimatePresence mode="wait">
          {mode === 'login' ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.5 }}
            >
              {renderLoginMode()}
            </motion.div>
          ) : (
            <motion.div
              key="register"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
            >
              {renderRegistrationMode()}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error/Success Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-center"
            >
              <div className="flex items-center justify-center space-x-2">
                <X className="w-5 h-5" />
                <span>{error}</span>
              </div>
            </motion.div>
          )}
          
          {success && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300 text-center"
            >
              <div className="flex items-center justify-center space-x-2">
                <Check className="w-5 h-5" />
                <span>{success}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* System Status */}
      <div className="absolute bottom-4 right-4 text-xs text-gray-400">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>J.A.R.V.I.S System Online</span>
        </div>
      </div>
    </div>
  );
};