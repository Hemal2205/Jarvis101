import React from 'react';
import { JarvisSystem } from './components/JarvisSystem';
import { JarvisProvider } from './context/JarvisContext';

function App() {
  return (
    <JarvisProvider>
      <div className="min-h-screen bg-black overflow-hidden">
        <JarvisSystem />
      </div>
    </JarvisProvider>
  );
}

export default App;